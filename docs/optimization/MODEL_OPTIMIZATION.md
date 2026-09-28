# AI MODEL & PROMPT OPTIMIZATION

This document details prompt caching parameters, LLM token costing, and model selection routing of the SCM Self-Optimization Engine.

---

## 1. Prompt Cache Topology

To minimize API cost and latency, prompt templates and static regulatory documents (e.g. PPADA clauses) are cached in-memory:

```
  [ Prompt Request ] ──► [ Redis Cache Check ] ──┬──► ( Hit )  ──► [ Return Context ]
                                                 └──► ( Miss ) ──► [ Fetch DB & Populate Cache ]
```

---

## 2. Model Selection Logic

* **Complex Audits**: Re-routes tasks to deep reasoning models (`gemini-2.5-pro`) to ensure high accuracy.
* **Simple Ingests & Parsing**: Dispatches tasks to high-speed models (`gemini-2.5-flash`) to minimize API spending.
* **Token Slashes**: Automatically prunes historical agent conversations in long-running threads using extractive summaries.
