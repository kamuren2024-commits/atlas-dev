# AI_AGENT_REGISTRY — KETRACO SCM Autonomous Agent Workforce
## Salience Atlas Autonomous Procurement Operating System (APOS)

This document contains the registry of all active SCM agents operating within the KETRACO Intelligence Control Plane.

---

### Registered Agent Directory

| Agent ID | Agent Name | Domain / Role | Goals | Tools | Capabilities | Memory Level |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **agent-planner** | SCM Planner Agent | Planning & Budgets | Validate Capex allocations, optimize procurement cycle plans | Capex Ceiling Verifier, Plan Conformance Matcher | PPADA Sec 53 check | Episodic & Working |
| **agent-author** | Tender Author Agent | Document Prep | Auto-compile standard tender docs, ensure compliant boilerplates | Template Boilerplate Generator, Spec Evaluator | PPADA Sec 74 check | Short-Term & Semantic|
| **agent-compliance**| Compliance Sentinel | Regulatory Auditing | Enforce PPADA 2015 / PPADR 2020 rules, audit evaluation committees | Rules Checker, Threshold Inspector | Strict PPADA Clause Match | Long-Term & Working |
| **agent-risk** | SCM Risk Analyst | Predictive Analytics | Forecast logistics, supply default, port delay, and FX risks | Digital Twin Simulator, FX Hedging Forecaster | What-if Risk Modeling | Episodic & Risk Memory |
| **agent-advisor** | Executive Advisor | SCM Conflict Resolution| Streamline multi-agent deadlocks, advise executive override | Task Decompositor, Decision Synthesizer | SHAP Attribution Map | Episodic & Org Memory |
| **agent-audit** | SCM Audit Engine | Forensic Auditing | Detect bid rigging, collusion, price inflation, bid rotation | Collusion Auditor, Price Index Comparer | SHA-256 Bid Verification | Semantic & Historical |

---

### Agent Communication & Coordination Flow

```
   [Strategic Query / Task Input]
                 |
                 v
   [Intelligent Agent Router]
                 |
        +--------+--------+
        |                 |
        v                 v
  [Single Agent]    [Multi-Agent Mesh / Task Planning]
        |                 |
        |                 v
        |           [Task Decomposer / Goal Tree Decomp]
        |                 |
        |                 v
        |           [Execution DAG / Directed Acyclic Graph]
        |                 |
        +--------+--------+
                 |
                 v
   [SCM Telemetry Log / Ledger Capture]
```

### Workforce Certification
* **Certified Version:** `v1.4.2-STABLE`
* **Last Verified Date:** `2026-06-30`
* **Autonomous Agent Health Rating:** `100% Operational (Optimal Status)`
