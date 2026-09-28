# Data Model

Supplier graph nodes carry tenant and source metadata. Logistics orders carry
`supplier_id`, status and timestamps used for performance derivation. Supplier
master, certifications, documents, spend, capacity and claims are not
persisted in one canonical supplier schema yet.
