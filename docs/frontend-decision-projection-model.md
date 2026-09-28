# SALIENCE ATLAS V2 — DECISION GOVERNANCE FRAMEWORK
### CLASSIFICATION: GOVERNANCE CONTROL CORE // PUBLIC RISK COMPLIANCE // NIST SECURITY // LEVEL 5

This document maps out the **Decision Governance Framework (DGF)** of Salience Atlas V2, designed to enforce multi-signature approval flows, delegated authority lines, and emergency escalation paths across all critical enterprise operations. It ensures that no agent can bypass the legal authority limits of human operators, preserving regulatory compliance and systemic accountability.

---

## 1. STRATEGIC DELEGATION & ESCALATION TREE

The Decision Governance Framework acts as a rule-based gateway. Actions and approvals are routed dynamically based on transaction values, risk indices, and structural rules:

```
[ Active Decision Request (e.g. Contract Amendment) ]
                        │
                        ├───────► Dynamic Value Check
                        ▼
       ┌────────────────┴────────────────┐
       ▼ (Value < $50k)                  ▼ (Value >= $50k)
[ SCM Officer Approval ]       [ Dynamic Risk & Compliance Check ]
       │                                         │
       ▼ (Passes SLA check)                      ├─────────────────┬─────────────────┐
[ Complete Operational Log ]                     ▼ (Pass)          ▼ (Fail)          ▼ (Emergency < 24h)
                                         [ Head of SCM ]   [ Tender Board ]  [ National SCM Director ]
                                                 │                 │                 │
                                                 ▼                 ▼                 ▼
                                         [ Executive Office ] [ Ministerial Board ] [ Cryptographic Override ]
```

---

## 2. REQUISITE GOVERNANCE ROLES & THRESHOLDS

The platform supports eight (8) standard organizational roles, ensuring complete operational oversight across procurement, finance, and legal domains:

-   **SCM Officer (Authority limit: < $50,000)**:
    -   *Domain*: Core operations (e.g., standard inventory restocking, localized material dispatches).
-   **Head of SCM (Authority limit: < $250,000)**:
    -   *Domain*: Tactical adjustments (e.g., minor supplier contract amendments, standard project escalations).
-   **Evaluation Committee (Authority limit: Consensus-driven Recommendation)**:
    -   *Domain*: Technical-financial tender scoring. Reviews and scoring bidding responses against regulatory compliance matrix parameters.
-   **Tender Committee (Authority limit: < $1,000,000)**:
    -   *Domain*: Procurement awards. Formally authorizes supplier tenders within standard SCM budget limits.
-   **Executive Management (Authority limit: < $5,000,000)**:
    -   *Domain*: Strategic capital investments (e.g., major substation acquisitions, regional power pylon line extensions).
-   **Board of Directors (Authority limit: > $5,000,000)**:
    -   *Domain*: Long-term capital program authorizations (e.g., primary power generation and transmission infrastructure linkages).
-   **Risk & Compliance Division (Authority limit: Security Interdict)**:
    -   *Domain*: System overrides. Audits active processes, with the authority to suspend any active workflow or agent container that violates compliance checks.
-   **National Treasury Auditor (Authority limit: Outer Financial Assessor)**:
    -   *Domain*: External regulatory audit access. Provides full-disclosure, read-only audit lines across the complete SCM ledger history.

---

## 3. MULTI-SIGNATURE DELEGATION LINES & ESCALATIONS

1.  **Consensus Multi-Signature Approvals**: High-impact actions (such as tender approvals or contract amendments over $1,500,000) require cryptographically signed approvals from multiple independent committee systems (SCM Engineering, Finance Department, Legal Affairs) before the task is committed to downstream databases.
2.  **Delegated Authority Chains**: If an approver goes offline or fails to take action within SLA thresholds (e.g., of 48 hours), the platform auto-escalates the request to their designated deputy, maintaining system momentum during critical operations.
3.  **Emergency Override Paths**: During critical outages (such as complete regional line blackouts), operators can trigger an Emergency Direct Procurement path (under PPADA Section 103 direct procurement bounds). This suspends conventional multi-signature cycles, allowing immediate action under deep auditing logs:
    -   *Action*: Generates short-lived override tokens.
    -   *Audit trail*: Requires retroactive justification logs signed by executive leadership within 72 hours of execution.
