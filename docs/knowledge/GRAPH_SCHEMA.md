# GRAPH SCHEMA REGISTER

This file contains the formal schema definition schema governing nodes and edges in the SCM Knowledge Graph.

---

## 1. Schema Validation (JSON-Schema format)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SCMGraphEdgeSchema",
  "type": "object",
  "properties": {
    "edge_id": { "type": "string", "format": "uuid" },
    "source_id": { "type": "string" },
    "target_id": { "type": "string" },
    "relationship_type": { 
      "type": "string", 
      "enum": ["SUBMITS_BID", "AUDITS_COMPLIANCE", "DEPENDS_ON", "AFFILIATED_WITH"] 
    },
    "confidence_score": { "type": "number", "minimum": 0, "maximum": 1.0 }
  },
  "required": ["edge_id", "source_id", "target_id", "relationship_type"]
}
```

---

## 2. Integrity Enforcement

The system runs background cron tasks to audit graph integrity. Edges referencing non-existent source or target IDs are quarantined immediately.
