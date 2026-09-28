# Atlas Graph Model

`ATLAS-PSN-GRAPH-001` adds a bounded Project Supply Nexus projection:
`PROJECT -> HAS_REQUIREMENT -> REQUIREMENT -> REQUIRES -> PRODUCT`, with
tenant/source provenance. The projection reuses the shared graph and does not
permit unrestricted cross-tenant traversal.

`ATLAS-NPI-GRAPH-001` adds a bounded tenant-filtered procurement case projection
for project, requirement, tender, supplier, and contract references. Bid content
is excluded from graph responses.
