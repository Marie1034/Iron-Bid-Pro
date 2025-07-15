# Iron Bid Pro - Professional Bid Calculator

## Overview

This is a full-stack web application for creating and managing construction bids, specifically focused on iron work projects. The application includes user authentication, allowing users to securely calculate project costs, manage bid items, and track bid history. It features a React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Replit authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 15, 2025)

- Added Replit authentication system for user management
- Created landing page for non-authenticated users
- Added dashboard page as the main authenticated home page
- Restructured routing: Landing → Dashboard → Calculator/Bid History
- Updated database schema to include users and sessions tables
- Enhanced security by associating bids with authenticated users
- Added proper error handling for unauthorized access

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and bundling
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Authentication**: Replit OpenID Connect with Passport.js
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful endpoints under `/api` prefix with authentication middleware

### Database Schema
- **users**: User authentication and profile information
- **sessions**: Session storage for user authentication state
- **bids**: Main bid records with client info, location, totals, timestamps, and user association
- **bid_items**: Individual line items for each bid with pricing and quantities
- **Relationships**: Users have many bids, bids have many bid_items

## Key Components

### Frontend Components
- **ProjectInfoForm**: Captures client details and project information
- **ItemCalculator**: Handles predefined iron work items with quantity inputs
- **CustomItemForm**: Allows adding custom bid items beyond predefined ones
- **BidSummary**: Displays calculated totals with markup for materials, labor, and overhead
- **BidHistory**: Lists all saved bids with view and delete functionality

### Backend Components
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Route Handlers**: Express routes for CRUD operations on bids and bid items
- **Middleware**: Request logging and error handling
- **Validation**: Zod schemas for data validation

### Shared Components
- **Schema**: Drizzle schema definitions and Zod validators shared between frontend and backend
- **Types**: TypeScript types generated from database schema

## Data Flow

1. **Bid Creation**: User fills project info → selects predefined items → adds custom items → calculates totals with markup → saves to database
2. **Bid Retrieval**: Frontend queries backend API → backend fetches from database → returns formatted bid data
3. **Bid Management**: Users can view bid history, individual bid details, and delete bids

### Calculation Logic
- Base subtotal from all bid items
- Materials markup: 15% of subtotal
- Labor markup: 25% of subtotal
- Overhead markup: 10% of subtotal
- Total: subtotal + materials + labor + overhead

## External Dependencies

### Frontend Dependencies
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Data Fetching**: TanStack Query for caching and synchronization
- **Form Validation**: React Hook Form with Zod resolvers
- **Date Handling**: date-fns for date formatting

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle ORM for type-safe database operations
- **Development**: tsx for TypeScript execution in development

### Build Dependencies
- **Bundling**: Vite with React plugin
- **TypeScript**: Full TypeScript support with path mapping
- **Development**: Replit-specific plugins for runtime error handling

## Deployment Strategy

### Development
- **Server**: Express with Vite middleware for hot module replacement
- **Database**: Uses environment variable `DATABASE_URL` for connection
- **Build**: Separate client and server builds with shared TypeScript configuration

### Production
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: esbuild bundles Express server to `dist/index.js`
- **Static Serving**: Express serves built client files in production
- **Database**: Drizzle migrations handle schema changes

### Configuration
- **Environment**: Supports both development and production modes
- **Database**: Configured for PostgreSQL with connection pooling
- **Session**: PostgreSQL-backed sessions for user state
- **CORS**: Configured for cross-origin requests in development

The application is designed as a monorepo with clear separation between client, server, and shared code, making it easy to develop, test, and deploy as a cohesive unit.