# Web Frontend (React SPA)

## Location: `apps/web/`

## Tech stack
- React + Vite
- **State management**: Effector (stores/events/effects) + `effector-storage` for persistence
- **Routing**: `atomic-router` + `createHistoryRouter`
- **HTTP**: Axios via a shared `base` instance
- **Architecture**: Feature-Sliced Design (FSD) — pages / features / entities / shared / widgets
- **Theme**: light/dark, persisted in localStorage under `@app/theme`

## Environment variables
```
VITE_API_URL  — base URL for the API
```

## Routing (`src/shared/config/routing.ts`)
| Route name | Path |
|---|---|
| `browse` | `/` |
| `registration` | `/register` |
| `trees` | `/family-trees` |
| `treesDetail` | `/family-trees/:id` (owner only, requires auth) |
| `sharedTreesDetail` | `/family-trees/:id/shared` (shared RBAC, requires auth) |
| `publicTreesDetail` | `/family-trees/:id/public` (read-only, anonymous) |
| `sharedTreeUsers` | `/family-trees/:id/shared-users` |
| `notFound` | (catch-all) |

## API client (`src/shared/api/base.ts`)
- Axios instance with `baseURL: VITE_API_URL`, `withCredentials: true`
- Response interceptor: shows success toast for POST/PUT/PATCH/DELETE (except file uploads)
- Error interceptor: shows error toast; 401 silently rejects (triggers auth redirect elsewhere)

## API modules (`src/shared/api/`)
- `auth.ts`, `user.ts`, `tree.ts`, `tree-member.ts`, `tree-member-connection.ts`
- `shared-tree.ts`, `notification.ts`, `fcm-token.ts`, `file.ts`

## FSD layer structure
```
src/
├── app/           # App init, theme store, router setup
├── pages/         # Route-level pages (each: ui/ui.tsx + index.ts; no separate model.ts)
│   ├── home/                     # /
│   ├── registration/             # /register
│   ├── trees/                    # /family-trees
│   ├── trees-detail/             # /family-trees/:id (owner, full permissions)
│   ├── shared-trees-detail/      # /family-trees/:id/shared (shared RBAC permissions)
│   ├── trees-public-detail/      # /family-trees/:id/public (read-only, anon)
│   ├── shared-tree-users/        # /family-trees/:id/shared-users
│   └── not-found/
├── features/      # User-triggered actions (each: model.ts + ui.tsx + index.ts)
│   ├── auth/                     # Google sign-in button
│   ├── tree/create-edit, delete
│   ├── tree-member/add, edit, delete, preview
│   ├── tree-detail/share
│   └── shared-tree-users/edit    # Edit RBAC for shared user
├── entities/
│   └── user/                     # User entity store
├── widgets/
│   └── layout/                   # App shell (navbar, user dropdown)
└── shared/
    ├── api/        # Axios API modules
    ├── config/     # routing.ts, system.ts (appStarted event)
    ├── lib/        # create-form, disclosure, family-chart-transformer, lazy-page, message, time-ago, with-suspense
    ├── styles/     # family-chart-custom.css
    └── ui/         # field-wrapper, loading spinner
```

## Visualization widget (`src/widgets/tree-visualization/`)
- `model.ts` — `createTreeDetailModel<T>(config)` generic factory; takes `scope`, `requireAuth`, `fetchTree`, `resolvePermissions`, `getName`; returns `TreeDetailModel` (`$members`, `$connections`, `$id`, `$treeName`, `$permissions`, `$loading`)
- `visualization.tsx` — canvas component; reads `permissions.canAdd/canEdit/canDelete/canManageSharedUsers`
- `view.tsx` — `TreeDetailView` (edit/delete buttons gated on permissions)
- All 3 tree pages (`trees-detail`, `shared-trees-detail`, `trees-public-detail`) are thin wrappers: `createModel` delegates to this factory, `component = TreeDetailView`

## TreeScope (`src/shared/config/tree-scope.ts`)
- `TreeScope = 'owner' | 'shared' | 'public'`
- `$treeScope` global store — set by `treeScopeChanged` on every page open so write features (add/edit/delete) target the correct API prefix
- `scopeSegment(scope)` → `''` / `'/shared'` / `'/public'` (used in API client URLs)

## Key patterns
- Tree detail pages: no separate `model.ts`; `createModel` inline in `ui/ui.tsx`, `component = TreeDetailView`
- Write features (`add/edit/delete`) are singletons; they read `$treeScope` via `attach({ source: { ..., scope: $treeScope } })` so scope propagates without prop-drilling
- `shared/lib/create-form.ts` — generic form factory
- `shared/lib/disclosure.ts` — open/close state for modals/drawers
- Lazy loading via `shared/lib/lazy-page.ts` + `with-suspense` HOC
- `appStarted` event fires on app boot to initialize router history
- `shared/lib/family-chart-transformer.ts` — transforms API member/connection data into family-chart format
