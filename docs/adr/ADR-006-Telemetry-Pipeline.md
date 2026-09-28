# ADR-006: Telemetry Pipeline

* **Status**: ✅ Approved
* **Owner**: Lead Observability Engineer
* **Review Date**: 2026-07-28
* **Related Components**: `AIOperationsCenter`, `AuditLog`

---

## 1. Context & Problem Statement

To govern cost, assess latency, and monitor reliability, SRE and AI Governance boards require structural logging of all active model interactions. Raw, unformatted logs do not integrate easily with APMs.

## 2. Alternatives Considered

* **Option A: Traditional File Logging**: Write logs to local system files. High risk of disk fullness and lacks centralization.
* **Option B: JSON-Structured Stdout Streams (Selected)**: Emit highly structured JSON logs directly to standard stdout channels.

## 3. Decision

We implemented a unified, structured telemetry pipeline. All operations output structured logs including duration, input/output token counts, calculated costs, selected model, and success indicators, enabling direct collection by fluentd, Datadog, or Cloud Logging.

## 4. Consequences & Tradeoffs

### Pros:
* **APM Integration**: Enables real-time dashboards of costs, response rates, and model distributions.
* **Non-Blocking**: Outputting to stdout uses node's async system stream buffers without blocking active API threads.

### Cons:
* **Log Verbosity**: Increases output volume (mitigated through strict log levels e.g., `INFO`/`ERROR`).
