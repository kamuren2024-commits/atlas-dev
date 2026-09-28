# SALIENCE ATLAS V2 — SYSTEM ARCHITECTURE MAP
### PHASE Ω∞: BACKEND HARDENING & CRITICAL INFRASTRUCTURE TOPOLOGY

This document serves as the formal architectural blueprint mapping the distributed subsystems, runtime invariants, and hazard boundaries of Salience Atlas V2.

---

## 1. SERVICE BOUNDARIES & PLATFORM LIFECYCLE

The system is designed as a modular, event-driven intelligence operating system. Real-world services are isolated to prevent cascading resource starvation or data pollution across tenant environments.

```
   [ ENTERPRISE CLIENT ]
             │
             ├─── HTTP (Port 3000) ────▶ [ API GATEWAY / REVERSE PROXY ]
             │                                   │
             └─── mTLS TCP ------------┐         ├─ JWT Authenticator / Session
                                        │         ▼
                                        ├─▶ [ CORE API SERVER ] (Express / Vite Middleware)
                                        │         │
                                        │         └──▶ [ EVENT STORE ] (Local Log / Partitioned Postgres)
                                        │                   │
                                        │                   ▼
                                        └──────────▶ [ EVENT FABRIC ENGINE ] (Kafka/NATS Abstraction)
                                                            │
                                  ┌─────────────────────────┴────────────────────────┐
                                  ▼                                                  ▼
                     [ GOVERNANCE CONTROL PLANE ]                      [ DISTRIBUTED ONTOLOGY ENGINE ]
                      - Scope Checker / ABAC Evaluator                  - Segmented Graph Query Workers
                      - PPADA Human Approval Escrow                     - Partitioned In-Memory Caching
                                  │                                                  │
                                  ▼                                                  ▼
                     [ RUNTIME WORKFLOW ROUTER ]                       [ KNOWLEDGE GRAPH LEDGER ]
                      - Non-blocking Scheduler                          - Relationship Indexer (D3 Maps)
                                  │
                                  ▼
                     [ SANDBOXED AGENT OS WORKERS ]
                      - Restrained JavaScript VM (No eval)
                      - Pre-defined Capability Scopes
```

---

## 2. DATA FLOWS & SIGNAL CORRELATION

To guarantee auditability under critical security restrictions, every action triggers a fully traceable, asynchronous path linked via immutable correlation identifiers (`traceId` and `clientSequence`).

1. **Transaction Request (Command)**: Client initiates an action (e.g., executing a contract evaluation or launching a bidding process).
2. **Access & Consent Scan**: Security intercepts and verifies permissions via `GovernanceEngine` using row-level policies.
3. **Immutable Log (Event-Sourced Append)**: An append-only event is logged into the `EventStore`. Once appended, the command is committed.
4. **Asynchronous Broadcast**: `EventFabricEngine` broadcasts the message to listening sub-networks.
5. **Decoupled Execution**: Independent background workers consume the event, perform calculations (e.g., Monte Carlo simulations or contract analytics), and mutate the projection registers.
6. **Telemetry Correlation**: All logs, span audits, and decision trees are bound to the original transaction envelope for immediate audit.

---

## 3. ZERO TRUST & DATA ISOLATION BOUNDARIES

The platform establishes distinct cryptographic security zones:

- **Zone 0 (Internet Facing Ingress)**: Handles endpoint termination, sessions, and request sanitization. No direct connection to persistence is allowed from this layer.
- **Zone 1 (Core Application Services)**: Controls internal business models, policy engines, and task routing. Internal APIs use mTLS with token scopes.
- **Zone 2 (Storage & State)**: Postgres relational schemas separated by distinct cryptographic schema mappings. Only licensed system-level service accounts possess write privileges.
- **Zone 3 (Sandbox Agent Runtime)**: Isolated virtualized workers that execute untrusted code or LLM-generated operations. These workers have zero disk write-access and zero wide-area network access.

---

## 4. FAILURE DOMAINS & GRACEFUL DEGRADATION MAP

To prevent single points of failure (SPOFs) from compromising regional infrastructure (e.g., critical grid dispatching), the systems rely on circuit-breaker configurations:

| Subsystem Failure | Immediate Automated Recovery | Graceful Degradation Behavior |
| :--- | :--- | :--- |
| **Model API (Gemini/Anthropic)** | Cascade failover with exponential backoff and jitter. Reroutes to domestic local backups. | Suspends real-time summarization but allows manual static processing to proceed. |
| **Ontology Database Corruption** | Replay of historical sequential blocks from the Event Store. | Suspends visual bento graphing; tabular inventories and raw checklists remain operational. |
| **Workforce Coordinator Crash** | Isolation of affected VM containers and deployment of cold-standby images. | Automatically places active queue execution into local state buffers, persisting tasks until worker rebalancing is complete. |
| **Tenant Network Partitioning** | Localized Edge-Caching node continues to log transactions. | Syncs with primary region when connections are re-established; uses Conflict-Free Reallocated Projections (CRDTs). |

---

## 5. SCALING & SCENARIO BOTTLENECK ANALYSIS

In-memory states represent a critical hazard when processing higher orders of magnitude. The table below details mitigation vectors for core operations:

- **Linear Memory Scans (DFS Graph Traversals)**:
  - *Hazard*: Evaluating a 100M node relationship list synchronously stalls the Node.js single-thread loop.
  - *Mitigation*: Sub-graph projections, paging, and localized sub-tree indexes. High-latency simulations run inside a decoupled thread pool.
- **Event Storms (Queue Overloads)**:
  - *Hazard*: Spikes in transaction rates could blow heap memory under high stress.
  - *Mitigation*: Rate-limiting backpressure controls. Interceptor queues pause ingestion, and consumers fetch items based on execution rate capability.
- **Storage Amplification**:
  - *Hazard*: Complete history tracing yields immense audit trails.
  - *Mitigation*: Multi-tiered storage engines (hot data retained in Postgres; warm data rolled into S3/GCS; archiving cold logs).
