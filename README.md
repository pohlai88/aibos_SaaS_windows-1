# AI-BOS: The Windows OS for SaaS

> **Revolutionary meta-platform where micro-apps plug in seamlessly and communicate automatically**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/aibos/platform)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## 🎯 **What is AI-BOS?**

AI-BOS is the **"Windows OS for SaaS"** - a unified platform that acts as an operating system for business applications. Just like Windows provides a shell for desktop apps, AI-BOS provides a web-based shell where micro-applications can:

- **Plug in seamlessly** without complex integrations
- **Communicate automatically** via intelligent event bus
- **Share data** through unified APIs and real-time sync
- **Scale independently** while maintaining system coherence

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm 9+
- Supabase account (for database)
- Git

### **Installation**
```bash
# Clone the repository
git clone https://github.com/aibos/platform.git
cd aibos_SaaS_windows-1-1

# Install dependencies
npm install

# Set up environment variables
cp railway-1/backend/env.example railway-1/backend/.env
cp railway-1/frontend/env.example railway-1/frontend/.env

# Build and deploy
cd railway-1
./build-and-deploy.sh  # Unix/Linux/macOS
# OR
./build-and-deploy.bat # Windows
```

### **Database Setup**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema: `railway-1/supabase-schema.sql`
3. Update your `.env` files with Supabase credentials

### **Development**
```bash
# Start backend (from railway-1/backend/)
npm run dev

# Start frontend (from railway-1/frontend/)
npm run dev

# Access the platform
open http://localhost:3000
```

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    AI-BOS Platform                          │
├─────────────────────────────────────────────────────────────┤
│  🖥️ Shell (Next.js)   │  🔄 Event Bus     │  🗄️ Database    │
│  • Window Manager     │  • Real-time Sync │  • Supabase     │
│  • Dock System        │  • App Events     │  • Row Security │
│  • Multi-tenant UI    │  • Data Flow      │  • Multi-tenant │
├─────────────────────────────────────────────────────────────┤
│  🔌 Micro-Apps        │  🛡️ Security      │  🚀 Deployment  │
│  • CRM                │  • JWT Auth       │  • Railway      │
│  • Accounting         │  • RBAC           │  • Vercel       │
│  • Inventory          │  • API Keys       │  • Auto-scale   │
└─────────────────────────────────────────────────────────────┘
```

### **Core Components**

#### **Frontend (Next.js Shell)**
- **Window Manager**: Draggable, resizable app windows
- **Dock System**: App launcher with running indicators
- **Real-time UI**: Live updates and notifications
- **Multi-tenant**: Secure tenant isolation

#### **Backend (Node.js API)**
- **Event Bus**: Automatic app-to-app communication
- **Manifest Engine**: Dynamic app loading and configuration
- **Data Layer**: Unified API for all micro-apps
- **Security**: JWT authentication with row-level security

#### **Database (Supabase)**
- **PostgreSQL**: Production-ready relational database
- **Real-time**: WebSocket-based live data sync
- **Row Security**: Automatic tenant data isolation
- **Auto-backup**: Built-in backup and recovery

## 🔌 **Demo Applications**

AI-BOS includes several demo micro-applications:

- **📊 CRM**: Customer relationship management
- **💰 Accounting**: Financial tracking and reporting  
- **📦 Inventory**: Stock management and tracking
- **🧮 Tax Calculator**: Automated tax calculations
- **⚡ Realtime Demo**: Live WebSocket communication

## 🌟 **Key Features**

### **🎨 Modern UI/UX**
- macOS-inspired window management
- Responsive design for all devices
- Dark/light theme support
- Accessibility-first development

### **🔄 Real-time Everything**
- Live data synchronization
- Real-time notifications
- WebSocket-based communication
- Automatic conflict resolution

### **🛡️ Enterprise Security**
- Multi-factor authentication
- Role-based access control
- Row-level security policies
- API rate limiting and monitoring

### **🚀 Developer Experience**
- TypeScript throughout
- Comprehensive testing suite
- Hot reload development
- One-command deployment

### **📈 Scalability**
- Multi-tenant architecture
- Horizontal scaling ready
- CDN optimization
- Database sharding support

## 📚 **Documentation**

### **Architecture & Design**
- [🏗️ Architecture Guide](./Docs/aibos-architecture.md) - Deep dive into system design
- [📐 Diagrams](./Docs/aibos-diagrams.md) - Visual architecture diagrams
- [📋 Final Summary](./Docs/aibos-final-summary.md) - Complete project overview

### **Development Guides**
- [🚀 Quick Start Guide](./Docs/microDevQuickStart/README-SIMPLE.md) - Get started in 5 minutes
- [👩‍💻 Developer Guide](./Docs/microDevQuickStart/MICRO_DEVELOPER_GUIDE.md) - Comprehensive development guide
- [✅ Developer Success](./Docs/microDevQuickStart/MICRO_DEVELOPER_SUCCESS.md) - Best practices and patterns

### **API Documentation**
- [🔌 API Reference](./railway-1/README.md) - Complete API documentation
- [🏃‍♂️ Deployment Guide](./railway-1/HANDOVER_GUIDE.md) - Production deployment guide
- [🔧 Integration Guide](./railway-1/SHARED_LIBRARY_INTEGRATION.md) - Shared library usage

### **Shared Library**
- [📚 Shared Library](./shared/README.md) - Comprehensive utilities and components
- [🎨 UI Components](./shared/ui-components/README.md) - Reusable React components
- [🔍 Type Definitions](./shared/types/) - TypeScript type system

## 🛠️ **Development**

### **Project Structure**
```
aibos_SaaS_windows-1-1/
├── railway-1/                 # Main application
│   ├── backend/              # Node.js API (TypeScript)
│   ├── frontend/             # Next.js shell
│   └── README.md             # Platform API docs
├── shared/                   # Shared library
│   ├── lib/                  # Core utilities
│   ├── types/                # TypeScript types
│   ├── ui-components/        # React components
│   └── README.md             # Library documentation
├── Docs/                     # Architecture documentation
└── scripts/                  # Build and deployment scripts
```

### **Available Scripts**
```bash
# Development
npm run dev              # Start development server
npm run type-check       # Run TypeScript checks
npm run lint             # Run code quality checks
npm run test             # Run test suite

