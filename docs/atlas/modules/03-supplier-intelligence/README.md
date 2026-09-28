# Module 03 — Supplier Intelligence

Phase 03 adds a governed supplier intelligence read path over the existing
knowledge graph and logistics order evidence. It does not duplicate tender,
evaluation, contract or AI engines.

Routes: `GET /api/suppliers` and
`GET /api/suppliers/:supplierId/intelligence`.

Supplier performance is derived only from persisted order counts. Missing
evidence is returned as `INSUFFICIENT_DATA`; no supplier score, sanction,
ownership or live status is fabricated.
