# 🔧 Family Tree - API (Backend)

Enterprise-grade NestJS backend API for the Family Tree platform, featuring graph-inspired database architecture and robust cloud infrastructure.

---

## 🏗️ Architecture

This application follows **NestJS modular architecture** with a clean separation of concerns:

```
apps/api/src/
├── modules/          # Feature modules (controllers, services, DTOs)
├── database/         # Database schema and migrations
├── config/           # Configuration modules (cache, env, etc.)
├── common/           # Shared guards, interceptors, decorators
├── helpers/          # Utility functions
└── main.ts           # Application entry point
```

### Shared Types & Validation

All TypeScript types and Zod validation schemas are **shared from `@family-tree/shared`**, ensuring 100% type safety and consistency with the frontend.

---

## 🗄️ Database Structure

### Graph-Inspired Architecture

The database schema is **inspired by Neo4j graph database concepts**, modeling family relationships as a graph:

- **Nodes** → Family Tree Members (individuals)
- **Edges** → Connections (relationships between members)

This approach naturally represents family hierarchies and relationships, making it ideal for genealogical data.

### Database Schema

Built with **Drizzle ORM** and **PostgreSQL**, the schema includes:

#### Core Tables

**`users`** - Authenticated users (Google OAuth)
- `id`, `email`, `username`, `name`, `image`
- `gender`, `dob`, `dod`, `description`
- `createdAt`, `updatedAt`, `deletedAt`

**`family_trees`** - Family tree containers
- `id`, `name`, `image`
- `createdBy` → references `users.id`
- Unique constraint on `(name, createdBy)`

**`family_tree_members`** - Individual family members (Nodes)
- `id`, `name`, `image`, `gender`
- `dob`, `dod`, `description`
- `familyTreeId` → references `family_trees.id`

**`family_tree_member_connections`** - Relationships (Edges)
- `id`, `type` (SPOUSE | PARENT)
- `fromMemberId` → references `family_tree_members.id`
- `toMemberId` → references `family_tree_members.id`
- `familyTreeId` → references `family_trees.id`

**`shared_family_trees`** - Tree sharing & permissions (RBAC)
- `familyTreeId` → references `family_trees.id`
- `userId` → references `users.id`
- `isBlocked` - Boolean (default false)
- `canEditMembers`, `canDeleteMembers`, `canAddMembers` - Boolean permissions
- Unique constraint on `(familyTreeId, userId)`

#### Supporting Tables

**`fcm_tokens`** - Firebase Cloud Messaging tokens
- `id`, `token`, `deviceType` (ANDROID | IOS | WEB)
- `userId` → references `users.id`

**`notifications`** - User notifications
- `id`, `content`
- `senderUserId` → references `users.id`
- `receiverUserId` → references `users.id`

**`notification_reads`** - Notification read status
- `userId` → references `users.id`
- `updatedAt`

### Enums

```typescript
// Gender enums
UserGenderEnum: MALE | FEMALE | UNKNOWN
MemberGenderEnum: MALE | FEMALE

// Connection types
FamilyTreeMemberConnectionEnum: SPOUSE | PARENT

// Device types
FCMTokenDeviceEnum: ANDROID | IOS | WEB
```

### Cascade Deletions

