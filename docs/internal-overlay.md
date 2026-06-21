# Internal Overlay

This public repository is designed to work without any private files.

Private maintainers may optionally clone a separate private repository into:

```bash
internal/
```

The `internal/` directory is ignored by git. It can contain private runbooks, production notes, deployment details, incident history, and maintainer-specific agent instructions.

If `internal/` is missing, the app should still install, build, test, and run normally.

Public users can confirm this with:

```bash
pnpm check:boundaries
pnpm internal:check
```

Private maintainers can mount the overlay with:

```bash
git clone git@github.com:samsel/mypaperpop.com-internal.git internal
```

## Boundary Rules

- Public app code must not import, read, or execute files from `internal/`.
- Public package scripts must not require `internal/`.
- Public tests and evals must pass with `internal/` missing.
- Do not copy private runbooks, incident notes, infrastructure details, generated user images, production data, or maintainer-only agent memory from `internal/` into public files.
- Do not store production secrets in either repository.

The private overlay may reference public app files when a maintainer script needs to operate on the app checkout. The reverse must not be true.

See [Repository boundaries](./repo-boundaries.md) and [AGENTS.md](../AGENTS.md).

The public repo has an automated boundary check:

```bash
pnpm check:boundaries
```

That command should pass whether or not private maintainers have mounted `./internal`.
