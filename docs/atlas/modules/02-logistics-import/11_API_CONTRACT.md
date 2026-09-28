# API Contract

`GET /api/logistics/data-quality` returns tenant-scoped source freshness:
`source`, `table`, `recordCount`, `lastUpdatedAt`, and `status` (`LIVE`,
`STALE`, `UNAVAILABLE`). It also returns `importIntelligence.status =
UNVERIFIED` with an explicit reason while no validated import source exists.
Malformed or unauthorized requests return the existing error envelope.
