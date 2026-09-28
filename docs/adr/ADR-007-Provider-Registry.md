# ADR-007: Provider Registry

* **Status**: ✅ Approved
* **Owner**: Principal AI Architect
* **Review Date**: 2026-07-28
* **Related Components**: `ProviderRegistry`, `AIConfig`

---

## 1. Context & Problem Statement

Enabling or disabling providers dynamically based on credential presence or operational directives can be error-prone if handled manually in disparate API routes.

## 2. Alternatives Considered

* **Option A: Static Configuration Files**: Hardcode enabled state in source files. Requires a rebuild to enable or disable models.
* **Option B: Dynamic Runtime Registry (Selected)**: Read env states dynamically on boot, check credential validity, and maintain a runtime catalog list.

## 3. Decision

We built the **ProviderRegistry** singleton pattern. It checks variables, verifies API key structures, registers active models dynamically, and constructs the sorted fallback queue strictly matching operational health statuses.

## 4. Consequences & Tradeoffs

### Pros:
* **Zero Rebuild Toggles**: Providers can be enabled or disabled purely by updating environment variables.
* **Self-Healing**: If a provider key is corrupted, the registry automatically excludes it from the active catalog.

### Cons:
* **Pre-Boot Overhead**: Small boot time checks are executed once during bootstrap.
