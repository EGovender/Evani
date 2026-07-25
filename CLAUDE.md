# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This is primarily a **documentation portfolio repository**. It contains a single project, `enterprise-integration-reference-architecture/`, which is a vendor-neutral reference architecture (in Markdown + Mermaid diagrams) demonstrating how to design secure, reliable enterprise integrations between systems like CRMs, ERPs, payment platforms, and banks.

Most of the repo is still docs-only work — writing/editing Markdown, Mermaid diagrams, and small JSON sample payloads, not code. The one exception is the buildable app described below.

## The CRM-ERP simulator app

`enterprise-integration-reference-architecture/examples/crm-erp-simulator/` is a React + TypeScript + Vite app — the *only* buildable code in this repo, fully self-contained in that subdirectory (its own `package.json`, `tsconfig.json`, `vite.config.ts`). It's an interactive, browser-only simulation of the CRM-to-ERP payment workflow documented in `docs/workflows/crm-to-erp-payment-request.md`, deployed to GitHub Pages via `.github/workflows/deploy-crm-erp-simulator.yml` on every push to `main` that touches that subdirectory.

Common commands (run from inside that subdirectory):
- `npm run dev` — local dev server
- `npm run build` — type-check (`tsc -b`) + production build to `dist/`
- `npm run lint` — oxlint
- `npm run preview -- --base=/Evani/` — sanity-check the production build with the real GitHub Pages base path

Key structure: `src/types/domain.ts` (shared domain types) and `src/utils/toDocPayload.ts` (camelCase → the docs' snake_case wire shape) are the two files responsible for keeping the app's terminology, field shapes, and status vocabulary mirroring the Markdown docs — update both together if either the docs or the app's model changes. `src/engine/` holds the simulated integration pipeline (validators, failure-injection modes, retry/backoff), `src/state/` is a single Context + reducer store, and `src/data/seed.ts` holds the seeded demo dataset engineered to reproduce the product spec's example reconciliation numbers on first load.

Everything else in the repo (root `README.md`, `docs/`, `sample-data/`, `.gitignore`) remains documentation-only — no build/lint/test applies outside the simulator's own subdirectory.

## Content conventions (must follow when editing or adding docs)

- **Everything is fictional.** All organizations, systems, people, account numbers, and data (e.g. "Northstar Community Foundation", "Harbor Youth Services", vendor/request IDs) are invented for demonstration. Never introduce real company names, real credentials, or real production-like data. Every doc that contains a scenario should carry (or inherit from the README) a disclaimer that data is fictional/generalized.
- **No secrets, ever.** Example configs show placeholders like `stored-in-secret-manager`, never real values.
- **Vendor-neutral language.** Refer to "CRM Platform", "ERP / Financial System", "Payment Platform", "Integration Service", etc., not specific commercial product names.
- **Diagrams are Mermaid**, embedded directly in Markdown code fences (`flowchart`, `sequenceDiagram`, `stateDiagram-v2`). Keep new diagrams consistent with the existing node/actor naming style (short labels + `<br/>` sub-description) used in `docs/architecture/system-context.md` and `docs/workflows/crm-to-erp-payment-request.md`.
- **Recurring structural elements** used across architecture/workflow docs — reuse these headings/patterns rather than inventing new ones when adding a similar doc:
  - System-of-record / data-ownership tables (`Data Domain` → `System of Record`)
  - Validation rule tables (`Rule` → `Failure Code`)
  - Status models kept **separate** per system (business status vs. technical/integration status vs. financial status) — never collapse these into one field
  - Idempotency via a stable external ID (e.g. `payment_request_id` used as the target system's external ID)
  - Retry policy tables with exponential backoff, capped attempts, then escalation to a `Manual Review` / exception queue
  - Reconciliation control tables (count/amount/currency/status comparisons between source and target)
  - Audit event JSON with `correlation_id`, `source_system`, `source_record_id`, `target_system`, `target_record_id`, `operation`, `attempt_number`, `result`, `occurred_at`
- **JSON sample payloads** (`sample-data/*.json`) should mirror the shape of examples embedded in the workflow docs (e.g. `payment_request_id`, `correlation_id`, nested `payee`/`payment`/`accounting`/`approval`/`documents` objects) and stay internally consistent with whatever workflow doc references them.

## Structure

```
enterprise-integration-reference-architecture/
├── README-snippet.md          # Links to the architecture/workflow docs; meant to be pasted into a top-level README
├── docs/
│   ├── architecture/          # System-context docs: actors, systems, trust boundaries, system-of-record tables
│   └── workflows/             # End-to-end workflow docs: sequence diagrams, validation rules, status models,
│                               # failure/exception paths, retry policy, reconciliation controls
└── sample-data/                # Example JSON payloads referenced by the workflow docs
```

The root `README.md` is the full/canonical write-up of the reference architecture (goals, patterns, data ownership, control framework, security, observability, ADR conventions, planned demonstrations). `README-snippet.md` is a short excerpt meant to be linked from elsewhere — keep both in sync when adding new architecture or workflow docs (add a new doc's link to `README-snippet.md`'s list).

When adding a new workflow doc under `docs/workflows/`, cross-link it from the relevant `docs/architecture/` doc's "Related Workflow" section, and vice versa — the two existing docs do this (`system-context.md` ↔ `crm-to-erp-payment-request.md`).
