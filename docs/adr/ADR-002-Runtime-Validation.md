# ADR-002: Runtime Configuration Validation

* **Status**: ✅ Approved
* **Owner**: Lead SRE Architect
* **Review Date**: 2026-07-28
* **Related Components**: `ConfigService`, `PreflightEnvironmentValidation`

---

## 1. Context & Problem Statement

Configuration errors in production, such as empty credentials, mismatched priority numbers, or invalid URL syntaxes, frequently lead to catastrophic runtime crashes. We need a way to detect and block these issues before the server binds to port 3000.

## 2. Alternatives Considered

* **Option A: Lazy Checking**: Validate configurations only when a route or model is requested. Creates risk of silent, latent failures during peak SCM hours.
* **Option B: Strict Pre-Boot Validation (Selected)**: Run exhaustive checks on configuration states during application startup. If any fatal anomalies are detected, block server boot.

## 3. Decision

We implemented a **Preflight Environment Validation** pipeline on system startup. It validates that all active providers possess non-empty credentials, cost budgets are within logical bounds, and priority scores do not overlap.

## 4. Consequences & Tradeoffs

### Pros:
* **Early Failure Detection**: Guarantees that if the server starts, it has the credentials and settings required to run successfully.
* **Safer Deployments**: Prevents misconfigured containers from entering the routing mesh.

### Cons:
* **Boot Overhead**: Adds ~5ms to server bootstrap times (negligible).
