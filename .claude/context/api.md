# API (NestJS)

## Location: `apps/api/`

## Bootstrap (`src/main.ts`)
- Global prefix set via `GLOBAL_PREFIX` constant
- Cookie parser middleware
- CORS: allows `COOKIE_CLIENT_URL` and `www.` variant, credentials: true
- Trust proxy enabled
- Swagger at `/api` (built by `SwaggerBuilder`)
- Sentry via `instrument.ts`

## Environment variables (`src/config/env/env-validation.ts`)
Validated with Zod at startup:
```
DATABASE_URL, PORT, NODE_ENV
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
JWT_SECRET, COOKIES_SECRET
CLOUDFLARE_URL, CLOUDFLARE_ENDPOINT, CLOUDFLARE_ACCESS_KEY_ID, CLOUDFLARE_SECRET_ACCESS_KEY
SENTRY_DSN
REDIS_URL, REDIS_TTL
COOKIE_DOMAIN, COOKIE_CLIENT_URL
```

## Auth flow
1. `GET /auth/google` → `GoogleOauthGuard` → redirects to Google
2. `GET /auth/google/callback` → Google redirects back → guard validates → `AuthService.signIn(user)`
   - If user exists: generate JWT
   - If new user: insert into `users` table, generate JWT
   - Sets httpOnly cookie (`access_token`, 30 days, sameSite: none, secure)
   - Redirects to `COOKIE_CLIENT_URL + redirectUrl` (from `auth_redirect_url` cookie or `/family-trees`)
3. `GET /auth/logout` → clears the cookie → 200

## Guards & Interceptors
- `JWTAuthGuard` — validates JWT from cookie, attaches `req.user`
- `GoogleOauthGuard` — Passport Google strategy
- **Access isolation (Phase 2):** owner/public/shared are now separate route prefixes, each with its own guard (`common/guards/`):
  - `OwnerGuard` — `createdBy === user.id`; bare path; after `JWTAuthGuard`.
  - `PublicGuard` — `isPublic === true`; **no JWT** (anonymous + crawlers); `/public/*` prefix; read-only.
  - `SharedAccessGuard` — non-blocked `shared_family_trees` record holding every `@RequirePermission(...)` flag; `/shared/*` prefix; after `JWTAuthGuard`. Owner does NOT pass here (owners use bare path).
  - `FamilyTreeAccessGuard` — the original combined guard (owner→public→shared). **Still used, but only** for the shared-users RBAC PUT (the one genuinely "owner-OR-shared-with-all-perms" route).
- `@RequirePermission('canAddMembers', ...)` decorator (`common/decorators/`) — declares which shared-tree flags a route needs; variadic (all must hold). Omit for read-only routes. Read by `SharedAccessGuard`/`FamilyTreeAccessGuard`. Every guard must be in the consuming module's `providers` so DI can resolve `DrizzleAsyncProvider`.
- `FamilyTreeCacheInterceptor` — Redis cache for family tree endpoints
- `UserCacheInterceptor` — Redis cache for user endpoints
- `ZodResponseInterceptor` — response shape validation

## Filters
- `HttpFilter` — global HTTP exception filter
- `ZodFilter` — catches Zod validation errors, formats them

## Modules
All feature modules live in `src/modules/`:

---

### Auth (`/auth`)
| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/auth/google` | GoogleOauth | Initiates Google OAuth |
| GET | `/auth/google/callback` | GoogleOauth | Callback, sets JWT cookie, redirects |
| GET | `/auth/logout` | none | Clears JWT cookie |

---

### User (`/users`)
| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/users/me` | JWT | Get own profile |
| GET | `/users/:id` | JWT | Get user by id |
| PUT | `/users` | JWT | Update own profile |
| PATCH | `/users/avatar` | JWT | Randomize own avatar |

Cache: `UserCacheInterceptor`

---

### Family Tree (`/family-trees`)
URL namespace: scope prefix goes **before** the id — `/family-trees/public/:id`, `/family-trees/shared/:id`.
Controllers are registered in order: `FamilyTreePublicController` → `FamilyTreeSharedController` → `FamilyTreeController` (literals before params).

| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/family-trees` | JWT | List own trees (paginated+search, **no `isPublic` param**) |
| GET | `/family-trees/public` | none | List all public trees (paginated+search, anonymous) |
| GET | `/family-trees/public/:id` | PublicGuard (no JWT) | Get public tree by id (anon visitors) |
| GET | `/family-trees/shared` | JWT | Get trees shared with me (paginated+search) |
| GET | `/family-trees/shared/:id` | JWT | Get single shared tree record |
| GET | `/family-trees/shared/:id/users` | JWT | Get users with access to shared tree (paginated+search) |
| PUT | `/family-trees/shared/:id/users/:userId` | JWT + FamilyTreeAccessGuard | Update RBAC for shared user |
| GET | `/family-trees/:id/preview` | none | Public preview metadata (for OG crawlers / Cloudflare Worker) |
| GET | `/family-trees/:id` | JWT + OwnerGuard | Get tree by id — owner only |
| POST | `/family-trees` | JWT | Create tree + auto-create initial member from user |
| PUT | `/family-trees/:id` | JWT + OwnerGuard | Update tree |
| DELETE | `/family-trees/:id` | JWT + OwnerGuard | Delete tree |

Cache: `FamilyTreeCacheInterceptor`
Module structure: `family-tree/controllers/` (3 controllers) + `family-tree/services/` (2 services). `SharedFamilyTreeModule` is dissolved — its service + DTO live in `family-tree/`.

---

### Family Tree Member — isolated by prefix
Three flat concrete controllers (no abstract base), each with its own prefix + guard. No class inheritance.
- **Owner**: `@Controller('family-trees/:familyTreeId/members')` — JWT + OwnerGuard (read + write)
- **Shared**: `@Controller('family-trees/shared/:familyTreeId/members')` — JWT + SharedAccessGuard (read + write, RBAC-gated via `@RequirePermission`)
- **Public**: `@Controller('family-trees/public/:familyTreeId/members')` — PublicGuard, no JWT, read-only

Controllers registered in order: Public → Shared → Owner (literals before params) in `family-tree-member.module.ts`.

| Method | Route suffix | Owner | Shared | Public |
|---|---|---|---|---|
| GET | `/members` | ✓ | ✓ | ✓ |
| GET | `/members/:id` | ✓ | ✓ | ✓ |
| POST | `/members/child` | ✓ | canAddMembers | ✗ |
| POST | `/members/spouse` | ✓ | canAddMembers | ✗ |
| POST | `/members/parents` | ✓ | canAddMembers | ✗ |
| PUT | `/members/:id` | ✓ | canEditMembers | ✗ |
| DELETE | `/members/:id` | ✓ | canDeleteMembers | ✗ |

Cache: `FamilyTreeCacheInterceptor`

---

### Family Tree Member Connection — isolated by prefix
Three flat concrete controllers (same pattern as members). The connection module is registered **before** the member module in `app.module.ts` so `members/connections` resolves before `members/:id` — **do not reorder**.

| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/family-trees[/public\|/shared]/:familyTreeId/members/connections` | per-prefix | All connections in tree |
| GET | `/family-trees[/public\|/shared]/:familyTreeId/members/:memberUserId/connections` | per-prefix | Connections for specific member |

Cache: `FamilyTreeCacheInterceptor`

---

### File (`/files`)
| Method | Route | Guard | Description |
|---|---|---|---|
| POST | `/files/:folder` | none | Upload image to Cloudflare R2 (jpeg/png, max 5MB) |

Returns: `{ message, path }` where path = `CLOUDFLARE_URL/folder/randomKey`

---

### Notification (`/notifications`)
| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/notifications` | JWT | Get own notifications |
| GET | `/notifications/read` | JWT | Mark all notifications as read |

---

### FCM Token (`/fcm-tokens`)
| Method | Route | Guard | Description |
|---|---|---|---|
| POST | `/fcm-tokens` | JWT | Register FCM token for push notifications |
| DELETE | `/fcm-tokens` | JWT | Remove FCM token |

## Shared access check logic
Handled by `FamilyTreeAccessGuard` + `@RequirePermission` (see Guards section). The old
`SharedFamilyTreeService.checkAccessSharedFamilyTree()` god-method was removed (Phase 1 of the
Isolation ticket — see `.claude/context/isolation-plan.md`):
- Owner → always allowed
- Public tree → read-only (any required permission → 403)
- Shared → looks up `shared_family_trees`; missing/blocked → 403; then every required flag must be true
- Members + connections + the shared-users RBAC PUT all enforce via the guard now.
- NOTE: `family-tree.controller` `GET/:id` (inline owner|public check) and `PUT`/`DELETE` (service-level `WHERE createdBy`) were intentionally left as-is — they get dedicated guards in Phase 2 route isolation.