All foreign keys use `onDelete: 'cascade'` to maintain referential integrity:
- Deleting a user → deletes their trees, tokens, notifications
- Deleting a tree → deletes all members and connections
- Deleting a member → deletes all their connections

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ family_trees : "creates"
    users ||--o{ fcm_tokens : "has"
    users ||--o{ notifications : "sends"
    users ||--o{ notifications : "receives"
    users ||--o{ notification_reads : "reads"
    
    family_trees ||--o{ family_tree_members : "contains"
    family_trees ||--o{ family_tree_member_connections : "has"
    family_trees ||--o{ shared_family_trees : "shared_via"
    
    users ||--o{ shared_family_trees : "has_access"
    
    family_tree_members ||--o{ family_tree_member_connections : "from"
    family_tree_members ||--o{ family_tree_member_connections : "to"
    
    users {
        uuid id PK
        string email UK
        string username
        string name
        string image
        enum gender
        date dob
        date dod
        string description
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    family_trees {
        uuid id PK
        string name
        uuid createdBy FK
        string image
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    family_tree_members {
        uuid id PK
        string name
        string image
        enum gender
        date dob
        date dod
        string description
        uuid familyTreeId FK
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    family_tree_member_connections {
        uuid id PK
        uuid familyTreeId FK
        uuid fromMemberId FK
        uuid toMemberId FK
        enum type "SPOUSE | PARENT"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    shared_family_trees {
        uuid familyTreeId FK
        uuid userId FK
        boolean isBlocked
        boolean canEditMembers
        boolean canDeleteMembers
        boolean canAddMembers
        timestamp createdAt
        timestamp updatedAt
    }
    
    fcm_tokens {
        uuid id PK
        string token
        uuid userId FK
        enum deviceType "ANDROID | IOS | WEB"
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    notifications {
        uuid id PK
        string content
        uuid receiverUserId FK
        uuid senderUserId FK
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }
    
    notification_reads {
        uuid userId FK
        timestamp updatedAt
    }
```


---

### Interceptor-Based Caching

The API uses **NestJS Interceptors** (`FamilyTreeCacheInterceptor`, `UserCacheInterceptor`) to automatically manage cache hits and invalidations across the HTTP request lifecycle.

### Features

- **Query-Aware Caching** - Pagination and search results are cached based on their query parameters (`page`, `perPage`, `name`).
- **Automatic Invalidation** - Cache is cleared automatically when data mutations (`POST`, `PUT`, `DELETE`, `PATCH`) occur in related modules.
- **Improved Performance** - Move logic from services to the interceptor layer for cleaner code and faster lookups.

### Caching Implementation

The API uses **@nestjs/cache-manager** with **Redis**. Interceptors handle the logic:

```typescript
// Example: FamilyTreeCacheInterceptor logic
const { method, user, query, params } = request;

if (method === 'GET' && path === '/api/family-trees') {
  const cached = await this.cacheService.getUserFamilyTrees(user.id, query);

  if (cached) return of(cached);
}
```

### Cached Endpoints

The following endpoints utilize Interceptor-based caching:

- **Users**
  - `GET /users/me` - Profile cache
  - `GET /users/:id` - User cache by ID

- **Family Trees**
  - `GET /family-trees` - Paginated family trees list (supports `name` search)
  - `GET /family-trees/:id` - Single tree metadata

- **Family Tree Members**
  - `GET /family-trees/:familyTreeId/members` - Full member list cache

- **Member Connections**
  - `GET /family-trees/:familyTreeId/members/connections` - Full connection list cache

### Cache Invalidation

Cache is automatically invalidated on data mutations:

```typescript
// On update/delete operations
await this.cacheService.delByPattern('family-trees:*');
```

### Cache Configuration

- **TTL (Time To Live)**: Configurable via `REDIS_TTL` environment variable
- **Connection**: Redis URL via `REDIS_URL` environment variable
- **Adapter**: `@keyv/redis` for seamless integration

---


## 🛠️ Technologies Used

### Core Framework
- **NestJS 11** - Progressive Node.js framework
- **TypeScript 5** - Type-safe development
- **Express 5** - HTTP server

### Database & ORM
- **PostgreSQL** - Relational database (hosted on Neon)
- **Drizzle ORM** - Type-safe SQL query builder
- **Drizzle Kit** - Database migrations

### Authentication & Security
- **Passport.js** - Authentication middleware
- **Passport Google OAuth2** - Google authentication strategy
- **Passport JWT** - JWT authentication strategy
- **@nestjs/jwt** - JWT token generation
- **Cookie Parser** - Secure cookie handling

### Caching & Performance
- **Redis** - In-memory caching (via Keyv)
- **@nestjs/cache-manager** - Cache abstraction
- **@keyv/redis** - Redis adapter for Keyv

### File Storage
- **AWS SDK S3** - S3-compatible client
- **Cloudflare R2** - Object storage (S3-compatible)
- **Multer** - Multipart/form-data handling

### Validation & Documentation
- **Zod** - Runtime type validation (from shared library)
- **nestjs-zod** - NestJS integration for Zod
- **@nestjs/swagger** - OpenAPI/Swagger documentation

### Monitoring & Error Tracking
- **Sentry** - Error tracking and performance monitoring
- **@sentry/nestjs** - NestJS integration
- **@sentry/profiling-node** - Performance profiling

### Rate Limiting & Security
- **@nestjs/throttler** - Rate limiting
- **CORS** - Cross-origin resource sharing
- **Express Basic Auth** - Basic authentication

### Development Tools
- **Biome** - Fast linting and formatting
- **Vitest** - Unit testing
- **ts-node** - TypeScript execution
- **tsx** - Fast TypeScript runner

---

## 📡 API Endpoints

### Authentication (`/auth`)

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/logout` - Logout user

### Users (`/users`)

- `GET /users/me` - Get current authenticated user
- `GET /users/:id` - Get user by ID
- `PUT /users` - Update current user profile
- `PATCH /users/avatar` - Generate random avatar for user

### Family Trees (`/family-trees`)

- `GET /family-trees` - Get user's trees (Supports pagination: `page`, `perPage`, search: `name`)
- `GET /family-trees/:id` - Get tree by ID
- `POST /family-trees` - Create new family tree
- `PUT /family-trees/:id` - Update tree
- `DELETE /family-trees/:id` - Delete tree

### Shared Family Trees (`/family-trees`)

- `GET /family-trees/shared` - Trees shared **with** you (Supports pagination & search)
- `GET /family-trees/:familyTreeId/shared` - Single shared tree detail
- `GET /family-trees/:familyTreeId/shared-users` - Users who have access to your tree (Supports pagination & search)
- `PUT /family-trees/:familyTreeId/shared-users/:userId` - Update access (RBAC) for a specific user

### Family Tree Members (`/family-trees/:familyTreeId/members`)

- `GET /family-trees/:familyTreeId/members` - Get all members in tree
- `GET /family-trees/:familyTreeId/members/:id` - Get member by ID
- `POST /family-trees/:familyTreeId/members/child` - Add child member
- `POST /family-trees/:familyTreeId/members/spouse` - Add spouse member
- `POST /family-trees/:familyTreeId/members/parents` - Add parents
- `PUT /family-trees/:familyTreeId/members/:id` - Update member
- `DELETE /family-trees/:familyTreeId/members/:id` - Delete member

### Member Connections (`/family-trees/:familyTreeId/members`)

- `GET /family-trees/:familyTreeId/members/connections` - Get all connections in tree
- `GET /family-trees/:familyTreeId/members/:memberUserId/connections` - Get connections for specific member

### File Upload (`/files`)

- `POST /files/:folder` - Upload file to Cloudflare R2
  - Supported folders: `avatar`, `tree`
  - Accepted formats: JPEG, PNG
  - Max size: 5MB

### Notifications (`/notifications`)

- `GET /notifications` - Get user notifications
- `GET /notifications/read` - Mark all notifications as read

### FCM Tokens (`/fcm-tokens`)

- Manage Firebase Cloud Messaging tokens for push notifications

---

## 🚀 Running Locally

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 10 or higher
- **Docker** & **Docker Compose** (for PostgreSQL and Redis)

### Installation

1. **Install dependencies** (from project root)
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in `apps/api/` based on `.env.example`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   
   See [Environment Variables](#environment-variables) section below for details.

3. **Start Docker services** (PostgreSQL + Redis)
   ```bash
   cd apps/api
   docker compose up -d
   ```

4. **Run database migrations**
   ```bash
   # Generate migrations
   pnpm drizzle:generate
   
   # Push schema to database
   pnpm drizzle:push
   ```

5. **Start development server**
   ```bash
   # From project root
   pnpm start:backend
   
   # Or using Nx directly
   npx nx serve api
   ```

6. **Access the API**
   ```
   http://localhost:${PORT}
   ```

7. **View Swagger documentation**
   ```
   http://localhost:${PORT}/api
   ```

### Environment Variables

All environment variable examples are stored in `apps/api/.env.example`.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server port | `${PORT}` |
| **Google OAuth** | | |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Console |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:${PORT}/auth/google/callback` |
| **JWT** | | |
| `JWT_SECRET` | Secret for signing JWT tokens | Random secure string |
| **Cookies** | | |
| `COOKIES_SECRET` | Secret for cookie encryption | Random secure string |
| `COOKIE_DOMAIN` | Cookie domain | `localhost` |
| `COOKIE_CLIENT_URL` | Cookie client URL | `http://localhost:${PORT}` |
| **Cloudflare R2** | | |
| `CLOUDFLARE_URL` | Public R2 bucket URL | `https://pub-xxxxx.r2.dev` |
| `CLOUDFLARE_ACCESS_KEY_ID` | R2 access key ID | From Cloudflare |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | R2 secret access key | From Cloudflare |
| `CLOUDFLARE_ENDPOINT` | R2 endpoint URL | `https://xxxxx.r2.cloudflarestorage.com` |
| **Sentry** | | |
| `SENTRY_DSN` | Sentry project DSN | From Sentry dashboard |
| **Redis** | | |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `REDIS_TTL` | Cache TTL in seconds | `3600` |

### Development Commands

```bash
# Start dev server
pnpm start:backend

# Build for production
npx nx build api --prod

# Run linting
npx nx lint api

# Run tests
npx nx test api

# Database management
pnpm drizzle:generate  # Generate migrations
pnpm drizzle:push      # Push schema to DB
pnpm drizzle:studio    # Open Drizzle Studio
```

---

## 🚢 DevOps & Deployment

### Infrastructure

The backend is deployed with a modern, scalable infrastructure:

- **Hosting**: [Hetzner](https://www.hetzner.com/) - High-performance cloud servers
- **Database**: [Neon](https://neon.tech/) - Serverless PostgreSQL
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/products/r2/) - S3-compatible object storage
- **Monitoring**: [Sentry](https://sentry.io/) - Error tracking and performance monitoring
- **Secrets**: [Infisical](https://infisical.com/) - Centralized environment variable management

### Deployment Pipeline

Automated deployment via **GitHub Actions** (`.github/workflows/cd.yml`):

#### 1. Build Stage
- Checkout code
- Install dependencies with pnpm
- Build API with Nx (`npx nx build api --prod`)
- Build Docker image
- Push to GitHub Container Registry (GHCR)
- Generate artifact attestation

#### 2. Deploy Stage
- Fetch secrets from **Infisical**
- Upload `.env` and `docker-compose.yml` to Hetzner server
- SSH into server
- Pull latest Docker image from GHCR
- Restart containers with Docker Compose
- Clean up unused images

### Docker Configuration

The API runs in a Docker container:

```yaml
# docker-compose.yml
services:
  api:
    image: ghcr.io/xayrulloh/family-tree-api:stable
    ports:
      - "${PORT}:${PORT}"
    env_file:
      - .env
    restart: unless-stopped
```

### Secrets Management with Infisical

All environment variables are stored securely in **Infisical**:

- Centralized secret management
- Environment-specific configurations (dev, staging, prod)
- Automatic secret injection during deployment
- No secrets in Git repository

### Monitoring with Sentry

**Sentry** integration provides:
- Real-time error tracking
- Performance monitoring
- Request tracing
- User feedback collection
- Release tracking

### Continuous Deployment

Deployment triggers:
- **Push to `main` branch** → Automatic production deployment
- Build → Test → Deploy pipeline
- Zero-downtime deployments with Docker Compose

---

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication (Google OAuth, JWT)
│   │   ├── user/             # User management
│   │   ├── family-tree/      # Family tree CRUD
│   │   ├── shared-family-tree/ # Tree sharing & Access Management (RBAC)
│   │   ├── family-tree-member/           # Member management
│   │   ├── family-tree-member-connection/ # Relationship management
│   │   ├── file/             # File upload (Cloudflare R2)
│   │   ├── notification/     # Push notifications
│   │   └── fcm-token/        # FCM token management
│   ├── database/
│   │   └── schema.ts         # Drizzle ORM schema
│   ├── config/               # Configuration modules
│   │   ├── cache/            # Redis cache configuration
│   │   ├── env/              # Environment validation
│   │   └── ...
│   ├── common/               # Shared resources
│   │   ├── guards/           # Auth guards (JWT, Google OAuth)
│   │   ├── interceptors/     # Request/response interceptors
│   │   └── decorators/       # Custom decorators
│   ├── helpers/              # Utility functions
│   ├── utils/                # Constants and utilities
│   └── main.ts               # Application entry point
├── drizzle/                  # Database migrations
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Local development services
├── .env.example              # Environment variables template
└── package.json              # Dependencies
```

---

## 🧪 Testing

```bash
# Run unit tests
npx nx test api

# Run tests with coverage
npx nx test api --coverage

# Run tests in watch mode
npx nx test api --watch
```

---

## 📚 API Documentation

### Swagger/OpenAPI

Interactive API documentation is available at:
```
http://localhost:${PORT}/docs
```

Features:
- Try out endpoints directly
- View request/response schemas
- Authentication testing
- Zod schema validation

---

## 🔗 Related Documentation

- **Frontend Web**: See [apps/web/README.md](../web/README.md)
- **Shared Library**: See [libs/shared/README.md](../../libs/shared/README.md)
- **Main README**: See [root README.md](../../README.md)

---

## 📖 Key Libraries Documentation

- [NestJS](https://nestjs.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [PostgreSQL](https://www.postgresql.org)
- [Passport.js](https://www.passportjs.org)
- [Zod](https://zod.dev)
- [Sentry](https://docs.sentry.io)
- [Redis](https://redis.io)

---

<div align="center">
  <p>Built with 🚀 NestJS and 🐘 PostgreSQL</p>
  <p>Deployed on Hetzner with ❤️</p>
</div>