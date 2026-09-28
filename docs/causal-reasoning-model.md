# SALIENCE ATLAS V2 — CAUSAL REASONING ENGINE MODEL
### CLASSIFICATION: COGNITIVE FABRIC // CAUSAL DEPENDENCY SCHEMAS // CLASS III SECURITY

This document details the architectural specification for the **Causal Reasoning Engine (CRE)** in Salience Atlas V2. By utilizing directed, temporal ontological dependencies instead of standard statistical machine learning regressions, the system achieves human-explainable causal trace-backs for complex supply-chain, compliance, and financial system states.

---

## 1. COGNITIVE REASONING ARCHITECTURE

Traditional machine learning packages identify correlations (e.g., "Transformer failure correlates with contractor change"); they cannot identify physical or legal causation. The Causal Reasoning Engine inside Salience Atlas V2 solves this by treating the entire supply-chain ontology as a directed dependency graph.

When an operational variance is detected (such as a 30-day delay on a substation construction milestone), the query engines perform a reverse traversal of the ontological structure to discover originating actors and failures:

```
[ Root Exception State: Project Delay ]
                    │
                    ├── Traverse DEPENDS_ON Edge
                    ▼
[ Intermediate Variance: Shipment Delayed at Port ]
                    │
                    ├── Traverse DELIVERS Edge
                    ▼
[ Operational Source: Supplier Production Shortage ]
                    │
                    ├── Traverse SUPPLIES Edge
                    ▼
[ Financial Bottleneck: Delayed Contract Capital Milestone ]
                    │
                    ├── Traverse REFERENCES Edge
                    ▼
[ Core Governance Bottleneck: Multi-Signatory Board Approval Backlog ]
```

---

## 2. REASONING TRACE PATHWAYS

The Causal Reasoning Engine analyzes four distinct transaction aspects to construct a complete explanatory model:

### 2.1 Operational Tracing (Physical Logistics & Manufacturing)
Tracks physical coordinates, manufacturing logs, and resource allocations:
-   *Trajectory*: `Asset` $\rightarrow$ `Inventory` $\rightarrow$ `Shipment` $\rightarrow$ `Facility` $\rightarrow$ `Supplier`.
-   *Logical Assessment*: Evaluates whether a logistics asset delayed at a shipping port blocks a downstream milestone on the physical project grid.

### 2.2 Financial Tracing (Budgets, Costs, & Payments)
Tracks monetary flows, currency exchange risks, inflation offsets, and milestone capital disbursements:
-   *Trajectory*: `Invoice` $\rightarrow$ `Milestone` $\rightarrow$ `Contract` $\rightarrow$ `Budget` $\rightarrow$ `Procurement Plan`.
-   *Logical Assessment*: Identifies if delays in contractor mobilization payments led to labor strikes, directly impacting scheduling timetables.

### 2.3 Compliance Tracing (Legislative & Regulatory Mandates)
Analyzes deviations from local preference limits, anti-corruption checklists, and environmental approvals:
-   *Trajectory*: `Bidding Response` $\rightarrow$ `Evaluation Criteria` $\rightarrow$ `Regulation` (e.g., PPADA margin guidelines).
-   *Logical Assessment*: Checks whether bid evaluation scoring challenges by rival bidders have frozen a high-value tender award.

### 2.4 Governance Tracing (Approvals & Authorizations)
Examines human bottlenecks, signature delays, and administrative policy review processes:
-   *Trajectory*: `Approval Request` $\rightarrow$ `Policy Guardrail` $\rightarrow$ `User Role` $\rightarrow$ `Escalation Flow`.
-   *Logical Assessment*: Identifies which committee member or executive office holds the active block on a critical contract amendment, and how long that approval has spent in queue.

---

## 3. EXPLAINABILITY ENVELOPE (ANTI-BLACK-BOX DESIGN)

All outputs from the Causal Reasoning Engine must write to a deterministic **Causal Reasoning Envelope**. This structure guarantees that AI models or logical rule engines cannot make recommendations without producing clear evidence chains:

```json
{
  "traceId": "cre-71b56fb6-ac2a-4a6c-974c-473ef2fbfd53",
  "targetAnomalousObject": "urn:atlas:project:olkaria-transmission-line-v2",
  "targetAnomalyType": "MILESTONE_DELAY",
  "anomalyValue": "30_DAYS",
  "causalChain": [
    {
      "step": 1,
      "sourceObject": "urn:atlas:project:olkaria-transmission-line-v2",
      "relationship": "DEPENDS_ON",
      "targetObject": "urn:atlas:shipment:sh-transformer-400kv-01",
      "evidenceMatch": "Gantt date mismatch: Substation construction start depends on transformer physical delivery."
    },
    {
      "step": 2,
      "sourceObject": "urn:atlas:shipment:sh-transformer-400kv-01",
      "relationship": "DELIVERS",
      "targetObject": "urn:atlas:supplier:siemens-ea-nairobi",
      "evidenceMatch": "Shipment status: PENDING_CUSTOMS because Bill of Lading lacks authorized digital signature."
    },
    {
      "step": 3,
      "sourceObject": "urn:atlas:supplier:siemens-ea-nairobi",
      "relationship": "OWNS",
      "targetObject": "urn:atlas:approval:app-customs-duty-waiver-09",
      "evidenceMatch": "Approval state: WAITING_APPROVAL in Finance Department queue for 18 calendar days."
    }
  ],
  "confidenceScore": 0.94,
  "recommendingMitigation": "Execute manual emergency approval override for Customs Duty Waiver and sign with cryptographic executive token."
}
```

This structural formatting ensures that every decision provides transparent, human-auditable records. Operators see a clear trace, eliminating black-box AI logic and guaranteeing regulatory defensibility before auditors.
