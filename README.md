# Xtreamium Web

A modern React-based web application for streaming IPTV content from your subscription to a local proxy application, which launches media players like MPV or VLC to play the streams.

## 🎥 Features

- **IPTV Stream Management** - Browse and organize your IPTV channels
- **EPG Integration** - Electronic Program Guide support for channel listings
- **Local Proxy Integration** - Connects to a local ASP.NET proxy application
- **Multi-Server Support** - Manage multiple IPTV server configurations
- **Channel Search** - Find channels quickly with built-in search
- **Theme Support** - Dark/light theme toggle
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI Components**: Radix UI + shadcn/ui + Tailwind CSS v4
- **State Management**: Zustand + TanStack Query
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Package Manager**: Bun
- **Build Tool**: Vite
- **Deployment**: Docker + Nginx

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for development)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd xtreamium-web
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment**

   ```bash
   # Copy environment file
   cp .env.production .env.development
   # Edit the environment file with your settings
   ```

4. **Start development server**

   ```bash
   # Plain development (HTTP)
   bun run dev:plain
   
   # Development with SSL proxy (HTTPS)
   bun run dev
   ```

The application will be available at:

- HTTP: `http://localhost:5173`
- HTTPS: `https://streams.dev.fergl.ie:3000` (requires SSL certificates)

### Building for Production

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

### Docker Deployment

```bash
# Build Docker image
./scripts/build_docker.sh

# Or with custom tag and environment
./scripts/build_docker.sh xtreamium-web:v1.0.0 production

# Run the container
docker run -p 8080:80 xtreamium-web:latest
```

## 📦 Scripts

- `bun run dev` - Start development server with SSL proxy
- `bun run dev:plain` - Start development server (HTTP only)
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build
- `bun run release` - Create a new release
- `bun run release:patch` - Create a patch release
- `bun run release:minor` - Create a minor release  
- `bun run release:major` - Create a major release

## 🏗️ Architecture

The application consists of three main components:

1. **Frontend Web App** (this repository) - React-based UI for managing streams
2. **Backend API Server** - Python FastAPI server for business logic
3. **Local Proxy Application** - ASP.NET application running in user space

## 🧩 Key Components

- **Channel Management** - Browse and search IPTV channels
- **EPG (Electronic Program Guide)** - View program schedules
- **Server Configuration** - Manage multiple IPTV server connections
- **Proxy Integration** - Interface with local media player proxy
- **Theme System** - Dark/light mode with system preference detection

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) components:

- All UI components are in `src/components/ui/` (do not edit directly)
- Custom components should be created in `src/components/`
- Components use snake-case filenames and CamelCase component names

## 🔧 Development Guidelines

- **Package Manager**: Use `bun` for all operations (install, run, build)
- **API Calls**: Use Axios for HTTP requests
- **Styling**: Tailwind CSS with shadcn/ui components
- **File Naming**: snake-case for files, CamelCase for React components
- **Comments**: Keep to a minimum, only where absolutely necessary

## 📁 Project Structure

```text
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components (don't edit)
│   ├── layouts/        # Layout components
│   ├── navigation/     # Navigation components
│   ├── widgets/        # Reusable widgets
│   └── epg/           # EPG-specific components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API and service layer
├── models/             # TypeScript type definitions
├── contexts/           # React contexts
├── lib/               # Utility libraries
└── utils/             # Helper utilities
```

## 🚢 Deployment

The application is containerized using Docker with multi-stage builds:

1. **Builder Stage**: Uses Bun to install dependencies and build the app
2. **Runtime Stage**: Uses Nginx Alpine to serve the static files

GitHub Actions automatically builds and publishes Docker images on tagged releases.

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Use `bun` for all package management operations
3. Test locally before submitting changes
4. Keep component modifications minimal and ask before editing shadcn/ui components

## 📄 License

This project is private and proprietary.
