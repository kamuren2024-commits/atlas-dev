# RELATIONSHIP MODEL SPECIFICATION

This document details the typed directional edges that bind entities in the SCM Knowledge Graph.

---

## 1. Allowed Relationship Types

To maintain semantic integrity, all relationships (edges) must follow strict type constraints:

| Relationship Name | Source Entity | Target Entity | Directed | Description |
| :--- | :--- | :--- | :---: | :--- |
| **SUBMITS_BID** | `Supplier` | `Tender` | Yes | Supplier enters a proposal |
| **AUDITS_COMPLIANCE**| `Policy` | `Tender` | Yes | Procurement rules are enforced |
| **DEPENDS_ON** | `Asset` | `Asset` | Yes | Operational asset dependency |
| **AFFILIATED_WITH** | `Supplier` | `Supplier` | No | Shared directorship or ownership |

---

## 2. Relationship Attributes

Edges can contain metadata, such as `timestamp`, `confidence_score`, and `provenance_id` to enable path-weighting algorithms during hazard calculations.
