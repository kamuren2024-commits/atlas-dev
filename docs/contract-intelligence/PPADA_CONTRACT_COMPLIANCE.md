# PPADA CONTRACT COMPLIANCE

## 1. Introduction
All actions within KETRACO's SCM operations must comply with the **Public Procurement and Asset Disposal Act (PPADA 2015)** and its corresponding **Public Procurement and Asset Disposal Regulations (PPADR 2020)**. The Atlas ACIN embeds these rules as immutable, code-enforced guardrails.

---

## 2. Core Legislative Mappings & Guardrails

| Section | Statutory Requirement | ACIN Automated Enforcement Guardrail |
| :--- | :--- | :--- |
| **Section 135** | Legal Contract Signing Boundaries. | Rejects any contract execution that does not match the exact approved Tender Award values, ensuring no post-tender drift. |
| **Section 139** | Contract Variations and Amendments. | Hard block on cumulative variations exceeding **25%** of the original contract value. Variations above **15%** automatically trigger board-level review holds. |
| **Section 140** | Performance Securities. | Automatically flags contracts if valid performance security is not submitted within the statutory **30-day** post-award window. |
| **Section 141** | Inspection and Acceptance. | Blocks milestone payments until the physical Inspection and Acceptance Committee digitally signs the quality compliance certificate. |
| **Section 142** | Contract Termination Guidelines. | Automatically compiles a legal compliance audit pack if default notices exceed the statutory termination periods. |
| **Section 143** | Liquidated Damages. | Computes and levies liquidated damages dynamically according to the contract's defined daily rate when deadlines slip. |

---

## 3. High-Fidelity Validation Capabilities

### 3.1 Variation Limit Validation
When a variation is requested, the system queries the contract twin's ledger history:
$$\sum V_{existing} + V_{new} \le 0.25 \times \text{Original Contract Sum}$$
If this equation is violated, the system displays a hard red block and halts any further processing.

### 3.2 Audit Readiness Scoring
The system computes an active **Audit Readiness Score** ($ARS \in [0, 100]$) for each contract. It measures whether all statutory documents (tender specifications, signed forms, evaluations, tax clearance certificates, inspection reports) are hashed, signed, and present in the permanent ledger.

---

## 4. Mandatory Human-In-The-Loop (HITL) Enforcement
Where the law prohibits fully autonomous decision-making (such as authorizing double-digit contract price adjustments, changing suppliers, or issuing default notices), the ACIN forces a **Mandatory HITL Compliance Lock**. 
The operator must provide:
1.  **Clear audit justifications** (documented in plain text).
2.  **Verified credentials / Secure PIN code** (acting as a digital handshake).
3.  **Co-signatures** from other department leads before the lock is released.
