# 15 — Autonomous AI Operating System Transformation Architecture

**Target System:** Salience Atlas AI Operating System (Atlas OS)  
**Vision:** Enterprise-Grade Autonomous Intelligence Platform for Critical Infrastructure  
**Auditor:** Principal Enterprise AI Architect, Platform Architect & Systems SRE  
**Date:** Q3 2026  
**Status:** COMPLETE — ARCHITECTURAL TARGET BLUEPRINT  

---

## 1. Architectural Vision: The AI Enterprise OS

Salience Atlas is evolving from an operations dashboard with simulated agents into a **true Autonomous Enterprise AI Operating System**. 

The target architecture organizes the platform into four strictly decoupled, highly observable layers:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               LAYER 4: DECISION & INTERACTION LAYER                         │
│   • Command Center Shell (GIS 2.5D / Three.js 3D Twin / SCADA HUD)                          │
│   • Autonomous SCM & Tender Evaluation Studio (PPADA 2015 Compliance Workbench)             │
│   • Streaming Server-Sent Events (SSE) Telemetry & Copilot Collaboration Chat               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                LAYER 3: AUTONOMOUS AGENT RUNTIME                            │
│   • StandardLoopEngine (OODA: Observe → Plan → Execute → Verify → Reflect)                  │
│   • Multi-Agent Dynamic Orchestrator (Intent Decomposition & Dependency Graphs)             │
│   • Verified Tool Execution Fabric (Direct SQLite / Knowledge Graph Query Tools)            │
│   • Cryptographic Provenance & Safety Termination Controls (SHA-256 State Signatures)       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                               LAYER 2: COGNITIVE & EVENT FABRIC                             │
│   • AI Federation Gateway (Local Ollama Edge Inference + Server-Side Google Gemini SDK)     │
│   • Enterprise Knowledge Graph (BFS Traversal, Collusion Detection, Causal Reasoning)       │
│   • Multi-Tier Enterprise Memory (Working, Episodic, Semantic in SQLite ai_memory)          │
│   • Durable Append-Only Event Ledger (Priority Queue, Normalizer, Real-Time Replay)         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                             LAYER 1: PERSISTENT INFRASTRUCTURE & SRE                        │
│   • Production SQL Database (SQLite3 93-Table Canonical Schema → Managed PostgreSQL)        │
│   • Zero-Trust Identity & RBAC (Bcrypt Credential Store, Asymmetric JWT, Clearance L1-L4)  │
│   • Prometheus Telemetry Exporter (/metrics) & Unified Node Native Automated Test Harness   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Transformation Principles

1. **UPGRADE, DO NOT REPLACE:**
   - The 93-table schema in `data/salience_atlas.db` is the single source of truth for the enterprise domain model.
   - The React 19 / Vite / Tailwind UI with its Command Center, GIS map, and 3D digital twin is preserved completely.
   - The `StandardLoopEngine` in `src/core/loop` is promoted from an isolated test module to the universal agent execution runtime.

2. **ELIMINATE THE SIMULATION CRUTCHES:**
   - Replace in-memory JavaScript maps for the Agent Registry with a real persistent database table.
   - Replace keyword substring routing (`if (query.includes('tender'))`) with structured LLM intent classification via `AIFederationService`.
   - Replace mock tool returns with actual database queries against the 93 tables.
   - Replace hardcoded AI telemetry with genuine execution metrics from `ai_execution_logs`.

3. **HYBRID LOCAL/CLOUD AI FEDERATION:**
   - Air-gapped / Edge execution: Direct connection to local Ollama (`qwen2.5:32b`, `llama3`).
   - Cloud Frontier execution: Secure server-side `@google/genai` integration with Gemini 2.5 Flash / Pro for high-order reasoning and multimodal engineering drawings.
   - Full cost and latency governance recorded in SQLite on every model invocation.

4. **ZERO-LOSS STATE PERSISTENCE:**
   - All events emitted to `EventBus` are mirrored into an append-only `event_ledger` table.
   - Agent working memory and episodic decision traces are committed to `ai_memory`.
   - Operator incident decisions generate tamper-evident SHA-256 HMAC signatures in `audit_logs`.

---

## 3. The 4-Stage Operational Upgrade Sequence

```
                               UPGRADE SEQUENCE ROADMAP
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: FOUNDATIONAL HARMONIZATION & REPAIR (Immediate)                                    │
│  • Fix broken relative test import paths (event-fabric)                                     │
│  • Add unified "test" script to package.json (node:test runner)                             │
│  • Add registered_agents table to SQLite to fix AgentRegistry crash                        │
│  • Mount missing /api/ai/chat & /api/ai/status routes in server.ts                          │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  STAGE 2: AI FEDERATION & AGENT LOOP ACTIVATION                                             │
│  • Connect AIFederationService to @google/genai (server-side Gemini 2.5) & local Ollama      │
│  • Route frontend Copilot requests to real AIFederationService                              │
│  • Wire BaseSCMAgent instances to use StandardLoopEngine for OODA reasoning                 │
│  • Log all prompt tokens, completion tokens, latency, and cost in ai_execution_logs         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  STAGE 3: STATE DURABILITY & KNOWLEDGE GRAPH PERSISTENCE                                    │
│  • Persist EventFabric events to SQLite append-only event_ledger table                      │
│  • Persist KnowledgeGraph nodes and edges into kg_nodes / kg_edges SQLite tables            │
│  • Connect BaseSCMAgent episodic memory to ai_memory table                                  │
│  • Provide Server-Sent Events (SSE) endpoint at /api/events/stream for live HUD streaming    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  STAGE 4: ENTERPRISE SECURITY & SRE HARDENING                                               │
│  • Migrate static ENTERPRISE_USERS to database table with bcrypt hashed passwords           │
│  • Enforce strict JWT secret validation (no default fallback in production)                 │
│  • Expose standard Prometheus metrics at /metrics (HTTP latency, DB pool, event rates)      │
│  • Generate valid prisma/schema.prisma matching the 93 tables for future Postgres cutover   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Expected Operational Guarantees

Upon completion of this transformation:
- **Zero-Data-Loss Reliability:** Restarting the application container preserves all tender evaluations, convoy waypoints, digital twin configurations, and agent execution logs.
- **Genuine Intelligence:** User questions in the Command Center Copilot execute real LLM reasoning through Gemini or Ollama against live database records.
- **Statutory Auditability:** Every agent decision generates an immutable cryptographic SHA-256 audit entry satisfying Section 71 of the Public Procurement and Asset Disposal Act (PPADA 2015).
- **100% Passing Automated Tests:** Full test suite verification across loop state machines, event normalizers, and database transactions executable with a single `npm test` command.
