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
- **D3.js** - Data-driven document manipulation
- **d3-hierarchy** - Hierarchical layouts
- **d3-shape** - SVG shape generators
- **Custom SVG rendering** - Hand-crafted family tree connections

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

## 🎨 D3 Family Tree Visualization

The family tree visualization is built with **custom SVG rendering** powered by D3.js utilities. Located in `apps/web/src/pages/trees-detail/ui/visualization.tsx`.

### Key Features

#### 1. **Custom Layout Engine**
- Uses `d3-hierarchy` for tree structure calculations
- Custom positioning algorithm for multi-generational trees
- Responsive layout that adapts to container width

#### 2. **SVG-Based Rendering**
All visual elements are rendered as native SVG for:
- ✅ Infinite scalability without quality loss
- ✅ Smooth zoom and pan interactions
- ✅ Precise positioning and measurements
- ✅ Hardware-accelerated rendering

#### 3. **Connection Types**

**Spouse Connections** (Green Lines)
```typescript
const CONNECTION = {
  SPOUSE: { color: '#10b981', width: 3 },
  PARENT_CHILD: { color: '#9ca3af', width: 2 },
};
```
- Horizontal lines connecting married couples
- Rendered between node edges, not centers

**Parent-Child Connections** (Gray Lines)
- Vertical stems from parents to children
- Horizontal branches for multiple children
- Zig-zag lines for single children with spouses
- Straight lines for single children without spouses

#### 4. **Interactive Features**

**Pan & Zoom**
- Mouse drag to pan across the tree
- Mouse wheel to zoom in/out
- Smooth, momentum-based interactions
- ViewBox-based transformation for performance

**Dynamic Centering**
- Automatically centers tree on load
- Calculates optimal viewBox based on node positions

**Memoization**
- React.memo for node components
- useMemo for expensive calculations
- Optimized re-renders for large trees

### Visualization Code Structure

```typescript
// Main visualization component
export const Visualization: React.FC<Props> = ({ model }) => {
  // Effector state
  const [connections, members] = useUnit([model.$connections, model.$members]);
  
  // D3-based position calculation
  const positions = useMemo(
    () => calculatePositions(members, connections, containerWidth),
    [members, connections]
  );
  
  // SVG rendering with pan/zoom
  return (
    <svg viewBox={...} onWheel={handleWheel}>
      <CoupleConnections />      {/* Green spouse lines */}
      <ParentChildConnections /> {/* Gray parent-child lines */}
      <FamilyTreeNodes />        {/* Member cards */}
    </svg>
  );
};
```

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
│   ├── pages/            # Page-level components
│   │   ├── trees-detail/ # Family tree visualization page
│   │   ├── home/         # Landing page
│   │   └── ...
│   ├── widgets/          # Complex UI blocks (header, sidebar)
│   ├── features/         # Business logic features
│   │   ├── auth/         # Authentication
│   │   ├── tree-member/  # Member CRUD operations
│   │   └── ...
│   ├── entities/         # Business entities
│   ├── shared/           # Shared utilities
│   │   ├── api/          # API client configuration
│   │   ├── lib/          # Utility functions (layout-engine, etc.)
│   │   └── ui/           # Reusable UI components
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
