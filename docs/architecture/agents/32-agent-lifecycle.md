# 32. Agent Lifecycle Specification
## Salience Atlas v5

Enterprise Agents follow a strict, deterministic state machine from registration to final completion or recovery.

### State Transition Diagram

```
                 [ REGISTERED ]
                       │
                       ▼
                [ INITIALIZING ]
                       │
                       ▼
                    [ READY ] ◄─────────────────┐
                       │                        │
                       ▼                        │
                 [ EXECUTING ]                  │
                 /     │     \                  │
                ▼      ▼      ▼                 │
         [ PAUSED ] [ WAITING ] [ FAILED ]      │
            │          │           │            │
            ▼          ▼           ▼            │
        [ RESUMED ]  [ READY ]  [ RETRY ]       │
                                   │            │
                                   ▼            │
                               [ RECOVERED ] ───┘
                                   │
                                   ▼
                               [ DISABLED ]
```

### State Definitions
- **REGISTERED**: The agent is loaded into memory and Cataloged in the Agent Registry.
- **INITIALIZING**: The agent is loading internal configurations, binding capabilities, and injecting security guards.
- **READY**: The agent is fully active and waiting for an execution trigger.
- **EXECUTING**: The agent is actively processing a workflow plan on the Loop Runtime substrate.
- **PAUSED**: The agent's step executions have been paused, awaiting resuming signals.
- **FAILED**: A critical constraint violation or code exception has halted execution.
- **RECOVERED**: Rollback checkpoints or fallback outputs successfully patched the execution context, returning the agent to active ready status.
- **DISABLED**: The agent is deregistered and turned off to protect the system.
