# 06 — AI Federation & Inference Runtime

**Target System:** Salience Atlas AI Federation, LLM Runtime & Multi-Model Inference  
**Scope:** `AIFederationService`, Ollama Integration, Google Gemini SDK (`@google/genai`), Circuit Breakers, API Gap  
**Auditor:** Principal AI Infrastructure Engineer & LLM Platform Architect  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

Salience Atlas was envisioned with a hybrid, air-gapped **Federated AI Operating Model**:
- **Local Edge Inference:** Running locally via Ollama (e.g. `qwen2.5:32b` or `llama3`) for zero-egress SCADA grid reasoning and air-gapped substation dispatch.
- **Cloud Frontier Models:** Running via Google Gemini (using `@google/genai`) for complex multimodal schematic review, national transmission engineering, and complex PFM Act statutory drafting.

Our inspection reveals that **both halves of this vision exist in code, but they are completely disconnected from each other and from the live HTTP API**:
1. `backend/ai-federation/AIFederationService.ts`: Contains a working Ollama client with queue management, request timeout controls, and circuit breakers.
2. `@google/genai` (v2.4.0): Installed in `package.json`, with capability declared in `metadata.json`, but no active server-side route utilizes it.
3. `backend/ai-runtime/api-routes.ts`: The only router mounted under `/api/ai` returns **hardcoded JSON mock data and static string templates**.
4. `src/utils/ai.ts`: The frontend attempts to call `/api/ai/chat` and `/api/ai/status`, which are unmounted and return 404.

---

## 2. Deep Dive: `AIFederationService.ts`

The file `backend/ai-federation/AIFederationService.ts` contains a 300+ line implementation:

```
                                  AIFederationService (Singleton)
                                                 │
                  ┌──────────────────────────────┴──────────────────────────────┐
                  │                                                             │
                  ▼                                                             ▼
         OllamaFederationProvider                                      Concurrency Queue & Breaker
         • Base URL: http://localhost:11434                            • maxConcurrent: 2
         • Model check: /api/tags                                      • queueLimit: 50
         • Chat generation: /api/chat                                  • timeoutMs: 120,000 (2 min)
         • Supported: qwen2.5:32b, deepseek-r1                         • Circuit breaker on connection error
```

### 2.1 Working Code Analysis:
- **Model Discovery:** Hits `http://localhost:11434/api/tags` to probe available local weights.
- **Concurrency & Throttling:** Restricts simultaneous generation requests to `maxConcurrent = 2` to prevent GPU/CPU saturation on edge servers; queues up to 50 pending requests.
- **Circuit Breaker:** Implements state machine (`CLOSED` → `OPEN` → `HALF_OPEN`) that trips if Ollama is unreachable, returning clean error responses rather than hanging HTTP requests.
- **Token Telemetry:** Parses token counts (`prompt_eval_count`, `eval_count`) and execution duration from Ollama's response payload.

### 2.2 Why It Is Inactive:
`AIFederationService` is exported in `backend/ai-federation/index.ts`, but **no API route in `server.ts` imports or invokes it**. It sits as an unreferenced code island.

---

## 3. The Mock AI Routes (`backend/ai-runtime/api-routes.ts`)

Instead of routing requests to `AIFederationService`, `server.ts` mounts `createAiPlatformApiRouter()` at `/api`.

### Empirical Code Inspection:
1. **Endpoint `GET /ai-federation/telemetry` (Line 7):**
   ```ts
   res.json({
     success: true,
     telemetry: {
       status: 'ONLINE',
       activeModels: 4,
       providerLatencies: { gemini: 124, anthropic: 168, local_llama: 42, deepseek: 210 },
       requestThroughput: 86.4,
       tokenUtilization: 0.32,
       costSavingsKES: 145000,
       health: 'OPTIMAL',
       activeGuardrails: 18
     }
   });
   ```
   **Verdict: 100% HARDCODED MOCK.** None of these numbers reflect live inference.

2. **Endpoint `POST /ai` (Line 166):**
   ```ts
   const { prompt, module } = req.body || {};
   res.json({
     success: true,
     module: module || 'chat',
     response: `Atlas AI Engine evaluated: "${prompt || 'Status analysis'}". All transmission corridors, logistics convoys, and financial commitments verified within nominal operational thresholds.`,
     sources: ['Atlas Knowledge Graph', 'Fleet Telematics Sensor Mesh', 'PPADA Audit Ledger'],
     latencyMs: 142,
     confidence: 0.97,
     timestamp: new Date().toISOString()
   });
   ```
   **Verdict: 100% HARDCODED STRING TEMPLATE.** No LLM is invoked.

3. **Endpoint `POST /api/copilot/ask` in `server.ts` (Line 104):**
   Returns static text claiming to be the "Atlas Operational Intelligence Copilot".

---

## 4. The Frontend Disconnect (`src/utils/ai.ts`)

The frontend code in `src/utils/ai.ts` was written expecting a modern, production-grade AI gateway:
- **Function `checkAIAvailability()`:** Performs `fetch('/api/ai/status')` expecting provider health, queue status, and deployed models.
- **Function `processAIChat()`:** Performs `POST /api/ai/chat` with `{ message, context, system, model, temperature, maxTokens }` expecting `{ success, requestId, provider, model, response, usage, latencyMs }`.

When a user in the UI asks a question in the AI Copilot:
1. The frontend calls `/api/ai/chat`.
2. `server.ts` has no matching route, so it hits the 404 fallback.
3. The frontend catches the 404 and displays the offline mock banner:
   ```
   ### Connection Diagnostics Offline
   The local AI gateway failed to establish remote links. Booting offline memory cache...
   ```

---

## 5. Cloud Frontier LLM Integration: Google Gemini

The workspace contains `@google/genai` v2.4.0 in `package.json`, which is the official current SDK for Gemini models (Gemini 2.5 Flash / Pro).
- In accordance with AI Studio guidelines, the Gemini API key must be managed server-side via `process.env.GEMINI_API_KEY` (lazy initialization).
- Currently, no backend route imports `@google/genai`.
- A genuine hybrid architecture requires `AIFederationService` to support **both**:
  1. `OllamaProvider`: For local offline/air-gapped SCADA inference.
  2. `GeminiProvider`: Utilizing `@google/genai` for high-complexity statutory reasoning and multi-modal engineering diagrams.

---

## 6. Target Production Transformation Plan

```
                                PROPOSED UNIFIED AI GATEWAY
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     POST /api/ai/chat                                       │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                   AIFederationService.chat()
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               │ If GEMINI_API_KEY present                     │ If local Ollama requested
               ▼                                               ▼
      GeminiProvider                                   OllamaProvider
      • @google/genai                                  • http://localhost:11434
      • Model: gemini-2.5-flash                        • Model: qwen2.5:32b / llama3
      • High-order reasoning                           • Zero-egress grid SCADA
               │                                               │
               └───────────────────────────────┬───────────────────────────────┘
                                               │
                                               ▼
                              Persist to SQLite ai_execution_logs
                              (prompt_tokens, completion_tokens, latency, cost)
```

1. **Mount Real Routes:** Add `/api/ai/chat` and `/api/ai/status` to `server.ts` connecting directly to `AIFederationService`.
2. **Implement `GeminiProvider`:** Add a lazy-loaded Google GenAI provider in `backend/ai-federation/providers/GeminiProvider.ts`.
3. **Log All Invocations:** Write token usage, model ID, latency, and costs directly into the existing SQLite `ai_execution_logs` table.
4. **Remove Hardcoded Mocks:** Retire static string templates in `backend/ai-runtime/api-routes.ts` and `server.ts`.
