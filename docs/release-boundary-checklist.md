# Release Boundary Checklist

Use this checklist before pushing public-release changes or copying material between the public app and the private overlay.

## Public Repository Must Stay Standalone

The public repository must work for someone who cannot access the private internal repository.

Required checks:

```bash
pnpm install --frozen-lockfile
pnpm check:boundaries
pnpm internal:check
cp .env.example .env
pnpm exec tsc --noEmit
pnpm test:unit
pnpm build
```

Expected result for `pnpm internal:check` in a fresh public clone:

```text
Internal overlay: not mounted.
This is expected for public users. The app does not need ./internal to install, build, test, or run.
```

## Public Content Rules

Allowed in public:

- Product source code.
- Public tests and evals.
- Public setup, development, and self-hosting docs.
- Placeholder environment examples.
- Public-safe architecture explanation.

Not allowed in public:

- Real secrets or credential values.
- Generated user images.
- Customer data or production exports.
- Private incident notes.
- Private deployment runbooks.
- Maintainer-only agent memory.
- Internal-only scripts from the private overlay.
- Code that imports, reads, or executes `internal/`.

## Private Overlay Rules

Allowed in the private overlay:

- Private runbooks and environment notes.
- Maintainer-only agent instructions.
- Internal architecture decisions.
- Private maintainer scripts.

Not allowed in the private overlay:

- A copied second version of the public app source tree.
- Production secrets, API tokens, database URLs, private keys, generated user images, or customer data.
- Changes that make the public app depend on the overlay.

## Moving Knowledge Across The Boundary

When moving private knowledge into public docs:

1. Rewrite it as public guidance instead of copying text verbatim.
2. Remove environment names, incident details, private IDs, private URLs, and operational assumptions.
3. Replace real values with placeholders.
4. Run `pnpm check:boundaries`.
5. Run secret scans against a clean public tree:

```bash
gitleaks detect --no-git --redact --verbose
trufflehog filesystem . --no-update --json --no-color
```

Install `gitleaks` and `trufflehog` locally before running these commands. CI runs pinned scanner containers for public pull requests and pushes.

If `internal/` is mounted locally, scan a clean archive or fresh public clone so private files do not pollute public scan results.
