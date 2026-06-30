# Self-Hosting

MyPaperPop can be self-hosted with standard managed services.

## Required Services

- PostgreSQL database
- Google OAuth application
- Stripe account with one-time payment price IDs
- S3-compatible object storage
- xAI API key for image generation
- Google Gemini API key for prompt understanding and routing

## Optional Services

- PostHog for product analytics
- Resend for feedback email
- Axiom for operational logs
- Braintrust for AI traces, evals, artifacts, and online scoring

Braintrust tracing defaults to the `mypaperpop.com` project in production and `mypaperpop.com-dev` elsewhere. Set `BRAINTRUST_PROJECT_NAME` if you use a different project name. To enable online scoring, push the scorer functions and configure the trace-level scoring rule:

```bash
pnpm braintrust:deploy-online-scoring
```

This requires `BRAINTRUST_API_KEY` and `BRAINTRUST_PROJECT_ID`.
When deploying scoring rules, make sure `BRAINTRUST_PROJECT_NAME` and `BRAINTRUST_PROJECT_ID` point at the same Braintrust project. The scorer push uses the project name; the scoring-rule setup uses the project ID.

## Configuration

Copy [.env.example](../.env.example) to `.env` and replace every placeholder with your own values.

The public repository contains the app implementation and example configuration. It does not contain MyPaperPop production credentials, production data, generated user images, or private infrastructure identifiers.

Run database migrations only after `POSTGRES_URL` points to the database you intend to mutate. The `pnpm start` script runs `pnpm db:migrate` before `next start`.

## Stripe Prices

The app includes MyPaperPop price IDs in [lib/payments/config.ts](../lib/payments/config.ts). Self-hosters should replace those IDs with their own Stripe price IDs before accepting payments.
