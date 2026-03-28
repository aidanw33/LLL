# LLL Development Guidelines

## Commands
- `npm run dev` — start local Supabase + Vite dev server
- `npm run dev:restart` — full Supabase restart + dev server (use after config changes)
- `npm run dev:frontend` — Vite only (no Supabase restart)
- `npm run build` — type check + production build
- `npm run lint` — ESLint
- `npm test` — run tests once
- `npm run test:watch` — run tests in watch mode

## Project Structure
```
src/
  components/     # Grouped by feature: components/auth/, components/reader/
  hooks/          # Custom React hooks
  contexts/       # React context providers
  lib/            # Supabase client, utilities
  types/          # Shared TypeScript types
prisma/
  schema.prisma   # Database schema (single source of truth)
  migrations/     # Generated migration files
supabase/
  config.toml     # Local Supabase config
```

## Code Style

### TypeScript
- Strict mode enforced
- Use `type` over `interface`
- No `any` — use `unknown` when type is uncertain
- Named exports for all components and hooks

### React
- Function components only
- Group components by feature in subdirectories
- Split components over ~150 lines
- React Context for state management
- Keep business logic in hooks, UI in components

### Styling
- Tailwind utility classes only — no custom CSS per component
- No `@apply` — extract repeated patterns into components instead
- Follow existing dark theme: slate backgrounds, indigo accents

### Database
- All schema changes via Prisma migrations (`npx prisma migrate dev`)
- RLS enabled on every table
- Never expose Supabase secret key in frontend code
- Use Supabase client for auth, Prisma for typed DB queries

### Testing
- Test critical paths: auth flows, data mutations, core features
- Use React Testing Library — test behavior, not implementation
- Tests must pass in CI without env vars (vitest.config.ts provides fallbacks)

## Git Workflow
- Feature branches off `main`: `feat/`, `fix/`, `chore/`
- PRs to `main` — CI must pass before merge
- One logical change per commit
- Don't commit `.env` or secrets

## CI/CD
- GitHub Actions runs: lint, type check, test, build
- Vercel auto-deploys `main`, preview deploys on PRs
- Supabase cloud config is separate from local — changes to both must be made independently