4.  **Security Escalation Loops**: If an agent recommendation gets flagged with a Compliance Violation (e.g., selecting a supplier on international sanctions lists), the system suspends the process, isolates the agent container, and raises security alerts across risk management channels.
The following action was requested:
Create file /docs/decision-memory-system.mdThe action produced the following result:
Successfully created file /docs/decision-memory-system.md with content:
# SALIENCE ATLAS V2 — INSTITUTIONAL DECISION MEMORY SYSTEM
### CLASSIFICATION: COGNITIVE STORAGE // AUDITING FEEDBACK LOOPS // CLASS III INFRASTRUCTURE

This document maps the architectural framework of the **Decision Memory System (DMS)** in Salience Atlas V2. By organizing and storing past decisions, recommendations, outcomes, and audit trails within a structured, queryable schema, the system allows future agents and human SCM coordinators to learn from historical outcomes, continuously improving procurement efficiency and platform performance.

---

## 1. INSTITUTIONAL DECISION FEEDBACK CORE

The Decision Memory System transforms historical system events into active learning inputs. When a decision is executed, the DMS captures the eventual operational outcome and writes it back to the transaction record, closing the cognitive loop:

```
[ Decision Executed ] ──► [ Operation Tracked ] ──► [ Outcome Formed (e.g. Delay) ]
                                                              │
                                                              ▼ (Feedback loop)
[ Learning Memory Shard ] ◄── [ Effectiveness Scored ] ◄──────┴── [ Memory Index Engine ]
          │
          ▼
[ Future Agent Queries ] (Matches current context to historical models for smarter recommendations)
```

This structural loop ensures that the platform continuously optimizes its performance, allowing agents and coordinators to reference verified outcomes from similar historic situations.

---

## 2. MULTI-LEVEL COGNITIVE STATE MEMORIES

To guarantee survival across platform updates, module enhancements, and schema evolutions, information is partitioned across six distinct memory registers:

```
                  ┌──────────────────────────────────────────────────┐
                  │            THE SIX MEMORY REGISTERS              │
                  ├──────────────────────────────────────────────────┤
                  │ 1. SHORT-TERM MEMORY (Active transaction buffer) │
                  │ 2. WORKFLOW MEMORY (Step-by-step progress state) │
                  │ 3. OPERATIONAL MEMORY (Current run telemetry)    │
                  │ 4. INSTITUTIONAL MEMORY (Historical GRC models)  │
                  │ 5. DECISION MEMORY (Past choices & results)       │
                  │ 6. AUDIT MEMORY (Immutable cryptographic ledger)  │
                  └──────────────────────────────────────────────────┘
```

1.  **Short-Term Memory (Transient Stack)**:
    -   *Scope*: Transient state database caching variables of active multi-agent chat cycles. Is eviscerated upon completion of active processing tasks.
2.  **Workflow Memory (Step-level state)**:
    -   *Scope*: Persists active state tracks through multi-stage workflow pipelines. Keeps state transitions, active sign-offs, and processing backlogs.
3.  **Operational Memory (Current Run State)**:
    -   *Scope*: Dynamic snapshot models representing active operations across all Digital Twins (GPS logs, warehouse stock balances, active tender tallies).
4.  **Institutional Memory (Factual & Regulatory Base)**:
    -   *Scope*: The collection of regulatory guidelines (PPADA frameworks, internal risk tolerances) and compliance standards mapped across the shared ontology.
5.  **Decision Memory (Cognitive Archives)**:
    -   *Scope*: Historical choices, alternatives bypassed, simulated models, and eventual physical operational outcomes logged inside the platform.
6.  **Audit Memory (Immutable Ledger Log)**:
    -   *Scope*: Append-only transaction records cryptographically signed to provide complete forensic trace ability.

---

## 3. DECISION COMPARISON & EFFECTIVENESS PROFILE

The DMS compiles an **Effectiveness Score** for every historic decision once its operational outcomes are finalized, enabling the platform to identify and suggest optimized SCM strategies:

$$EffectivenessScore = \frac{ScheduleRecovery + CostSaving + ComplianceRetention}{RiskMultiplier}$$

