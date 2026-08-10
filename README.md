# LocalSnow

LocalSnow is a public snowsports discovery and booking product for ski/snowboard instructors, schools and clients.

The product direction is simple:

- free/direct path: clients can discover instructors and schools without LocalSnow taking a commission;
- protected booking path: clients can pay LocalSnow for help making the lesson happen, with replacement/reschedule/refund support when needed;
- SkiRelay bridge later: unserved or overflow demand can become private instructor-network coordination instead of being lost.

This repository is an active product codebase, not a starter template. The README exists to explain the real project, stack and local workflow.

## Product shape

LocalSnow is meant to answer two different user questions:

1. Client: "Who can teach me in this resort, for this sport/level/date, and how do I contact or book them?"
2. Instructor/school/operator: "How do I show my offer, availability and trust signals without giving away private operational details?"

Current product seams include:

- public instructor/school/resort/sport discovery;
- services and availability signals;
- client proof path and booking readiness;
- protected booking revenue boundary;
- admin/operator queues for protected booking follow-up;
- product boundary docs for how LocalSnow connects to SkiRelay without merging both products into one confused app.

## Stack

- SvelteKit + Svelte 5
- TypeScript
- PostgreSQL
- Drizzle ORM
- Tailwind CSS
- Vitest + Playwright
- Stripe boundary logic for protected booking/client payment flows
- Google APIs / Calendar integration paths
- Sentry, Cloudflare R2 and n8n/email integration hooks
- Docker / GHCR / Traefik-style deployment configuration

## Local setup

Use the pinned package manager through Corepack:

```bash
corepack enable
corepack pnpm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Start Postgres:

```bash
corepack pnpm db:start
```

Push or migrate the schema:

```bash
corepack pnpm db:push
# or, for migration-based environments
corepack pnpm db:migrate
```

Seed development data if needed:

```bash
corepack pnpm seed
# or
corepack pnpm seed:all
```

Run the app:

```bash
corepack pnpm dev
```

## Quality gates

```bash
corepack pnpm test:run
corepack pnpm check
corepack pnpm build
```

Some DB-backed paths require a valid `DATABASE_URL`. Keep real production secrets out of the repository.

## Useful docs

- `docs/ski-network-product-boundaries.md` explains the LocalSnow/SkiRelay product split, shared availability/commitment model and protected-booking promise.
- `docs/github-workflow.md` explains the PR/stack workflow used for this repo.
- `docs/N8N_EMAIL_WORKFLOWS.md` documents email workflow integration notes.
- `docs/SEO_IMPLEMENTATION_SUMMARY.md` and `docs/SEO_AI_MASTER_PROMPT.md` contain SEO/discovery work.

## Current development posture

LocalSnow is being built as a real product with a strong concierge/manual-operations path first. The goal is not to automate every payment, calendar and instructor workflow before revenue exists. The goal is to prove client demand, instructor/school supply and the protected-booking guarantee with the smallest responsible system.

That means the codebase intentionally keeps some operations manual-backed for now, especially instructor/school payout and protected-booking follow-up.
