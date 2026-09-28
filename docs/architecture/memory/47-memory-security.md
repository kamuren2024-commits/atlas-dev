# 47. Memory Security & Privacy Shield
## Salience Atlas v5

All EMF reads and writes pass through the `MemorySecurityGuard` validation checks.

### Key Security Protocols

#### 1. Tenant Multi-Tenant Isolation
- Tenant segregation is enforced at the core repository tier.
- If a provider detects a request attempting to read a key whose entry `context.tenantId` does not match the requester's `tenantId`, EMF throws a critical security violation.

#### 2. Namespace Shielding
- Memory tags can define isolated namespaces (e.g. `tender-scope`).
- Sub-components can only access variables registered in their matching context namespace.

#### 3. Secure Wiping (Zero-Fill)
- Standard deletion processes in databases often leave fragments behind.
- EMF ensures secure deletion by replacing the stored payload with `[SECURE_WIPED_BY_SYSTEM]` and clearing associated index keys.

#### 4. Encryption Abstractions
- Confidential payloads are automatically encrypted using Base64-salt tokens prior to mapping, keeping credentials secure in memory.