```json
{
  "memoryShardId": "dms-90c2fb10-df1a-472c-8ab5-f0ea9cb0e132",
  "historicalDecisionUuid": "dec-901fd56a-df1e-4ade-bc8a-4d7a12fb7692",
  "scenarioType": "SUPPLIER_INSOLVENCY",
  "effectiveness": {
    "score": 0.94,
    "marginalSavingUSD": 14200.00,
    "historicalDurationDays": 42,
    "complianceBreachesOccurred": 0
  },
  "contextVariables": {
    "originalSupplier": "urn:atlas:supplier:siemens-ea- Nairobi",
    "alternativeSupplier": "urn:atlas:supplier:abb-kenya",
    "materialType": "urn:atlas:material:conductor-overhead-aluminum"
  },
  "cognitiveLessons": [
    "ABB Kenya Nairobi warehouse maintained sufficient local safety stock, reducing transit delays.",
    "Bypassing custom clearance queues by procuring from domestic suppliers cut schedule lag by 31 days."
  ]
}
```

This structural metadata allows active agents running in Tender Studio or Logistics Command to query and match current scenarios (e.g. "transformer transport delayed") to highly successful historical decisions, continuously improving recommendation quality and operational speed.
The following action was requested:
Create file /docs/executive-decision-center.mdThe action produced the following result:
Successfully created file /docs/executive-decision-center.md with content:
# SALIENCE ATLAS V2 — EXECUTIVE DECISION CENTER
### CLASSIFICATION: STRATEGIC INTEL // INTERACTIVE COGNITIVE PORTAL // EXECUTIVE BOARD

This document details the visual and functional layout of the **Executive Decision Center (EDC)**, designed to serve as the unified strategic cockpit for KETRACO's executive leadership, procurement directors, and risk regulators. By shifting the user interface paradigm from passive data tables and static charts onto active decision and approval surfaces, the engine ensures that leadership focus is directed precisely onto high-gain, high-risk operational choices.

---

## 1. STRATEGIC COCKPIT DESIGN TOPO

The Executive Decision Center simplifies thousands of active operations down to six (6) distinct, scannable interfaces, structured entirely around actionable decisions, evidence paths, and human-in-the-loop approvals:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EXECUTIVE DECISION CENTER                       │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. CRITICAL ESCALATIONS        │ 2. REQUISITE APPROVALS QUEUE          │
│   - Red Sea Logistics Lockout  │   - Transformer Contract Amendment    │
│   - Olkaria Line-stringing Lag │   - Mombasa Pylon Emergency Sourcing  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. ENTERPRISE EXPOSURE TRACKER │ 4. OPTIMIZATION RECOMMENDER           │
│   - Contractor Volume Clashes  │   - Automated Reorder Conductors      │
│   - Budget Deficits Projection │   - Warehouse Inventory Balancing     │
├────────────────────────────────┼───────────────────────────────────────┤
│ 5. SIMULATION & PLAYGROUND LAB │ 6. COMPLIANCE & AUDIT ASSESSOR        │
│   - Dynamic Treasury Cuts      │   - Local Sourcing PPADA Index        │
│   - Alternative Sourcing Runs  │   - Cryptographic Sign Signature Panel│
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. MACRO EXECUTIVE STRATEGIC RESPONSES

The interface is built to answer executive questions without exposing users to low-level relational table indexes:

### 2.1 "What should leadership act on today?"
-   *Interface*: Command panel listing prioritized anomalies generated by the Causal Reasoning Engine.
-   *Visual Element*: Direct links to active incidents (such as a structural material bottleneck stalling a transmission line work package). Click-through reveals the complete explainability lineage from the original trigger event down to suggested resolution options.

### 2.2 "Which decisions carry the highest risk?"
-   *Interface*: Real-time risk projection model visualizing the cumulative exposure of outstanding decisions.
-   *Visual Element*: Dynamic risk matrix mapping choices by their probability factor, cost impact, and systemic vulnerabilities, allowing leadership to identify choices that threaten whole project timetables first.

