# Contributing

Thanks for your interest in MyPaperPop.

## Development Flow

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env` and provide your own service credentials.
3. Run `pnpm check:boundaries`.
4. Run `pnpm internal:check`.
5. Run `pnpm exec tsc --noEmit`.
6. Run `pnpm test:unit`.
7. Run `pnpm build`.

For UI changes, run the relevant Playwright tests before opening a pull request.

## Pull Requests

Keep changes focused. Include tests for behavior changes, especially around payments, auth, quota, safety, and AI generation flows.

Do not commit secrets, production data, generated user images, private deployment notes, or local environment files.

Do not make public code depend on `internal/`. The optional private overlay is ignored by git and must not be required for install, build, test, or runtime behavior. See [Repository boundaries](./docs/repo-boundaries.md) and [AGENTS.md](./AGENTS.md).
