# MinIO/S3 Deployment

Status: `PARTIALLY_IMPLEMENTED`

`S3ObjectStore` uses the AWS S3 SDK and supports MinIO through
`S3_ENDPOINT` plus path-style addressing. Configure:

`S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`,
`OBJECT_LOCK_ENABLED`, `OBJECT_VERSIONING_ENABLED`, and
`RETENTION_CONFIGURED`.

Uploads calculate SHA-256, send metadata, retrieve object metadata, and reject a
hash mismatch as `INTEGRITY_FAILURE`. Versioning is required when enabled in
configuration. A real MinIO deployment test is still required.
