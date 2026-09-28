# 02 — Monolith & Backend Services Audit

**Target System:** Salience Atlas API Gateway & Express Monolith  
**Scope:** HTTP Routes, Middleware Pipelines, Router Registration, Endpoint Realism  
**Auditor:** Principal Enterprise Backend & Platform Engineer  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Architectural Overview of `server.ts`

The Salience Atlas backend is constructed as a **single monolithic Node.js HTTP service** using Express v4.21.2. The entrypoint `server.ts` serves two distinct roles depending on `NODE_ENV`:
1. **Development (`NODE_ENV !== 'production'`):** Creates an embedded Vite development server using `createServer({ server: { middlewareMode: true }, appType: 'spa' })` and mounts it after API routes.
2. **Production (`NODE_ENV === 'production'`):** Serves pre-built static assets from `/dist` and serves `index.html` on SPA wildcard fallback (`*all`).

### Ingress & Port Binding:
- **Port:** Hardcoded to `3000` (required by container infrastructure reverse proxy).
- **Host:** Bound to `0.0.0.0` for container networking.
- **Middleware:** `express.json({ limit: '50mb' })`, `express.urlencoded({ extended: true, limit: '50mb' })`.

---

## 2. API Router Mounting & Empirical Status Map

An audit of `server.ts` reveals **15 registered API routers** and several root endpoints mounted directly on the Express app:

```
                                    ┌───────────────────────┐
                                    │       server.ts       │
                                    │ (Express 4.21.2:3000) │
                                    └───────────┬───────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         │                                      │                                      │
         ▼                                      ▼                                      ▼
  /api/auth (authRouter)             /api/finance (Router)                 /api/ai (Router)
  • In-memory users                  • Active SQLite (db-core)             • Hardcoded JSON telemetry
  • Static tokens                    • Real 26 finance tables              • Unconnected to Ollama
  • WORKING (Demo Data)              • WORKING (Production Asset)          • MOCK / SIMULATED
```

### Detailed Route Registration Inventory:

| Route Prefix | Router Function / Export | Source File | Empirical Classification | Primary Backing Store |
|---|---|---|---|---|
| `/api/auth` | `authRouter` | `backend/security/auth-router.ts` | **WORKING (Demo Users)** | In-memory `ENTERPRISE_USERS` |
| `/api/evaluations` | `evaluationApiRouter` | `backend/evaluation/api-routes.ts` | **WORKING** | SQLite `bidders`, `documents` |
| `/api/logistics` | `createLogisticsApiRouter` | `backend/domains/logistics/api-routes.ts` | **WORKING** | SQLite `logistics_*` (30 tables) |
| `/api/finance` | `createFinanceApiRouter` | `backend/finance/api-routes.ts` | **WORKING** | SQLite `finance_*` (26 tables) |
| `/api/project-supply` | `createProjectSupplyApiRouter` | `backend/domains/project-supply/api-routes.ts` | **WORKING** | SQLite `project_supply_requirement` |
| `/api/procurement` | `createProcurementApiRouter` | `backend/domains/procurement/api-routes.ts` | **WORKING** | SQLite `procurement_case*` |
| `/api/supplier` | `createSupplierApiRouter` | `backend/domains/supplier/api-routes.ts` | **WORKING** | SQLite `bidders` / supplier data |
| `/api/events` | `createEventApiRouter` | `backend/event-fabric/event-api-routes.ts` | **PARTIAL** | In-memory `EventBus` |
| `/api/planning` | `setupPlanningApiRoutes` | `backend/planning-engine/planning-api-routes.ts` | **PARTIAL** | In-memory plan state + SQLite |
| `/api/digital-twin` | `createDigitalTwinApiRouter` | `backend/digital-twin/api-routes.ts` | **WORKING** | SQLite `twin_*` (13 tables) |
| `/api/meetings` | `createMeetingIntelligenceApiRouter` | `backend/domains/meeting-intelligence/api-routes.ts` | **WORKING** | SQLite `meeting_*` (15 tables) |
| `/api/v3` | `createV3ApiRouter` | `backend/evaluation/v3-routes.ts` | **PARTIAL** | In-memory `KnowledgeGraphService` |
| `/api/v2/evaluations` | `createV2EvaluationApiRouter` | `backend/evaluation/v2-routes.ts` | **WORKING** | SQLite `bidders` v2 schema |
| `/api` (AI platform) | `createAiPlatformApiRouter` | `backend/ai-runtime/api-routes.ts` | **MOCK / SIMULATED** | Hardcoded JSON literals |
| `/api/missions` | `missionRouter` | `backend/mission-engine/mission-api-routes.ts` | **PARTIAL** | SQLite + in-memory state |

