# API Contract

`GET /api/suppliers` returns tenant-authorized graph supplier identities.

`GET /api/suppliers/:supplierId/intelligence` returns graph relationships,
order-derived performance, evidence sources and an explicit human-approval
boundary. Performance includes formula, source, sample size, timestamp and
`INSUFFICIENT_DATA` when no supplier-linked orders exist.
