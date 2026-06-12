# Prisma Guide

This document explains the Prisma commands used in the backend, the migration workflow, and recommended practices for a production-ready NestJS/PostgreSQL service.

## Overview

The backend uses Prisma with PostgreSQL. The database schema lives in `prisma/schema.prisma`, and Prisma generates its client from that schema.

Key Prisma workflows:
- `prisma migrate dev` — development migrations
- `prisma migrate deploy` — production-safe migration application
- `prisma db push` — schema sync without migrations
- `prisma db pull` — infer schema from an existing database
- `prisma db seed` — seed data after migration
- `prisma generate` — regenerate Prisma client

## Current baseline

The current database schema in `prisma/schema.prisma` and the existing migration under `prisma/migrations/` represent the finalized baseline for this project.

From now on, treat this version as the definitive development DB structure. Future changes should be implemented as new Prisma migrations, not by re-syncing or manually editing the production database.

Use `prisma migrate dev` for local feature work and `prisma migrate deploy` for staging/production rollouts. If the current DB is already provisioned and matches the migration history, continue from this baseline rather than resetting the schema.

## Package scripts

The backend already defines useful npm scripts in `package.json`:

```json
"scripts": {
  "start:dev": "nest start --watch",
  "start:db:dev": "docker compose rm dev-db-mmm -s -f -v && docker compose up dev-db-mmm -d && sleep 3 && prisma migrate deploy && prisma db seed",
  "start:db:test": "docker compose -f docker-compose.yml rm test-db-mmm -s -f -v && docker compose -f docker-compose.yml up test-db-mmm -d && sleep 3 && dotenv -e .env.test -- prisma migrate deploy && dotenv -e .env.test -- prisma db seed"
}
```

### Recommended local development flow

1. Start the local development DB container:

```bash
npm run start:db:dev
```

2. Make schema changes in `prisma/schema.prisma`.
3. Create a new migration in development:

```bash
npx prisma migrate dev --name add-new-field
```

4. Review generated SQL in `prisma/migrations/<timestamp>_add-new-field/`.
5. Seed the DB if needed:

```bash
npx prisma db seed
```

6. Run the app:

```bash
npm run start:dev
```

## Prisma commands explained

### `prisma migrate dev`

Use this command in active development to create a migration from your Prisma schema changes and apply it to the local database.

Example:

```bash
npx prisma migrate dev --name add-user-status
```

What it does:
- compares `prisma/schema.prisma` to the local database
- generates a migration folder under `prisma/migrations`
- applies the migration to the database
- updates Prisma Client if needed

Use this only on development or feature branches. Do not run `migrate dev` directly on production.

### `prisma migrate deploy`

This is the production-safe command used to apply all pending migrations in order.

Example:

```bash
npx prisma migrate deploy
```

What it does:
- reads all migrations from `prisma/migrations`
- applies any unapplied migrations to the connected database
- does not create new migrations
- is safe to run in CI/CD and deployment pipelines

In this repository, `npm run start:db:dev` and `npm run start:db:test` already call `prisma migrate deploy`.

### `prisma db push`

This command syncs Prisma schema with the database without creating migration files.

Example:

```bash
npx prisma db push --preview-feature
```

When to use it:
- initial prototyping when you do not want migrations yet
- introspecting a throwaway database

When not to use it:
- production deployments with an evolving schema
- projects where schema versioning and rollback history are required

### `prisma db pull`

Use this command when the database already exists and you want Prisma to infer the schema from it.

Example:

```bash
npx prisma db pull
```

This updates `prisma/schema.prisma` from the live DB structure.

Use case:
- onboarding a legacy database
- inspecting production schema after manual DB changes

### `prisma db seed`

This runs the seed script configured in `package.json` under the `prisma` section.

Example:

```bash
npx prisma db seed
```

In this repository, Prisma loads `prisma/seed.ts`.

Seed scripts are useful for:
- creating test accounts
- populating required lookup data
- bootstrapping defaults for a new environment

### `prisma generate`

Regenerates the Prisma Client after schema or generator changes.

Example:

```bash
npx prisma generate
```

This command typically runs automatically as part of `prisma migrate dev` or `prisma migrate deploy`, but it is still useful when you change the Prisma generator configuration.

## How migration works

Prisma migrations are stored as SQL files in `prisma/migrations/<timestamp>_<name>/migration.sql`.

Workflow:
1. Update `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <meaningful-name>`.
3. Prisma generates a new migration folder and applies the SQL to the local DB.
4. Review the SQL before committing.
5. Commit both the schema and migration folder to git.

Production deployment flow:
1. Merge the branch containing the migration.
2. Deploy the application with the updated code and migration files.
3. Run `npx prisma migrate deploy` on the target database.
4. Run `npx prisma db seed` if the environment needs seed data.

### Migration best practices

- keep migration names short and meaningful, e.g. `add-user-status`, `rename-settings-columns`, `add-queue-manager-index`
- always review generated SQL before committing
- commit migrations together with the schema change
- avoid manual DB drift in production; use migrations rather than ad-hoc SQL changes
- if the database is managed by a container, allow the service startup to run `prisma migrate deploy` as part of the deployment step
- prefer `prisma migrate deploy` in CI and production instead of `migrate dev`

### When to use `db push` vs migrations

Use `db push` for quick prototypes or scratch environments when no migration history is needed.
Use migrations for any staging/production system where you need:
- a reproducible schema history
- auditability of schema changes
- roll-forward deployment

## Environment and deployment notes

- `DATABASE_URL` should point to the target PostgreSQL instance.
- `prisma migrate deploy` expects the database to already exist and the connection to be valid.
- `prisma db seed` should be idempotent if run multiple times in the same environment.
- do not seed production data with test user accounts or debug fixtures.

### Example production deployment step

```bash
# build the backend image, deploy code, then run migrations remotely
docker compose -f docker-compose.yml up -d --build
docker exec -it mental-math-master-backend npm run prisma:migrate:deploy
# or directly:
npx prisma migrate deploy
npx prisma db seed
```

> Note: There is no existing `prisma:migrate:deploy` npm script today, but adding one is a good practice for consistent deployments.

## Troubleshooting

- If `prisma migrate deploy` fails, inspect the migration SQL files and the database error.
- If `prisma db pull` changes the schema unexpectedly, verify the live database and ignore unsupported features.
- If Prisma Client is stale, run `npx prisma generate`.
- If the DB schema drifts, avoid manually modifying production tables and instead generate a migration that reconciles the change.

## Summary

Prisma in this backend is used as a schema-first ORM with migration tracking. For production-level work,
prefer migration files and `prisma migrate deploy`, keep `prisma/schema.prisma` in sync with migrations, and use seed scripts only for environment bootstrapping.
