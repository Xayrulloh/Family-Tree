# Family Tree — Claude Context

This file is the entry point for Claude Code in this project.

## Quick start for new sessions
Run `/remember` to load full project context instantly.

## Context files (`.claude/context/`)
| File | Contents |
|---|---|
| [project.md](.claude/context/project.md) | Project overview, tech stack, monorepo structure, key conventions |
| [db.md](.claude/context/db.md) | Drizzle schema, all tables, columns, relations, enums |
| [api.md](.claude/context/api.md) | All NestJS endpoints, auth flow, guards, interceptors, env vars |
| [web.md](.claude/context/web.md) | React SPA structure, routing, FSD layers, Effector patterns, API client |
| [cloudflare.md](.claude/context/cloudflare.md) | Cloudflare Worker — OG meta injection for social crawlers |
| [shared.md](.claude/context/shared.md) | Shared Zod schemas and types used by both API and web |
| [implementation-log.md](.claude/context/implementation-log.md) | Running log of what was built each session |

## Skills
| Command | Description |
|---|---|
| `/remember` | Load all context files and print a ready-to-work summary |
| `/compact` | Summarize current session and append to implementation-log.md, update stale context files |
| `/create-pr` | Draft and create a GitHub PR for the current branch |

## Key facts
- Monorepo: Nx + pnpm workspaces
- Linter: Biome (not ESLint/Prettier) — run `pnpm biome check` or `pnpm biome format`
- Shared package: `@family-tree/shared`
- Auth: Google OAuth → JWT in httpOnly cookie
- All tables have soft-delete (`deletedAt` field)
- Response validation: `@ZodSerializerDto(Schema)` on every controller method
- GitHub repo: Xayrulloh/family-tree
