# مصاريف المشاريع (Site Expenses)

A responsive, Arabic-first (RTL) web app for a building contractor to track money received per project and expenses deducted from it, showing the remaining balance ("الباقي في الجيب") for each project.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/site-expenses run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Clerk auth env (auto-provisioned, do not set manually): `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Auth: Replit-managed Clerk (email/password + Google), one shared Postgres DB between the API and the web frontend
- Frontend: React + Vite, Tailwind v4, wouter routing, TanStack Query

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the API contract (projects, transactions, dashboard summary)
- `lib/db/src/schema/` — Drizzle schema: `projects` (has `userId`), `transactions`
- `artifacts/api-server/src/routes/` — Express routes: `projects.ts`, `transactions.ts`, `dashboard.ts`, all behind `requireAuth`
- `artifacts/api-server/src/middlewares/requireAuth.ts` — Clerk session check, sets `req.userId`
- `artifacts/site-expenses/src/App.tsx` — Clerk provider, routing, sign-in/sign-up wiring
- `artifacts/site-expenses/src/pages/` — `landing.tsx` (public, signed-out), `sign-in.tsx`, `sign-up.tsx`, `dashboard.tsx` (post-login project picker + totals), `project-details.tsx` (per-project transactions)

## Architecture decisions

- Projects are private per account: every project row has a `userId` (Clerk user id). All project/transaction/dashboard queries are scoped by the signed-in user's id.
- Balance (`totalReceived - totalSpent`) is always computed server-side from the transactions table, never stored, so it can't drift.
- One project (seeded before auth existed) has `userId = NULL`; the first authenticated user to list their projects automatically "claims" any orphaned projects (see `claimOrphanProjects` in `routes/projects.ts`). This is a one-time migration shim, not a general sharing mechanism.
- Dashboard (`/dashboard`) is the landing screen after login — it's where the user picks a project first; clicking a project opens its expenses/balance/transaction history.

## Product

- Public landing page (signed-out) explains the app and links to sign-up/sign-in.
- After login: dashboard shows total received/spent/balance across all of the user's projects, and a list of projects to pick from.
- Project detail page: prominent balance card (green/red), full transaction history, add/edit/delete deposits and expenses.

## User preferences

- Language: Arabic (Libyan dialect tone), full RTL layout throughout.
- Platform: single responsive web app (desktop + mobile browser) — no separate native/Expo app.
- Data scope: each contractor account only sees its own projects (private per user, not shared).

## Gotchas

- After changing `lib/db/src/schema/*`, run `pnpm --filter @workspace/db run push` then `pnpm run typecheck:libs` before typechecking `api-server` — otherwise stale `.d.ts` output makes new columns look like type errors.
- Web auth is cookie-based via Clerk — never add `getToken()`/Bearer headers to browser API calls.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for auth setup/customization/troubleshooting
