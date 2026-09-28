# Loop State Machine

The Loop State Machine controls execution transitions deterministically, ensuring that an agent cannot proceed without completing required stages or bypass validation checks.

## State Transition Matrix

```mermaid
stateDiagram-v2
    [*] --> CREATED
    CREATED --> OBSERVING : start
    CREATED --> FAILED : exception
    CREATED --> CANCELLED : cancel
    
    OBSERVING --> PLANNING : observe_complete
    OBSERVING --> FAILED : exception
    OBSERVING --> CANCELLED : cancel
    OBSERVING --> TIMED_OUT : timeout
    
    PLANNING --> EXECUTING : plan_complete
    PLANNING --> FAILED : exception
    PLANNING --> CANCELLED : cancel
    PLANNING --> TIMED_OUT : timeout
    
    EXECUTING --> VERIFYING : execution_complete
    EXECUTING --> FAILED : exception
    EXECUTING --> CANCELLED : cancel
    EXECUTING --> TIMED_OUT : timeout
    
    VERIFYING --> REFLECTING : validation_complete
    VERIFYING --> FAILED : exception
    VERIFYING --> CANCELLED : cancel
    VERIFYING --> TIMED_OUT : timeout
    
    REFLECTING --> COMPLETED : reflection_complete
    REFLECTING --> FAILED : exception
    REFLECTING --> CANCELLED : cancel
    REFLECTING --> TIMED_OUT : timeout
    
    COMPLETED --> [*]
    FAILED --> [*]
    CANCELLED --> [*]
    TIMED_OUT --> [*]
```

## Transition Management Rules

- **Deterministic Verification**: Every state change triggers `LoopStateMachine.validateTransition` which throws if the path is invalid.
- **Fail-Safe Transitions**: Any uncaught exception instantly transitions the context state to `FAILED`, preserving diagnostic metadata.
- **Timeout Bound Enforcement**: Evaluated on every phase start to prevent zombie run-aways.
- **Explicit Cancellation**: Provides safe abort handles for human operations or supervisor system-wide kill switches.
