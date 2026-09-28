# Salience Atlas V2 - AI Provider Governance & Budgets

This document specifies the compliance, budget controls, and cost tracking parameters enforced inside the Salience Atlas V2 Federation Layer.

## Cost Governance Parameters

Dynamic limits are read from environment variables to control LLM costs at the SCM system level:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `AI_MONTHLY_BUDGET_USD` | `$100.00` | Hard cap on total SCM cognitive costs per month. |
| `AI_DAILY_BUDGET_USD` | `$10.00` | Alert threshold for daily model query costs. |
| `AI_REQUEST_LIMIT_PER_MINUTE` | `500` | Rate-limiter bound to guard against runaway agent loops. |
| `AI_MAX_RETRIES` | `3` | Maximum retry attempts per individual provider channel. |
| `AI_MAX_AGENT_DEPTH` | `20` | Dynamic runaway depth threshold for recursive agents. |

## Telemetry & Compliance Audits

Every completed or failed cognitive operation produces a structured audit trace registered into `AuditLedger` and monitored via `AIOperationsCenter`:

1. **Deduplication Checks**: Hits against cache are marked as `$0.00` cost and registered for telemetry speed.
2. **Cost Tracking**: All prompt and completion tokens are priced using provider-specific scales and subtracted from the system's runtime budget limits.
3. **Execution Audits**: The ledger captures the literal user query, final generated text, responding model, and transaction timestamp for full compliance indexing.