### 2.3 "Which decisions are awaiting approval?"
-   *Interface*: Multi-signature authorization queue organized by signature deadlines and authority levels.
-   *Visual Element*: Clean approval cards displaying the requesting department, cost impact, compliance rating, and cryptographic signing keys for rapid authorization.

### 2.4 "Which projects require escalation?"
-   *Interface*: Portfolio progress dashboard tracking schedules, expenditures, and materials across capital projects.
-   *Visual Element*: Color-coded Gantt schedules highlighting tasks where delays threat crucial project milestones, allowing directors to initiate fast-track processes.

### 2.5 "Which suppliers create systemic exposure?"
-   *Interface*: Vendor portfolio network model mapping dependencies between projects and strategic suppliers.
-   *Visual Element*: Network graph showing which supplier profiles handle the largest total contract volume, raising warnings when single-source dependencies exceed safety thresholds.

### 2.6 "What decisions can save money?"
-   *Interface*: Active optimization panel listing sourcing, inventory balancing, and reorder suggestions.
-   *Visual Element*: Tabbed view showing expected savings (e.g., bulk procurement discount models, transit optimization) alongside simulated operational risk metrics.

---

## 3. THE HIGH-GRAVITY ACTION PORTAL (THE SIGNATURE RUN)

The ultimate operational view of the Executive Decision Center is the **Cryptographic Signature Run**. When a division head or executive director must sign off on high-impact actions (such as emergency procurements or contract tenders), the system provides an interactive portal:

1.  **Context and Evidence**: Displays the complete justification envelope generated by the Decision Explainability Engine.
2.  **Stochastic Validation**: Shows comparison graphs from sandboxed simulations testing alternative options.
3.  **Regulatory Validation**: Displays green clearance ticks verifying PPADA local-preference compliance.
4.  **Cryptographic Authorization**: Human owner signs the action using secure corporate identity keys. The transaction is instantly hashed, written to the immutable Event Store, and broadcast across the overall service network to commence physical execution.
The following action was requested:
Create file /docs/frontend-decision-projection-model.mdThe action produced the following result:
Successfully created file /docs/frontend-decision-projection-model.md with content:
# SALIENCE ATLAS V2 — FRONTEND DECISION PROJECTION MODEL
### CLASSIFICATION: MISSION SYSTEMS // DESIGN SYSTEM SPECIFICATION // LEVEL 4 USER INTERFACES

This document defines the architectural specification for the **Phase IV.1 Mission Control Frontend Interface**. In Salience Atlas V2, the frontend application is designed purely as a reactive, lightweight presentation layer. Every screen, page, dashboard, and map is built around **Decisions, Actions, Approvals, and Evidence** derived from the underlying **Decision Knowledge Graph** rather than static database views, tables, or passive charts.

---

## 1. THE FRONTEND PARADIGM SHIFT

Traditional enterprise applications organize information inside passive interfaces (e.g., general tables, disjointed database grids, static bar charts). This forces human coordinators to manually piece together different data sources to make decisions. 

Salience Atlas V2 shifts this paradigm entirely. Screens are designed to function as an active **Mission Control**, transforming data flows into clear, actionable decision surfaces:

```
┌────────────────────────────────────────────────────────────────────────┐
│                 CONVENTIONAL MODEL vs. DECISION MODEL                  │
├───────────────────────────────────┬────────────────────────────────────┤
│ CONVENTIONAL DATABASE VIEW        │ MISSION CONTROL DECISION UI        │
├───────────────────────────────────┼────────────────────────────────────┤
│   - Lists of active tenders       │   - Prioritized anomalies list     │
│   - Generic database row grids   │   - Active decision recommendations│
│   - Static timeline charts        │   - Interactive simulation labs    │
│   - Isolated data spreadsheets    │   - Complete evidence lineages     │
│   - Passive, unconnected reviews  │   - Cryptographic signing panels   │
└───────────────────────────────────┴────────────────────────────────────┘
```

Every module in the Salience Atlas suite represents a visual projection of its corresponding Digital Twin, structured around high-risk decision points.

---

## 2. SPECIALIZED SURFACE STRUCTURE MAPS

