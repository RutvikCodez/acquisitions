# Acquisitions App - Docker Deployment Guide

This guide explains how to run the Acquisitions application with Neon Database in both development and production environments using Docker.

## Overview

The application supports two distinct deployment modes:

- **Development**: Uses **Neon Local** proxy for ephemeral database branches
- **Production**: Connects directly to **Neon Cloud Database**

## Prerequisites

### Required Software

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v3.8+

### Required Neon Configuration

1. A Neon project with API access
2. Neon API Key (get from [Neon Console](https://console.neon.com))
3. Project ID and Branch ID

## Development Environment Setup

### 1. Configure Neon Local Environment

Copy the development environment template:

```powershell
# Windows PowerShell
Copy-Item .env.development .env.dev.local
```

Edit `.env.dev.local` and update the following variables:

```env
# Neon Local Configuration
NEON_API_KEY=neon_api_...your_actual_key
NEON_PROJECT_ID=your_project_id
PARENT_BRANCH_ID=your_parent_branch_id
```

### 2. Start Development Environment

Run the application with Neon Local proxy:

```bash
# Start with ephemeral database branches
docker-compose -f docker-compose.dev.yml --env-file .env.dev.local up --build

# Or run in background
docker-compose -f docker-compose.dev.yml --env-file .env.dev.local up -d --build
```

### 3. Verify Development Setup

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Database**: postgres://user:password@localhost:5432/neondb

The Neon Local container automatically:

- Creates a fresh ephemeral branch on startup
- Deletes the branch when the container stops
- Routes connections to your Neon project

### 4. Development Workflow

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down

# Rebuild and restart
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d
```

## Production Environment Setup

### 1. Configure Production Environment

Create production environment file (keep this secure):

```bash
cp .env.production .env.prod.local
```

Edit `.env.prod.local` with your production values:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@your-neon-host.neon.tech/dbname?sslmode=require
ARCJET_KEY=your_production_arcjet_key
```

### 2. Deploy to Production

```bash
# Start production services
docker-compose -f docker-compose.prod.yml --env-file .env.prod.local up -d --build

# View production logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check application health
curl http://localhost:3000/health
```

### 3. Production Monitoring

The production setup includes:

- Health checks every 30 seconds
- Automatic restart on failure
- Resource limits (1 CPU, 512MB RAM)
- Security hardening (read-only filesystem, no new privileges)

## Database Migrations

### Development (using Neon Local)

```bash
# Run migrations against Neon Local
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate new migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate
```

### Production

```bash
# Run migrations against Neon Cloud
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

## Environment Variables Reference

### Development Environment

| Variable           | Description                              | Example                                             |
| ------------------ | ---------------------------------------- | --------------------------------------------------- |
| `NODE_ENV`         | Environment mode                         | `development`                                       |
| `DATABASE_URL`     | Local database connection                | `postgresql://user:password@neon-local:5432/neondb` |
| `NEON_API_KEY`     | Neon API key for Local proxy             | `neon_api_...`                                      |
| `NEON_PROJECT_ID`  | Your Neon project ID                     | `proj_...`                                          |
| `PARENT_BRANCH_ID` | Branch to create ephemeral branches from | `br_...`                                            |

### Production Environment

| Variable       | Description             | Example                             |
| -------------- | ----------------------- | ----------------------------------- |
| `NODE_ENV`     | Environment mode        | `production`                        |
| `DATABASE_URL` | Neon cloud database URL | `postgresql://...@...neon.tech/...` |
| `ARCJET_KEY`   | Production Arcjet key   | `ajkey_prod_...`                    |

## Troubleshooting

### Common Issues

#### Development: Neon Local won't connect

```bash
# Check Neon Local container logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify environment variables are set
docker-compose -f docker-compose.dev.yml config
```

#### Production: Database connection fails

```bash
# Test database connection manually
docker-compose -f docker-compose.prod.yml exec app node -e "console.log(process.env.DATABASE_URL)"

# Check application logs
docker-compose -f docker-compose.prod.yml logs app
```

#### Port conflicts

```bash
# If port 3000 is already in use, modify docker-compose files:
# Change "3000:3000" to "3001:3000" or another available port
```

### Cleaning Up

```bash
# Remove development containers and volumes
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f

# Remove production containers
docker-compose -f docker-compose.prod.yml down -v
```

## Security Best Practices

1. **Never commit `.env.production`** - contains sensitive production credentials
2. **Use different API keys** for development and production
3. **Rotate credentials** regularly
4. **Use secrets management** in production deployments (Kubernetes secrets, Docker secrets, etc.)
5. **Enable SSL/TLS** for production database connections

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Production
        env:
          DATABASE_URL: ${{ secrets.NEON_DATABASE_URL }}
          ARCJET_KEY: ${{ secrets.ARCJET_KEY }}
        run: |
          docker-compose -f docker-compose.prod.yml up -d --build
```

## Advanced Configuration

### Custom Docker Network

```bash
# Create custom network
docker network create acquisitions-prod

# Update docker-compose.prod.yml to use external network
networks:
  default:
    external:
      name: acquisitions-prod
```

### Volume Mounts for Logs

```yaml
# Add to docker-compose.prod.yml
volumes:
  - ./logs:/app/logs
```

## Support

For issues related to:

- **Neon Database**: [Neon Documentation](https://neon.com/docs)
- **Docker**: [Docker Documentation](https://docs.docker.com)
- **Application**: Check application logs and GitHub issues
