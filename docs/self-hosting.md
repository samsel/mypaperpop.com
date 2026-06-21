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

## Configuration

Copy [.env.example](../.env.example) to `.env` and replace every placeholder with your own values.

The public repository contains the app implementation and example configuration. It does not contain MyPaperPop production credentials, production data, generated user images, or private infrastructure identifiers.

## Stripe Prices

The app includes MyPaperPop price IDs in [lib/payments/config.ts](../lib/payments/config.ts). Self-hosters should replace those IDs with their own Stripe price IDs before accepting payments.
