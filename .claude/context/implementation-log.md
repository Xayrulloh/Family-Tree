# Implementation Log

Append a bullet here after each session with: date, what was built/changed, and any key decisions made.

---

## 2026-06-13 — Claude Code setup
- Created `.claude/` project directory with `settings.json` (MCP GitHub server + allowed tool permissions)
- Created `CLAUDE.md` root index pointing to all context files
- Created `.claude/context/`: project.md, db.md, api.md, web.md, cloudflare.md, shared.md, implementation-log.md
- Created `.claude/commands/`: remember.md, compact.md, create-pr.md
- `settings.local.json` holds the GitHub token (gitignored)
- Added `.claude/settings.local.json` to `.gitignore`
- **Note:** GitHub token was exposed in chat — rotate it at github.com/settings/tokens

---

## 2026-06-14 — Fix production Swagger + Claude tooling
- Fixed prod Swagger (`/docs`) showing the same response schema for every endpoint and dropping params/query/body
- Added `/git-save` command (`.claude/commands/git-save.md`) — stages all + Conventional Commit, no push
- Updated `/compact` (`.claude/commands/compact.md`) to always persist key session learnings/decisions into context
- Allowed `git add` / `git commit` in `.claude/settings.json`
- Modified: `apps/api/project.json` (build config); shipped in PR #498 → `develop`
- **Key note:** Prod Swagger broke because the production api build had `optimization: true`, which minifies/mangles DTO class names. `nestjs-zod` + `@nestjs/swagger` name OpenAPI component schemas after the DTO class name, so mangling collapsed every schema into collisions → all endpoints showed one shared schema, params disappeared. Fix: `optimization: false` in `apps/api/project.json` production config. Local was fine because `nx serve` uses the development config (no minification).
- **Key note:** The `@nx/rspack:rspack` executor controls minification via `project.json`'s `optimization` flag and **overrides** anything set in `apps/api/rspack.config.js` (tried `optimization.minimizer` and `optimization.minimize: false` there — both ignored). Configure build optimization in `project.json`, not the rspack config.
- **Key note:** Swagger basic-auth in `apps/api/src/config/swagger/swagger.config.ts` is hardcoded `admin`/`password` — unresolved, worth moving to env vars.

---

## 2026-06-14 — Isolation ticket: Phase 1 (access-control layer)
- Wrote the full 3-phase isolation plan to `.claude/context/isolation-plan.md` (route prefixes `/`=owner, `/public`, `/shared`; guards enforce mode; services stay pure; frontend = thin pages + shared widget). Locked decisions: separate `/public` prefix, owner stays at bare path.
- Implemented **Phase 1** on branch `feature/isolation-access-guards` (off `develop`):
  - Created `common/decorators/require-permission.decorator.ts` — variadic `@RequirePermission('canAddMembers', ...)`.
  - Created `common/guards/family-tree-access.guard.ts` — `FamilyTreeAccessGuard` (owner→public→shared branching, reads required flags from decorator metadata via `Reflector`).
  - Migrated member, member-connection, and shared-family-tree (RBAC PUT) controllers to `@UseGuards(JWTAuthGuard, FamilyTreeAccessGuard)` + `@RequirePermission`, deleting all inline `checkAccessSharedFamilyTree` calls.
  - Deleted `checkAccessSharedFamilyTree` from `shared-family-tree.service.ts` (and the `console.log('what the fuck')` debug line inside it).
  - Registered `FamilyTreeAccessGuard` in the 3 modules' `providers`; dropped the now-unused `SharedFamilyTreeService` from member/connection modules.
  - Fixed a real security hole: `GET /family-trees/:familyTreeId/members/:memberUserId/connections` had NO access check before — now covered by the class-level guard.
