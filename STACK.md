# LLL — Tech Stack

## Frontend
- **React** + **Vite** + **TypeScript**
- **Tailwind CSS** for styling

## Backend / Database / Auth
- **Supabase** (hosted Postgres)
  - PostgreSQL database
  - Google OAuth via Supabase Auth
  - Row-level security for data access control
- **Prisma** ORM for type-safe database access

## Hosting
- **Vercel** (free tier) for frontend hosting and auto-deploys

## Local Development
- **Node.js** runtime
- **Docker** for local Postgres
- **Supabase CLI** to run the full Supabase stack locally (Postgres, Auth, etc.)

## CI/CD
- **GitHub Actions** (free tier)
  - Linting (ESLint)
  - Type checking (TypeScript)
  - Tests (Vitest)
  - Build verification
- **Vercel** auto-deploy on push to `main`, preview deploys on PRs
- **Supabase CLI** for running database migrations in CI
