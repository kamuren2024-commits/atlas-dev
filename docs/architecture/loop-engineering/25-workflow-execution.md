# 25. Workflow Execution
## Salience Atlas v5

The Workflow Execution Engine implements concurrent step scheduling and variables mapping across multi-step execution graphs.

### Execution Isolation
Each execution instance maintains an isolated map of `variables` to track state data between steps. This prevents concurrent executions of the same workflow template from mutating each other's data scopes.

### Loop Integration
Each executed step registers its status inside the execution manager:
- **RUNNING**: Node execution has started inside the loop.
- **COMPLETED**: Loop pipeline run completed successfully.
- **FAILED**: Node failed or was aborted by timeouts.
- **SKIPPED**: Node was bypassed because its preceding conditional criteria were unmet.