- **Key note (DI gotcha):** A guard injecting `DrizzleAsyncProvider` MUST be listed in each consuming module's `providers` (DrizzleModule imported there) — otherwise Nest can't resolve it. `Reflector` injects fine but Biome flags it as type-only; needs `// biome-ignore lint/style/useImportType` (same pattern the codebase already uses for `@Body`/`@Query` DTO and service imports — `import type` breaks Nest DI metadata emission).
- **Key note (guard ordering):** `FamilyTreeAccessGuard` reads `req.user`, so it MUST be listed after `JWTAuthGuard` in `@UseGuards(...)`. Public-but-unauthenticated access is NOT possible yet — current routes still require JWT; true anon `/public` access arrives in Phase 2 with a JWT-less `PublicGuard`.
- **Key note (intentional scope):** Phase 1 is behavior-preserving except the connections-route fix + debug-log removal. `family-tree.controller` `GET/:id`/`PUT`/`DELETE` were deliberately NOT touched — they're owner-only and belong with the Phase 2 route split (the unified guard would have wrongly granted shared/public users read on `GET/:id`).
- Verified: `pnpm biome check` clean, `nx run api:build:development` compiles.

---

## 2026-06-14 — Isolation ticket: Phase 2 (route isolation)
- Branch `feature/isolation-routes` (stacked on Phase 1, no merge until whole task done).
- Split the unified guard into prefix-bound guards (`common/guards/`): `OwnerGuard`, `PublicGuard` (no JWT), `SharedAccessGuard`. Kept `FamilyTreeAccessGuard` for the one mixed route (shared-users RBAC PUT).
- Members + connections: extracted abstract base controllers (`*.base.controller.ts`) — read tier + write tier — and 3 thin concrete controllers each (owner bare / `/shared` / `/public`), differing only in prefix + guard. Registered all in their modules.
- Root tree controller: `GET /:id` → owner-only (`OwnerGuard`); added `GET /:id/public` (`PublicGuard`, no JWT); `PUT`/`DELETE` → `OwnerGuard` and the service methods made pure (dropped `userId`/`WHERE createdBy`).
- Cache interceptor: replaced exact `path ===` checks with prefix-agnostic regexes so `/public/members` + `/shared/members` hit the same `treeId`-keyed entry; moved the `if (!user)` early-return below the GET block so anonymous public reads cache (mutations still gated on `user`).
- **Key note (controller inheritance + DI):** NestJS registers routes from decorated methods inherited from an abstract base class, but a concrete controller with NO own constructor can fail DI (missing `design:paramtypes`). Fix = give each concrete an explicit `constructor(svc){ super(svc) }`; Biome flags it `noUselessConstructor` → silence with `// biome-ignore lint/complexity/noUselessConstructor`. Public read-only is achieved by extending the read-tier base only (no write methods to inherit).
- **Key note (route ordering):** `members/:id` (member module) would shadow `members/connections` (connection module). It works because `FamilyTreeMemberConnectionModule` is imported BEFORE `FamilyTreeMemberModule` in `app.module` (Express: first registered route wins). Same for `/family-trees/shared` (SharedFamilyTreeModule) before `:id` (FamilyTreeModule). Do not reorder these module imports.
- **Key note (verification gotcha):** standalone `tsc -p apps/api/tsconfig.app.json` floods TS6305 + "property does not exist on …Dto" errors because `@family-tree/shared` resolves to a stale/absent `dist/` (no `build` target — consumed from source). The errors hit untouched pre-existing files identically. Canonical check is `nx run api:build:development` (rspack from source), NOT standalone tsc.
- **Key note (intentional breakage):** `GET /:id` is now owner-only, so public/shared viewing is broken until Phase 3 repoints the frontend to `/:id/public`, `/public/members`, `/shared/members`, etc. Acceptable because nothing merges until the full task is ready.

---

## 2026-06-14 — Isolation ticket: Phases 2–4 (frontend API, renames, wiring)

Branch `feature/isolation-routes` continued (all phases on same branch, no merge until done).

