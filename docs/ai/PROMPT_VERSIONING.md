# PROMPT REGISTRATION & VERSIONING

This document standardizes prompt template construction, metadata tracing, and deployment releases.

---

## 1. Declarative Prompt Construction

Prompt templates are treated as code artifacts and tracked in versioned files:

```json
{
  "promptId": "sourcing-scribe-draft",
  "version": "1.4.2",
  "author": "@SCM-Core",
  "template": "Analyze the following requisition under PPADA Section {{section}}..."
}
```

---

## 2. Dynamic Promotion Flow

* **Candidate Phase**: Prompts undergo offline similarity evaluations.
* **Release Pipeline**: Checked into Github and promoted as part of standard service releases.
* **Audit Traces**: Each transaction log retains the exact prompt version utilized.
