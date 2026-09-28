# ENTITY MODEL SPECIFICATION

This document defines the standardized entity schemas and classes used inside the SCM Knowledge Graph.

---

## 1. Core Entity Classes

Every node in the Knowledge Graph belongs to a well-defined entity class:

| Class Name | Description | Unique Identifier | Core Properties |
| :--- | :--- | :--- | :--- |
| **Supplier** | Corporate supplier submitting bids | `supplier_pin` (VAT ID) | `company_name`, `country_origin`, `registration_date` |
| **Tender** | Active or closed procurement tender | `tender_id` (UUIDv4) | `title`, `allocated_budget`, `deadline_timestamp` |
| **Asset** | Grid infrastructure element | `asset_id` (UUIDv4) | `substation_name`, `asset_type`, `voltage_class_kv` |
| **Policy** | PPADA legal regulations | `policy_id` (Slug) | `clause_number`, `relevance_index`, `description` |

---

## 2. Entity Serialization Format

Entities are serialized to JSON-LD formats for schema-less data exchange across platform boundaries. This keeps all metadata discoverable.