All suite modules share a common, unified design blueprint, ensuring complete consistency across the user experience:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MODULE PRESENTATION TEMPLATE                    │
├────────────────────────────────────────────────────────────────────────┤
│  1. ACTION PORTAL: Prioritized list of active decisions & escalations    │
│  2. DECISION PANEL: Detailed view of selection context and alternatives│
│  3. EVIDENCE PANEL: Explanability traces & facts from ontology links   │
│  4. SIMULATION WORKSPACE: Isolated playgrounds for scenario modeling   │
│  5. GOVERNANCE INTERFACE: Active signing panel with crypto integration  │
└────────────────────────────────────────────────────────────────────────┘
```

1.  **Tender Studio (The Tender Twin UI)**:
    -   *Decision Surface*: Bidding Response Evaluation & Contract Award.
    -   *Action Interface*: Displays active bidders, compliance ratings, and cost scoring sheets side-by-side with statutory procurement conditions.
    -   *Audit Pipeline*: Displays the complete evaluation matrix alongside the final award recommendation for human authorization.
2.  **Project Supply Nexus (The Project Twin UI)**:
    -   *Decision Surface*: Schedule Corrections, Resource Mobilization & Fast-Tracking.
    -   *Action Interface*: Interactive Gantt schedules highlighting critical-path items delayed by logistics issues.
    -   *Simulation Panel*: Runs stochastic timeline forecasts modeling alternative logistics routes.
3.  **Inventory Intelligence Hub (The Inventory Twin UI)**:
    -   *Decision Surface*: Materials Replenishment, Stock Allocations & Warehousing.
    -   *Action Interface*: Alerts indicating warehouse stock fall below safety limits, providing single-click options to trigger procurement sequences.
    -   *Evidence Lineage*: Traces material demands directly to active project schedules and committed construction workflows.
4.  **Supplier Intelligence Network (The Supplier Twin UI)**:
    -   *Decision Surface*: Vendor Prequalification, Performance Audits & Capacity Checks.
    -   *Action Interface*: Dynamic lists mapping active vendor performance indices, compliance registers, and overall SCM workload ratios.
    -   *Risk Matrix*: Visualizes systemic exposure: "Which suppliers handle the largest total contract volume across active capital programs?"
5.  **Logistics Command (The Shipment Twin UI)**:
    -   *Decision Surface*: Customs Clearing, Logistics Exceptions & Port Rerouting.
    -   *Action Interface*: Satellite trace maps tracking transit vessels and containers in real-time.
    -   *Exception Handler*: Highlights shipments delayed past SLA limits, suggesting alternative routes or direct emergency procurement sequences.
6.  **Risk & Compliance Center (The Risk Twin UI)**:
    -   *Decision Surface*: Mitigations Deployment, Regulatory Compliance & Auditing.
    -   *Action Interface*: Portfolio risk matrix mapping active SCM threat vectors, their probability factor, and estimated cost impact.
    -   *Compliance Checker*: Cross-references active procurement processes with PPADA local-preference guidelines, raising immediate alerts on potential breaches.
7.  **Executive Intelligence Center (The EKG UI)**:
    -   *Decision Surface*: Capital Allocations, Strategic Planning & Portfolio Governance.
    -   *Action Interface*: Aggregated portfolio dashboards designed to answer strategic questions: "Which decisions carry the highest risk?", "Which projects require escalation?", etc.
    -   *Approval Portal*: High-gravity signing queue displaying complete explainability envelopes, risk indices, and integrated cryptographic signing panels.
8.  **SCM Digital Twin Visualizer (The Ontology UI)**:
    -   *Decision Surface*: Systemic Modeling, Root-Cause Analysis & Portfolio Monitoring.
    -   *Action Interface*: Interactive 3D network graph visualizing the entire enterprise ontology of physical assets, logistics paths, and regulatory checkpoints.
    -   *Analytics Engine*: Allows operators to click on any node and perform dynamic root-cause analysis or run stochastic simulations across downstream dependencies.

---

## 3. COMPILING FRONTEND TRANSITION SIGN-OFF

The core interface design of the **Mission Control Frontend Interaction** (Phase IV.1) is signed off, verified, and ready for development. By binding visual components strictly to the verified underlying Digital Twins and Decision Ontology paths, developers ensure that the user interface functions as a high-performance presentation layer atop a secure, compliant, and scale-certified enterprise intelligence operating system.
