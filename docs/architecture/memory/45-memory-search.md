# 45. Memory Retrieval & Search Engine
## Salience Atlas v5

The `MemorySearchEngine` evaluates complex multi-predicate queries against active `MemoryIndexRegistry` tables.

### Search Resolution Pipeline

1. **Namespace Isolation**: Filters indexes belonging strictly to the client's current `tenantId` to protect against data leakage.
2. **Predicate Evaluation**: Resolves filters sequentially:
   - Match exact keys (e.g. `query.exactKey`).
   - Match agent or workflow pointers.
   - Filter tags and array intersections.
   - Evaluate time range constraints (`start` and `end` times).
3. **Metadata Filters**: For custom key-value metadata parameters, EMF scans the remaining candidates and enforces exact matches.
4. **Result Packaging**: Assembles resolved entries, matching indexes, and latency metrics into a standard `MemorySearchResult` package.

```
  [Query Parameters] ──► [Tenant isolation] ──► [Tag/Key matching] ──► [Results]
```

This strict deterministic resolution maintains high compliance, as no probabilistic or loose non-deterministic matching is performed at this structural layer.
