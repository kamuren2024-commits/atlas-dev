# PLATFORM EXTENSION MODEL

For the full detailed sub-specifications, please see:
* [/docs/extensions/PLATFORM_EXTENSION_MODEL.md](/docs/extensions/PLATFORM_EXTENSION_MODEL.md)
* [/docs/extensions/PLUGIN_FRAMEWORK.md](/docs/extensions/PLUGIN_FRAMEWORK.md)
* [/docs/extensions/EXTENSION_SECURITY.md](/docs/extensions/EXTENSION_SECURITY.md)
* [/docs/extensions/EXTENSION_LIFECYCLE.md](/docs/extensions/EXTENSION_LIFECYCLE.md)
* [/docs/extensions/SDK_GUIDELINES.md](/docs/extensions/SDK_GUIDELINES.md)

---

## 1. Core Architectural Decoupling

The KETRACO SCM platform enforces a strict decoupled architecture to preserve core stability while enabling continuous innovation:

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

## 2. Key Extension Principles

* **Dynamic Isolation**: Extensions execute inside gVisor-sandboxed containers, preventing resource starvation or memory access crossovers.
* **Least Privilege**: Token scopes are strictly delegated (e.g., `read:requisition`) to protect sensitive database columns.
* **OpenAPI Standard**: All extensions register via declarative JSON metadata and expose structured API contracts.