**Phase 2 — Frontend API clients + routing + share button:**
- Flipped URL namespace: scope segment now goes BEFORE the id everywhere. `scopeSegment()` helper returns the same values (`''`/`'/shared'`/`'/public'`) but is now inserted before the id in all URL templates: `/family-trees${scope}/${id}/members`.
- `tree.ts`: removed `isPublic` from `findAll`, fixed `findByIdPublic` → `/family-trees/public/${id}`, added `findAllPublic` → `GET /family-trees/public`.
- `shared-tree.ts`: all 3 URLs updated (`findById`, `findUsers`, `update`) to new prefix-before-id shape.
- `routing.ts`: added `publicTreeList` + `sharedTreeList` routes; fixed paths for `sharedTreesDetail`, `publicTreesDetail`, `sharedTreeUsers`; listed literal paths (`/family-trees/public`, `/family-trees/shared`) BEFORE `/family-trees/:id` to prevent param route matching the literals.
- `share/model.ts` + `visualization.tsx`: `shareTrigger` now accepts `{ id }` and builds `${window.location.origin}/family-trees/shared/${id}` (previously appended `/shared` to `window.location.href` which is wrong for the new URL shape).
- `pages/tree-list/model.ts` (`fetchPublicTreesFx`): switched from `api.tree.findAll({ isPublic: true })` to `api.tree.findAllPublic(...)`.

**Phase 3 — Frontend renames:**
- `pages/trees` → `pages/tree-list`, export `Trees` → `TreeList`
- `pages/trees-detail` → `pages/tree-detail`, export `TreesDetail` → `TreeDetail`
- `pages/trees-public-detail` → `pages/public-tree-detail` (export `PublicTreesDetail` unchanged)
- `pages/shared-trees-detail` → `pages/shared-tree-detail`, export `SharedTreesDetail` → `SharedTreeDetail`
- `features/tree-detail/share` → `features/tree/share` (entire `tree-detail/` parent folder removed)

**Phase 4 — New routes wired:**
- `tree-list/model.ts` factory accepts `initialMode?: TreesMode` (default `'my-trees'`); resets `$mode` to `initialMode` on every route open so each entry URL lands on the correct tab.
- `tree-list/ui/index.ts` now exports `TreeList`, `PublicTreeList`, `SharedTreeList` — three `createLazyPage` entries with `staticDeps: { initialMode }`, sharing the same lazy chunk but each getting its own model instance.
- `pages/index.ts` wires all three into `createRoutesView`.

**Key note (route ordering in atomic-router):** Literal routes (`/family-trees/public`, `/family-trees/shared`) MUST appear before parameterized routes (`/family-trees/:id`) in `routesMap`. If `:id` is listed first, the router matches the string `"public"` or `"shared"` as the id and the dedicated routes never activate.
**Key note (`createLazyPage` + `staticDeps`):** The built-in `staticDeps` mechanism passes arbitrary config from page setup into `createModel`. Use `staticDeps: { initialMode: 'public-trees' as const }` to serve the same `ui.tsx` from multiple routes with different initial state — no extra infrastructure needed.
**Key note (share URL):** Building a share URL by appending to `window.location.href` is fragile (breaks if user is already on a scoped path). Always build from `window.location.origin + hardcoded path + id`.

---

## 2026-06-16 — CodeRabbit + user review fixes (PR #500)

**Security fixes:**
- `shared-family-tree.service.ts`: removed auto-create on missing shared record (privilege escalation — any auth user could self-provision read access to any tree by ID). Now throws `ForbiddenException` immediately.
- `public.guard.ts`: private trees now return `404` instead of `403` (prevents ID existence probing via the public endpoint).
- `shared-access.guard.ts`: owners are now explicitly blocked with `ForbiddenException` before the shared-record lookup (owner exclusion was documented but not enforced in code).

