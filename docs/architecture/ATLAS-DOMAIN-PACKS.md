# Atlas Domain Packs

## Domain-pack contract

A domain pack contributes:

- typed entities and ontology extensions;
- data connectors and source provenance;
- skills with integrity and evaluation records;
- governed tools and approval policies;
- mission playbooks and workflows;
- digital-twin and simulation adapters;
- domain evaluation suites and operational dashboards.

The pack must not bypass shared identity, policy, evidence, evaluation, audit,
or approval contracts.

## Reference deployment

The current KETRACO/grid, logistics, procurement, finance, and meeting
intelligence modules are reference packs. They should progressively move
behind the shared contracts in `packages/contracts` while preserving their
existing APIs and tests.

## Pack readiness states

`DISCOVERED -> VALIDATED -> EVALUATED -> ACTIVE`, with `RESTRICTED`,
`DISABLED`, and `REVOKED` terminal safety states as appropriate.

## Admission checklist

1. Entity and event contracts are tenant-scoped.
2. Sources and transformations have provenance.
3. Skills and tools have functional and security evaluations.
4. Actions have policy and approval requirements.
5. Failure, replay, and rollback behavior is tested.
6. Runtime evidence is persisted before autonomous activation.

