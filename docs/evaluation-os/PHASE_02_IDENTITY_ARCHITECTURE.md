# Phase 02 Identity Architecture

Status: `PARTIALLY_IMPLEMENTED`

`OidcTokenValidator` validates RS256 signatures against a refreshed JWKS,
issuer, audience, expiry, tenant, subject, roles, groups, and scopes. Production
middleware now selects this validator instead of the local HS256 flow. Production
V2 routes require an authenticated identity and ignore client-supplied evaluator
identity and role.

The existing local JWT/dev-user flow remains for development compatibility. A
deployment must configure an OIDC issuer, audience, and JWKS endpoint before
production identity can be declared ready.
