# 11 — Observability, SRE & Telemetry Infrastructure

**Target System:** Salience Atlas Observability Stack & Site Reliability Engineering (SRE) Architecture  
**Scope:** Metrics Exporters, Health Check Probes, Distributed Tracing, Logging Pipelines, GitHub Actions Synthetics  
**Auditor:** Principal Site Reliability Engineer (SRE) & Observability Architect  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

A critical mission infrastructure platform operating 24/7 requires exhaustive observability: **Golden Signals** (Latency, Traffic, Errors, Saturation), SLI/SLO tracking, automated synthetic probes, and distributed request tracing.

Salience Atlas features **numerous observability declarations and dashboard UIs** (such as the Datadog synthetics workflow in `.github/workflows/datadog-synthetics.yml` and the SRE HUD in the Command Center).

However, our empirical audit reveals:
- No real Prometheus metrics collector (`prom-client`) is installed or exporting metrics at `/metrics`.
- Telemetry endpoints (e.g. `/api/ai-federation/telemetry`, `/api/health`) return static mock JSON or minimal process uptime.
- There is no OpenTelemetry (OTel) instrumentation tracking requests between the Express server, SQLite queries, and agent loops.
- SRE dashboards in the frontend display synthetic randomized tick intervals to give the illusion of high-frequency SCADA metrics.

---

## 2. Health & Diagnostic Endpoints

### 2.1 `/api/health` Endpoint in `server.ts`
Line 95 of `server.ts`:
```ts
app.get('/api/health', async (req: Request, res: Response) => {
  const dbHealth = await dbCore.checkHealth();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbHealth
  });
});
```
**Assessment: WORKING.** This is a genuine operational health probe:
- Calls `dbCore.checkHealth()` which executes a probe query (`SELECT 1`) against `/data/salience_atlas.db` and counts applied migrations.
- Returns real V8 heap memory statistics (`heapUsed`, `heapTotal`, `rss`).
- Returns real process uptime.

### 2.2 Deep Diagnostics Route (`/api/diagnostics`)
Defined in `backend/security/auth-router.ts`:
- Returns status for subsystems: Auth, Database, EventBus, KnowledgeGraph, AI Platform.
- However, for EventBus and KnowledgeGraph, it checks only whether singleton instances exist in memory (`instance !== null`), not whether they are healthy or under resource pressure.

---

## 3. Metrics & OpenTelemetry Reality

### 3.1 Package Audit
- `package.json` does **not** contain `@opentelemetry/api`, `@opentelemetry/sdk-node`, `prom-client`, or `@datadog/tracer`.
- Any documentation claiming "Native OpenTelemetry 1.28 Distributed Context Propagation" is **declarative aspiration, not implemented reality**.

### 3.2 Frontend Simulated Telemetry
In `src/components/ketraco/command-center/TelemetryHUD.tsx`:
```ts
useEffect(() => {
  const interval = setInterval(() => {
    setGridFrequency(49.95 + Math.random() * 0.1); // Jitter around 50 Hz
    setTotalLoadMW(2140 + Math.floor(Math.random() * 40));
  }, 1000);
  return () => clearInterval(interval);
}, []);
```
The Command Center HUD generates local mathematical oscillations in the client rather than receiving live SCADA telemetry via WebSocket or SSE.

---

## 4. GitHub Actions Datadog Synthetics (`.github/workflows/datadog-synthetics.yml`)

The repository contains a real GitHub Actions workflow file:
```yaml
name: Datadog Synthetics
on:
  schedule:
    - cron: '*/15 * * * *' # Every 15 minutes
jobs:
  run-synthetics:
    runs-on: ubuntu-latest
    steps:
      - uses: datadog/synthetics-ci-github-action@v0.18.0
        with:
          api_key: ${{ secrets.DATADOG_API_KEY }}
          app_key: ${{ secrets.DATADOG_APP_KEY }}
          public_ids: '["sal-atl-health-check", "sal-atl-grid-telemetry"]'
```
**Assessment:** The CI configuration is syntactically valid and represents a high-standard SRE practice. However, unless the target URL is deployed to a publicly accessible Cloud Run endpoint, the synthetic checks cannot resolve the container.

---

## 5. SRE Upgrades & Production Telemetry Plan

```
                                TARGET SRE & TELEMETRY STACK
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    GET /metrics (Prometheus)                                │
│       • HTTP request duration histogram (p50, p95, p99)                                      │
│       • SQLite query execution latency & active locks                                       │
│       • EventBus queue depth and dropped event counter                                      │
│       • Loop engine active steps and execution timeouts                                     │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
                                      GET /api/events/stream
                                       (Real-Time SSE Hub)
                                               │
                                               ▼
                              Command Center Telemetry HUD & Charts
                                  (Live 50.00 Hz SCADA Stream)
```

1. **Implement `/metrics` Endpoint:** Export standard Prometheus text format metrics using light custom collectors or `prom-client`.
2. **Replace Client-Side Jitter with SSE:** Stream actual database-driven frequency readings and N-1 contingency alerts over Server-Sent Events.
3. **Structured JSON Logging:** Convert `console.log()` across backend services into structured NDJSON logs with `{ timestamp, level, correlationId, service, message }`.
