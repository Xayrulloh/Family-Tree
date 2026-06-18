# 🌐 Family Tree - Web Application

Modern React-based frontend for the Family Tree platform, featuring interactive D3 visualizations and event-driven state management.

---

## 🏗️ Architecture

This application follows a **Feature-Sliced Design (FSD)** architecture pattern, organizing code by features and layers:

```
apps/web/src/
├── app/           # Application initialization & routing
├── pages/         # Page components (routes)
├── widgets/       # Complex UI blocks
├── features/      # User interactions & business logic
├── entities/      # Business entities
└── shared/        # Reusable utilities & UI components
```

### Shared Types & Schemas

All TypeScript types and Zod validation schemas are **shared across the monorepo** from the `@family-tree/shared` library. This ensures:
- ✅ Type safety between frontend and backend
- ✅ Single source of truth for data structures
- ✅ Consistent validation rules across the stack

```typescript
// Example: Importing shared types
import {
  type FamilyTreeMemberConnectionSchemaType,
  FamilyTreeMemberConnectionEnum,
} from '@family-tree/shared';
```

---

## 🛠️ Technologies Used

### Core Framework
- **React 18** - Modern UI library with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server

### State Management
- **Effector** - Event-driven reactive state manager
- **Effector React** - React bindings for Effector
- **Effector Storage** - Persistent state storage
- **Patronum** - Utility library for Effector

### Routing
- **Atomic Router** - Type-safe, declarative routing
- **Atomic Router React** - React integration for Atomic Router
- **History** - Browser history management

### UI & Styling
- **Ant Design (antd)** - Professional React UI component library
- **@ant-design/icons** - Icon components
- **TailwindCSS 4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Dark/Light Mode** - Built-in theme switching with Ant Design's ConfigProvider

### Data Visualization
- **family-chart** - Interactive family tree canvas library
- **html2canvas** - DOM-to-PNG export for image download

### Forms & Validation
- **React Hook Form** - Performant form management
- **@hookform/resolvers** - Validation resolvers
- **Zod** - Runtime type validation (from shared library)

### HTTP & API
- **Axios** - Promise-based HTTP client
- **Day.js** - Lightweight date manipulation

### Development Tools
- **Biome** - Fast linting and formatting
- **Rspack** - Fast Rust-based bundler
- **Vitest** - Blazing fast unit testing
- **@testing-library/react** - React component testing

---

## 🎨 Family Tree Visualization

The family tree visualization is powered by the **`family-chart`** library, located in `apps/web/src/widgets/tree-visualization/`.

### Widget architecture

The `tree-visualization` widget is shared across all three tree-detail pages (owner, shared, public). Each page wires its own `createTreeDetailModel` config and passes the resulting model to `TreeDetailView`.

- **`model.ts`** — `createTreeDetailModel<T>(config)` generic factory; takes `scope`, `requireAuth`, `fetchTree`, `resolvePermissions`, `getName`
- **`visualization.tsx`** — `family-chart`-powered canvas; action buttons (add child/spouse/parents) are gated on `permissions.canAdd`
- **`view.tsx`** — `TreeDetailView` wrapper; toolbar with share, download, center-view, and managed-users link

### Interactive features

- **Pan, zoom, center** — built into `family-chart`
- **Member cards** — custom `setOnCardUpdate` hook renders overlay action buttons per card
- **Image export** — `html2canvas` captures the chart div and downloads as PNG
- **Sharing** — share button constructs `${origin}/family-trees/shared/${id}` and copies to clipboard

---

## ⚡ Effector State Management

**Effector** is an event-driven reactive state manager that provides predictable state updates through events, effects, and stores.

### Why Effector?

- **Event-Driven** - Clear separation between actions and state
- **Type-Safe** - Full TypeScript support out of the box
- **Reactive** - Automatic dependency tracking
- **Performant** - Minimal re-renders, efficient updates
- **DevTools** - Excellent debugging experience

### Architecture Pattern

```typescript
// Example: Tree member model
export const treeMemberModel = {
  // Events (user actions)
  addMemberTrigger: createEvent<MemberData>(),
  deleteMemberTrigger: createEvent<string>(),
  
  // Effects (async operations)
  addMemberFx: createEffect(async (data: MemberData) => {
    return await api.post('/members', data);
  }),
  
  // Stores (state)
  $members: createStore<Member[]>([])
    .on(addMemberFx.doneData, (state, member) => [...state, member])
    .on(deleteMemberFx.doneData, (state, id) => 
      state.filter(m => m.id !== id)
    ),
  
  // Computed stores
  $membersCount: $members.map(members => members.length),
};

// Usage in React components
const members = useUnit(treeMemberModel.$members);
const addMember = useUnit(treeMemberModel.addMemberTrigger);
```

### Key Concepts

