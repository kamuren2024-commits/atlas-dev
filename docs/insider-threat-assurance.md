# SALIENCE ATLAS V2 — INSIDER THREAT ASSURANCE SPECIFICATION
### CLASSIFICATION: SECURE ENCLAVE // THREAT MITIGATION // FORENSIC SECURITY MODEL

This specification outlines the active security layers, audit trail protections, and insider threat detection algorithms designed for Salience Atlas V2. Compliant with **NIST SP 800-53** security controls, the platform operates under a Zero-Trust architecture, guaranteeing that compiled transaction logs and knowledge graphs remain immune to tampering, even by administrators or compromised users.

---

## 1. THE TRIPLE-LINE OF INSIDER THREAT DEFENSE

The platform mitigates insider threats using a nested, non-bypassable **Security Guard**. Every administrative transaction is monitored, verified, and isolated before it can affect active operations:

```
[ USER PROFILE REQUEST ] (e.g. Modify Decision Evaluation Score)
            │
            ▼
[ ZERO-TRUST SECURITY ENFORCER ]
  ├── 1. Cryptographic Signature Validation (HSM Key Check)
  ├── 2. Dual-Control Verification (M-of-N Approval Required)
  ├── 3. Ledger Compliance Auditing (WORM Log Verification)
  └── 4. Anomaly Detection (Rate Limit & Context Analysis)
            │
      ┌─────┴──────────────────────────────────┐
      ▼ (Threat Detected)                      ▼ (Passes Checked)
[ AUTO SUSPEND & ACTIVATE ALARM ]     [ SIGN & EXECUTE TRANSACTION ]
- Blocks affected operator account    - Harshes update to ledger database
- Secures local document stores        - Records action on event loop
```

---

## 2. HIGH-RISK VECTORS & MITIGATION STRATEGIES

The platform deploys specialized detection rules against eight (8) common insider attack vectors:

### 2.1 Malicious Administrator Actions
-   *Threat Detail*: An administrator attempts to edit or delete completed procurement records or evaluation lists to favor a specific supplier.
-   *Mitigation*: Saves all data to an append-only, write-once-read-many (WORM) storage. Any change must be logged as a new transaction, leaving the historical records accessible under forensic audit.

### 2.2 Compromised High-Value User Account
-   *Threat Detail*: An attacker gains access to a SCM Officer or Director account to approve a fraudulent tender award.
-   *Mitigation*: Enforces multi-factor authentication (MFA) and biometric handshakes for any transaction over $50,000. Low-level session anomalies instantly trigger additional security challenges.

### 2.3 Compromised Supplier Account
-   *Threat Detail*: A compromised contractor account attempts to edit submitted bid prices or details after the bidding deadline.
-   *Mitigation*: Cryptographically hashes and seals all bids at the submission deadline. System blocks any post-deadline file changes.

### 2.4 Privilege Escalation Attempt
-   *Threat Detail*: A standard user attempts to manually elevate their system permissions to clear cost overrides or sign off on tenders.
-   *Mitigation*: Restricts privilege changes to a multi-signature approval loop requiring signatures from both the HR Division and the IT Security Lead.

### 2.5 Mass Document Export & Data Leakage
-   *Threat Detail*: A disgruntled employee attempts to download or export proprietary bidding details or contractor designs before leaving the organization.
-   *Mitigation*: Displays sensitive documents with unique watermark layers and sets export rate limits. Large data requests trigger security holds.

### 2.6 Decision & Evaluation Score Tampering
-   *Threat Detail*: A corrupt committee member attempts to modify the individual scoring records of competitors during evaluations.
-   *Mitigation*: Cryptographically locks evaluator scorecards upon submission. Re-scoring requires SCM Board authorization and triggers audits.

### 2.7 Ledger Log Modification
-   *Threat Detail*: An attacker with root database access attempts to delete log records or edit transaction times to cover up unauthorized actions.
-   *Mitigation*: Links ledger blocks sequentially using secure hash chains. Any deletion attempts break the chain, instantly raising alerts at security monitoring nodes.

### 2.8 Graph Manipulation Attempts
-   *Threat Detail*: A malicious user attempts to add fake supplier nodes or relationships to the SCM ontology to bypass compliance checks.
-   *Mitigation*: Requires technical and legal verification for all ontology changes. Modified structures are ignored by runtime checkers until formally approved.

---

## 3. FORENSIC THREAT NOTIFICATION SCHEMA

If threat detection rules are triggered, the platform isolates the current user session and creates an immutable **Security Incident Report**:

```json
{
  "incidentId": "sec-a90fbc18-df1a-472e-bc8e-4a0dfbfb9042",
  "anomalyType": "LEDGER_TAMPERING_ATTEMPT",
  "threatActor": "urn:atlas:user:internal-db-administrator-02",
  "details": {
    "targetBlock": 14205,
    "attemptedAction": "retroactive-write-timestamp-override",
    "forensicEvidence": [
      "Detected a SHA-256 hash mismatch at block 14206 during systemic background checks.",
      "Database user attempted manual bypass of HSM check on transaction: 'Contract Variation ABB Kenya'."
    ],
    "responseStatus": {
      "sessionState": "TERMINATED_AND_LOCKED",
      "alarmLevel": "SEV-1_EMERGENCY"
    }
  },
  "lockoutTimestampUTC": "2026-06-23T07:15:00Z"
}
```

This secure design ensures that the platform remains secure against internal compromises, protecting the integrity of KETRACO's critical infrastructure.
