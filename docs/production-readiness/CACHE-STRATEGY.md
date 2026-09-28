# Production Readiness: Cache Strategy Specification

## Architecture Overview
The **Salience Atlas V5** caching strategy uses Redis as a shared request deduplication layer. This is integrated directly into the `ModelRouter` and the `FederationCache` to reduce downstream model API cost, prevent prompt execution bottlenecks, and provide resilient failover storage.

```
       [Prompt Request]
              |
              v
     +-----------------+
     | FederationCache |
     +-----------------+
              |
      +-------+-------+
      | (Cache Hit)   | (Cache Miss)
      v               v
 [Return Output]   [Route API to Model]
                      |
                      v
               [Store in Cache]
```

---

## Design Decisions
1. **Dynamic Regional Namespaces**: Caches are partitioned into regions (e.g. `federation_cache_orchestrator`, `federation_cache_evaluations`) using structured key prefixes. This allows for targeted cache invalidation without affecting other modules.
2. **Deterministic Hashing**: Prompt payloads are digested using SHA-256 to produce fixed-size 64-character hexadecimal keys, preventing large inputs from swelling Redis memory consumption.
3. **Dual-Channel High-Performance Sync**: Reads query Redis first. On network failure, the system falls back to a RAM-based local cache to protect high-frequency loops.

---

## Service Contracts
```typescript
class FederationCache {
  public static get(prompt: string, region: string): Promise<any | null>;
  public static set(prompt: string, value: any, provider: string, model: string, region: string): Promise<void>;
  public static delete(prompt: string, region: string): Promise<void>;
  public static clear(): Promise<void>;
}
```

---

## Operational Considerations
* **Time-to-Live (TTL)**: Default TTL is set to 2 hours (`7200` seconds) for standard AI route answers, and is configurable.
* **Cache Invalidation**: Invoking maintenance triggers an immediate clear of the specific federation region, ensuring immediate system-wide updates.

---

## Production Readiness Checklist
- [x] Asynchronous, non-blocking Redis cache operations implemented.
- [x] SHA-256 prompt hashing for compact storage keys verified.
- [x] Local dual-channel memory fallbacks validated.
- [x] Regional namespace prefixing implemented.
