# API Contract

**Change ID:** ATLAS-NPI-BE-001

- `GET /api/procurement/summary`
- `GET /api/procurement/cases?stage=&limit=&offset=`
- `GET /api/procurement/cases/:caseId`
- `GET /api/procurement/market?item=`
- `GET /api/procurement/graph/:caseId`

All routes require authentication, tenant authorization, and return evidence
status. Bid content is deliberately not part of the response contract.
