# MCP Gateway Architecture

Status: `PARTIALLY_IMPLEMENTED`

The MCP gateway validates complete tool security declarations, delegates policy
decisions, and requires destination validation through an allowlist and private-IP
blocking. Credential references are separate from invocation payloads.

Live MCP servers, credential vault, rate-limit persistence, connector invocation
records, and government endpoint execution remain unimplemented.
