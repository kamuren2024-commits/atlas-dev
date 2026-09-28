# 35. Agent Discovery Service
## Salience Atlas v5

The `AgentDiscoveryService` enables clients, workflows, or other agents to query and retrieve active registered agents that match specific functional parameters.

### Query Surfaces
1. **Capability Matching**: Retrieves all agents declaring a specific capability (e.g., `findCapableOf("RETRIEVAL")`).
2. **Permission Querying**: Retrieves agents matching active resource accessibility constraints (e.g., `findWithPermissions("tender-db", "EXECUTE")`).
3. **Custom Evaluation**: Exposes a direct callback filter to query the entire active registry (e.g., matching a specific version or author).