---

## 3. High-Priority Backend Defects & Disconnects

### Defect B-01: AI Runtime Router Serves Fabricated Data
`backend/ai-runtime/api-routes.ts` exports `createAiPlatformApiRouter()`, mounted in `server.ts` at `/api`.
- Endpoint `GET /ai-federation/telemetry` returns hardcoded metrics:
  ```ts
  providerLatencies: { gemini: 124, anthropic: 168, local_llama: 42, deepseek: 210 },
  costSavingsKES: 145000, activeModels: 4
  ```
- Endpoint `POST /ai` returns string interpolation without invoking any LLM or model:
  ```ts
  response: `Atlas AI Engine evaluated: "${prompt || 'Status analysis'}". All transmission corridors... verified within nominal operational thresholds.`
  ```
- Endpoint `GET /ai/runtime/registry/models` returns a static array with hardcoded pricing.

### Defect B-02: Missing `/api/ai/chat` & `/api/ai/status` Endpoints
The frontend utility `src/utils/ai.ts` specifically calls:
- `GET /api/ai/status` (to check local Ollama availability, queue metrics, and latency)
- `POST /api/ai/chat` (to execute multi-turn LLM reasoning via backend federation)

Because neither route is implemented in `server.ts` or `createAiPlatformApiRouter()`, any frontend interaction requesting AI chat falls through to the wildcard 404 handler:
```json
{ "error": "Endpoint not found", "path": "/api/ai/chat" }
```
Consequently, frontend components silently switch into "Connection Diagnostics Offline" fallback mode.

### Defect B-03: Hardcoded `/api/copilot/ask` in `server.ts`
Line 104 of `server.ts` defines a root endpoint directly inside `server.ts`:
```ts
app.post('/api/copilot/ask', (req: Request, res: Response) => {
  const { question } = req.body || {};
  res.json({
    success: true,
    answer: `Atlas Operational Intelligence Copilot analyzed your query: "${question}". Current transmission corridors (Suswa-Isinya 400kV, Olkaria-Nairobi 220kV) are operating at 78% thermal capacity...`,
    confidence: 0.94,
    sources: ['SCADA Live Telemetry', 'PPADA 2015 Compliance Graph', 'Fleet Dispatch Stream']
  });
});
```
This is pure mock text that completely bypasses the ReAct loop engine in `src/core/loop` and the Ollama model in `backend/ai-federation`.

### Defect B-04: Unmounted `backend/chrome-extension-api.ts`
`backend/chrome-extension-api.ts` contains 883 lines of code providing endpoints for browser extensions, autonomous procurement evaluation, and governance approvals. In documentation (`PPADA_2015_TRACEABILITY.md`, `ARCHITECTURE.md`), this file is cited as the primary compliance gateway for 10 statutory articles. However, `server.ts` **never imports or mounts this router**, leaving all claimed capabilities unreachable.

---

## 4. Middleware & Request Pipeline Assessment

### 4.1 Error Handling
- Root 404 handler:
  ```ts
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path });
  });
  ```
  This prevents API requests from falling through to the Vite SPA fallback (which would return an HTML document instead of JSON). This is a well-designed safety pattern.
- Global Error Boundary: Express default error handler is utilized; there is no structured error-handling middleware logging correlation IDs or stack traces.

### 4.2 Security Middleware
- CORS: Express default (no explicit CORS middleware configured; reliance on reverse proxy).
- Rate Limiting: Redis-based rate limiter exists in `backend/security/api-gateway-middleware.ts`, but is **not mounted globally** in `server.ts`. It is applied only to selected sub-routes in `auth-router.ts`.
- Content-Security-Policy: Handled by hosting iframe sandbox; no server-side helmet headers configured.

---

## 5. Upgrade Recommendations for Backend Layer

1. **Mount Real AI Federation:** Replace mock `/api/ai` and `/api/copilot/ask` routes with handlers that delegate to `AIFederationService.getInstance().chat()` with proper streaming or JSON responses.
2. **Implement Missing `/api/ai/chat` & `/api/ai/status`:** Expose the real provider status and queue metrics from `AIFederationService` to fulfill the contract in `src/utils/ai.ts`.
3. **Harmonize Chrome Extension API:** Either mount `backend/chrome-extension-api.ts` under `/api/extension` or refactor its autonomous procurement entities into `backend/domains/procurement/`.
4. **Structured Request Context & Correlation IDs:** Introduce standard middleware assigning `x-request-id` to all incoming requests, propagating it through SQLite audit logs and agent telemetry.
