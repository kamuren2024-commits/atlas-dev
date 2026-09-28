# FINOPS & COST GOVERNANCE CHARTER — KETRACO SCM Intelligence Nexus

This charter outlines the cloud cost governance, budget policies, AI API optimization models, and rightsizing playbooks implemented on the KETRACO SCM Platform.

---

## 1. FinOps Philosophy & Unit Cost Model

We define financial accountability as an engineering discipline. Every platform service must map its cloud costs directly to business value metric indices (e.g., Cost per Monte Carlo simulation, Cost per Contract Audit).

```
 [ SCM Business Workload ] ──► [ FinOps Cost Allocator ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
         [ Compute / GKE ]                              [ AI API Quotas ]
         - Autoscaler controls                          - Provider budget caps ($10/day)
```

---

## 2. Resource Cost Allocations & Labels

Every resource provisioned in GCP or Kubernetes must include standard metadata labels to ensure 100% cost-attribution tracing:

* **`cost_center`**: Tracks business budget lines (e.g. `ke-9402`).
* **`owner`**: SRE team responsible for the asset (e.g. `scm-sre`).
* **`environment`**: Deployment environment (e.g. `production`).

---

## 3. AI Platform Cost Optimization

Model calls are our highest variable cost. We implement multiple strategies to prevent budget overruns:

* **Prompts Cache (Memorystore)**: We cache identical prompts and response payloads in Redis to bypass external AI model API fees for repetitive tasks. This has lowered API bills by **$\approx 35\%$**.
* **Federated Router (ModelRouter)**: Routes queries dynamically based on cost and payload sizing. High-throughput tasks default to lower-cost models (e.g. Groq/Gemini Flash), reserving high-intelligence models (e.g., Gemini Pro) for complex audits.
* **Hard Budget Caps**: Under `ProviderConfig`, we enforce strict budget limits ($10 USD daily, $100 USD monthly), blocking API access dynamically if thresholds are crossed.
* **Token Rate Limits**: All user accounts are limited to a maximum token allocation per hour to prevent accidental recursive loops in agent tasks.
