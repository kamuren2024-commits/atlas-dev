# SALIENCE ATLAS V2 — ENTERPRISE ONTOLOGY MODEL
### CLASSIFICATION: TOP SECRET // SCM ONTOLOGY SPECIFICATION // V2.0

This document defines the core semantic schema and relationship mappings that transform Salience Atlas V2 from a relational database platform into a dynamic, living **Enterprise Procurement and Supply Chain Ontology**. All platform modules (Tender Studio, Project Supply Nexus, Logistics Command, etc.) read and mutate states through this unified semantic layer.

---

## 1. CORE SEMANTIC OBJECTS (VERTICES)

The ontology consists of eighteen (18) core vertices, representing the entire physical, logical, financial, and regulatory footprint of international critical infrastructure procurement:

```
                            ┌────────────────┐
                            │   Regulation   │
                            └───────┬────────┘
                                    │ GOVERNS
                                    ▼
  ┌────────────┐  SUPPLIES  ┌────────────┐  PROCURED_BY  ┌────────────┐
  │  Supplier  ├───────────▶│    Asset   ├──────────────▶│   Tender   │
  └─────┬──────┘            └─────▲──────┘               └─────┬──────┘
        │                         │ CONTAINS                   │
        │ OWNS                    │                            │ REFERENCES
        ▼                   ┌─────┴──────┐                     ▼
  ┌────────────┐            │ Warehouse  │               ┌────────────┐
  │ Facility   │            └─────▲──────┘               │  Contract  │
  └────────────┘                  │                      └─────┬──────┘
                                  │ DELIVERS                   │
  ┌────────────┐  CONTAINS  ┌─────┴──────┐                     │ FUNDS
  │ Inventory  ├───────────▶│  Shipment  ├─────────────┐       │
  └────────────┘            └─────▲──────┘             │       ▼
                                  │                    │ ┌────────────┐
                                  └────────────────────┼─┤   Budget   │
                                       DEPENDS_ON      │ └────────────┘
                                                       ▼
                                                 ┌────────────┐
                                                 │  Project   │
                                                 └────────────┘
```

1.  **Supplier**: Legal entity capable of providing materials, equipment, or consultancy services (e.g., Siemens East Africa, local certified cable manufacturers).
2.  **Tender**: Formal invitation to bid governed by strict PPADA procurement regulations. Maintains values, bid criteria, and status.
3.  **Contract**: Legally binding bilateral agreement containing clauses, SLAs, liquidated damages coefficients, and payment milestones.
4.  **Project**: Heavy engineering program (e.g., 220kV Olkaria-Lessos-Kisumu transmission line, grid substation upgrades).
5.  **Inventory Item**: Specific supply catalog entry (e.g., overhead conductors, step-down transformers, insulator strings).
6.  **Material**: Raw bulk resources (e.g., raw steel, copper wire rolls, structural concrete).
7.  **Shipment**: Logistics container tracked from origin factory, through transit hubs, to site delivery.
8.  **Asset**: High-value physical grid equipment undergoing lifecycle operations (e.g., power transformers, circuit breakers, transmission pylons).
9.  **Warehouse**: Secure site storage facility with geographical coordinates, capacity limits, and environmental controls.
10. **Risk**: Identified threat vectors with probability, monetary impact, mitigation measures, and active triggers.
11. **Approval**: Authorization record with signatures, delegations, risk thresholds, and compliance flags.
12. **Evaluation**: Systematic scoring of developer bidding responses compiled by the tender evaluation committee.
13. **Procurement Plan**: Annual master plan of capital investments approved by the National Treasury and KETRACO Board.
14. **Budget**: Financial ledger node indicating fiscal allocation, committed expenditure, and available balances.
15. **User**: Enterprise operator, procurement officer, or external supplier agent bound by corporate credential keys.
16. **Department**: Corporate structure (e.g., SCM, Transmission Projects, Legal, Finance).
17. **Regulation**: Statutory and legislative boundaries (e.g., PPADA 2015 Part XII, National Environmental Management Act).
18. **Policy**: Organization-specific guardrails (e.g., Local Preference Margin, Risk Tolerance thresholds).
19. **Document**: Unstructured content nodes (e.g., PDF contracts, engineering CAD files, certificates of origin).

