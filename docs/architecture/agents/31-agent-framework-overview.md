# 31. Enterprise Agent Framework (EAF) Overview
## Salience Atlas v5

The Enterprise Agent Framework (EAF) is the standardized orchestration layer for all AI-enabled modules in Salience Atlas. This layer abstracts all intelligent execution blocks as state-governed cognitive units (Enterprise Agents).

### Architectural Stack

```
        ┌─────────────────────────────────────────┐
        │        Client App / Presentation        │
        └────────────────────┬────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────┐
        │        Enterprise Agent Framework       │
        │   (Registry, Discovery, GRC, Sec)       │
        └────────────────────┬────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────┐
        │      Enterprise Workflow Orchestrator   │
        │             (EWO / DAG Engine)          │
        └────────────────────┬────────────────────┘
                             │
                             ▼
        ┌─────────────────────────────────────────┐
        │            Loop Runtime Engine          │
        │         (Pipeline Stages / Context)     │
        └─────────────────────────────────────────┘
```

### Core Architecture Capabilities
1. **Dynamic Task Translation**: High-level commands received by agents translate into deterministic execution DAGs handled by EWO.
2. **Unified Compliance Checking**: Standardizes permissions, policies, and regulatory compliance checks prior to invoking any LLM, heuristic, or tool.
3. **Pristine Observability**: Merges agent-level cognitive events, workflow metrics, and loop state transitions into a unified telemetry log.
