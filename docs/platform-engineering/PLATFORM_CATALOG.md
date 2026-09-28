# PLATFORM COMPONENT CATALOG

This catalog lists and describes the core components, agents, and services operating in the KETRACO SCM platform.

---

## 1. Core Services Catalog

### A. Salience Atlas Router Gateway (`salience-atlas-router`)
* **Type**: Go / gRPC Gateway Service
* **Description**: Translates HTTP public requests to internal protobuf gRPC streams; manages key rotations and cost budgets.
* **Owner**: Core Platforms Team
* **SLO**: 99.95% availability

### B. SCM digital Twin Engine (`scm-digital-twin`)
* **Type**: Python FastAPI Service
* **Description**: Performs spatial calculations, Monte Carlo logistics simulations, and transmission node health estimations.
* **Owner**: Grid Intelligence Team
* **SLO**: Simulation execution time $\le 500$ ms (p95)

### C. Contract Analysis Agent (`contract-auditor`)
* **Type**: TypeScript Node Service
* **Description**: Connects to the Gemini SDK, validates bids, cross-checks against procurement guidelines, and formats citations.
* **Owner**: Procurement Compliance Team
* **SLO**: Citation compliance rating 100%

---

## 2. Shared Libraries & Platforms

* **`ketraco-sdk-node`**: Shared client libraries to resolve secure environment variables, log telemetry traces, and dispatch alerts.
* **`ketraco-cli`**: Developer command-line utility used to scaffold services, deploy manifests, and inspect live cluster metrics.
