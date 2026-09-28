# 21. Enterprise Workflow Orchestration (EWO) Overview
## Salience Atlas v5

The Enterprise Workflow Orchestrator (EWO) is the standard orchestrator for Salience Atlas modules. It introduces a high-fidelity, Directed Acyclic Graph (DAG) state coordinator that leverages the underlying APOS Loop Runtime engine to coordinate executing steps.

### Architectural Diagram

```
       [ Client App / Presentation ]
                     │
                     ▼
         [ Workflow Registry ] ◄─── [ Fluent Builder API ]
                     │
                     ▼
       [ Workflow Orchestrator (EWO) ]
         │           │             │
         ▼           ▼             ▼
  [ Adapters ] [ GRC Engine ] [ Recovery Engine ]
         │
         ▼
  [ Loop Runtime ] ◄─── [ Orchestrated Steps ]
```

### Core Architecture Capabilities
1. **Deterministic Execution**: Complex multi-module operations are expressed as validated DAG trees.
2. **Execution Substrate Integration**: Each step inside a workflow is wrapped and processed as a `LoopRuntime` execution.
3. **Enterprise Auditing**: Provides structured logs, state timeline events, and detailed transition snapshots.
