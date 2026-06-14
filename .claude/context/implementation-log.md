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
