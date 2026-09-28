# CERTIFIED CLIENT LIBRARIES

This document describes the certified client SDK modules, installation policies, and compatibility matrices.

---

## 1. Supported Runtime SDKs

* **TypeScript/Node.js SDK**: `@ketraco-scm/sdk-node` (v2.x) - Fully typed, async-optimized client.
* **Python SDK**: `ketraco-scm-sdk` (v2.x) - Optimized for data science and analysis pipelines.

---

## 2. Dynamic Installation Policies

* **Registry Location**: All modules must be retrieved from the internal secure package registry.
* **Vulnerability Checks**: Packages are pre-screened to ensure zero high/critical vulnerabilities.
* **Sample Instantiation**:
  ```typescript
  import { KetracoClient } from '@ketraco-scm/sdk-node';
  const client = new KetracoClient({ apiKey: process.env.KETRACO_API_KEY });
  ```
