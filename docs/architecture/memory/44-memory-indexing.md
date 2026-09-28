# 44. Memory Indexing Architecture
## Salience Atlas v5

Fast, reliable context resolution requires multi-dimensional indexing. EMF organizes indexes deterministically using the thread-safe `MemoryIndexRegistry`.

### Index Structure

All entries create a corresponding `MemoryIndex` containing pre-parsed headers:
- **Tenant ID**: Strict partition key.
- **Key**: Exact string address.
- **Tags**: Composed categorical label sets (e.g. `['compliance', 'tender-evaluation']`).
- **Namespaces**: Directory grouping (e.g. `tender-scope`).
- **Correlation ID**: Pointers linking multiple actions to a single user intent.
- **Workflow / Agent ID**: Back-link indexes linking state transitions to executing engines.
- **Time Indicators**: Millisecond timestamps for range filtering.

```
       [MemoryEntry] ──► [MemoryIndexRegistry]
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
      [Tenant Index]     [Key Index]       [Tag / Metadata]
```

This deterministic index design eliminates expensive runtime deep searches, maintaining average retrieval lookups under 2 milliseconds without requiring database overhead during local dev.
