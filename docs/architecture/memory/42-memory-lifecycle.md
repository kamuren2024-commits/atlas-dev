# 42. Memory Lifecycle Specification
## Salience Atlas v5

All entries recorded within the Enterprise Memory Fabric are managed via a strict, deterministic state machine ensuring legal, logical, and computational consistency.

### State Transition Diagram

```
                 [ CREATED ]
                      │
                      ▼
                 [ INDEXED ]
                      │
                      ▼
                  [ ACTIVE ] ◄────────────────┐
                      │                       │
                      ▼                       │
                [ REFERENCED ]                │
                 /    │     \                 │
                ▼     ▼      ▼                │
         [ ARCHIVED ] │  [ DELETED ]          │
              │       │                       │
              ▼       ▼                       │
         [ RESTORED ] └───────────────────────┘
```

### State Definitions
- **CREATED**: The memory block has been allocated and structured inside a provider's context, awaiting system registry mapping.
- **INDEXED**: Exact and composite key index headers have been populated within the `MemoryIndexRegistry` for quick retrieval.
- **ACTIVE**: The memory block is active and validated against standard multi-tenant access control lists (ACLs).
- **REFERENCED**: The memory block has been read or returned to a querying supervisor (such as an Enterprise Agent or Workflow step).
- **ARCHIVED**: Cold, long-term snapshot representation of inactive history.
- **RESTORED**: Rolled back from a historical snapshot or backup revision to a functional active status.
- **DELETED**: Zero-filled, securely wiped, and scrubbed from all indexing tables to guarantee absolute system security.
