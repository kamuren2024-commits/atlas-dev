# Atlas Platform Contracts

The shared contracts are additive and live in [`packages/platform/index.ts`](../../packages/platform/index.ts) and [`packages/contracts/atlas-fabric.ts`](../../packages/contracts/atlas-fabric.ts).

| Contract | Purpose | Adoption |
|---|---|---|
| `AtlasModuleDefinition` | Describe an existing or future module | Registry seeded with current modules |
| `AtlasEntityRef` | Stable tenant-scoped source identity | Optional event metadata |
| `AtlasEntityDefinition` | Canonical entity vocabulary | Registry seeded with shared entities |
| `AtlasEventEnvelope` | Cross-module event metadata | New contract; legacy events preserved |
| `IntelligenceRequest/Response` | Common request boundary for existing AI Federation | Contract only |
| `AtlasContext` | Request, user, tenant, mission, and entity context | Contract only |
| `AtlasAuditEvent` | Forward-compatible action provenance | Contract only |
| `IntegrationHealth` | Truthful connector state | Contract only |

No contract claims a live provider, connector, or event stream unless the existing implementation validates it.
