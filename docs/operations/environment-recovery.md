# Salience Atlas V2 — Environment Recovery Manual

This playbook defines immediate recovery procedures for operations and site reliability engineering (SRE) teams in the event of environment file loss, file corruption, or key compromise.

---

## 1. Scenario A: `.env` File Deletion or Absence

### Symptoms
*   Console logs warning: `⚠️ WARNING: .env file was missing in the workspace root.`
*   Log reports: `[SECURITY_ALERT] EVENT: ENV_DELETED | MESSAGE: ...`
*   Fatal crash on start: `Preflight checks failed: ... missing its required credential.`

### Automated Resolution Flow
1.  **Reconstruction**: The `ConfigService` automatically creates a placeholder `.env` at the workspace root based on the current `.env.example` file.
2.  **Field Blanking**: The system retains non-sensitive defaults (such as `_ENABLED=true` flags, budgets, and cache configurations) but blanks out all secret fields (like API keys) to prevent default-credential leaks.
3.  **Halt**: The startup validator throws an error and refuses to initialize the server.

### Manual Actions Needed
1.  Open the newly generated `.env` file at the root.
2.  Input valid, active provider credentials (e.g., `GEMINI_API_KEY`, `GROQ_API_KEY`).
3.  Restart the dev server or production container.

---

## 2. Scenario B: `.env` File Corruption or Modification (`ENV_CHANGED`)

### Symptoms
*   SRE log audit trail records: `[SECURITY_ALERT] EVENT: ENV_CHANGED`
*   Alert details: `The .env configuration file has been modified externally.`

### Remediation Workflow
1.  Ensure no unauthorized container access has occurred.
2.  If the modification was intentional, update the baseline hash by restarting the node server process:
    ```bash
    # This automatically registers the new .env hash as the baseline
    npm run dev
    ```
3.  If the modification was malicious, immediately regenerate `.env` from your deployment repository, replace any exposed keys, and restart the server.
