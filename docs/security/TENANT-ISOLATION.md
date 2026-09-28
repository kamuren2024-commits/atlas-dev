# Tenant Isolation

## Policy
Tenant-bound authorization is mandatory. Every resource access is evaluated against the authenticated actor identity and the authoritative tenant context.

## Boundary checks
- actor tenant must match the tenant used for access
- resource tenant must match the tenant used for access
- evidence and audit records must carry the tenantId
- cross-tenant writes are denied by policy

## Current status
The repository defines the required enforcement semantics in `AuthorizationService` and `trust-plane-contracts`, but end-to-end cross-tenant execution tests remain pending.
