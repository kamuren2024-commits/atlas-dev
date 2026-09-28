# VERSIONING AND DEPRECATION POLICY

This document defines the Semantic Versioning rules and deprecation windows for KETRACO SCM platform API services.

---

## 1. Versioning Protocol

We follow strict Semantic Versioning (`MAJOR.MINOR.PATCH`):
* **MAJOR**: Backward-incompatible API contract updates (e.g., changing node payload formats).
* **MINOR**: Backward-compatible feature additions (e.g., adding an optional telemetry parameter).
* **PATCH**: Backward-compatible bug and security hotfixes.

---

## 2. Deprecation Timeline

* **Notification Window**: API endpoint deprecations require a minimum notice period of 90 days.
* **Documentation Footprint**: Deprecated endpoints must be flagged in active catalogs with replacement guidance.
* **Sunset Phase**: Retired APIs are monitored via telemetry and disabled only when client traffic reaches zero.
