# ARCHITECTURE — KETRACO SCM Control Plane Platform
## Salience Atlas Autonomous Procurement Operating System (APOS)

This document provides a highly detailed, comprehensive overview of the APOS platform architecture, data models, multi-agent frameworks, and external integration capabilities.

---

### System Architecture Model

The Salience Atlas Procurement Operating System is designed as a modular, resilient full-stack application. It couples a React-based interactive digital twin front-end with an Express-based enterprise API router and multi-agent control plane.

```
       +-------------------------------------------------------------+
       |             SALIENCE ATLAS COMPASS / WEB CLIENT             |
       |  (Dashboard, Real-Time Digital Twin, API Playground Tab)    |
       +------------------------------+------------------------------+
                                      |
                           HTTPS REST Secure Line
                                      |
                                      v
       +-------------------------------------------------------------+
       |                  EXPRESS API GATEWAY                        |
       |            (/backend/chrome-extension-api.ts)                |
       +-------+----------------------+----------------------+-------+
               |                      |                      |
               v                      v                      v
       +-------+-------+      +-------+-------+      +-------+-------+
       |  MULTI-AGENT  |      | STATUTORY RAG |      | DIGITAL TWIN  |
       | CONTROL PLANE |      | KNOWLEDGE BASE|      | SIMULATION    |
       |  (fabric.ts)  |      |  (PPADA 2015) |      | (instances.ts)|
       +---------------+      +---------------+      +---------------+
```

---

### Core Structural Subsystems

1. **Multi-Agent Orchestrator Matrix (`/backend/agents/fabric.ts`):**
   * Manages the lifecycles, goals, and working memories of domain-specific agents (Planner, Compliance, Risk, Audit, SCM Head, and SCM Advisor).
   * Coordinated by the Intelligent Agent Router which parses strategic requests and compiles task graphs / Directed Acyclic Graphs (DAGs) for parallel agent execution.

2. **Compliance Engine & Statutory Guardrails (`/docs/legal/*`):**
   * Encodes PPADA 2015 and PPADR 2020 requirements directly into operational business policies and threshold checkers.
   * Proactively triggers Governance Gates when human authorization (HITL) is legally required.

3. **Digital Twin Simulation Engine (`/backend/agents/instances.ts`):**
   * Feeds interactive parameters (Mombasa port delay, steel price inflation, currency volatility) into predictive pricing and scheduling formulas.
   * Emits structural risk assessments and alternative route suggestions to mitigate contract delays.

4. **API Integration & Observability Gateway (`/backend/chrome-extension-api.ts`):**
   * Centrally exposes SCM context analytics, memory logs, and agent call routers via lightweight, secure, AES_256_GCM-encrypted REST gateways.
   * Powers Chrome Extension Copilots and mobile portals out-of-the-box.

---

### Security & Compliance Policy
* **Multitenancy:** Rigid working and episodic memory isolation on a per-tenant basis.
* **Authentication:** Dual bearer token validation combined with role-based and attribute-based access controls (RBAC/ABAC).
* **Audit Trails:** Serializes and archives every workflow event and human override decision as immutable compliance evidence.

---

### Architecture Stability Standard
* **Certified Version:** `v1.4.2-STABLE`
* **Last Verified Date:** `2026-06-30`
* **Enterprise Platform Rating:** `Grade-A Cloud Native Architecture`
