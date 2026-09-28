# Salience Atlas V2 - Cost Governance & Loop Protection

Uncontrolled AI consumption can lead to rapid cost increases and runaway recursive loops. Salience Atlas V2 implements defensive governors to guarantee financial guardrails.

## Financial Budget Constraints

Budgets are read dynamically from system environment parameters on boot:
- **Monthly Hard Budget**: Hard dollar ceiling ($100.00 default) after which cloud requests are restricted and redirected locally.
- **Daily Alert Budget**: Soft dollar limit ($10.00 default) triggers warnings to administrator channels.
- **TCO Pricing Estimates**: Every provider estimates its financial footprint using real-time pricing scales before committing tokens.

## Agent Loop Protection

To completely block infinite agent orchestration loops:
- **Max Agent Depth**: Recursion is limited to `20` steps (or configured `MAX_AGENT_DEPTH`). Requests exceeding this are terminated instantly.
- **Max Retries**: The router retries a failing provider channel at most `3` times before shifting down-chain.
- **Execution Budget**: Sets an operations-per-minute threshold (500 queries) to prevent high-frequency loop cascades.
