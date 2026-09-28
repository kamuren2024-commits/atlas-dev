# Test Strategy & Quality Assurance Framework

This document outlines the testing strategy, criteria, and automated validations implemented to ensure the reliability and security of the KETRACO SCM Intelligence Nexus.

---

## 1. Multi-Tier Testing Pyramid

Our quality assurance process spans four logical tiers:

```
                  ┌───────────────────────┐
                  │   System Integration  │  <-- Multi-agent simulations,
                  │      (Manual E2E)     │      SCM twin rendering
                  └───────────────────────┘
                  ┌───────────────────────┐
                  │  Startup Validations  │  <-- Preflight env check,
                  │     (Pre-Boot Gate)   │      SecretScanner compliance
                  └───────────────────────┘
                  ┌───────────────────────┐
                  │    Static Analysis    │  <-- ESLint check,
                  │   (tsc type checks)   │      Pre-commit scans
                  └───────────────────────┘
```

---

## 2. Automated Testing Checks

### Type Compilation & Linting
Enforced prior to any merge or deployment. Code MUST compile cleanly:
```bash
npm run lint
```

### Preflight Startup Validations
Every time the server boots, it runs a self-diagnostic sequence verifying:
* No runtime code references `.env.example`.
* No raw committed secrets exist in source files.
* Credentials for primary providers are present and structurally valid.
* Configuration budgets are valid.

---

## 3. Manual Verification Guidelines

### Digital Twin Interactivity
1. Load the SCM Twin dashboard.
2. Verify that substation nodes and logistics paths render clearly.
3. Trigger a Monte Carlo simulation and verify that transit ETAs update dynamically.

### Contract Auditing
1. Navigate to the Contract Auditor tab.
2. Upload a test bid or contract PDF/TXT file.
3. Trigger the SCM Agent compliance analysis and confirm that hazard scores, compliance indicators, and citations are returned.
