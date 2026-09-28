# SECURITY BASELINE — KETRACO SCM Intelligence Nexus

This security baseline defines the structural, runtime, and deployment safety measures implemented inside the KETRACO SCM Intelligence Nexus to protect credentials, prevent code injections, and comply with OWASP top-10 security guidelines.

---

## 1. Threat Modeling (STRIDE Analysis)

The application has been modeled against the STRIDE methodology to safeguard SCM and grid infrastructure data:

| Threat Category | Potential Vector | Mitigation Strategy Implemented |
| :--- | :--- | :--- |
| **Spoofing** | Unauthorized entity attempting to call SCM APIs or mock mock transactions. | Express gateway routes validate client origin. Security headers isolate requests within the iframe sandbox. |
| **Tampering** | Rogue actor modifying `.env` parameters or API responses in transit. | **EnvIntegrityMonitor** performs active runtime hashing. High-availability fallback ensures data consistency. |
| **Repudiation** | User denying performing administrative SCM or cost budget changes. | All configuration updates, provider rotations, and AI operations write permanent log records to `stdout`. |
| **Information Disclosure** | Leak of sensitive API credentials (e.g. Gemini, OpenAI) to the browser. | Zero environment variables with `VITE_` prefixes are used for backend credentials. **KeysVault** enforces strict masking. |
| **Denial of Service** | Budget exhaustion via rapid AI agent loops or recursive queries. | Strict cost controls (`AI_MONTHLY_BUDGET_USD` and `AI_DAILY_BUDGET_USD`) and request limiters block spikes. |
| **Elevation of Privilege** | Gaining SCM admin credentials or altering configuration scopes. | Strict file permission guidelines and read-only container compatibility prevent local file system overwrites. |

---

## 2. Secrets Management & Precedence

* **Zero-Commit Policy**: Direct API credentials or passwords MUST NOT be committed to the code repository.
* **Pre-Boot Scan**: The **SecretScanner** scans all active repository files for known credential formats (e.g., `sk-`, `AIza`, `csk-`, `gsk_`) on server startup. If matches are found, startup fails with a fatal exit code to block deployments.
* **Precedence of Truth**: Values are resolved dynamically in order: Process Environment variables (cloud secrets) $\rightarrow$ `.env.local` $\rightarrow$ `.env`.

---

## 3. OWASP Top-10 Compliance Mapping

### A. Broken Object Level Authorization (A01:2021)
All SCM Digital Twin substations, warehouse inventory logs, and contract audit records are restricted dynamically. The frontend renders views relative to isolated roles, and the backend verifies endpoints against proper user environments.

### B. Cryptographic Failures (A02:2021)
Sensitive data in transit is protected via TLS 1.3. Env integrity hashes employ SHA-256 with strong hashing protocols in node's native `crypto` library.

### C. Injection (A03:2021)
System commands are avoided. User-supplied inputs (like custom contract text or bid document uploads) undergo sanitization and are bound within structured parameters before feeding to vector indexes or AI prompt frameworks, eliminating command/prompt-injection risks.

### D. Insecure Design (A04:2021)
The application adheres to the principle of least privilege. The root container filesystem can run in read-only mode, and the database utilizes PGVector with indexed parameters for search optimization rather than loading full tables into client memory.

### E. Security Misconfiguration (A05:2021)
HMR is disabled in production, Node's `NODE_ENV` is set strictly to `production`, and the Vite dev server is isolated behind an Nginx reverse proxy routing solely on port 3000. All diagnostic error stacks are sanitized from client API responses.

### F. Vulnerable and Outdated Components (A06:2021)
Dependencies are strictly tracked in `package.json`. Regular automated vulnerability sweeps ensure no vulnerable libraries are imported, and modern, lightweight SDKs (such as `@google/genai` rather than legacy combinations) are preferred.

### G. Security Logging and Monitoring (A09:2021)
Startup validators log full capabilities reports, and the background monitor watches file systems for active breaches. All alerts include proper structured timestamps, classification tags (e.g., `[SECURITY_ALERT]`), and diagnostic details.
