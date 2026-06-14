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
