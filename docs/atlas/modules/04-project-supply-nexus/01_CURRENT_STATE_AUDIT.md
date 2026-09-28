# Current State Audit

| Surface | Finding | Status |
|---|---|---|
| Project UI | `ScmModules.tsx` contained hardcoded BOM percentages and counts | Downgraded to evidence/unavailable |
| Planning engine | `project-intelligence.ts` returns synthetic portfolio projects | Fixture/modelled; not used as live Nexus data |
| Project persistence | No canonical requirement table existed | Added migration 005 |
| Logistics persistence | Stock, order and order-item tables exist | Reused |
| Supplier graph | Seeded supplier/project relationships exist | Partial, fixture-bound |
| Events/workflows/AI | Shared fabrics exist; no Nexus-specific governed contract | Not enacted |
| Tests | Shared infrastructure tests exist; no PSN coverage | Added targeted calculation validation |
