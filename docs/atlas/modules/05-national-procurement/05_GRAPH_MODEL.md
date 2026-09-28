# Graph Model

**Change ID:** ATLAS-NPI-GRAPH-001

`GET /api/procurement/graph/:caseId` returns only a bounded case/project/
requirement/tender/supplier/contract projection and only tenant-matching graph
nodes. Bid details are excluded. Seeded graph records are not promoted to
canonical procurement evidence.
