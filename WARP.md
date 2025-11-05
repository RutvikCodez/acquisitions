# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js Express API for an acquisitions system using modern JavaScript (ES modules), PostgreSQL with Neon serverless, and Drizzle ORM. The application follows a layered MVC architecture with separation of concerns.

## Development Commands

### Core Development

- `npm run dev` - Start development server with watch mode (uses `node --watch`)
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes

### Database Operations

- `npm run db:generate` - Generate database migrations from schema
- `npm run db:migrate` - Apply migrations to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Architecture & Structure

### Path Mapping System

The project uses Node.js subpath imports for clean module resolution:

- `#config/*` → `./src/config/*` - Configuration modules (database, logger)
- `#controllers/*` → `./src/controllers/*` - Request handlers
- `#middleware/*` → `./src/middleware/*` - Express middleware (directory exists but not populated yet)
- `#models/*` → `./src/models/*` - Drizzle ORM schemas
- `#routes/*` → `./src/routes/*` - Express route definitions
- `#services/*` → `./src/services/*` - Business logic layer
- `#utils/*` → `./src/utils/*` - Shared utilities (JWT, cookies, formatting)
- `#validations/*` → `./src/validations/*` - Zod validation schemas

### Application Flow

- **Entry Point**: `src/index.js` → loads environment and starts `src/server.js`
- **App Configuration**: `src/app.js` - Express setup with middleware, CORS, security headers
- **Database**: Neon PostgreSQL with Drizzle ORM, connection configured in `src/config/database.js`
- **Logging**: Winston logger with file and console transports (`src/config/logger.js`)

### Current Features

- **Authentication**: JWT-based auth with signup endpoint (`/api/auth/sign-up`)
- **User Management**: User model with roles (user/admin), bcrypt password hashing
- **Request Validation**: Zod schemas for input validation
- **Security**: Helmet, CORS, cookie-parser middleware
- **Health Checks**: `/health` endpoint with uptime and timestamp

### Database Schema

- **Users table**: id, name, email (unique), password (hashed), role, timestamps
- **Migrations**: Located in `/drizzle` directory, managed by Drizzle Kit

## Code Standards

### ESLint Configuration

- ES2022 modules with strict linting rules
- 2-space indentation, single quotes, semicolons required
- No unused variables except those prefixed with `_`
- Prefer const, arrow functions, object shorthand

### Prettier Configuration

- Single quotes, semicolons, 2-space tabs
- 80 character line width
- ES5 trailing commas
- LF line endings

## Environment Setup

Copy `.env.example` to `.env` and configure:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Winston log level
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (add to .env)

## Development Notes

### Database Workflow

1. Modify schemas in `src/models/*.js`
2. Run `npm run db:generate` to create migrations
3. Run `npm run db:migrate` to apply changes
4. Use `npm run db:studio` for GUI database management

### API Structure

- All API routes prefixed with `/api`
- Authentication routes under `/api/auth`
- Request validation using Zod schemas in `#validations/*`
- Error handling with Winston logging
- Response formatting utilities in `#utils/format.js`

### Testing

The project is set up for testing (ESLint config includes Jest globals) but no test files exist yet. Consider adding tests in a `tests/` directory.
