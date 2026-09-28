# 23. Workflow Registry
## Salience Atlas v5

The `WorkflowRegistry` is a thread-safe, in-memory catalog managing versioned `WorkflowDefinition` schemas.

### Capabilities
- **Centralized Management**: Registers, queries, list, and deregister workflow schemas.
- **Strict Version Control**: Organizes definitions using semantic version structures (e.g., `1.0.0`, `1.1.0`).
- **Dynamic Lookup**: Resolves execution targets at runtime.
- **Discovery**: Exposes active, registered templates for external discovery.
