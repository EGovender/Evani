# CRM → ERP Payment Simulator

An interactive, browser-only simulation of the fictional CRM-to-ERP payment integration
documented in [`docs/workflows/crm-to-erp-payment-request.md`](../../docs/workflows/crm-to-erp-payment-request.md)
and [`docs/architecture/system-context.md`](../../docs/architecture/system-context.md). Built so a
recruiter can interact with the architecture directly instead of only reading diagrams.

All organizations, people, and data are fictional. No real backend, API, or database is
involved — everything runs client-side in the browser.

## What it simulates

1. **CRM payment request** — create a fictional payment request (payee, amount, currency,
   date, business justification, department, program, expense account, supporting document).
2. **Approval workflow** — Submit / Approve / Reject / Cancel, with business status kept
   separate from technical integration status.
3. **Integration processing** — click "Send to ERP" and watch the 7-step pipeline (auth,
   schema validation, payee check, accounting validation, duplicate check, vendor bill
   creation, CRM status update) complete with visible delays.
4. **ERP ledger** — the created vendor bill, advanceable through Pending Approval → Open →
   Scheduled for Payment → Paid.
5. **Failure injection** — simulate 8 failure modes (invalid accounting mapping, payee not
   payable, missing vendor ID, duplicate request, ERP unavailable, authentication failure,
   API timeout, record locked) and watch retries, backoff, and escalation to Manual Review.
6. **Exception queue** — correct the underlying issue and reprocess a failed request.
7. **Integration event log** — a full audit timeline with correlation IDs, source/target
   systems, operation, attempt number, and result for every action.
8. **Reconciliation dashboard** — compare approved CRM requests against ERP vendor bills and
   categorize records as Matched, Missing in ERP, Missing in CRM, Amount mismatch, Duplicate,
   or Status mismatch.

## Development

```bash
npm install
npm run dev        # local dev server
npm run build       # type-check + production build to dist/
npm run lint         # oxlint
npm run preview -- --base=/enterprise-architecture/   # sanity-check the production build with the real Pages base path
```

## Deployment

Deployed automatically to GitHub Pages by
[`.github/workflows/deploy-crm-erp-simulator.yml`](../../../.github/workflows/deploy-crm-erp-simulator.yml)
on every push to `main` that touches this directory.
