# API Contract

- `GET /api/project-supply/projects/:projectId`
- `GET /api/project-supply/projects/:projectId/requirements`
- `GET /api/project-supply/projects/:projectId/supply-position`

Responses include `ok`, tenant-authorized project scope, requirements,
source-backed positions, formulas, source tables, bounded graph data and
`DERIVED` or `UNAVAILABLE` status. Missing requirements are not converted to
zero readiness.
