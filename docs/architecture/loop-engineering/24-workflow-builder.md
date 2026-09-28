# 24. Workflow Builder
## Salience Atlas v5

The `WorkflowBuilder` implements an immutable, fluent builder API that simplifies definition assembly.

### Design Pattern
- **Strict Immutability**: Each method call returning `this` actually returns a *new* instance of `WorkflowBuilder` reflecting the updated node and metadata configurations. This avoids side effects when defining similar workflow definitions.
- **Fluent Construction**: Allows easy cascading of ID assignment, metadata naming, policy declaration, and node registration.

### Usage Example
```typescript
const definition = new WorkflowBuilder()
  .setId("bid-evaluation")
  .setName("Bid Evaluation Flow")
  .setVersion("1.0.0")
  .addNode({
    id: "fetch-bids",
    name: "Fetch active vendor bids",
    type: "STEP",
    dependencies: [],
    action: async (ctx) => { /* ... */ }
  })
  .register();
```
