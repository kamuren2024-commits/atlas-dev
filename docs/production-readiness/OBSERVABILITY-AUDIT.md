# Salience Atlas V5 — Observability & Monitoring Audit

---

### 1. Observability Maturity Score: 60%
The codebase contains incredibly rich metric collection models and beautifully detailed tracing definitions (e.g., agent execution chains and token-cost logs). However, the operational visibility score is bounded by the fact that all logs and metrics are kept in transient memory and are not integrated with industry-standard logging backends (such as OpenTelemetry, Elasticsearch, Prometheus, or Grafana).

---

### 2. Logging Infrastructure
* **Current Status**: Logging is handled by local collector classes:
  * `SCMTelemetry.log()`: Pushes agent execution traces into a static array (`/backend/agents/instances.ts` lines 50-66).
  * `AuditService.log()`: Records document events and mathematical signatures inside `EvaluationDatabase` arrays.
  * Standard server logs use direct `console.log` or `console.error` prints.
* **Limitations**: 
  1. No structured JSON logging format (such as standard Bunyan, Winston, or Pino layouts) is configured. Real production clusters need clean, standardized JSON streams to allow log routers (like fluentd, Logstash, or Google Cloud Logging) to parse severity levels and execution contexts.
  2. Because telemetry is stored inside process variables, restarting the container erases the entire historic operation history, leaving engineers blind during post-incident troubleshooting.

---

### 3. Metrics & Monitoring
* **Current Status**:
  * `MemoryMetricsCollector` tracks memory states, transition latencies, and cache hit ratios.
  * `CostGovernor` monitors cumulative tokens and token costs.
  * `/api/scm/fabric/health` exposes active scheduler queues and agent statuses.
* **Critique**:
  * The underlying modeling of the metrics is excellent, capturing fine-grained system details.
  * However, there is no OpenMetrics or Prometheus-compliant `/metrics` endpoint to expose these values to external scrapers. In a production cluster, metrics must be exposed in a format that Prometheus can scrape at regular intervals.

---

### 4. Distributed Tracing & OpenTelemetry (OTel)
* **Current Status**: SCMOrchestrator tracks execution flow inside `agentReasoningChain`, mapping the sequential inputs and outputs of agents.
* **Critique**:
  * While useful for rendering beautiful UI charts, these custom reasoning chains are closed structures.
  * The system lacks OpenTelemetry standard trace contexts (`traceparent` headers). If Salience Atlas is integrated with outer services (such as official KETRACO bidder portals or corporate email routes), the execution context cannot be correlated across the service boundaries.

---

### 5. Alerting & Diagnostics
* **Current Status**: 
  * The `EnvIntegrityMonitor` runs in the background and prints warnings to standard console channels if `.env` values are altered.
  * Express routes capture exceptions and print warnings (such as `[FEDERATED ROUTING FALLBACK]`).
* **Limitations**:
  * There are no active notification drivers. A critical database failover, an invalid config state, or an empty API key will trigger console prints, but will not send high-priority alerts to on-call support engineers (via Slack Webhooks, PagerDuty, or SMTP).

---

### 6. Recommendations
1. **Adopt Winston / Pino**: Replace all raw `console.log` and custom logging trackers with a standardized, structured JSON logger:
   ```ts
   import pino from 'pino';
   const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
   // Outputs structured {"level": 30, "time": ..., "msg": "..."} lines
   ```
2. **Expose Prometheus Endpoints**: Create an Express middleware utilizing `prom-client` to measure HTTP latency, active transaction volume, and cost accumulators, exposing them on a separate `/metrics` endpoint on port `3000`.
3. **Integrate OpenTelemetry Tracer**: Wrap Express routes and LLM provider calls with OpenTelemetry SDK tracing spans to enable auto-instrumentation and trace export to systems like Jaeger or AWS X-Ray.
4. **Implement Webhook Alerting**: Create a simple alert notifier that sends high-severity errors (like multiple circuit breaker trips or preflight failures) to a configured slack channel or operations webhook.
