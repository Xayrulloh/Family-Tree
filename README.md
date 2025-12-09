# 🌳 Family Tree

> **Preserve your family legacy, connect generations, and celebrate your heritage**

A modern, full-stack family tree platform that helps families document their history, preserve memories, and strengthen connections across generations.

🌐 **Live at [famtree.uz](https://famtree.uz)**

---

## 📊 Impact

- **10,000+** Active Families
- **50,000+** Trees Created
- **1M+** Memories Preserved

---

## 🎯 What is Family Tree?

Family Tree is a comprehensive digital platform designed to help families create, manage, and share their genealogical history. It provides an intuitive interface for building interactive family trees, uploading photos and documents, and preserving family stories for future generations.

### Key Features

- **Quick Member Addition** - Add any family member in just seconds with intuitive buttons
- **Unlimited Members** - Create as many members as you want with no limitations
- **Interactive Family Tree Visualization** - Dynamic, zoomable tree views with D3.js
- **Multi-generational Support** - Track unlimited generations and family connections
- **Memory Preservation** - Upload photos, documents, and stories for each family member
- **Collaborative Family Building** - Multiple family members can contribute to the same tree
- **Secure & Private** - OAuth authentication and role-based access control
- **Cloud Storage** - Reliable Cloudflare R2 integration for media storage

### Coming Soon

- **Real User Integration** - Connect family members to actual user accounts
- **Tree Merging** - Automatically combine trees when families unite through marriage

---

## 💡 Problem It Solves

### The Challenge

Families struggle to preserve their heritage and history due to:
- **Lost Connections** - Physical distance and time erode family knowledge
- **Fading Memories** - Stories and photos disappear with older generations
- **Scattered Information** - Family data exists in fragments across different sources
- **Lack of Engagement** - Traditional genealogy tools are complex and unintuitive

### Our Solution

Family Tree provides a centralized, user-friendly platform where families can:
- ✅ Document their complete family history in one place
- ✅ Preserve photos, stories, and memories digitally
- ✅ Collaborate with relatives to build comprehensive family trees
- ✅ Access their family history anytime, anywhere
- ✅ Pass down their legacy to future generations

---

## 🛠️ How It's Built

This project is built with modern, scalable technologies:

### Architecture
- **Monorepo** - Nx workspace for efficient multi-app development
- **TypeScript** - End-to-end type safety

### Frontend
- **React 18** - Modern UI with hooks and concurrent features
- **Effector** - Predictable state management
- **Atomic Router** - Type-safe routing
- **Ant Design** - Professional UI component library
- **D3.js** - Interactive family tree visualizations
- **Vite** - Lightning-fast build tooling
- **TailwindCSS** - Utility-first styling

### Backend
- **NestJS** - Enterprise-grade Node.js framework
- **PostgreSQL** - Robust relational database
- **Drizzle ORM** - Type-safe database queries
- **Passport.js** - OAuth authentication (Google)
- **AWS S3** - Scalable media storage
- **Redis** - High-performance caching
- **Sentry** - Error tracking and monitoring

### DevOps & Tools
- **Docker** - Containerized development environment
- **Hetzner** - High-performance cloud hosting
- **Vercel** - Frontend deployment and hosting
- **Neon** - Serverless PostgreSQL database
- **Sentry** - Error tracking and monitoring
- **pnpm** - Fast, efficient package management
- **Biome** - Fast linting and formatting
- **Zod** - Runtime type validation

---

## 🚀 Getting Started

For detailed setup instructions:
- **Backend (API)**: See [apps/api/README.md](apps/api/README.md)
- **Frontend (Web)**: See [apps/web/README.md](apps/web/README.md)

---

## 📁 Project Structure

```
Family-Tree/
├── apps/
│   ├── api/          # NestJS backend application
│   └── web/          # React frontend application
├── libs/             # Shared libraries and utilities
├── .github/          # GitHub Actions workflows
└── nx.json           # Nx workspace configuration
```

---

## 🧪 Development

### Code Quality

```bash
# Run linting
pnpm check:lint

# Run security scan
pnpm scan
```

### Nx Commands

```bash
# Visualize project graph
npx nx graph

# Show project details
npx nx show project api
npx nx show project web

# Run specific targets
npx nx build api
npx nx test web
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🔗 Links

- **Website**: [famtree.uz](https://famtree.uz)
- **Documentation**: [Nx Documentation](https://nx.dev)

---

<div align="center">
  <p>Built with ❤️ for families around the world</p>
  <p>Preserving memories, connecting generations</p>
</div>
