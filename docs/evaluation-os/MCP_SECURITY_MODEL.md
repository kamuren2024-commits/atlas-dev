# MCP Security Model

Status: `PARTIALLY_IMPLEMENTED`

MCP destinations require HTTPS, an explicit host allowlist, no credentials in
URLs, DNS resolution, and private/loopback/link-local address rejection.
Tool descriptors must declare scopes, roles, tenants, classification, timeout,
rate limit, risk, and human-approval requirements.

Redirect revalidation, DNS rebinding protection at connection time, response-size
limits, credential-vault integration, and live security tests remain required.
