# MyPaperPop

> [!NOTE]
> **Why this project is open source**
>
> I built MyPaperPop during late 2025 and early 2026 as a way to genuinely get hands-on with coding agents and understand what they could make possible in a real product. The goal was never mainly to make money from this app. The goal was to learn by building: to see where agents were useful, where they struggled, how quickly they were evolving, and what it felt like to develop a full product with them as part of the process.
>
> By June 2026, that goal had been accomplished. I had built the product, learned a lot from it, and gained firsthand experience with how much coding agents had changed through the first half of 2026. So I decided to open source the project.
>
> The hosted app continues to run at [mypaperpop.com](https://mypaperpop.com). For updates, follow [samselvanathan.com](https://samselvanathan.com) or [@samselvanathan_](https://x.com/samselvanathan_).

MyPaperPop is an AI-powered coloring page generator for kids, parents, and teachers. Describe a character or scene, refine it conversationally, then print or download a clean line-art coloring page.

Live app: [mypaperpop.com](https://mypaperpop.com)

## What Is Included

- Next.js app router application
- Google OAuth via Auth.js
- Stripe one-time credit packs
- PostgreSQL schema and Drizzle migrations
- S3-compatible image storage
- AI prompt, routing, generation, and safety pipeline
- Braintrust-compatible eval suite and online scorer definitions
- Playwright and Vitest test coverage

## What Is Not Included

This public repo does not include production credentials, generated user images, private incident notes, internal deployment runbooks, or maintainer-only operational docs.

Private maintainers may optionally clone the private internal repository into `./internal`. That folder is ignored by git and is not required to install, build, test, or run the public app.

Check overlay status with:

```bash
pnpm internal:check
```

For the full boundary model, see [Repository boundaries](./docs/repo-boundaries.md). Agents should read [AGENTS.md](./AGENTS.md) before changing files.

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

You need your own provider credentials for full app functionality. Run `pnpm db:migrate` only after `POSTGRES_URL` points to a real database.
`pnpm start` runs `pnpm db:migrate` before starting Next.js, so use it only when you intend to apply pending migrations.

- PostgreSQL
- Google OAuth
- Stripe
- S3-compatible storage
- xAI image generation
- Google Gemini

Optional integrations include PostHog, Resend, Axiom, and Braintrust.

## Development

```bash
pnpm check:boundaries
pnpm internal:check
pnpm exec tsc --noEmit
pnpm test:unit
pnpm test:unit:coverage
pnpm build
pnpm test:landing-gates
```

The full authenticated Playwright suite requires `.env.test.local` plus a test database user. See [.env.test.local.example](./.env.test.local.example).
Install Playwright browsers with `pnpm exec playwright install` before running Playwright tests for the first time.

## Evals

AI evals live in [evals](./evals). They can run locally against the configured app providers. Braintrust is optional for local runs and useful when you want hosted experiment history, traces, artifacts, and online scoring.

```bash
pnpm eval:ai:validate
pnpm eval:ai
```

## Docs

- [Development](./docs/development.md)
- [Self-hosting](./docs/self-hosting.md)
- [Internal overlay](./docs/internal-overlay.md)
- [Repository boundaries](./docs/repo-boundaries.md)
- [Release boundary checklist](./docs/release-boundary-checklist.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).

## Origin

Started from [nextjs/saas-starter](https://github.com/nextjs/saas-starter).