**Correctness fixes:**
- `tree-list/model.ts`: `PublicTreeList` page now uses `triggerRoute = route` instead of `authorizedRoute` — anonymous users can browse `/family-trees/public` without being redirected to login.
- `tree-visualization/model.ts`: added `fetchTreeFx.pending` to `$loading`; added fail handlers for all three fetch effects (`fetchTreeFx.fail`, `fetchMembersFx.fail`, `fetchConnectionsFx.fail`) to reinit stores and avoid stale UI on error.
- Cache interceptor `tap` callbacks wrapped in `try/catch` so Redis write failures don't propagate as unhandled rejections.
- `@nestjs/swagger/dist/decorators` import replaced with public `@nestjs/swagger` in all 13 controllers.
- `aria-label` added to icon-only Edit/Delete buttons in `view.tsx`.
- `name` param URL-encoded in `shared-tree.ts` API client.

**Architecture refactor (user review):**
- `REQUIRE_PERMISSION_KEY` → `SHARED_TREE_PERMISSION_KEY` moved to `src/utils/constants.ts`.
- Created `src/common/common.module.ts` (`@Global()`) providing `OwnerGuard`, `PublicGuard`, `SharedAccessGuard`, `FamilyTreeAccessGuard` — guards no longer repeated in every feature module's `providers[]`.
- Controller classes renamed to carry `FamilyTree` prefix matching DTO/service convention: `MemberController` → `FamilyTreeMemberOwnerController`, `MemberPublicController` → `FamilyTreeMemberPublicController`, `MemberSharedController` → `FamilyTreeMemberSharedController`, `ConnectionController` → `FamilyTreeMemberConnectionOwnerController`.
- `$mode` init in `tree-list/model.ts` converted from `sample` to idiomatic `.on()`.

**Key note (public list without auth):** When a factory uses `authorizedRoute = chainAuthorized({ route })` but needs to serve anonymous users for one mode, derive a `triggerRoute` conditionally (`initialMode === 'public-trees' ? route : authorizedRoute`) and clock lifecycle samples off `triggerRoute`. The auth-required fetches (`fetchTreesFx`, `fetchSharedTreesFx`) still clock off `authorizedRoute.opened` — only the public fetch and store resets move to `triggerRoute`.

**Key note (global guards via CommonModule):** Guards that inject `DrizzleAsyncProvider` must be provided in a module that imports `DrizzleModule`. Wrapping them in a `@Global()` `CommonModule` (which imports `DrizzleModule`) means they're available app-wide without being repeated in feature module `providers`. Import `CommonModule` early in `AppModule.imports` before feature modules.

**Key note (empty `catch {}` in tap):** RxJS `tap` does not await returned Promises. An async tap callback that throws will produce an unhandled rejection — it does NOT propagate through the observable stream. The `try/catch` inside prevents the unhandled rejection; an empty catch is intentional when cache failures must not affect the response. Add a comment if the empty catch looks suspicious.

---

