# 09 — Enterprise Memory & Context Engines

**Target System:** Salience Atlas Enterprise Memory Architecture  
**Scope:** Working Memory, Episodic Memory, Semantic Vector Memory, SQLite `ai_memory`, Agent State Registers  
**Auditor:** Principal AI Knowledge Engineer & Cognitive Systems Architect  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

Autonomous enterprise agents require tiered memory architectures to sustain long-horizon goals:
- **Working Memory:** High-speed scratchpad for active task reasoning and intermediate step evaluation.
- **Episodic Memory:** Historical event logs tracking past workflow executions, decisions, and outcomes.
- **Semantic Memory:** Knowledge base of institutional facts, procurement statutes, and electrical grid parameters.

Our audit of Salience Atlas reveals a **structural foundation already defined in both TypeScript interfaces and the SQLite schema**, but **bypassed by current agent instances**:
1. `src/core/memory/`: Defines contracts for `IMemoryProvider`, `EpisodicMemory`, `WorkingMemory`, and `SemanticMemory`.
2. `backend/database/db-core.ts`: Contains the SQLite table `ai_memory` with columns `(id, tenant_id, workflow_id, type, content, metadata_json, timestamp)`.
3. `backend/agents/instances.ts`: In runtime reality, `BaseSCMAgent` stores memory in simple in-memory arrays (`this.memory = { shortTerm: [], longTerm: [] }`), completely ignoring the database.

---

## 2. The Multi-Tier Memory Specification (`src/core/memory/`)

```
                              ENTERPRISE MEMORY ARCHITECTURE
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       MEMORY MANAGER                                        │
│                                  (src/core/memory/index.ts)                                 │
└──────────────┬───────────────────────────────┬───────────────────────────────┬──────────────┘
               │                               │                               │
               ▼                               ▼                               ▼
        WORKING MEMORY                 EPISODIC MEMORY                 SEMANTIC MEMORY
       (Active Context)              (Historical Traces)             (Vector / Knowledge)
   • Task goal & sub-goals            • Prior agent executions        • PPADA statutory rules
   • Tool invocation results          • Human review overrides        • High-voltage substation ratings
   • Step count & budget metrics      • Past incident resolutions     • Vendor past performance records
   • Scope: Current Loop Session      • Scope: Multi-Month Archive    • Scope: Institutional Permanence
```

### 2.1 Interface Contracts:
- `IWorkingMemory`: Fast key-value scratchpad with TTL and token budget limits.
- `IEpisodicMemory`: Queryable by workflow ID, time range, outcome status, and similarity.
- `ISemanticMemory`: Vector embedding index with cosine similarity search (`searchSimilar(embedding, topK)`).

---

## 3. Database Reality: Table `ai_memory` (`data/salience_atlas.db`)

In `backend/database/db-core.ts` (lines 332–340), migration `001_initial_schema` creates:
```sql
CREATE TABLE IF NOT EXISTS ai_memory (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  type TEXT NOT NULL, -- semantic, episodic, working
  content TEXT NOT NULL,
  metadata_json TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Empirical State in SQLite:
Querying `data/salience_atlas.db` reveals:
- **Total Rows in `ai_memory`:** Currently 0 rows during normal app runtime.
- **Root Cause:** Neither `backend/agents/instances.ts` nor `backend/ai-runtime/api-routes.ts` issues `INSERT` or `SELECT` statements against `ai_memory`.
- **Missed Opportunity:** The database table is fully schema-compliant and indexed, yet left empty because runtime agents utilize local JavaScript arrays.

---

## 4. Vector Embedding & Semantic Search Reality

The documentation frequently references **"Vector Embeddings with Sub-Millisecond Cosine Similarity"**.
- **Package Audit:** No vector database or indexing libraries (such as `@pinecone-database/pinecone`, `chromadb`, `hnswlib-node`, or `pgvector`) are installed in `package.json`.
- **Search Implementation:** In `backend/evaluation/semantic-search.ts`, semantic similarity is implemented as:
  ```ts
  function calculateSimilarity(textA: string, textB: string): number {
    const tokensA = new Set(textA.toLowerCase().split(/\W+/));
    const tokensB = new Set(textB.toLowerCase().split(/\W+/));
    const intersection = [...tokensA].filter(x => tokensB.has(x)).length;
    return intersection / Math.sqrt(tokensA.size * tokensB.size); // Jaccard / Cosine approximation
  }
  ```
  **Verdict: SIMULATED SEMANTIC SEARCH.** It is a token-overlap (Jaccard) heuristic rather than true high-dimensional neural vector search.

---

## 5. Upgrade Path: Production Enterprise Memory

1. **Connect `BaseSCMAgent` to `ai_memory`:**
   Refactor `BaseSCMAgent` to persist short-term and long-term memory records into SQLite's `ai_memory` table upon every loop iteration.
2. **Persistent Context Hydration:**
   When an agent initializes, query `ai_memory` where `tenant_id = ? AND type = 'episodic'` to re-hydrate context from previous sessions.
3. **Embeddings via Gemini:**
   When external semantic search is required, use `@google/genai` to generate 768-dimensional text embeddings (`text-embedding-004`) and store them as BLOBs or JSON arrays in SQLite, computing cosine similarity using standard dot-product mathematics.
