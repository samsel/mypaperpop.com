# Security

Please do not open public issues for vulnerabilities.

Report suspected security issues by emailing:

goodcreatorllc@gmail.com

Include a clear description, affected files or endpoints, reproduction steps, and potential impact. Please do not include secrets or private user data in the report.

## Secrets

This repository should not contain production credentials, private keys, database URLs, generated user images, or internal infrastructure identifiers. If you find one, report it as a security issue.

Before publishing or pushing broad changes, maintainers should scan the public tree without the optional `internal/` overlay:

```bash
pnpm check:boundaries
gitleaks detect --no-git --redact --verbose
trufflehog filesystem . --no-update --json --no-color
```

Install `gitleaks` and `trufflehog` locally before running these commands. The public GitHub workflow runs pinned scanner containers on pushes and pull requests.

If `internal/` is mounted, scan a clean public archive or clone so private overlay files are not included in public-release results.