---

## 2. STANDARD RELATIONSHIP TYPES (EDGES)

All edges are directed, typed, versioned, and maintain temporal bounds to prevent out-of-date relationship tracking:

-   `SUPPLIES [Supplier → Asset / Material]`: Supplier provides specified equipment or physical material.
-   `PROCURES [Tender → Asset / Material]`: Tender activity covers acquisition of specified items.
-   `SUPPORTS [Asset / Material → Project]`: Items are physically assigned to work packages on a project grid.
-   `DELIVERS [Shipment → Warehouse / Project]`: Cargo is assigned for physical offloading at specified locations.
-   `APPROVES [User / Approval → Tender / Contract / Spend]`: Multi-signature authorization mappings.
-   `EVALUATES [Evaluation → Tender]`: Bids scored against regulatory procurement criteria.
-   `CONTAINS [Warehouse → Inventory Item] | [Project → Asset]`: Physical or logical grouping.
-   `DEPENDS_ON [Project → Project] | [Asset → Asset] | [Shipment → Shipment]`: Precedent or systemic dependencies.
-   `BLOCKS [Risk → Project / Shipment / Milestone]`: Active risk events stalling downstream execution.
-   `MITIGATES [Action / Policy → Risk]`: Actions mapped directly to minimizing vulnerability impact.
-   `OWNS [Supplier → Facility] | [Department → Asset]`: Logical or legal custodianship.
-   `USES [Project → Budget]`: Financial transaction mapping tying physical work to funding pools.
-   `FUNDS [Budget → Project / Tender]`: Allocation linkages.
-   `GOVERNS [Regulation / Policy → Tender / Contract / Project]`: Compliance constraints.
-   `REFERENCES [Document → Supplier / Tender / Contract]`: Documentation mapping.

---

## 3. INHERITANCE & GRAPH EXTENSIBILITY

To ensure the ontology matures over ten years without breaking existing platform APIs:

-   **Base Vertex Properties**:
    All vertices inherit a baseline structural payload:
    ```typescript
    interface BaseVertex {
      id: string;              // Cryptographically random UUID v4
      type: string;            // Vertex type (e.g., 'Supplier', 'Asset')
      tenantId: string;        // Strict multi-tenant row boundary
      createdAt: string;       // ISO 8601 UTC timestamp
      updatedAt: string;       // ISO 8601 UTC timestamp
      version: number;         // Optimistic lock sequence counter
      metadata: Record<string, any>; // Extensible, schemaless cell storage
    }
    ```
-   **Dynamic Property Extension**: Subclasses register properties within the schemaless `metadata` map. For example, adding wind-load tolerances to `Asset` during a wind-farm module expansion does not alter the core `Asset` relational schema; instead, properties are registered as virtual metadata attributes tracked under version-controlled schemas.

---

## 4. TEMPORAL STATE TRANSITIONS & VERSIONING

1.  **Temporal Relationship Tracking (ValidTime vs SystemTime)**:
    -   *ValidTime*: The actual physical period during which a relationship holds true (e.g., a supplier's tax compliance certificate is valid from `2026-01-01` to `2026-12-31`).
    -   *SystemTime*: The transactional period during which the relationship was stored in the log (e.g., updated on `2026-06-22`).
    This dual-axis temporal tracking allows the execution engine to perform historical audit runbacks: *"How did the SCM risk profile look as of September 14, 2025, before the transformer failure?"*
2.  **State Upgrades**: All relationship modifications are persisted via append-only events. Edges are never deleted; instead, they are invalidated by modifying the temporal `validTo` parameter, maintaining a trace of historic configurations.
