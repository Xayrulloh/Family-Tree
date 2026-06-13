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
| `treesDetail` | `/family-trees/:id` |
| `sharedTreesDetail` | `/family-trees/:id/shared` |
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
├── pages/         # Route-level pages (each: model.ts + ui/ui.tsx + index.ts)
│   ├── home/                     # /
│   ├── registration/             # /register
│   ├── trees/                    # /family-trees
│   ├── trees-detail/             # /family-trees/:id (owner view + visualization)
│   ├── shared-trees-detail/      # /family-trees/:id/shared (shared viewer + visualization)
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

## Visualization
- `pages/trees-detail/ui/visualization.tsx` — owner tree visualization
- `pages/shared-trees-detail/ui/visualization.tsx` — shared tree visualization
- Uses `family-chart` library with custom CSS
- `shared/lib/family-chart-transformer.ts` — transforms API member/connection data into family-chart format

## Key patterns
- Each page has a `model.ts` with Effector stores/effects/events and a `ui/ui.tsx` that consumes them
- `shared/lib/create-form.ts` — generic form factory
- `shared/lib/disclosure.ts` — open/close state for modals/drawers
- Lazy loading via `shared/lib/lazy-page.ts` + `with-suspense` HOC
- `appStarted` event fires on app boot to initialize router history
