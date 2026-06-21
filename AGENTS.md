# Agent Instructions

This is the public MyPaperPop app repository.

## Repository Boundary

The public repository contains the runnable application, public documentation, tests, evals, and safe examples. It must remain usable by someone who has no access to the private repository.

The optional private overlay lives at:

```text
internal/
```

`internal/` is ignored by git. Public users do not need it. Private maintainers may mount `samsel/mypaperpop.com-internal` there for private runbooks, operational notes, and maintainer-only scripts.

## Hard Rules

- Do not make application code depend on `internal/`.
- Do not import from `internal/` in `app/`, `lib/`, `components/`, `hooks/`, `tests/`, `evals/`, public `scripts/`, or config files.
- Do not add private runbooks, incident notes, deployment internals, generated user images, production data, customer data, or maintainer-only context to the public repo.
- Do not commit secrets or real credential values. Examples must use placeholders.
- Do not copy files from `internal/` into the public repo. If a private idea needs public documentation, rewrite it as generic public guidance with private details removed.
- Do not remove `/internal/` from `.gitignore`.
- The app must install, build, test, and run with `internal/` missing.

## What Belongs Here

- Product source code.
- Public architecture and development docs.
- Public examples with placeholder environment values.
- Tests, evals, and tooling needed by outside contributors.
- Security policy and contribution guidance.

## What Belongs In The Private Overlay

- Private deployment runbooks.
- Internal environment names, infrastructure notes, and operational context.
- Maintainer-only agent memory.
- Private scripts that are not needed by outside contributors.
- Historical architecture decisions that reveal internal business or operational context.

The private overlay still must not contain production secrets, private keys, database URLs, API tokens, generated user images, or customer data.

## Working With A Mounted Overlay

If `internal/` exists, treat it as a separate git repository.

Before editing, check where you are:

```bash
pwd
git status --short --branch
```

If you are changing public app code, commit in the public repository root. If you are changing private runbooks or private scripts, commit inside `internal/`.

Never stage `internal/` from the public repository. It should be ignored:

```bash
git check-ignore -v internal/
```

## New User Smoke Check

These commands must work for a fresh public clone without `internal/`:

```bash
pnpm install --frozen-lockfile
pnpm check:boundaries
pnpm internal:check
cp .env.example .env
pnpm exec tsc --noEmit
pnpm test:unit
pnpm build
```

Full app functionality requires real service credentials in `.env`. Do not run database migrations until `POSTGRES_URL` points to a real database.

## Pre-Push Safety Check

For changes that affect public source or docs:

```bash
pnpm check:boundaries
pnpm internal:check
pnpm exec tsc --noEmit
pnpm test:unit
pnpm build
gitleaks detect --no-git --redact --verbose
trufflehog filesystem . --no-update --json --no-color
```

Install `gitleaks` and `trufflehog` locally before running the scanner commands. CI runs pinned scanner containers.

If `internal/` is mounted, run public secret scans against a clean public archive or exclude `internal/` so private overlay files do not pollute public results.

`pnpm check:boundaries` is intentionally strict. If it fails, fix the boundary violation instead of weakening the check unless the repository split itself is being intentionally redesigned.
