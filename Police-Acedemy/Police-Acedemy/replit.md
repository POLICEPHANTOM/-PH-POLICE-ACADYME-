# Police Academy Portal

## Overview

This is an Arabic-language Police Academy management portal built for handling user registrations, announcements, applications, ranks, and rules. The application features a dark blue and gold themed interface with RTL (right-to-left) layout support. It serves as an internal management system where users can apply to join, view announcements, browse organizational ranks, and read rules/regulations. Administrators have a dedicated dashboard for managing applications and posting announcements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Layout**: RTL-first design with fixed sidebar navigation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Authentication**: Passport.js with Local Strategy, session-based auth
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **API Structure**: RESTful endpoints under `/api/*` prefix

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Tables**: users, announcements, applications, ranks, rules, settings

### Build System
- **Dev Server**: Vite with HMR for frontend, tsx for backend
- **Production Build**: esbuild for server bundling, Vite for client
- **Output**: Server bundle to `dist/index.cjs`, client to `dist/public`

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` directory used by both frontend and backend
- **API Contract**: Centralized route definitions in `shared/routes.ts` with Zod schemas
- **Storage Abstraction**: `IStorage` interface in `server/storage.ts` for database operations
- **Protected Routes**: Client-side auth check via `/api/user` endpoint, server-side via Passport middleware

## External Dependencies

### Database
- PostgreSQL (required, configured via `DATABASE_URL` environment variable)
- Drizzle Kit for migrations (`npm run db:push`)

### Authentication
- express-session with PostgreSQL session store
- Passport.js local strategy (username/password)

### Third-Party Services
- No external APIs currently integrated
- Google Fonts (Cairo font family for Arabic text)

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (defaults to hardcoded value in dev)