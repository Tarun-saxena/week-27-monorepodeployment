# Turborepo + Prisma Monorepo Starter

A minimal, working Turborepo setup with Prisma living in its own shared package
(`packages/db`), consumed by an Express app (`apps/http-server`) via workspace
protocol. Clone this instead of wiring Prisma into a monorepo from scratch
every time.

## Stack

- **Turborepo** (npm workspaces) — monorepo task runner
- **Prisma 7** (with `@prisma/adapter-pg`) — database ORM, Postgres
- **Express** — example consumer app (`apps/http-server`)
- **TypeScript** throughout

## Structure

```
apps/
  http-server/     # Express API, consumes @repo/db
packages/
  db/              # Prisma schema, client, migrations — shared across apps
```

## Setup

1. **Clone and rename**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_NEW_REPO_NAME.git my-project
   cd my-project
   ```
   Update `"name"` in the root `package.json` to your project's name.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your database**
   ```bash
   cp apps/http-server/.env.example apps/http-server/.env
   ```
   Fill in `DATABASE_URL` with a Postgres connection string (Neon, Supabase,
   local Postgres, whatever you use). Copy the same value into `packages/db/.env`
   if you plan to run Prisma CLI commands directly from that package.

4. **Generate the Prisma client and apply migrations**
   ```bash
   npm run db:generate
   npm run db:migrate:deploy
   ```

5. **Run it**
   ```bash
   npm run dev
   ```
   Hit `http://localhost:4000/health` — should return `{ ok: true, userCount: 0 }`.

## Adding a new app

1. `mkdir apps/your-app && cd apps/your-app && npm init -y`
2. Add `"@repo/db": "*"` to its `dependencies`
3. `import { prisma } from "@repo/db"` — no separate Prisma setup needed, it
   shares the same schema and client as every other app in the monorepo.

## Adding a new model

1. Edit `packages/db/prisma/schema.prisma`
2. From `packages/db`:
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
3. Commit both the schema change and the new file under `prisma/migrations/`.

## The build vs runtime split (the part worth understanding)

- **Build time:** `prisma generate` only. This creates the client from your
  schema — it does not touch the database.
- **Local dev:** `prisma migrate dev` — creates a new migration from schema
  changes and applies it to your dev database. Run this manually whenever you
  change the schema.
- **Deploy / container startup:** `prisma migrate deploy` — applies existing
  migrations non-interactively. Safe for CI/CD and container entrypoints.
  Never run `migrate dev` here; it can prompt interactively and assumes a
  reachable dev database.

If you containerize any app that depends on `@repo/db`, run `prisma generate`
during the image build, and `prisma migrate deploy` as the container's startup
command — not inside the build stage.

## Why `@repo/db` has a build step

`@repo/db`'s `package.json` points `exports`/`main` at `./dist`, not `./src`.
Turbo's `dev`/`build` tasks are wired so `@repo/db` compiles (`tsc -b`) before
any app that depends on it starts. If you add a new package under `packages/`
that other apps import, give it the same shape: a `build` script, `dist`
output, and `dependsOn: ["^build"]` on consumers in `turbo.json`.
