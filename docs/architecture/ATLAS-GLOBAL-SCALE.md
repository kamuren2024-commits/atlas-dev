# Atlas Global Scale

## Deployment model

Atlas is a modular platform with domain packs deployed behind shared
contracts. A deployment may add energy, logistics, manufacturing, finance,
healthcare, transport, mining, or public-sector packs without changing the
trust plane.

## Scale boundaries

- **Tenant:** data, identity, policy, residency, and retention boundary.
- **Organization:** shared ontology and governance scope.
- **Region:** residency and latency constraint.
- **Domain pack:** domain entities, skills, tools, workflows, and twin models.
- **Mission:** bounded unit of operational reasoning and action.

## Required platform behavior

Availability, cost, latency, privacy, residency, skill compatibility, model
eligibility, and policy must be routing dimensions. No single provider or
vendor SDK is the platform architecture.

## Current evidence

The repository has provider federation, connector abstractions, shared event
envelopes, and domain modules. Cross-tenant durable isolation, globally
distributed persistence, and end-to-end cross-fabric mission replay remain
PARTIAL or UNVERIFIED and require deployment-specific evidence.

