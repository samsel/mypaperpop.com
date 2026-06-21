# Claude Instructions

Read `AGENTS.md` before making changes. This is the public MyPaperPop repository, and the optional `internal/` folder is a separate private overlay.

The most important rule: the public app must work without `internal/`. Do not add imports, scripts, tests, evals, or build steps that require private overlay files.

Private details belong only in the private overlay repository mounted at `internal/`. Public documentation may mention that the overlay exists, but it must not include private runbooks, incident history, internal infrastructure identifiers, generated user images, production data, or real credentials.

Use placeholders in examples. Keep `.env`, `.env*.local`, generated reports, build output, downloaded images, and `internal/` out of public commits.

Before pushing public changes, run the checks listed in `AGENTS.md`.

The fastest boundary check is:

```bash
pnpm check:boundaries
```

If it fails, treat the failure as a real public/private split issue.
