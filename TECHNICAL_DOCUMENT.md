# Mental Math Master Backend - Developer Technical Document

## 1. Purpose

This document is for developers maintaining and deploying the Mental Math Master backend.

The backend is a NestJS service using Prisma, PostgreSQL, Firebase Admin authentication, Redis/BullMQ queue infrastructure, throttling, Helmet, CORS, and Winston logging.

## 2. Prerequisites

- Node.js 20+ recommended
- npm 10+
- Docker Desktop or Docker Engine
- PostgreSQL 15+
- Redis 7+
- Prisma CLI through project dependency
- Firebase service account credentials
- Heroku CLI access for Heroku deployments
- GitHub repository access for GitHub Actions deployment

## 3. Environment Variables

The backend uses `@nestjs/config` and dotenv-based scripts.

Required:

```bash
APP_ENV=
APP_NAME=
PORT=
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
CORS_ORIGIN=
GOOGLE_CLIENT_ID=
```

Queue/Redis:

```bash
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

Recommended admin/subscription variables:

```bash
ADMIN_EMAILS=
REVENUECAT_WEBHOOK_SECRET=
REVENUECAT_BASEURL_V2_RESTAPI=
REVENUECAT_PROJECTID_RESTAPI=
REVENUECAT_API_KEY=
REVENUECAT_ENTITLEMENT_ID=
```

Firebase Admin:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Important: `src/auth/firebase/firebase-admin.module.ts` currently contains hardcoded Firebase Admin credentials. Before QA or production deployment, move those values to environment variables and rotate any exposed key.

Environment files currently used:

- `.env.development`
- `.env.qa`
- `.env.production`
- `.env.test`

Check that each env file has valid line breaks and does not accidentally join values on one line.

## 4. Database Setup

Database engine:

- PostgreSQL
- Prisma schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations`
- Seed file: `prisma/seed.ts`

Local dev DB is defined in `docker-compose.yml`:

```bash
docker compose up dev-db-mmm -d
```

Apply migrations:

```bash
npx prisma migrate deploy
```

Seed data:

```bash
npm run db:seed
```

One-command local DB reset/setup:

```bash
npm run start:db:dev
```

Test DB:

```bash
npm run start:db:test
```

## 5. Redis Setup

Redis is used by BullMQ queue infrastructure.

Local Redis:

```bash
docker compose up dev-cache-mmm -d
```

BullMQ dashboard:

```bash
docker compose up bullmq-dashboard-mmm -d
```

Default dashboard URL:

```bash
http://localhost:3002
```

## 6. Local Setup

```bash
cd mental-math-master-backend
npm install
npm run start:db:dev
npm run start:development
```

Default local API:

```bash
http://localhost:3001
```

Run checks:

```bash
npm run lint
npm run build
```

Integration test example:

```bash
npm run test:integration:game
```

## 7. QA Deployment

Recommended QA flow:

1. Create QA PostgreSQL database.
2. Create QA Redis instance.
3. Set `.env.qa` or platform config vars.
4. Run Prisma migrations.
5. Build the app.
6. Start from `dist/main.js`.

Commands:

```bash
npm ci
npm run build:qa
npm run start:qa
```

Note: `build:qa` already runs `prisma migrate deploy` using `.env.qa`.

## 8. Production Deployment

Recommended production flow:

1. Create production PostgreSQL database.
2. Create production Redis instance.
3. Configure all production environment variables.
4. Run migrations during release/build phase.
5. Build and start the compiled app.

Commands:

```bash
npm ci
npm run build:production
npm run start:production
```

Important current script note: `start:production` currently loads `.env.development`. Update it to load `.env.production` before production deployment.

Recommended package script:

```json
"start:production": "dotenv -e .env.production node dist/main"
```

## 9. Docker Deployment

The backend includes a Dockerfile.

Important current Dockerfile note: it ends with `npm run start:prod`, but `package.json` does not define `start:prod`. Before Docker deployment, either add a `start:prod` script or change the Docker CMD to `npm run start:production`.

Recommended package script:

```json
"start:prod": "node dist/main"
```

QA Docker build:

```bash
docker build -t mental-math-master-backend:qa .
docker run --env-file .env.qa -p 3001:3001 mental-math-master-backend:qa
```

Production Docker build:

```bash
docker build -t mental-math-master-backend:production .
docker run --env-file .env.production -p 3001:3001 mental-math-master-backend:production
```

Docker Compose for full local stack:

```bash
docker compose up dev-db-mmm dev-cache-mmm bullmq-dashboard-mmm -d
```

## 10. Heroku Deployment

Recommended Heroku addons:

- Heroku Postgres
- Heroku Data for Redis

Required Heroku config vars:

```bash
APP_ENV=qa|production
APP_NAME=Mental Math Master
JWT_SECRET=...
CORS_ORIGIN=https://your-ui-domain
GOOGLE_CLIENT_ID=...
DATABASE_URL=...
DIRECT_URL=...
REDIS_HOST=...
REDIS_PORT=...
REDIS_PASSWORD=...
```

Heroku provides `PORT`; do not hardcode it.

For Heroku release migrations, use a release command or GitHub Action step:

```bash
npx prisma migrate deploy
```

## 11. GitHub Actions To Heroku

Required GitHub secrets:

```bash
HEROKU_API_KEY
HEROKU_EMAIL
HEROKU_BACKEND_QA_APP
HEROKU_BACKEND_PROD_APP
```

Example workflow:

```yaml
name: Deploy Backend

on:
  push:
    branches:
      - qa
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: mental-math-master-backend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: mental-math-master-backend/package-lock.json

      - run: npm ci
      - run: npm run lint
      - run: npm run build:qa
        if: github.ref_name == 'qa'
      - run: npm run build:production
        if: github.ref_name == 'main'

      - uses: akhileshns/heroku-deploy@v3.14.15
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          heroku_app_name: ${{ github.ref_name == 'main' && secrets.HEROKU_BACKEND_PROD_APP || secrets.HEROKU_BACKEND_QA_APP }}
          appdir: mental-math-master-backend
```

If Heroku builds the app itself, set config vars in Heroku and run migrations as a Heroku release phase or a post-deploy job.

## 12. Operational Notes

- CORS origins are configured from `CORS_ORIGIN`.
- Rate limits are configured in `src/app-config/throttler.config.ts`.
- Logs use Winston config from `src/app-config/winston.config.ts`.
- OpenTelemetry tracing is active only when `ENV=production`.
- Prisma requires `DATABASE_URL` at runtime.
- Redis should be reachable before queue workers are expected to process jobs.

## 13. Pre-Release Checklist

- Firebase Admin credentials are environment-based and rotated
- `npm run lint` passes
- `npm run build:production` passes
- `npx prisma migrate deploy` succeeds against target DB
- `DATABASE_URL` and `DIRECT_URL` point to the target DB
- `CORS_ORIGIN` points to the target UI domain
- Redis connection variables are valid
- Docker start command matches package scripts
- Heroku config vars are complete
