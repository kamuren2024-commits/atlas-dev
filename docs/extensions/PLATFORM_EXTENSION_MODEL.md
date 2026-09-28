# PLATFORM EXTENSION MODEL

This document defines the formal extension model of the KETRACO SCM platform, standardizing how external services, plugins, and custom integrations interact with the core engine without direct modifications.

---

## 1. Core Architectural Separation

To guarantee a stable, maintainable core, we enforce strict decoupled boundaries:

```
  ┌────────────────────────────────────────────────────────┐
  │                   SALIENCE CORE ENGINE                 │
  └───────────────────────────┬────────────────────────────┘
                              │ (mTLS / OpenAPI Gateway)
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 PLATFORM EXTENSION LAYER               │
  ├─────────────────────┬──────────────────────┬───────────┤
  │ Sourcing Plugins    │ Compliance Rule-Sets │ Custom UI │
  └─────────────────────┴──────────────────────┴───────────┘
```

---

## 2. Capability Registration & Handshake

Extensions must complete a mutual TLS handshake and register their functional capabilities using a JSON schema:

```json
{
  "extensionId": "ke.co.ketraco.procurement.scribe-v2",
  "name": "Procurement Scribe Extension",
  "version": "2.1.0",
  "requiredCapabilities": [
    "READ_REQUISITIONS",
    "WRITE_TENDER_DRAFTS"
  ],
  "entrypoint": "https://scribe-extension.internal.ketraco/api/v1/invoke",
  "signature": "sha256:d83d1c...8f2b"
}
```

---

## 3. Extension Sandboxing & Isolation

* **Isolated Runtimes**: External extensions execute inside gVisor-sandboxed container runtimes with restricted network and filesystem access.
* **API Rate Limits**: The platform enforces a maximum of 100 requests per minute per extension to prevent resource exhaustion.
* **Token Boundaries**: All API calls must utilize short-lived OAuth scope tokens.
