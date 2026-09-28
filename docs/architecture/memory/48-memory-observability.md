# 48. Memory Observability & Telemetry
## Salience Atlas v5

EMF includes a comprehensive monitoring layer to track performance and system health.

### Metrics Collection Schema

The `MemoryMetricsCollector` monitors the following parameters across all memory tiers:
- **Memory Count**: The total number of active memory blocks currently managed by the provider.
- **Retrieval Latency**: Averaged duration in milliseconds for getting memory keys.
- **Search Latency**: Averaged duration in milliseconds for executing multi-predicate search queries.
- **Snapshot Count**: Total number of historical snapshots captured.
- **Version Count**: Total number of historical versions recorded in the audit trail.
- **Cache Hit Ratio**: Calculation of cache hits relative to total lookups, showing the efficiency of the `MemoryCache` layer.
- **Lifecycle Transition Counter**: Logs and counts each state change (e.g. `CREATED`, `INDEXED`, `REFERENCED`, `DELETED`) to identify system bottlenecks.

These metrics are available via the `MemoryRuntime.getMetrics(type)` API to support clean dashboard visualizations.
