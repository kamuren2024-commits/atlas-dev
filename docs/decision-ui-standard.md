# SALIENCE ATLAS V2 — DECISION UI STANDARD
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // SECURITY & DELEGATION // LEVEL 5 ACCESS

This standard defines the strict structure, visual layout, and interface rules for all **Decision Cards** (Layer 4) within Salience Atlas V2. Formulated to eliminate "black-box" decision risks, this standard prohibits presenting any cognitive recommendation without accompanying evidence.

---

## 1. COMPACT DECISION ENGINE LAYOUT

All Decision Cards are structured around nine functional elements to ensure complete operational and risk visibility:

```
┌────────────────────────────────────────────────────────┐
│  DECISION TITLE: Action ID   |   Confidence Score      │
├────────────────────────────────────────────────────────┤
│  RECOMMENDATION: Description of Action                 │
├────────────────────────────────────────────────────────┤
│  GROUNDED EVIDENCE: Verifiable Source Fact URNs        │
├────────────────────────────────────────────────────────┤
│  SYSTEM RISKS: Key Threat Markers                      │
├────────────────────────────────────────────────────────┤
│  ALTERNATIVES: Option Comparison Matrix                │
├────────────────────────────────────────────────────────┤
│  APPROVALS REQUIRED: Regulatory Signatures List        │
├────────────────────────────────────────────────────────┤
│  SIMULATION IMPACT: Estimated Cost/Schedule Delta      │
├────────────────────────────────────────────────────────┤
│  AUDITING REFERENCE: Historical Ledger Block ID        │
└────────────────────────────────────────────────────────┘
```

---

## 2. DETAIL SPECIFICATIONS FOR ELEMENTS

To maintain decision and audit trail transparency, every card must contain:

### 2.1 Title
-   *Syntax*: Clean name including unique identifier.
-   *Example*: `Direct Procurement authorization: Mombasa Transformer (Ref: PR-2026-90)`

### 2.2 Recommendation
-   *Syntax*: Human-readable action description.
-   *Example*: `"Authorize direct award to ABB Kenya. Current field stock has dropped past the safety limit, posing an immediate blackout risk to Grid Node 4B."`

### 2.3 Confidence Score
-   *Syntax*: Percentage score (0% to 100%) indicating the agent's confidence assessment, grounded directly in verified historical trends and compliance checks.

### 2.4 Grounded Evidence
-   *Syntax*: Bulleted lists linking directly to immutable records (e.g., Inventory level receipts, market index summaries). **No ungrounded recommendations are allowed.**

### 2.5 System Risks
-   *Syntax*: Identification of downsides, showing probability and financial impact.
-   *Example*: `"Cost variation margin is 12% above original estimates, reducing total contingency reserves by 1.2%."`

### 2.6 Alternatives Comparison
-   *Syntax*: Structured table comparing alternative courses of action side-by-side on cost, timeline, and risk metrics.

### 2.7 Approvals Required
-   *Syntax*: Checklist of required administrative signatures (e.g., Head of SCM, Accounting Officer) based on project value and delegation limits.

### 2.8 Simulation Impact
-   *Syntax*: Estimated project schedule and financial impact of implementing the proposed suggestion.

### 2.9 Auditing Reference
-   *Syntax*: Unique hash key referencing parent regulatory guidelines (e.g., PPADA Section 103 direct procurement bounds) and ledger record IDs.

---

## 3. CORE DESIGN RULES FOR DECISIONS

-   **High-Contrast Action Headers**: Use colored border accents (Success: Green, Critical: Red) to immediately flag recommendation risk categories.
-   **Traceable Information Nodes**: Build clickable links on all evidence URNs, allowing operators to drill down into the raw transactions.
-   **Interactive Compare Views**: Allow users to toggle and compare alternatives inside the primary workspace view, preventing focus changes.

By standardizing this decision-card structure, KETRACO operators can quickly verify and approve logistics, procurement, and risk actions while maintaining complete regulatory compliance.
