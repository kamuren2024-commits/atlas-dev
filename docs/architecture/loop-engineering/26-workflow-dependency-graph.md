# 26. Workflow Dependency Graph (DAG)
## Salience Atlas v5

The `WorkflowGraphEngine` uses Kahn's algorithm or Depth First Search (DFS) topological sorting to resolve step dependencies and group execution plans.

### DAG Visualization

```
        [ Node A ]
        /        \
   [ Node B ]   [ Node C ]
        \        /
        [ Node D ]
```

### execution Order Resolution
1. **Cycle Detection**: Verifies that there are no loops (e.g. A depends on B, B depends on A).
2. **Topological Sorter**: Orders nodes into concurrent tiers.
   - Tier 0: `[ "A" ]`
   - Tier 1: `[ "B", "C" ]` (Executed in parallel)
   - Tier 2: `[ "D" ]`
3. **Conditional Routing**: Evaluates dependency-level `condition` checks to dynamically skip branches.