# Production
npm run build            # Build for production
npm run preview          # Preview production build
npm run deploy           # Deploy to production

# Quality Assurance
npm run format           # Format code with Prettier
npm run test:coverage    # Run tests with coverage
npm run audit            # Security audit
```

### **Environment Variables**
Create `.env` files based on the examples:
- `railway-1/backend/.env` - Backend configuration
- `railway-1/frontend/.env` - Frontend configuration

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - Secret for JWT token signing
- `NODE_ENV` - Environment (development/production)

## 🚢 **Deployment**

### **Backend (Railway)**
```bash
cd railway-1/backend
railway login
railway init
railway up
railway variables set JWT_SECRET=your-secret-key
```

### **Frontend (Vercel)**
```bash
cd railway-1/frontend
vercel
vercel env add NEXT_PUBLIC_API_URL
# Enter your Railway backend URL
```

### **Automated Deployment**
Use the provided scripts for automated deployment:
- `railway-1/build-and-deploy.sh` (Unix/Linux/macOS)
- `railway-1/build-and-deploy.bat` (Windows)

## 🤝 **Contributing**

We welcome contributions! Please see:
- [📋 Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [👨‍💼 Code Owners](./CODEOWNERS) - Code review assignments
- [🚀 Deployment Strategy](./DEPLOYMENT_STRATEGY.md) - Release process

### **Development Workflow**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run quality checks: `npm run lint && npm run test`
5. Commit with conventional commits: `feat: add amazing feature`
6. Push and create a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- 📧 **Email**: support@aibos.dev
- 💬 **Discord**: [Join our community](https://discord.gg/aibos)
- 📚 **Docs**: [Full documentation](./Docs/)
- 🐛 **Issues**: [Report bugs](https://github.com/aibos/platform/issues)

## 🏆 **Acknowledgments**

Built with ❤️ by the AI-BOS team using:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Railway](https://railway.app/) - Backend deployment
- [Vercel](https://vercel.com/) - Frontend deployment

---

**Ready to revolutionize your SaaS architecture?** Get started with AI-BOS today! 🚀
