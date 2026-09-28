# SALIENCE ATLAS V2 — DECISION EXPLAINABILITY ENGINE
### CLASSIFICATION: COGNITIVE OBSERVABILITY // DETERMINISTIC REASONING // AUDIT FIRST

This document maps the architectural framework of the **Decision Explainability Engine (DXE)** inside Salience Atlas V2. It ensures all autonomous agents, recommendation services, and deep SCM optimizers adhere to a strict **"No Black-Box"** design standard. No agent may submit a recomendation without structuring it within a deterministic explainability schema that details factual justifications, regulatory matches, and simulated trade-offs.

---

## 1. EXPLAINABLE ARTIFACT SYSTEM

The Decision Explainability Engine operates as an active validation filter. Whenever an agent (such as the Tender Evaluation Copilot) formulates an action proposal, the request is intercepted by the DXE compiler to verify that all explainability fields are completed and valid before the recommendation is loaded into user interfaces:

```
[ ADVISORY AGENT RUNTIME ] ─────── (Generates Proposal) ───────┐
                                                               ▼
                                                  [ EXPLAINABILITY ENGINE ENFORCER ]
                                                               │
                                         ┌─────────────────────┴─────────────────────┐
                                         ▼                                           ▼
                               [ FAIL: REJECT VALUE ]                     [ PASS: SIGN RECOMMENDATION ]
                               (Stops pipeline and logs)                  (Enters active User Interfaces)
                                         │                                           │
                                         ▼                                           ▼
                                [ SYSTEM DEVIATION ]                        [ TRACEABLE VALUE IN GRAPH ]
```

---

## 2. CHRONOLOGICAL REASONING BLOCKS (THE "SEVEN PILLARS")

Every operational recommendation is split into seven (7) chronological reasoning blocks, providing a complete overview of the agent's decision logic:

```
                  ┌──────────────────────────────────────────────────┐
                  │          THE SEVEN PILLARS OF EVIDENCE           │
                  ├──────────────────────────────────────────────────┤
                  │ 1. WHY? (The causal trigger event)               │
                  │ 2. WHAT EVIDENCE? (Target fact URNs on ledger)   │
                  │ 3. WHICH REGULATIONS? (Explicit statutory rules) │
                  │ 4. WHICH RISKS? (Probability & cost deltas)      │
                  │ 5. WHICH SIMULATIONS? (Monte Carlo validation)  │
                  │ 6. WHICH ASSUMPTIONS? (Volatile heuristic seeds) │
                  │ 7. WHICH ALTERNATIVES? (Bypassed system paths)   │
                  └──────────────────────────────────────────────────┘
```

1.  **Why? (Temporal Catalyst)**:
    -   *Logic*: Defines the specific real-world event or delta that initiated the reasoning cycle.
    -   *Example*: "Triggered because Siemens EA overhead conductor shipping container has spent 12 days at Mombasa Port custom clearing, exceeding the SLA threshold of 5 days."
2.  **What Evidence? (Fact Lineage)**:
    -   *Logic*: Links directly to immutable fact nodes stored in the Shared Ontology.
    -   *Example*: "Backed by: (1) Bill of Lading hash `sha256:71df9...`, (2) KRA Import Waiver Request URN `urn:atlas:document:waiver-1025`, and (3) GPS log coordinates indicating physical containment."
3.  **Which Regulations? (Legal Base Constraints)**:
    -   *Logic*: Maps the recommendation to statutory guidelines, ensuring complete compliance with local procurement frameworks.
    -   *Example*: "Governed and compliant with PPADA 2015 Part XII Section 103 direct procurement bounds due to critical grid transmission network protection requirements."
4.  **Which Risks? (Active Threat Projections)**:
    -   *Logic*: Details the probability factor, monetary exposure, and mitigation cost for both the recommended action and total system inaction.
    -   *Example*: "Inaction risk: 85% probability of grid stalling leading to $2.4M in liquidated damages. Recommended action risk: 14% probability of pricing challenge leading to $320k audit delay."
5.  **Which Simulations? (Stochastic Verification)**:
    -   *Logic*: Links to isolated, sandboxed runs verifying the proposal.
    -   *Example*: "Validated by simulation `sim-47ea11` (10,000 Monte Carlo runs), proving alternative supplier backup routing cuts critical path project lag from 42 days to 6 days."
6.  **Which Assumptions? (Information Gaps)**:
    -   *Logic*: Highlights the limitations of the current information state, such as estimated container clearing speeds or unverified contractor claims.
    -   *Example*: "Assumes custom clearing processes return to normal baseline speeds of 48 hours once tax duty waiver is signed by executive office."
7.  **Which Alternatives? (Bypassed Options)**:
    -   *Logic*: Identifies alternative options and justifies why they were bypassed.
    -   *Example*: "Alternative A (re-routing cargo through Tanzanian port) bypassed due to a 22-day transit penalty. Alternative B (liquidating current contract) bypassed due to legal delay risks."

---

## 3. ZERO-VARIANCE JSON STRUCTURE (MANDATORY IN CONTRACT COMPILING)

Every agent proposal or recommendation must export this zero-variance explainability schema, ensuring complete, structured traceability across the entire platform:

```json
{
  "recommendationId": "rec-091f3bc6-ac12-4ade-a1ef-cd37fbfbefd3",
  "originatingAgent": "urn:atlas:agent:logistics-optimizer-v3",
  "targetingObject": "urn:atlas:shipment:sh-conductor-bundle-01",
  "severity": "CRITICAL",
  "pillars": {
    "why": "Shipment delayed past target transit ETA limit of 14 days, risking KETRACO construction schedule slips.",
    "evidence": [
      "urn:atlas:telemetry:mombasa-port-gps-4091",
      "urn:atlas:document:bill-of-lading-908"
    ],
    "regulations": [
      "urn:atlas:regulation:ppada-2015-section-103"
    ],
    "risks": {
      "inactionExposureUSD": 2400000.00,
      "proposalExposureUSD": 320000.00,
      "riskMitigationRatio": 0.13
    },
    "simulations": [
      "urn:atlas:simulation:sim-mombasa-customs-failure"
    ],
    "assumptions": [
      "Assumes alternative supplier ABB Kenya possesses corresponding stock in their Nairobi warehouse."
    ],
    "alternatives": [
      "Alternative A: Re-route via Dar es Salaam (Rejected: excessive road transit cost).",
      "Alternative B: Terminate contract (Rejected: 6-month litigation delay risk)."
    ]
  },
  "justificationHash": "sha256:71dfbdce3a4e908fca13ea09bc..."
}
```
