# MODEL REGISTRY SPECIFICATION

This document outlines the certified models registry and dynamic fallback policies.

---

## 1. Primary Model Registry

We restrict active platform tasks to certified AI models:

* **Primary Reasoning Engine**: `gemini-2.5-pro` (Handles heavy bid-scoring & regulatory verification).
* **Primary Interactive Scribe**: `gemini-2.5-flash` (Optimized for standard drafting and dialogue).
* **Backup Route Engine**: `gemini-1.5-pro` (Fallback endpoint to sustain service during rate limits).

---

## 2. Dynamic Fallback Flow

```
  [ Gemini 2.5 Pro ] ──► ( Rate Limited / 5xx ) ──► [ Switch: Gemini 2.5 Flash ]
```
