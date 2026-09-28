# SALIENCE ATLAS V2 — APPROVAL CENTER STANDARD
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // APPROVAL CORE // REGULATORY FABRIC

This standard establishes the technical and behavioral rules for the **Global Approval Center** within Salience Atlas V2. As the central authorization gateway, the system tracks and manages all critical procurement and operational approvals, verifying that each decision complies with treasury regulations and corporate policy limits.

---

## 1. THE CONCISE APPROVAL TRAVERSAL

The Approval Center acts as an interactive, non-bypassable workflow gate. No high-value transaction can proceed without routing through this central verification system:

```
[ PROPOSED TRANSACTION ] (e.g., Approve Tender Award)
           │
           ▼
[ DELEGATED AUTHORITY ROUTER ] (Checks user limits and active role)
           │
           ▼
[ APPROVAL CENTER INBOX ]
  ├── 1. Verify User Credentials (HSM Key Check)
  ├── 2. Map Related Evidence (Files, scores, checklists)
  ├── 3. Map Applicable Policies (PPADA rules, budget limits)
  └── 4. Map Decision Alternatives (Comparison list)
           │
     ┌─────┴───────────────────────────────────┐
     ▼ (Rejected)                             ▼ (Approved)
[ WRITE REJECTION & NOTIFY ]             [ WRITE CRYPTOGRAPHIC SIGNATURE ]
- Logs rejection reason to ledger         - Records signature trace to ledger
- Reverts transaction to draft            - Commits transaction state change
```

---

## 2. REQUISITE APPROVAL FIELDS & BINDINGS

To meet public audit and regulatory requirements, every approval entry must be linked directly to four critical data structures:

### 2.1 Verifiable Evidence
-   *Rule*: Approvals must display all supportive background data (detailed scoring matrices, inventory level receipts, risk audits) side-by-side.
-   *Enforcement*: System disables action selectors if background data references are broken or unverified.

### 2.2 Parent Decision
-   *Rule*: Approvals must map to their parent decision recommendations, showing the core reasoning, evaluated alternatives, and estimated schedule impact.
-   *Enforcement*: Connects approvals directly to the Decision Knowledge Graph to preserve logical lineage.

### 2.3 Regulatory Policy Binding
-   *Rule*: Approvals must be bound to their legal authorizing statute (e.g., PPADA Section 139 for variations, section 103 for emergency direct awards).
-   *Enforcement*: Displays the authorizing law and statutory limits within the approval workspace.

### 2.4 Immutable Archival Audit Chain
-   *Rule*: Completed approvals are written to an append-only transaction ledger, generating cryptographically signed, permanent records.
-   *Enforcement*: Formats approval outputs as verifiable transaction logs for future Auditor-General reviews.

---

## 3. PRIMARY SYSTEM PATH APPROVALS

The Approval Center manages six main authorization paths, applying specific delegation checks to each:

1.  **PPADA Statutory Approvals**: Procurement planning authorizations and local preference inclusions checks, routed to the Accounting Officer.
2.  **Tender Committee Approvals**: Joint approvals of bid specifications, technical evaluations, and award recommendations.
3.  **Contract Variation Approvals**: Approvals of cost/scope amendments. Checks that the cumulative variance remains below the PPADA 25% cap.
4.  **Risk Mitigation Approvals**: Authorizations to release funds from contingency reserves to mitigate active supply-chain disruptions.
5.  **Executive Strategic Approvals**: Releases capital funds for major infrastructure programs and regional transmission line projects.
6.  **Emergency Direct Approvals**: Fast-track authorizations for emergency procurements during severe physical grid failures.

This standardized approval framework ensures that all SCM decisions remain completely transparent and legally defensible.
