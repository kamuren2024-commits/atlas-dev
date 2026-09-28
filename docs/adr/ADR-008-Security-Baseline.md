# ADR-008: Security Baseline

* **Status**: ✅ Approved
* **Owner**: Lead Security Architect
* **Review Date**: 2026-07-28
* **Related Components**: `SecretScanner`, `KeysVault`

---

## 1. Context & Problem Statement

Accidental commits of sensitive API keys or credential leakage to the browser pose serious security vulnerabilities that must be rigorously countered.

## 2. Alternatives Considered

* **Option A: Perimeter Filtering**: Rely purely on network-level WAFs. Does not solve repository secret hygiene.
* **Option B: Multi-Layer Security Baseline (Selected)**: Enforce code-level secret scanners, bar `VITE_` secret variables, and mask logs inside the application code.

## 3. Decision

We established a multi-layer security baseline:
1. Pre-boot **SecretScanner** checking repository files.
2. Direct client secrets extraction block (secrets lack `VITE_` prefixes).
3. Surgical log redactions via `KeysVault.maskKey` formatting.

## 4. Consequences & Tradeoffs

### Pros:
* **Deep Defense**: Even if an administrator accidentally prints an API client log, raw keys are protected.
* **Safe Coding**: Blocks compilation instantly if a developer leaves an active token in a script.

### Cons:
* **Build Time**: Minor processing overhead to review code patterns on startup.
