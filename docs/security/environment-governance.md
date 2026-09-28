# Salience Atlas V2 — Environment Governance

This document describes the environment governance model implemented for Salience Atlas V2, designed to protect credentials, validate configuration integrity, and guarantee production-level reliability.

## 1. Environment Governance Architecture

The platform architecture enforces a strict environment protection boundary separating static configurations, dynamic runtime values, and cloud orchestration secrets.

```
       [ .env ]             [ .env.local ]          [ Environment (Secret Manager/Vault) ]
          │                       │                                   │
          └───────────┬───────────┘                                   │
                      ▼                                               ▼
         [ ConfigService.init() ] ──────────(Merge)─────────► [ Config Cache ]
                      │
                      ├───────────────────────┬───────────────────────┐
                      ▼                       ▼                       ▼
            [ SecretScanner ]         [ StartupValidator ]    [ PreflightValidation ]
```

### Governance Rules

1. **Strict Source of Truth**: All configuration must reside in the disk `.env`/`.env.local` or environment secrets injected by the orchestrator.
2. **No Frontend Leakage**: Secret keys (specifically `GEMINI_API_KEY`, `GROQ_API_KEY`, etc.) are processed exclusively on the server-side (`server.ts`). They are never exposed with `VITE_` prefixes.
3. **Reference Lockdown**: Runtime code is strictly forbidden from reading, parsing, or importing `.env.example`.

---

## 2. Dynamic Integrity Verifications

On system startup, the following dynamic validations are executed sequentially to lock down environment hazards:

*   **SecretScanner**: Scans the active repository files (omitting ignores and `.env`) for committed strings resembling known secret patterns (such as `sk-`, `AIza`, `gsk_`, `hf_`, `claude`, `api_key=`, `token=`).
*   **StartupValidator**: Ensures no file references or imports `.env.example`.
*   **PreflightEnvironmentValidation**: Confirms that required environment fields for enabled models are non-empty, priorities are non-overlapping, daily/monthly budgets are soundly configured, and caching is enabled.
*   **EnvIntegrityMonitor**: Initializes file watch dogs and periodically checks that `.env` has not been deleted or modified unexpectedly, raising system-critical logs and alerts upon changes.