- **Events** - User actions or system events
- **Effects** - Async operations (API calls, side effects)
- **Stores** - Reactive state containers
- **Gates** - Component lifecycle integration
- **Combine** - Merge multiple stores

---

## 🚀 Running Locally

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 10 or higher
- Backend API running (see `apps/api/README.md`)

### Installation

1. **Install dependencies** (from project root)
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in `apps/web/` as shown in `apps/web/.env.example`

3. **Start development server**
   ```bash
   # From project root
   pnpm start:frontend
   
   # Or using Nx directly
   npx nx serve web
   ```

4. **Open in browser**
   ```
   http://localhost:${PORT}
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:${PORT}` |
| `VITE_CLOUDFLARE_URL` | Cloudflare R2 base URL | `http://localhost:${PORT}` |
| `VITE_SENTRY_DSN` | Sentry DSN | `http://{SENTRY_DSN}` |
| `VITE_SENTRY_ENVIRONMENT` | Sentry environment | `http://localhost:${PORT}` |
| `VITE_DOMAIN_URL` | Domain URL | `http://localhost:${PORT}` |

> **Note**: All Vite environment variables must be prefixed with `VITE_` to be exposed to the client.

### Development Commands

```bash
# Start dev server
pnpm start:frontend

# Build for production
npx nx build web

# Run linting
npx nx lint web

# Run tests
npx nx test web

# Type checking
npx nx typecheck web
```

---

## 🚢 DevOps & Deployment

### Vercel Deployment

The frontend is deployed on **Vercel** with automatic deployments from Git.

#### Configuration

The project includes a `vercel.json` at the root:
- Configured for monorepo structure
- Automatic preview deployments for PRs
- Production deployments from main branch
- Excludes Dependabot PRs from preview deployments

#### Build Settings

```json
{
  "buildCommand": "npx nx build web",
  "outputDirectory": "dist/apps/web",
  "framework": "vite"
}
```

#### Environment Variables (Vercel)

Set these in your Vercel project settings:
- `VITE_API_URL` - Production API URL

#### Deployment Workflow

1. **Push to branch** → Vercel creates preview deployment
2. **Merge to main** → Vercel deploys to production
3. **Automatic rollbacks** available in Vercel dashboard

---

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/              # App initialization, routing, providers
│   ├── pages/            # Page-level components (each: ui/ui.tsx + ui/index.ts + index.ts)
│   │   ├── tree-list/         # /family-trees, /family-trees/public, /family-trees/shared (tabs)
│   │   ├── tree-detail/       # /family-trees/:id (owner, full permissions)
│   │   ├── shared-tree-detail/ # /family-trees/shared/:id (shared RBAC)
│   │   ├── public-tree-detail/ # /family-trees/public/:id (read-only, anonymous)
│   │   ├── shared-tree-users/ # /family-trees/shared/:id/users (access management)
│   │   ├── home/              # /
│   │   ├── registration/      # /register
│   │   └── not-found/
│   ├── widgets/          # Complex UI blocks
│   │   ├── tree-visualization/ # Shared family-chart widget + createTreeDetailModel factory
│   │   └── layout/            # App shell (navbar, user dropdown)
│   ├── features/         # Business logic features
│   │   ├── auth/              # Google sign-in button
│   │   ├── tree/              # create-edit, delete, share
│   │   ├── tree-member/       # add, edit, delete, preview
│   │   └── shared-tree-users/ # edit RBAC for shared user
│   ├── entities/
│   │   └── user/              # User entity store + chainAuthorized
│   ├── shared/           # Shared utilities
│   │   ├── api/               # Axios API modules (tree, tree-member, tree-member-connection, shared-tree, …)
│   │   ├── config/            # routing.ts, tree-scope.ts, system.ts
│   │   ├── lib/               # create-form, disclosure, family-chart-transformer, lazy-page, message, with-suspense
│   │   ├── styles/            # family-chart-custom.css
│   │   └── ui/                # field-wrapper, loading spinner
│   ├── main.tsx          # Application entry point
│   └── styles.css        # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

---

## 🧪 Testing

```bash
# Run unit tests
npx nx test web

# Run tests with coverage
npx nx test web --coverage

# Run tests in watch mode
npx nx test web --watch
```

---

## 🔗 Related Documentation

- **Backend API**: See [apps/api/README.md](../api/README.md)
- **Shared Library**: See [libs/shared/README.md](../../libs/shared/README.md)
- **Main README**: See [root README.md](../../README.md)

---

## 📚 Key Libraries Documentation

- [FSD Architecture](https://feature-sliced.design/)
- [Nx](https://nx.dev)
- [React](https://react.dev)
- [Effector](https://effector.dev)
- [Atomic Router](https://atomic-router.github.io)
- [Ant Design](https://ant.design)
- [D3.js](https://d3js.org)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)

---

<div align="center">
  <p>Built with ⚛️ React and ⚡ Effector</p>
</div>
