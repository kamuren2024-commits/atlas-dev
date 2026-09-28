# IDENTITY FEDERATION & SSO SPECIFICATION

This document details the authentication bindings, OIDC configurations, and corporate single sign-on parameters.

---

## 1. Single Sign-On (SSO) Integrations

All user access to KETRACO SCM platform interfaces is routed through corporate single sign-on (SSO) systems:

* **Identity Provider (IdP)**: Corporate Microsoft Active Directory / Okta.
* **Protocol**: OpenID Connect (OIDC) / SAML 2.0.
* **MFA Enforcements**: Multi-factor authentication is mandatory for all user accounts.

---

## 2. Token Exchange & JWT Claims

Upon successful login, Keycloak issues standard cryptographically signed JWT tokens containing custom authorization claims:

* **`roles`**: Defines user authorization groups (e.g., `scm-auditor`, `scm-sre`, `grid-planner`).
* **`groups`**: Maps users to specific regional energy dispatch divisions (e.g., `kisumu-hub`, `nairobi-hq`).
* **Validation**: Gateway routers verify token signatures dynamically using the public JWKS keys endpoint before routing requests.
