# ADR-003: Startup Verification of Codebase Integrity

* **Status**: ✅ Approved
* **Owner**: Lead DevSecOps Engineer
* **Review Date**: 2026-07-28
* **Related Components**: `StartupValidator`

---

## 1. Context & Problem Statement

Developers sometimes mistakenly reference configuration templates (like `.env.example`) or temporary files in production source code, causing logical errors and credential leaks.

## 2. Alternatives Considered

* **Option A: Static Code Scanning**: Rely purely on local Git pre-commit hooks. Easy to bypass or ignore.
* **Option B: Dynamic Runtime Assertions (Selected)**: Enforce a codebase scan on server startup that validates that no runtime files reference, import, or parse `.env.example`.

## 3. Decision

We implemented the **StartupValidator** inside `/backend/core/config/startup-validator.ts`. On every boot, it scans the repository for forbidden strings (like `.env.example`) and halts execution if any violation is detected.

## 4. Consequences & Tradeoffs

### Pros:
* **Zero Policy Bypasses**: Since it runs directly in the server entry point, it blocks rogue deployments in any environment.
* **Strict Documentation Boundary**: Protects `.env.example` as documentation-only.

### Cons:
* **Pre-Boot Scan**: Scanning the repository on boot takes ~20ms, which is handled concurrently or before routing initialization.
