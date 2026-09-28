# 22. Workflow Orchestrator
## Salience Atlas v5

The `WorkflowOrchestrator` is the central component responsible for processing, running, and reporting execution results for registered workflows.

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User as Client
    participant WO as WorkflowOrchestrator
    participant GE as GraphEngine
    participant LR as LoopRuntime
    participant HM as HistoryManager

    User->>WO: execute(workflowId, inputs)
    WO->>GE: resolveExecutionOrder(definition)
    GE-->>WO: tiers: string[][]
    loop Each Tier
        loop Each Node in parallel
            WO->>LR: execute(nodeLoopId, steps)
            LR-->>WO: loopResult (success/fail)
            WO->>HM: recordStepExecution(step)
        end
    end
    WO-->>User: WorkflowResult
```

### Core Execution Flow
1. **Resolution**: Inspects the `WorkflowRegistry` for the specified workflow ID.
2. **Context Creation**: Instantiates a unique, isolated `WorkflowExecutionContext`.
3. **DAG Analysis**: Utilizes `WorkflowGraphEngine` to order nodes.
4. **Execution**: Maps node action functions into short-lived `LoopRuntime` stages.
5. **Observability**: Tracks execution metrics and transition paths.
