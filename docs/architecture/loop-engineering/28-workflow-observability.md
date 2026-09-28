# 28. Workflow Observability and Telemetry
## Salience Atlas v5

Observability in the EWO layer is achieved through two complementary systems: `WorkflowHistoryManager` and `WorkflowMetricsCollector`.

### Tabled Metrics Schema
The metrics engine aggregates telemetry values:
- **Workflow Duration**: Total executing time from initiation to final outcome.
- **Step Latency**: Individual execution times for each node.
- **Queue Wait Time**: Internal scheduling latencies.
- **Success Rate**: Number of completed runs divided by overall runs.
- **Policy Violations**: Tally of governance check failures.
- **Throughput**: Calculated execution velocity (steps/second).
- **Dependency Wait Time**: Schedulers tracking blockages.
