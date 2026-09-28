# Atlas Canonical Ontology

## Phase 0 ontology target

The repository already contains procurement, evaluation, evidence, finance, logistics, grid, graph, and digital-twin concepts. The target is one canonical identity and relationship layer, introduced through adapters rather than a database rewrite.

## Core entity classes

`Person`, `Organization`, `Employee`, `Supplier`, `Director`, `Tender`, `Bid`, `Evaluation`, `Contract`, `Project`, `Asset`, `Substation`, `Transformer`, `TransmissionLine`, `Tower`, `Shipment`, `InventoryItem`, `Warehouse`, `Invoice`, `Payment`, `Risk`, `Incident`, `Document`, `Location`, `Community`, `Parcel`, `Wayleave`, `Regulation`, `Policy`, `Workflow`, `Decision`, `Agent`, `Mission`.

## Required identity fields

Every canonical entity adapter should expose:

| Field | Requirement |
|---|---|
| `id` | Stable Atlas identifier |
| `type` | Ontology type |
| `tenantId` | Mandatory tenant scope |
| `sourceSystem` | Origin system or `synthetic-demo` |
| `sourceId` | Origin identifier |
| `observedAt` | Source observation timestamp |
| `updatedAt` | Canonical update timestamp |
| `version` | Payload/schema version |
| `provenance` | Evidence and transformation references |

## Relationship vocabulary

Initial first-class edges: `AWARDED`, `DELIVERS_FOR`, `CONSTRUCTS`, `LOCATED_AT`, `SUPPLIES`, `OWNED_BY`, `IMPACTS`, `AFFECTED_BY`, `DAMAGES`, `DEPENDS_ON`, `GOVERNS`, `EVIDENCED_BY`, `TRIGGERS`, `APPROVES`, `EXECUTES`, and `DERIVED_FROM`.

## Existing-to-canonical mapping

| Existing area | Canonical entities |
|---|---|
| Evaluation/rules/evidence | Tender, Bid, Evaluation, Regulation, Policy, Document, Evidence, Decision |
| Supplier/contract modules | Supplier, Organization, Director, Contract, Payment, Risk |
| Logistics/inventory | Shipment, InventoryItem, Warehouse, Project, Supplier |
| Grid/digital twin | Asset, Substation, Transformer, TransmissionLine, Tower, Location, Incident |
| Finance | Project, Invoice, Payment, Decision, Risk |
| Agents/workflows | Agent, Workflow, Mission, Decision, Policy |

## Constraints

- Do not create a second identity for an entity that already has a canonical adapter.
- Relationships require tenant scope, provenance, and correlation metadata.
- Predictions and recommendations are not canonical facts; they must reference inputs, model/source, confidence, timestamp, and limitations.

## Phase 2 operational status

The in-process graph adapter now exposes the supplier, contract, project, shipment, inventory, warehouse, asset, and risk pathway with provenance on each seeded relationship. The adapter is a compatibility layer over the existing graph service, not a database replacement.
