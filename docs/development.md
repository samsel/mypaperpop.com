# Development

## Requirements

- Node.js compatible with the version used by Next.js 16
- pnpm
- PostgreSQL
- S3-compatible object storage

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The app expects `.env`, not `.env.local`, for local development because helper scripts and Playwright share the same environment loading behavior.

Fill `.env` with real service credentials before running `pnpm db:migrate` or testing full app behavior. A placeholder `.env` is enough for static checks and build validation, but database migrations require a real `POSTGRES_URL`.
`pnpm start` runs `pnpm db:migrate` before starting Next.js.

## Useful Commands

```bash
pnpm check:boundaries
pnpm internal:check
pnpm exec tsc --noEmit
pnpm test:unit
pnpm test:unit:coverage
pnpm build
pnpm test:landing-gates
```

The authenticated e2e suite requires a test user and `.env.test.local`.
Install Playwright browsers with `pnpm exec playwright install` before the first Playwright run.

## Optional Internal Overlay

Private maintainers can clone internal docs and runbooks into `./internal`. Public users can ignore that folder entirely.

```bash
pnpm internal:check
```

The public app must keep working when `./internal` is absent. See [Repository boundaries](./repo-boundaries.md).

Run `pnpm check:boundaries` before pushing changes that touch docs, scripts, package configuration, tests, evals, or app code.
