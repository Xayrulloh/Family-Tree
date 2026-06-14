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
| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/family-trees` | JWT | List own trees (paginated+search). If `?isPublic=true`: returns public trees |
| GET | `/family-trees/:id/preview` | none | Public preview metadata (for OG crawlers) |
| GET | `/family-trees/:id/public` | PublicGuard (no JWT) | Get public tree metadata (anon visitors) |
| GET | `/family-trees/:id` | JWT + OwnerGuard | Get tree by id — **owner only** now |
| POST | `/family-trees` | JWT | Create tree + auto-create initial member from user |
| PUT | `/family-trees/:id` | JWT + OwnerGuard | Update tree (service is pure — no userId) |
| DELETE | `/family-trees/:id` | JWT + OwnerGuard | Delete tree (service is pure — no userId) |

Cache: `FamilyTreeCacheInterceptor`

---

### Family Tree Member — isolated by prefix (Phase 2)
Three controllers built from abstract base controllers (`*.base.controller.ts`: read tier + write tier), differing only in prefix + guard. Handler bodies written once.
- **Owner**: `/family-trees/:familyTreeId/members` — JWT + OwnerGuard (read + write)
- **Shared**: `/family-trees/:familyTreeId/shared/members` — JWT + SharedAccessGuard (read + write, RBAC-gated via `@RequirePermission`)
- **Public**: `/family-trees/:familyTreeId/public/members` — PublicGuard, no JWT, **read-only** (extends read-tier base only)

Routes below are the same on all three prefixes (writes only on owner/shared):

| Method | Route | Guard | Permission check | Description |
|---|---|---|---|---|
| GET | `/family-trees/:familyTreeId/members` | JWT | read access | Get all members (nodes) |
| GET | `/family-trees/:familyTreeId/members/:id` | JWT | read access | Get member by id |
| POST | `/family-trees/:familyTreeId/members/child` | JWT | canAddMembers | Add child node |
| POST | `/family-trees/:familyTreeId/members/spouse` | JWT | canAddMembers | Add spouse node |
| POST | `/family-trees/:familyTreeId/members/parents` | JWT | canAddMembers | Add parent nodes |
| PUT | `/family-trees/:familyTreeId/members/:id` | JWT | canEditMembers | Update member |
| DELETE | `/family-trees/:familyTreeId/members/:id` | JWT | canDeleteMembers | Delete member |

Cache: `FamilyTreeCacheInterceptor`

---

### Family Tree Member Connection — isolated by prefix (Phase 2)
Read-only on all three prefixes (one abstract base controller, three concretes with owner/shared/public guards as above). The connection module is registered **before** the member module in `app.module` so `members/connections` resolves before `members/:id` on every prefix — do not reorder.
| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/family-trees/:familyTreeId[/public|/shared]/members/connections` | per-prefix | Get all connections in tree |
| GET | `/family-trees/:familyTreeId[/public|/shared]/members/:memberUserId/connections` | per-prefix | Get connections for specific member |

Cache: `FamilyTreeCacheInterceptor`

---

### Shared Family Tree (`/family-trees`)
| Method | Route | Guard | Description |
|---|---|---|---|
| GET | `/family-trees/shared` | JWT | Get trees shared with me (paginated+search) |
| GET | `/family-trees/:familyTreeId/shared` | JWT | Get single shared tree record |
| GET | `/family-trees/:familyTreeId/shared-users` | JWT | Get users who have access (paginated+search) |
| PUT | `/family-trees/:familyTreeId/shared-users/:userId` | JWT | Update RBAC for a shared user (requires canEdit+canAdd+canDelete) |

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
