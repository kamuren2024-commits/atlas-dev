# Government Connector and MCP Architecture

## Authority

Government data is retrieved only through an officially permitted public API or an
authorized enterprise connector. Authenticated government systems are not scraped.
The connector result is not evidence until schema validation, provenance recording,
classification, and policy authorization have succeeded.

## Request path

`Authenticated Principal -> Tenant -> Purpose -> Policy Guard -> Connector Scope -> API/MCP Call -> Response Validation -> Provenance -> Evidence -> Audit`

Every invocation must retain the request ID, trace ID, actor, tenant, authorization
decision, connector/provider, endpoint or tool ID, parameter hash, response hash,
timestamp, status, and failure reason. Credentials are resolved from environment
secrets or a vault and are never returned to an AI prompt, frontend, database
plaintext field, or log.

## Connector status

The typed provider contracts in `backend/integrations/` deliberately return
`NOT_CONFIGURED` until authorized endpoints and credentials are supplied. They do
not fabricate tender, supplier, regulatory, or government responses.

| Connector | Allowed initial scope | Prohibited |
|---|---|---|
| PPRA | Public tender information, standard documents, circulars, published decisions | Authenticated-system scraping |
| E-GPS | Adapter contract only until endpoint documentation and credentials exist | Invented endpoints or fabricated data |
| KETRACO | Public notices, addenda, dates, eligibility, tender documents | Bypassing SAP Ariba authentication |
| GavaConnect | Officially authorized APIs only | Unrestricted or unscoped government access |

## MCP controls

Each tool declares scopes, tenant and role allow-lists, classification, schemas,
timeout, rate limit, risk level, and human-approval requirement. Policy denial is a
terminal `CONNECTOR ACCESS BLOCKED` result; retries must not bypass authorization.
Raw external HTML is sanitized and is never inserted into an LLM system prompt.

## Evidence and uncertainty

`UNAVAILABLE`, `NOT_VERIFIED`, `UNKNOWN`, and `CONFLICT` remain distinct from
`NOT_COMPLIANT`. A stale result becomes `EXPIRED` and requires re-verification.
An external response without provenance is rejected rather than promoted to evidence.
