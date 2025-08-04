# Overview

This is a full-stack web application called "The Casino & The Church" - an interactive game with a split-screen homepage featuring casino and church themes. The application uses a modern React frontend with Express.js backend, PostgreSQL database with Drizzle ORM, and includes 3D graphics capabilities with Three.js/React Three Fiber.

The project appears to be a gaming application with dual themes (casino vs church) that includes audio features, Phaser.js game scenes, and a comprehensive UI component library built on top of Radix UI and Tailwind CSS.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main UI framework
- **Vite** as the build tool and development server with hot module replacement
- **Tailwind CSS** for styling with a custom design system using CSS variables
- **Radix UI** components for accessible, unstyled UI primitives
- **React Three Fiber** and **Drei** for 3D graphics and WebGL rendering
- **Phaser.js** for 2D game scenes and pixel art effects
- **Zustand** for client-side state management (game state and audio controls)
- **TanStack React Query** for server state management and API caching

## Backend Architecture
- **Express.js** server with TypeScript
- **REST API** design with `/api` prefix for all endpoints
- **In-memory storage** implementation with interface for easy database swapping
- **Session-based** request logging and error handling middleware
- **Hot reload** development setup with Vite integration

## Data Storage
- **PostgreSQL** database configured through environment variables
- **Drizzle ORM** for type-safe database operations and migrations
- **Neon Database** adapter for serverless PostgreSQL connectivity
- **Schema-first** approach with shared TypeScript types between client and server

## Authentication & Authorization
- Basic user schema with username/password fields
- Zod validation schemas for input validation
- Session management capabilities (connect-pg-simple dependency suggests session store)

## External Dependencies
- **Neon Database** - Serverless PostgreSQL hosting
- **Google Fonts** - "Press Start 2P" pixel font for retro gaming aesthetic
- **Fontsource** - Self-hosted Inter font files
- **Audio Assets** - MP3/OGG/WAV file support for game sounds
- **3D Models** - GLTF/GLB format support for 3D assets
- **GLSL Shaders** - Custom shader support via vite-plugin-glsl

## Key Design Patterns
- **Monorepo Structure** - Shared types and schemas between client/server in `/shared`
- **Component Composition** - Extensive use of Radix UI primitives with custom styling
- **Hook-based State** - Custom hooks for mobile detection and game state management
- **Asset Pipeline** - Vite configuration for handling various media file types
- **Error Boundaries** - Runtime error overlay for development debugging
- **Responsive Design** - Mobile-first approach with breakpoint-based layouts