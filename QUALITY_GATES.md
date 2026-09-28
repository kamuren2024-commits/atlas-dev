# QUALITY GATES — KETRACO SCM Intelligence Nexus

This document defines the quality gates that govern the delivery of software assets to KETRACO production clusters.

---

## 1. Quality Gate Framework

No code modifications may bypass these barriers. Every pull request and release candidate must pass all gates:

```
 [Code Modification]
          │
          ▼
 [ Gate 1: Static Compilation ]  ── (tsc --noEmit checks)
          │
          ▼
 [ Gate 2: Code Quality/Lint ]   ── (eslint rule checks)
          │
          ▼
 [ Gate 3: Security Scan ]        ── (SecretScanner prevents key leaks)
          │
          ▼
 [ Gate 4: Sandbox Checks ]      ── (Startup verification & .env monitors)
          │
          ▼
 [ Gate 5: Production Build ]    ── (Vite + esbuild Server Bundling)
          │
          ▼
   [ RELEASE CANDIDATE ]
```

---

## 2. Quality Gate Classifications & Criteria

| Gate ID | Quality Gate Name | Success Criteria | Action on Failure | Verification Command |
| :--- | :--- | :--- | :--- | :--- |
| **QG-01** | **Static Compilation** | • `tsc --noEmit` returns code 0.<br>• 100% valid typescript types. | **Block PR Merge** | `npm run lint` |
| **QG-02** | **Code Linting** | • ESLint check outputs zero warnings or errors. | **Block PR Merge** | `npm run lint` |
| **QG-03** | **Secrets Quarantine** | • Zero hardcoded credentials in files.<br>• Passes SecretScanner check on start. | **Halt Bootstrap / deployment** | `npx tsx backend/core/config/secret-scanner.ts` |
| **QG-04** | **Bootstrap Verification** | • Zero file references to `.env.example`.<br>• Correct `.env` initialization from templates. | **Halt Bootstrap / deployment** | `npx tsx server.ts` |
| **QG-05** | **Build Integrity** | • Single file CommonJS `dist/server.cjs` compiles successfully via esbuild. | **Fail Deployment Pipeline** | `npm run build` |
| **QG-06** | **Runtime Port Check** | • Express strictly binds to port `3000` with host `0.0.0.0`. | **Fail Ingress Ingress Router** | Local manual verification |

---

## 3. Quality Gate Enforcements

* **Pre-Commit Enforcement**: Hook checks execute QG-01, QG-02, and QG-03 locally.
* **CD Pipeline Integration**: The deployment engine executes QG-04, QG-05, and QG-06 dynamically before promoting images to Cloud Run.
