# Loop Runtime Engine (Salience Atlas v5)

## Overview
The `LoopRuntime` is the universal core execution kernel of Salience Atlas. It orchestrates context creation, state transition determinism, checkpointing, cancellation policies, and metric aggregation.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User as Client/Agent
    participant LR as LoopRuntime
    participant CTX as LoopExecutionContext
    participant PL as LoopPipeline
    participant TM as TimeoutManager
    participant RE as RetryEngine
    
    User->>LR: execute(loopId, stages, options)
    LR->>CTX: create(loopId, executionId)
    LR->>LR: transition(INITIALIZING)
    LR->>PL: runBeforePipeline(context)
    loop Stage Loop
        LR->>LR: transition(StageState)
        LR->>PL: runBeforeStage(context)
        LR->>TM: wrapWithTimeout(executeStage)
        TM-->>LR: Return Stage Output / Throw
        LR->>PL: runAfterStage(context, output)
        Note over LR,CTX: Capture immutable snapshot
    end
    LR->>LR: transition(COMPLETED)
    LR->>PL: runAfterPipeline(context)
    LR-->>User: Execution Outcome, Metrics & History
```

## State Machine Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Initializing
    Initializing --> Observing
    Observing --> Planning : Success
    Planning --> Executing : Success
    Executing --> Validating : Success
    Validating --> Reflecting : Success
    Reflecting --> Checkpoint : Optional Save
    Checkpoint --> Completed : Done
    
    Observing --> Retry : Failure
    Planning --> Retry : Failure
    Executing --> Retry : Failure
    Validating --> Retry : Failure
    Reflecting --> Retry : Failure
    
    Retry --> Cancelled : Cancel Triggered
    Retry --> Timed_Out : Timeout Breach
    Retry --> Failed : Attempts Exhausted
    Retry --> Recovered : Resolve Safe
    Recovered --> Completed
```
