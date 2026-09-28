# ADR-004: Environment Management

* **Status**: ✅ Approved
* **Owner**: SRE Architect Lead
* **Review Date**: 2026-07-28
* **Related Components**: `ConfigService`, `EnvIntegrityMonitor`

---

## 1. Context & Problem Statement

In dynamic cloud or local developer workspaces, configuration files (such as `.env`) are susceptible to sudden deletions, corrupted updates, or accidental modification. This leads to broken API routes or hard-to-diagnose container states.

## 2. Alternatives Considered

* **Option A: Throw on Missing File**: Instantly crash on boot if `.env` is absent. Degrades developer onboarding speed.
* **Option B: Automatic Recovery & Hashing (Selected)**: If `.env` is missing, reconstruct it from `.env-template` with blanked secret fields. Continuously monitor file SHA-256 hashes during runtime.

## 3. Decision

We implemented the dual configuration protection:
1. `ConfigService` auto-regenerates missing `.env` from template schemas on startup.
2. `EnvIntegrityMonitor` starts a background filesystem watcher that continuously computes baseline SHA-256 hashes of the environment, flagging unexpected modifications immediately.

## 4. Consequences & Tradeoffs

### Pros:
* **Frictionless Onboarding**: Developers can clone the repository and start up without manually copying templates.
* **Intrusion Detection**: Instant security alerts emit if credentials are manipulated on a live container.

### Cons:
* **Disk I/O Polling**: Background monitors poll the file system (optimized to run once every minute).
