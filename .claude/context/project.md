# Project: Family Tree (famtree.uz)

## What it is
A web app for creating, managing, and sharing family trees. Users sign in via Google OAuth, create trees, add members (nodes), connect them (parent/spouse), and can share trees with other users with fine-grained RBAC permissions.

## Live domain
- Frontend: `https://www.famtree.uz`
- API: separate backend deployment
- Cloudflare Worker: sits in front of the SPA to serve OG meta tags for social crawlers

## Tech stack
| Layer | Tech |
|---|---|
| Monorepo | Nx + pnpm workspaces |
| Backend | NestJS + Drizzle ORM + PostgreSQL |
| Frontend | React + Vite + Effector (FSD architecture) + atomic-router + Axios |
| Worker | Cloudflare Workers (TypeScript) |
| Shared lib | Zod schemas + request/response types (used by both api and web) |
| Auth | Google OAuth2 → JWT stored as httpOnly cookie |
| File storage | Cloudflare R2 |
| Cache | Redis (via NestJS cache interceptors) |
| Linter | Biome |
| Error tracking | Sentry |
| Push notifications | Firebase FCM |
| CI/CD | GitHub Actions (`.github/workflows/`) |

## Monorepo structure
```
family-tree/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # React SPA
│   └── cloudflare/   # Cloudflare Worker (OG meta tags)
├── libs/
│   └── shared/       # Zod schemas + TS types shared between api and web
├── biome.json        # Linter config
├── nx.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Key conventions
- All API routes are prefixed with a global prefix (see `GLOBAL_PREFIX` constant in `apps/api/src/utils/constants.ts`)
- Biome is used for linting/formatting (not ESLint/Prettier)
- Shared package name: `@family-tree/shared`
- All DB tables use soft-delete via `deletedAt` timestamp
- Response validation uses `nestjs-zod` + `ZodSerializerDto` on every controller method
- Cookie name for JWT: `COOKIES_ACCESS_TOKEN_KEY` constant

## Build gotchas
- API build uses `@nx/rspack:rspack`; the `production` config keeps `optimization: false` **on purpose**. Enabling minification mangles DTO class names, which `nestjs-zod` + `@nestjs/swagger` use as OpenAPI schema names → breaks Swagger (one shared schema for all endpoints, missing params). Configure build optimization in `apps/api/project.json`, NOT `rspack.config.js` (the executor's `optimization` flag overrides the rspack config).
