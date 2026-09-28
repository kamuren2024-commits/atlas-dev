# Salience Atlas V2 - Cognitive Failover & Resilience Engine

The Federation Gateway is built to absorb major provider outages without interrupting active business workflows, user panels, or background agents.

## Cascading Failover Sequence

When a request is submitted:
1. The SCM router identifies the primary target provider based on the task type (Fast vs. Reasoning).
2. It constructs a dynamic failover list by calling `ProviderRegistry.getFallbackChain()`.
3. If the primary provider fails (e.g. timeout, 5xx server error, rate limit), the gateway captures the exception, records a failure tally, and cascades instantly down-chain.
4. If all cloud clusters are unreachable, it fires the final local containment safeguard (Ollama), injecting fallback warning badges into the API response headers.

## Integrated Circuit Breaker Parameters

To prevent wasting API quota and generating latency bottlenecks:
- **Failure Threshold**: `3` consecutive exceptions.
- **Circuit State**: Trips to `OPEN`, immediately skipping the provider.
- **Cooldown Interval**: `60` seconds. Following cooldown, the circuit enters a `HALF-OPEN` state, routing a single test probe to verify upstream health recovery.