## 2026-06-14 — Isolation ticket: Phase 3 (frontend)
- Branch `feature/isolation-routes` (continued, same branch as Phase 2).
- Created `shared/config/tree-scope.ts` — `TreeScope` type (`'owner' | 'shared' | 'public'`), global `$treeScope` store + `treeScopeChanged` event, `scopeSegment()` helper that maps scope to URL infix.
- Extended all API clients (`tree.ts`, `tree-member.ts`, `tree-member-connection.ts`) with `scope?: TreeScope`; URLs compute the correct prefix segment via `scopeSegment(scope)`. Added `findByIdPublic(id)` to `tree.ts` for the public tree metadata endpoint.
- Added `publicTreesDetail` route (`/family-trees/:id/public`) to `routing.ts` and `pages/index.ts`.
- Created `widgets/tree-visualization/` widget: `model.ts` (`createTreeDetailModel<T>` generic factory), `visualization.tsx`, `view.tsx` (`TreeDetailView`), `index.ts`. Factory takes `scope`, `requireAuth`, `fetchTree`, `resolvePermissions`, `getName` — handles auth-gating, data fetching, scope signalling, and permission derivation. Single engine for all 3 page types.
- Replaced the two per-page visualization components (`trees-detail/ui/visualization.tsx`, `shared-trees-detail/ui/visualization.tsx`) and their page models with thin `createModel` + `component = TreeDetailView` exports in each page's `ui.tsx`.
- Created new `pages/trees-public-detail/` page — all permissions `false`, `requireAuth: false`, fetches via `api.tree.findByIdPublic`.
- Updated `pages/trees/ui/ui.tsx`: public tree cards now link to `routes.publicTreesDetail` (were erroneously pointing to `treesDetail`).
- Updated Cloudflare Worker: `TREE_ROUTE` regex now matches `/family-trees/:id`, `/family-trees/:id/shared`, and `/family-trees/:id/public` so OG crawlers get meta tags for all 3 URL shapes.
- Fixed `null` id bug (found in code-review): `attach` effects in `createTreeDetailModel` typed source as `string` but `$id` is `string | null`; added early-throw guard so no API call fires with `"null"` as tree id.
- **Key note (`Effector attach` + nullable source):** When an `attach` reads a store that can be `null`, you MUST widen the `effect` param type to `string | null` and guard eagerly (`if (!id) throw ...`). TypeScript won't catch the mismatch because Effector's `attach` types the effect param from the provided `effect` function, not the source store. The bug manifests as `GET /family-trees/null/members` at runtime.
- **Key note (public page + Layout):** `UserDropdown` already guards `if (!user) return <InlineLoading />`, so it's safe on unauthenticated public pages. No Layout changes needed.
- **Key note (web tsc verification):** Run `npx tsc -p libs/shared/tsconfig.lib.json` first to build shared lib, then `npx tsc -p apps/web/tsconfig.json --noEmit`. Without building shared first, tsc reports TS6305 errors on every shared import. Two pre-existing `_authorizedRoute` warnings exist in untouched files — safe to ignore.

---

## 2026-06-18 — Full naming convention refactor + CodeRabbit fixes

- Applied `FamilyTree[Domain][Scope]` prefix uniformly across **all** controllers, services, DTOs, Zod schemas, and TypeScript types. Methods are the only exception.
- Controllers renamed: `ConnectionPublicController` → `FamilyTreeMemberConnectionPublicController`, `ConnectionSharedController` → `FamilyTreeMemberConnectionSharedController`, `FamilyTreeController` → `FamilyTreeOwnerController`.
- Service renamed: `SharedFamilyTreeService` → `FamilyTreeSharedService`.
- All 8 DTO classes in `shared-family-tree.dto.ts` + base Zod schema + all request/response schemas + inferred TS types: `SharedFamilyTree*` → `FamilyTreeShared*`.
- Fixed RBAC PUT guard: `PUT /family-trees/shared/:id/users/:userId` changed from `FamilyTreeAccessGuard + @RequirePermission` to `JWTAuthGuard + OwnerGuard`.
- Fixed share URL bug: `shareTrigger` now accepts `{ id, scope }`; URL is `/family-trees/public/:id` for public scope and `/family-trees/shared/:id` for owner/shared.
- Added `.on(fail)` handlers for all three fetch effects in `tree-list/model.ts`.
- Added `Logger` to `FamilyTreeCacheInterceptor`; GET catch logs `'Cache population failed'`, mutation catch logs `'Cache invalidation failed'`.

**Key note (naming convention — canonical rule):** The project-wide pattern is `FamilyTree[Domain][Scope]` for everything: controllers, services, DTOs, Zod schemas, inferred TS types. Domain examples: `Member`, `MemberConnection`, `Shared`. Scope examples: `Owner`, `Public`, `Shared`. Method names are the only exception.

