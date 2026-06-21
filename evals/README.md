# MyPaperPop AI Evals

This directory contains Braintrust evals for the real MyPaperPop AI product path.

## Commands

- `pnpm eval:ai` runs the core provider-backed AI eval suites.
- `pnpm eval:ai:planning` runs the real `evaluatePrompt` planner against planning cases.
- `pnpm eval:ai:safety` runs the real `checkChildSafety` gate against safety cases.
- `pnpm eval:ai:age-fit` runs the real planner plus final prompt construction for age-fit cases.
- `pnpm eval:ai:grounding` runs the real `searchForContext` grounding step.
- `pnpm eval:ai:followup` runs the real `generateFollowUp` step.
- `pnpm eval:ai:real-images` runs real xAI image generation and a configurable VLM judge.
- `pnpm eval:ai:validate` validates JSONL case syntax and shape only. It is not an eval.
- `pnpm braintrust:push-scorers` deploys the production online scorers to Braintrust.

There is no dry mode. Eval commands call the app's configured providers. Use `--local` only when you want to run real provider calls without sending Braintrust experiment logs.

## Configuration

The target provider is the app provider. Evals do not override it.

- Chat/planning/safety/follow-up use the app's Gemini configuration.
- Real-image generation uses the app's xAI configuration.

Only the eval judge is configurable:

```bash
AI_EVAL_JUDGE_PROVIDER=gemini
AI_EVAL_JUDGE_MODEL=gemini-2.5-flash-lite
```

For an OpenAI-compatible local judge:

```bash
AI_EVAL_JUDGE_PROVIDER=ollama
AI_EVAL_JUDGE_MODEL=llama3.1:8b
AI_EVAL_JUDGE_BASE_URL=http://localhost:11434/v1
```

Optional runtime controls:

```bash
AI_EVAL_TRIAL_COUNT=3
AI_EVAL_MAX_CONCURRENCY=1
```

If `BRAINTRUST_API_KEY` is absent, evals still run provider calls but use `noSendLogs`.

Braintrust online scoring rules can be configured in the Braintrust UI after pushing scorers.

Axiom remains the operational log sink for app/server diagnostics. Braintrust is the AI product observability, artifact, eval, and online-scoring system.

## Suites

- `planning`: `GENERATE` / `CLARIFY` / `ENGAGE` routing, paper orientation, prompt includes/excludes, useful non-generation responses.
- `safety`: child-safety allow/reject boundaries, categories, rejection-message contract.
- `grounding`: named-reference classification and factual/non-character preservation.
- `followup`: follow-up message specificity and suggestion-chip structure.
- `age-fit`: real planner output plus printable prompt construction for age bands.
- `real-image`: real xAI image generation, local preprocessing metrics, and configurable VLM judging.

Generated image artifacts are written locally under `evals/.runs/` for image evals and are also logged to Braintrust when Braintrust logging is enabled.
