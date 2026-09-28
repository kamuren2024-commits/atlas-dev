# Identity and Authorization

## Current state
The repository still contains a demo credential model in `backend/security/auth-router.ts`, but the trust plane now includes an explicit identity contract in `backend/security/trust-plane-contracts.ts` and typed policy outcomes in `backend/security/authorization-service.ts`.

## Identity boundary
The trusted identity context must contain:
- actorId
- tenantId
- authenticationMethod
- authenticationStrength
- roles
- attributes
- sessionId
- issuer
- issuedAt
- expiresAt

The server must derive identity from the authenticated boundary rather than trusting client-supplied identity fields.

## Authorization boundary
Authorization decisions are now modeled as a typed contract instead of a raw boolean. They resolve to `ALLOW`, `DENY`, `REQUIRE_APPROVAL`, `NOT_APPLICABLE`, or `POLICY_UNAVAILABLE` and default to denial when trust state is unknown.

## Observed gaps
- Static credential store is still not a production-grade identity provider
- Role-based checks are still an implementation milestone rather than a validated production policy engine
- End-to-end cross-tenant and approval-chain enforcement is still pending

## Required direction
Move toward authoritative identity from an external provider, enforce tenant and resource boundaries, and prove mission-level approval and audit durability before claiming government-grade status.
