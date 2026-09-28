# SALIENCE ATLAS V2 — ANTI-CORRUPTION ASSURANCE SPECIFICATION
### CLASSIFICATION: COGNITIVE LEDGER // EXPOSURE PREVENTION // KETRACO GOVERNANCE MATRIX

This specification details the anti-corruption mitigation and forensic detection algorithms built into Salience Atlas V2. Jointly evaluated by SCM compliance officers, legislative auditors, and anti-graft investigators (EACC/PPRA), the system monitors transactions in real-time to identify and isolate integrity compromises before public resources are spent.

---

## 1. THE AUTOMATED FORENSIC MONITORING LAYER

The platform deploys an active, non-bypassable **Compliance Guard**. All transactions (tenders, evaluations, contract variations, approvals, and dispatches) are analyzed by compliance checkers before they are saved to the ledger database:

```
[ PROPOSED TRANSACTION ] (e.g. Contract Award)
           │
           ▼
[ FORENSIC HEURISTICS ENGINE ]
  ├── 1. Collision Check: IP Address and Metadata Matching
  ├── 2. Timing Monitor: Evaluator speed verification (SLA Checks)
  ├── 3. Split Check: Consecutive sibling values under legal thresholds
  ├── 4. Capacity Auditor: Active vendor SCM multi-workloads
  └── 5. Compliance Check: PPADA Local Sourcing Margin Requirements
           │
     ┌─────┴──────────────────────────────────┐
     ▼ (Abuse Detected)                       ▼ (Passes Checked)
[ AUTO SUSPEND & ISOLATE ]          [ SIGN & COMMENCE TO LEDGER ]
- Freezes affected workflows         - Issues cryptographic receipt
- Generates forensic logs            - Updates Digital Twin status
```

---

## 2. KEY INTEGRITY ANALYSIS PATTERNS

The engine executes automated checks against eight (8) high-risk procurement abuse patterns:

### 2.1 Bid-Rigging & Collusion Detection
-   *Analytical Logic*: Scans bids to identify common markers (matching document metadata properties, similar pricing item errors, identical source IP uploads, or circular financial associations).
-   *Forensic Output*: Groups matching accounts and freezes affected bids, creating audit logs for regulatory review.

### 2.2 Conflict of Interest Audits
-   *Analytical Logic*: Cross-checks bidder registration records (partners, board members) against internal corporate personnel records and user profiles.
-   *Forensic Output*: Flags bids submitted by relatives or direct associates of KETRACO employees, suspending processing pending internal review.

### 2.3 Supplier Favoritism & Technical Over-specification
-   *Analytical Logic*: Compares tender requirements with historical standards to flag custom, non-standard specifications that restrict bidding competition to a single vendor.
-   *Forensic Output*: Halts technical specification publication when custom parameters restrict bidding pools below statutory requirements.

### 2.4 Approval Abuse & Single-User Escalation
-   *Analytical Logic*: Identifies approval sequences designed to bypass standard verification channels (e.g., executing multiple steps in a single session without required committee review).
-   *Forensic Output*: Suspends the transaction and routes the request to the Security Compliance Board for verification.

### 2.5 Emergency Procurement Misuse Checks
-   *Analytical Logic*: Monitors use of emergency procurement paths under PPADA Section 103, checking if the trigger matches a real-world emergency (determined by physical sensor networks or official disaster declarations).
-   *Forensic Output*: Flags emergency procurements that lack verified real-world triggers, requiring joint board authorization before execution.

### 2.6 Contract Splitting & Value Subdivision
-   *Analytical Logic*: Audits purchase requisitions for consecutive sibling materials within 30 days that are split to bypass statutory authority limits.
-   *Forensic Output*: Aggregates split items into a single procurement, routing it through the appropriate committee system.

### 2.7 Unusual Bid-Withdrawal & Collusion Patterns
-   *Analytical Logic*: Identifies cases where the lowest bidder suddenly withdraws their bid during the standstill period, leaving the award to a more expensive competitor.
-   *Forensic Output*: Suspends award execution and initiates a forensic review of communication logs to identify collusive bidding patterns.

### 2.8 Arbitrary Scoring Deviations
-   *Analytical Logic*: Audits the Evaluation Committee's scoring spreadsheets, flagging evaluators who award highly divergent scores to specific vendors without clear technical justification.
-   *Forensic Output*: Flags scoring deviations that exceed acceptable variance bounds, suggesting secondary evaluation runs.

---

## 3. IMMUTABLE FORENSIC INVESTIGATION PACKET

When an investigator flags a transaction for review, the system generates an immutable, legally certified **Forensic Investigation Packet (FIP)** containing:

```json
{
  "fipId": "fip-90f7cab1-af3e-4ade-bc87-4d7dfbfb9032",
  "auditScope": "Tender-KETRACO-Insulation-2026",
  "auditTarget": "urn:atlas:tender:td-gasket-mombasa-01",
  "forensicObservations": {
    "collusionScore": 0.89,
    "collusionEvidence": [
      "Bidder A and Bidder B submitted bidding documents with identical PDF header metadata hashes.",
      "Both documents was uploaded from the same public IP address (41.89.20.10) within 14 seconds of each other."
    ],
    "valuationSlicingScore": 0.00,
    "statutoryViolations": [
      "PPADA Section 155 violation flagged: Selected bidder did not achieve local preference requirements (40% Kenyan materials)."
    ]
  },
  "auditChainState": {
    "firstEntryBlock": "091f3bc",
    "finalClosedBlock": "eab10f9",
    "signatureHandshakes": "Multi-Sig SCM-Officer; Auditor-General-Assurance"
  }
}
```

This structural auditing framework ensures that KETRACO’s critical procurement pipelines remain transparent and accountable, protecting public investments and meeting strict national anti-corruption standards.
