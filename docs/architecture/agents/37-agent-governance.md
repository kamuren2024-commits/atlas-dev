# 37. Agent Governance and Policy
## Salience Atlas v5

The `AgentGovernanceEngine` evaluates all agent operations prior to dispatching them to EWO workflows, enforcing strict regulatory and organizational limits.

### Automated Constraints
- **Risk Evaluation**: Dynamically analyzes the risk profile. Spending above $500,000 automatically spikes the risk score to 85%+.
- **Human-In-The-Loop (HITL)**: Spending over $500,000 triggers mandatory human supervisory approval, halting execution until an administrator issues a signed approval.
- **Concurrent Limits**: Policy defines maximum concurrent executions for specific agents to protect server bandwidth.
