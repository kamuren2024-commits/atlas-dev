# 38. Agent Observability and Telemetry
## Salience Atlas v5

Observability in the EAF is achieved through the integration of the `AgentTelemetryCollector`, `AgentHealthTracker`, and the core workflow auditing engine.

### Tracked Metrics
- **Latency MS**: Roundtrip duration of agent activities.
- **Success/Failure Ratios**: Computes moving success rates to dynamically degrade or unhealthy-flag agents.
- **Workflow/Loop Co-relation**: Maintains direct pointers (`workflowExecutionId` and `loopExecutionId`) linking the agent execution to its underlying DAG nodes and loop pipeline runs.
- **Timeline Logs**: Lifecycle transitions are persisted as audit records and events.