**Key note (schema rename cascade):** When renaming a Zod schema in `libs/shared/`, the rename must cascade through four layers: (1) the base schema file in `schema/`, (2) `request.ts`/`response.ts` files that `.pick()` from it, (3) DTO files in the API that import schemas from `@family-tree/shared`, (4) web files that import inferred types from `@family-tree/shared`. All four must be updated in the same change or the build breaks.

**Key note (share URL scope):** `shareTrigger` carries `{ id, scope }`. For `public` scope the link is `/family-trees/public/:id` (anon-accessible). For `owner` and `shared` scopes the link is `/family-trees/shared/:id` (recipient must be in `shared_family_trees`). Do NOT use `scopeSegment()` here — `scopeSegment('owner')` returns `''`, which would produce the owner-only bare path.

---

## 2026-06-20 — Guest avatar, CodeRabbit fixes + session-load spinner (PR #507)

- Fixed `UserDropdown` showing `<InlineLoading />` for unauthenticated users on public tree pages — replaced with a random `notionists` avatar.
- Created `apps/web/src/shared/lib/random-avatar.ts` — mirrors `apps/api/src/helpers/random-avatar.helper.ts` exactly (same DiceBear `notionists` style, same variant lists for beards/brows/glasses/lips/nose/hair, same gender-specific logic).
- `generateRandomAvatar(gender?: 'male' | 'female')` — optional gender; omitting it picks randomly (50/50). Returns a full DiceBear URL with all params.
- `UserDropdown` uses `useMemo(() => generateRandomAvatar(), [])` for guests so the avatar is stable per mount (doesn't regenerate on re-renders). For logged-in users without `user.image`, falls back to `generateRandomAvatar(userGender)`.
- Removed `InlineLoading` import from `user-dropdown.tsx` (was the only consumer).
- **Key note (guest avatar stability):** The guest avatar must be generated inside `useMemo([])`, not inline — otherwise it regenerates a new random URL on every render, causing an image flicker loop as the `<Avatar>` repeatedly fetches a new URL.
- **Key note (web random-avatar parity):** The web helper is intentionally kept in sync with the API helper — same style (`notionists`), same variant lists. If the API helper is updated (new variants added, style changed), update `apps/web/src/shared/lib/random-avatar.ts` in the same PR.

---

## 2026-06-20 — Delete member: two-phase flow + full rule matrix

### What was built
- Two-phase delete flow: `GET :id/delete-preview` (returns `{ canDelete, blockReason, spouseToDelete }`) → user sees modal → `DELETE :id` executes.
- `computeDeletePreview` private method in `FamilyTreeMemberService` — all tree-safety logic lives here.
- `FamilyTreeMemberDeletePreviewSchema` / `FamilyTreeMemberDeletePreviewType` added to `libs/shared/src/lib/family-tree-member/family-tree-member.response.ts`.
- `GET :id/delete-preview` added to owner controller (guarded by `OwnerGuard` alone) and shared controller (`@RequirePermission('canDeleteMembers')`).
- Frontend: `features/tree-member/delete/model.ts` (Effector `fetchPreviewFx` + `deleteTreeFx` via `attach`) and `ui.tsx` (three-state modal: spinner / blocked message / confirm + optional spouse warning).
- `deletePreview` added to `src/shared/api/tree-member.ts`. Delete is hard (no soft-delete).

### Delete rule matrix (all scenarios)

| Target state | Outcome | Reason |
|---|---|---|
| 2+ children | **BLOCK** | Removing the parent would split the tree into disconnected subtrees |
| has parents AND has children (middle member) | **BLOCK** | Middle members are the bridge between top and bottom of the tree |
| sole member of the tree (no parents, no children, no spouse) | **BLOCK** | Tree cannot be empty |
| has parents, no children, no spouse | **DELETE target** | Parents survive; no broken connections |
| has parents, no children, has spouse (spouse also has parents) | **BLOCK** (case 5b) | Co-deleting the couple disconnects two parent families; deleting target alone leaves spouse without their link to target's parents |
| has parents, no children, has spouse (spouse has no parents) | **DELETE target + spouse** | Parents survive; co-delete spouse to avoid isolation |
| no parents, no children, has spouse (spouse has parents) | **DELETE target only** | Spouse stays connected via their own parents |
| no parents, no children, has spouse (spouse has no parents) — leaf couple (only 2 members in tree) | **DELETE target only** | Co-deleting would empty the tree; spouse becomes the sole surviving member (1-member tree is valid) |
| no parents, no children, has spouse (spouse has no parents) — 3+ members in tree | **DELETE target + spouse** | Co-delete spouse to avoid isolation; other members survive |
| no parents, 1 child, has spouse (spouse has parents) | **BLOCK** (case 12) | Deleting the couple severs spouse's parents from the child |
| no parents, 1 child, has spouse (spouse has no parents) | **DELETE target + spouse** | Child survives; always has PARENT edges to both parents so co-delete is required |

### Architecture notes
- All children always have **two** PARENT edges (one to each parent). This is why co-delete is mandatory when a couple has shared children — deleting one parent leaves dangling half-connections on the child.
- Members can have at most one spouse and one set of parents (enforced at creation).
- DB FK `onDelete: 'cascade'` on `familyTreeMemberConnectionsSchema` auto-deletes all connections when a member is deleted.

### Bugs fixed this session
- **Last-member guard was too aggressive:** `minRequired = spouseToDelete ? 3 : 2` correctly ensures ≥1 survivor, but for a leaf couple (only 2 members, both no parents/children) it blocked deletion entirely. Fix: when co-deleting a childless couple would fail the count check, fall back to deleting only the target (spouse becomes sole survivor). The `children.length === 0` guard prevents this fallback from firing for shared-child co-deletion (which would be a separate correctness bug).
- **Redundant `source: $member` in Effector sample:** `sample({ clock: deleted, source: $member, target: deleteTreeFx })` — the `source` is ignored because `deleteTreeFx` is an `attach` that already reads `$member` from its own source. Removed.

### Gotchas
- `import z from 'zod'` not `import type z` when defining a Zod schema — `import type` makes `z` undefined at runtime and silently breaks `z.object(...)` with no TS error.
- `fetchPreviewFx.doneData` from the Axios `base` interceptor is a full `AxiosResponse`. Must use `fn: (response) => response.data` in the sample to store only the data in `$preview`, not the entire response object.

---

## 2026-06-24 — Unit test phase (Tiers 1–5, 210 tests total)

- **Tier 1 (51 tests):** Pure helpers — `random-avatar` (libs/shared), `random-string` (api), `time-ago` (web), `family-chart-transformer` (web).
- **Tier 2 (98 tests):** All 9 base Zod schemas in `libs/shared/src/lib/schema/` — base, user, family-tree, family-tree-member, family-tree-member-connection, pagination, search, fcm-token, notification, shared-family-tree.
- **Tier 3 (28 tests):** All 4 NestJS guards — `OwnerGuard`, `PublicGuard`, `SharedAccessGuard`, `FamilyTreeAccessGuard`.
- **Tier 4 (12 tests):** `FamilyTreeMemberService.computeDeletePreview` — all 12 rule-matrix branches via `(service as any).computeDeletePreview(...)` cast.
- **Tier 5 (21 tests):** Web utility factories — `createDisclosure` (8 tests) and `createForm` (13 tests, with `renderHook` for effect tests since internal events aren't exported).
- Test infrastructure created: `apps/api/jest.config.ts`, `apps/api/tsconfig.spec.json`, `libs/shared/vitest.config.ts`, `libs/shared/tsconfig.spec.json`.
- **Key note (Zod v4 UUID validation):** Zod v4.3.6 enforces RFC 4122 variant bits — the 4th UUID segment must start with `8`, `9`, `a`, or `b`. Microsoft GUIDs (4th segment starting with `c`) are rejected. Valid test UUID pattern: `550e8400-e29b-41d4-a716-446655440000` (3rd segment starts with `4` = version 4, 4th starts with `a` = RFC variant).
- **Key note (Zod v4 safeParse + RangeError):** `safeParse` does NOT catch native JS errors thrown inside `z.preprocess`. An invalid date string in `BaseSchema` causes `new Date(str)` → `dateToString` → `RangeError` which bubbles through `safeParse`. Test with `expect(() => schema.safeParse({...})).toThrow(RangeError)` not `expect(result.success).toBe(false)`.
- **Key note (guard test mocking strategy):** Mock `drizzle-orm` (`eq`, `and`, `or`), `~/database/schema`, and `~/database/drizzle.provider` at the top of each guard spec. This avoids ESM/CJS resolution issues with drizzle-orm in Jest and lets guards be instantiated directly with a plain mock db object — no NestJS testing module needed.
- **Key note (service private method testing):** `computeDeletePreview` is `private`. Cast the service instance: `(service as any).computeDeletePreview(member, treeId)`. Mock `@family-tree/shared`, `~/config/cloudflare/cloudflare.config`, `~/database/schema`, `drizzle-orm`, and `~/database/drizzle.provider` to avoid heavy deps (AWS SDK, pg, etc.) loading in Jest.
- **Key note (createForm internal events):** `formInstanceChanged`, `resetFormInstance`, and `formValuesChanged` are NOT exported from `createForm`. The only way to populate `$formInstance` from a test is via `renderHook(() => useBindFormWithModel({ form: mockForm }))` from `@testing-library/react`. The `jsdom` environment (already configured in `vite.config.ts`) makes this work without extra setup.
- **Key note (Vitest CLI vs Jest CLI):** Vitest does not support `--testPathPatterns` (Jest flag). Run Vitest directly: `npx vitest run path/to/spec.ts`. Nx passes the flag through to the underlying runner; use Jest's `--testPathPatterns` for API tests but run web tests with `npx vitest run` directly from the `apps/web` directory.

---

## 2026-06-24 — Unit test polish: AAA formatting + IDE type fixes

- Added `/// <reference types="jest" />` to all 6 API spec files (4 guards + service + helper). VS Code's TS language server uses the nearest `tsconfig.json`, not `tsconfig.spec.json`, so Jest globals (`jest`, `describe`, `it`, `expect`, `beforeEach`) show `Cannot find name` errors in the IDE despite tests running fine. The triple-slash directive fixes this without touching the tsconfig references.
- Applied Arrange-Act-Assert (AAA) blank-line grouping to all 21 spec files written in the previous session. Rule: one blank line before the act call, one blank line before the first `expect()` call. Single-line tests (one `expect`, no setup) need no blank lines.
- Added `biome.json` overrides block for `**/*.spec.ts` / `**/*.test.ts`: disables `noExplicitAny` (needed for `mockDb as any` and similar test casts) and `noNonNullAssertion` (needed for `.find(...)!` in transformer tests). This is cleaner than per-line `biome-ignore` comments across 21 files.
- Saved AAA blank-line rule to persistent memory (`memory/feedback_test_formatting.md`) so it applies automatically in future sessions without being re-stated.
- **Key note (Biome test overrides pattern):** Use `biome.json` `overrides` with `"includes": ["**/*.spec.ts", "**/*.test.ts"]` to relax lint rules for test files only. Preferred over `// biome-ignore` comments when the same rule fires across many test files. Rules relaxed: `suspicious.noExplicitAny`, `style.noNonNullAssertion`.
- **Key note (`/// <reference types="jest" />` vs tsconfig):** Adding the spec tsconfig to `tsconfig.json`'s `references` array (composite project references) is the "correct" approach but VS Code doesn't always pick it up immediately. The `/// <reference types="jest" />` directive at the top of the spec file is immediate and file-local — use it as the reliable fallback when IDE errors appear despite correct tsconfig setup.
