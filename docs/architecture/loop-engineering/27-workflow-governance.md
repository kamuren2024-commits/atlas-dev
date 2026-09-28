# 27. Enterprise Governance and Risk (GRC)
## Salience Atlas v5

The `EnterpriseGovernanceEngine` provides policy constraints, audit checks, and human-in-the-loop approvals before executing steps.

### Policies and Rules
- **Risk Evaluation**: Dynamically evaluates values (e.g. procurement cost) against thresholds.
- **Cost Limits**: Spend thresholds above 1M automatically trigger double executive approval rules.
- **Compliance Rules**: Validates that all active steps pass regulatory checkpoints (e.g., PPADA 2015 clauses).
- **Escalation Tracks**: Directs delayed or stuck steps to supervisors.
