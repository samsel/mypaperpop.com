# Repository Boundaries

MyPaperPop is split into a public app repository and an optional private overlay.

## Public Repository

Repository: `samsel/mypaperpop.com`

This repository contains the runnable product source code and public contributor docs. A new user should be able to clone it, install dependencies, inspect the app, run local checks, and self-host with their own credentials.

Public-safe content includes:

- Application source code.
- Public tests and evals.
- Public setup, development, and self-hosting docs.
- Placeholder environment examples.
- Public security and contribution policies.

Public content must not include:

- Real credentials or tokens.
- Private deployment runbooks.
- Incident notes.
- Internal infrastructure identifiers that are not already public hostnames.
- Generated user images or production data.
- Maintainer-only agent memory.

## Private Overlay

Repository: `samsel/mypaperpop.com-internal`

Private maintainers can mount this repository inside the public checkout:

```bash
git clone git@github.com:samsel/mypaperpop.com-internal.git internal
```

The overlay is for private maintainer context only. It must not become a second copy of the app.

Private overlay content may include:

- Private runbooks.
- Maintainer-only agent instructions.
- Internal architecture decisions.
- Environment notes.
- Private scripts run by maintainers from the public app root.

The private overlay still must not contain real production secrets, private keys, database URLs, API tokens, generated user images, or customer data.

## Dependency Rule

The dependency direction is one-way:

```text
private overlay may reference the public app
public app must not require the private overlay
```

That means public source code, tests, evals, package scripts, and build config must keep working when `internal/` is absent.

## Fresh Clone Expectations

A fresh public clone without `internal/` should pass:

```bash
pnpm install --frozen-lockfile
pnpm check:boundaries
pnpm internal:check
cp .env.example .env
pnpm exec tsc --noEmit
pnpm test:unit
pnpm build
```

Full runtime behavior requires real service credentials. Database migrations require a real `POSTGRES_URL`.

## Agent Rules

Agents should read `AGENTS.md` before editing. The short version:

- Public app changes go in the public repo.
- Private runbooks and private scripts go in `internal/`.
- Never copy private overlay content into public files.
- Never make public code depend on `internal/`.
- Scan before pushing.

## Automated Guardrails

The public repository includes:

- `pnpm check:boundaries`: fails when public code/config references `internal/`, when internal-only files appear in the public tree, when `internal/` is not ignored, or when `.env.example` fake-enables optional integrations.
- `.github/workflows/public-guardrails.yml`: runs the boundary check, install, typecheck, unit tests, and build on pull requests and pushes to `main`.

See [Release boundary checklist](./release-boundary-checklist.md) before moving material across the public/private boundary.
