# CONTRACT GRAPH MODEL

## 1. Introduction
The **Contract Graph Model** forms the semantic blueprint of KETRACO's enterprise intelligence. Rather than treating contracts as isolated financial entities, the graph maps every agreement to active tenders, evaluations, active energy grid expansion nodes, physical depot stocks, and budget allocations.

---

## 2. Ontology & Relationship Definitions
The contract knowledge graph contains the following core entity nodes and edges:

```
[ Budget Node ] ──(Allocates)──> [ Tender Node ] ──(Spawns)──> [ Evaluation Node ]
                                                                      │
                                                                 (Recommends)
                                                                      ▼
[ Asset / Grid Node ] <──(Upgrades)── [ Contract Node ] <──(Awards)── [ Supplier Node ]
                                             │
                                        (Authorizes)
                                             ▼
                                     [ Variation Node ] ──(Spawns)──> [ Risk Node ]
```

### 2.1 Core Graph Entities
1.  **Supplier Node ($S$)**: Holds corporate records, director national IDs, tax certificates, and reputation ratings.
2.  **Tender Node ($T$)**: Represents standard bidding documents (SBD), design specifications, and maximum pricing baselines.
3.  **Evaluation Node ($E$)**: Captures actual bidder scores, technical compliance flags, and financial rankings.
4.  **Contract Node ($C$)**: The central digital twin node tracking active legal terms and milestone frameworks.
5.  **Project/Grid Node ($P$)**: Physical substation locations (e.g., Suswa), transmission line miles, and soil/terrain geo-data.
6.  **Budget Node ($B$)**: Financial spending allocations, current contingency reserve funds, and Treasury caps.
7.  **Payment Node ($Y$)**: Invoices, bank ledger clearings, escrow releases, and retention balances.
8.  **Variation Node ($V$)**: Documented scope changes, cost modifications, and schedule variations.
9.  **Asset Node ($A$)**: High-voltage transformers, power-cables, insulator arrays, and switchgears.
10. **Risk Node ($R$)**: Causal models of likely supply delays, structural defects, price surges, and contractual disputes.

---

## 3. High-Fidelity Graph Traversals & Multi-Hop Reasoning
The graph enables semantic discoveries that standard SQL cannot easily resolve:

### 3.1 Cross-Director Shell Debarment Discovery
*   **Traversal Path**: `Contractor A ──(OwnedBy)──> Director X ──(Owns)──> Debarred Company B`.
*   **Result**: Instantly flags bids or active contracts with hidden connections to debarred directors or joint-ventures.

### 3.2 Material Specification Alignment Check
*   **Traversal Path**: `Bid Spec Specifier (Tender) ──(Requires 150kV Winding) <──> Active Supplier Spec (Contract Twin) ──(Has 145kV Winding)`.
*   **Result**: Raises critical compliance alerts on technical spec mismatches before manufacturing begins.

### 3.3 Risk Propagation & Cascade Modeling
*   **Traversal Path**: `Suez Canal Blockage (Disruptor) ──(Delays)──> Insulator Assembly Shipment ──(AffectedBOM)──> Suswa Switchyard Project ──(Blocks)──> Nairobi Ring Commissioning`.
*   **Result**: Forecasts grid stabilization setbacks based on maritime transport telematics.
