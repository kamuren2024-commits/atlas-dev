# SALIENCE ATLAS V2 — AI ACCOUNTABILITY FRAMEWORK
### CLASSIFICATION: COGNITIVE SYSTEM GRC // AI EXPLAINABILITY STANDARDS // NO BLACK-BOX

This framework establishes the strict accountability, auditing, and alignment rules designed for the artificial intelligence components of Salience Atlas V2. Compliant with international guidelines for reliable AI systems (including NIST AI RMF and EU AI Act principles), the framework eliminates unexplainable AI recommendations, ensuring that every automated SCM suggestion remains 100% auditable.

---

## 1. THE NON-REPUTIABLE REASONING CHAIN

Autonomous agents in Salience Atlas V2 operate as **Traceable Advisory Systems**. No agent may present a recommendation to a human coordinator without routing the proposal through the **Reasoning Verification Guard**:

```
[ Cognitive Agent Proposal ] (e.g. Suggest Alternative SCM Supplier B)
            │
            ▼
[ REASONING VERIFICATION GUARD ]
  ├── 1. Model & Session Identity (Verify unique model stamp)
  ├── 2. Prompt Lineage Hash (Audit system instructions and input queries)
  ├── 3. Regulatory Alignment Tick (Verify compliance against PPADA rules)
  ├── 4. Grounding Evidence Trace (Links recommendations to physical data)
  └── 5. Dynamic Risk Projection (Assess expected cost & timing impact)
            │
      ┌─────┴──────────────────────────────────┐
      ▼ (Verification Fails)                   ▼ (Passes Checked)
[ SHUTDOWN & LOG EXCEPTION ]          [ COMAND RECOMMENDATION TO UI ]
- Blocks affected agent process        - Displays option with evidence
- Notifies compliance auditor          - Unlocks human multi-sig panel
```

---

## 2. STRATEGIC ACCOUNTABILITY PILLARS

The AI Accountability Framework enforces strict validation rules across eight (8) critical operational criteria:

### 2.1 GROUNDING EVIDENCE SELECTION
-   *Rule*: AI suggestions must link to real-world fact URNs (GPS coordinates, invoices, warehouse inventory levels) on the ledger.
-   *Enforcement*: System rejects any recommendation containing ungrounded suggestions or unsupported fact assertions.

### 2.2 SYSTEMIC REASONING CHAIN EXPLAINABILITY
-   *Rule*: Recommendations must describe their step-by-step logic in human-readable terms.
-   *Enforcement*: Structural outputs must break down the choice's cause, regulatory context, evaluated risks, and expected outcomes.

### 2.3 COGNITIVE MODEL DESIGN CERTIFICATION
-   *Rule*: Retains the exact model identifier and signature (e.g., `gemini-3.5-flash-v1`) powering each reasoning cycle.
-   *Enforcement*: Prevents uncertified background processes from submitting recommendations to user interfaces.

### 2.4 PROMPT & CONTEXT LINEAGE RECORDING
-   *Rule*: Hashes and logs complete system instructions, context variables, and input prompts for audits.
-   *Enforcement*: Reconstructs the exact context state to allow regulators to replay and audit the reasoning loop years later.

### 2.5 STATUTORY REGULATORY ALIGNMENT CHECK
-   *Rule*: Cross-references recommended actions with legal constraints (PPADA margins, budget boundaries) dynamically.
-   *Enforcement*: Flags recommendations that violate regulatory guidelines as "compliance exceptions."

### 2.6 STRATEGIC DATA SOURCE TRACING
-   *Rule*: Tracks raw data sources, verifying their integrity using secure ledger keys.
-   *Enforcement*: Prevents unverified third-party inputs or unauthenticated sensor readings from triggering recommendations.

### 2.7 CONTRACT MODIFICATION COMPLIANCE
-   *Rule*: AI-proposed contract variations are limited beneath statutory caps, mapping alternatives side-by-side.
-   *Enforcement*: Blocks automated proposals that suggest adjustments exceeding the PPADA 25% cost cap.

### 2.8 DUAL-OPERATOR ESCALATION ARCHITECTURE
-   *Rule*: AI recommendations must be approved by a human coordinator before physical execution occurs.
-   *Enforcement*: Programmatic suggestions remain purely advisory; human signatures are required to commit changes to production.

---

## 3. AUDITABLE AI RECOMMENDATION METADATA

Every recommendation carries rich metadata, allowing forensic auditors to query and trace its entire reasoning lineage:

```json
{
  "recommendationId": "rec-a90bc10f-df1e-4ade-bc87-4d0dfbfbef02",
  "aiEngine": "urn:atlas:ai-model:gemini-3.5-flash:run-980",
  "policyVersion": "ppada-compliance-matrix-2026-v2",
  "groundingEnforcement": {
    "evidenceNodes": [
      "urn:atlas:inventry:insulator-gasket-mombasa-405",
      "urn:atlas:project:construction-timeline-grid-3"
    ],
    "factualIntegrityScore": 1.00
  },
  "complianceAssurance": {
    "rulesChecked": [
      "PPADA-Section-155-Local-Preference-Verified",
      "PPADA-Section-139-Variation-Ratio-Check"
    ],
    "passed": true
  }
}
```

This comprehensive framework eliminates typical AI reliability issues, ensuring that Salience Atlas V2 operates as a transparent and legally compliant decision support platform.
