# Tool and MCP security baseline

## Current state

The tool layer exists but the execution path still depends on policy and capability checks that are not fully enforceable in an auditable, runtime-proof manner. Tool risk, tenant scope, and idempotency are not fully modeled as hard gates in the current runtime.

## Core concerns

- Not all tool requests are proven to be tied to a verified identity and tenant
- MCP-specific controls are not yet enforced in a formal security test harness
- Execution and output validation are not bound to the same evidence chain required by the Phase II specification

## Recommended controls

- identity verification
- tenant verification
- capability verification
- permission check
- risk classification
- approval check
- input validation
- execution
- output validation
- evidence capture
- audit logging

## Verdict

Tool security is not sufficiently hardened for production or government-grade operation in the current repository state.
