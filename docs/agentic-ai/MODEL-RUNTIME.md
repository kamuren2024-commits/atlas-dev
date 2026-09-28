# Model runtime evidence

## Verification scope

This document records executable evidence from the Phase IV-A bounded runtime verification performed on 2026-09-26. Model inventory is not treated as proof of execution. The detailed machine-readable evidence is in:

- [ollama-runtime-results.json](../tevv/ollama-runtime-results.json)
- [ollama-failure-results.json](../tevv/ollama-failure-results.json)
- [model-routing-results.json](../tevv/model-routing-results.json)
- [agent-local-model-results.json](../tevv/agent-local-model-results.json)

Status meanings:

- **PASS**: the behavior was directly observed and validated.
- **FAIL**: the behavior was exercised and contradicted the required invariant.
- **UNVERIFIED**: the required behavior was not proven within the bounded test.
- **NOT_APPLICABLE**: the behavior is not supported by the available runtime contract.

## Proven

- **Model discovery: PROVEN.** `GET /api/tags` returned `gemma4:12b` and `qwen3:14b`.
- **Endpoint resolution: PROVEN.** The Ollama client normalized the configured host to `http://127.0.0.1:11434`.
- **Registry consistency: PROVEN.** Three refreshes represented each live model exactly once.
- **Stale registration removal: PROVEN by implementation and repeated live refresh.** Refresh removes prior local entries before applying the current inventory.
- **Failure handling: PROVEN.** Invalid endpoint, nonexistent model, and bounded timeout all produced explicit failures without synthetic success.
- **Fail-closed gateway: PROVEN.** With local generation bounded to one second, `AtlasAiGateway` returned an unavailable error rather than a fabricated response.

## Failed or unverified

| Capability | qwen3:14b | gemma4:12b | Evidence |
|---|---|---|---|
| Simple generation | FAIL: bounded 30-second request timed out | FAIL: bounded 30-second request timed out | Raw `/api/generate` requests were sent to each discovered model; neither returned content |
| Structured JSON | UNVERIFIED | UNVERIFIED | No generated response was available to validate against a schema |
| Tool calling | UNVERIFIED | UNVERIFIED | `/api/tags` declares tools, but no complete tool request/authorization/execution/continuation round trip was observed |
| Agent integration | UNVERIFIED | UNVERIFIED | Existing harness activity does not prove substantive local-model output through every mission phase |
| Concurrency and request isolation | UNVERIFIED | UNVERIFIED | No successful local responses were available for an attributable two-request comparison |

## Explicit non-claims

This evidence does not establish model capability, agent capability, scalability, durable trust-plane readiness, or production readiness. In particular:

```text
MODEL INVENTORY != MODEL CAPABILITY
MODEL CAPABILITY != AGENT CAPABILITY
AGENT CAPABILITY != PRODUCTION READINESS
```
