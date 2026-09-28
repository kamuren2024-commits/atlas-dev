# PostgreSQL Migration Runbook

Status: `CONTRACT_ONLY`

1. Provision PostgreSQL and take a verified backup of the SQLite database.
2. Run the PostgreSQL foundation migration and record its checksum in
   `evaluation_schema_migrations`.
3. Discover legacy Evaluation OS rows from `evaluation_tenders`,
   `evaluation_bidders`, documents, evidence, scores, workflow, and audit tables.
4. Map each row to a versioned PostgreSQL aggregate; reject rows with missing
   tenant, identity, or content hash rather than inventing values.
5. Validate foreign keys, counts, content hashes, and audit-chain continuity.
6. Write a migration report containing discovered, migrated, rejected,
   transformed, and manual-review counts.
7. Cut over only after repository injection and deployment-backed verification
   pass. Preserve SQLite as read-only recovery input; never use it as a
   production Evaluation OS write path.
