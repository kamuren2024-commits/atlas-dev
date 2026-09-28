# 43. Memory Providers Specification
## Salience Atlas v5

The Enterprise Memory Fabric leverages specialized memory providers that expose identical contract APIs (`IMemoryProvider`) while enforcing custom retention, security, and replication structures.

### Provider Segments

| Provider Name | Type | Retention Policy | Classification | Primary Use-Case |
| :--- | :--- | :--- | :--- | :--- |
| **WorkingMemoryProvider** | `WORKING` | 5 Minutes (Transient) | INTERNAL | Fast parameter-passing and step pipeline states |
| **SessionMemoryProvider** | `SESSION` | 30 Minutes | INTERNAL | User authentication tokens and interface active views |
| **WorkflowMemoryProvider** | `WORKFLOW` | 24 Hours | INTERNAL | Input / Output values of executing DAG pipelines |
| **AgentMemoryProvider** | `AGENT` | 7 Days | RESTRICTED | Experience telemetry, logs, and self-reflection metrics |
| **SharedMemoryProvider** | `SHARED` | 30 Days | INTERNAL | Team-level collaborative memory workspaces |
| **OrganizationMemoryProvider** | `ORGANIZATION` | Infinite / Indefinite | CONFIDENTIAL | Blueprints, spend matrices, and regulatory PPADA rules |
| **LongTermMemoryProvider** | `LONG_TERM` | Infinite / Indefinite | CONFIDENTIAL | Cold archive snapshots, regulatory compliance audit trails |

### Contract Uniformity
By inheriting from `BaseMemoryProvider`, all specialized providers support:
- Secure tenant isolation checks.
- Symmetric version history recording.
- Multi-predicate search query indexing.
- Micro-latency performance tracking.
