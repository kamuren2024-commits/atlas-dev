# Graph Model

For a requested project, the API returns a bounded one-hop shared graph plus
persisted requirement nodes and provenance-backed `PROJECT -HAS_REQUIREMENT->
REQUIREMENT` and `REQUIREMENT -REQUIRES-> PRODUCT` edges. Existing graph nodes
are tenant-filtered through project identity. No unrestricted graph traversal
or cross-tenant inference is exposed.

Change ID: `ATLAS-PSN-GRAPH-001`.
