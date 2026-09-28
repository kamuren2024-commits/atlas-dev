# Salience Atlas V2 - Resiliency & Provider Failover Design

This document details how Salience Atlas V2 handles multi-provider cognitive resilience, routing, circuit breaking, and emergency localized containment fallbacks.

## Dynamic Failover Cascade

When an API request is made through `ModelRouter.route()`, the gateway:
1. Translates the user intent and strategy (e.g. latency, cost, reasoning).
2. Establishes the primary target provider.
3. Computes the ordered sequence of backup providers by pulling from `ProviderRegistry.getFallbackChain()`.
4. Attempts execution on the primary. If a failure (HTTP 4xx, 5xx, or network timeout) occurs, it marks the failure and cascades down-chain instantly to the next prioritized fallback provider.

## Circuit Breakers

To prevent high-latency timeouts and wasting API quota during active service outages, the router maintains an active circuit state tracker for each provider:

- **Failure Threshold**: `3` consecutive failures.
- **Circuit State**: Tripped (skips provider for subsequent calls).
- **Cooldown Interval**: `60` seconds. After this cooldown, the circuit enters a half-open state, sending a single test request to determine if service has recovered.

## Emergency Containment Fallback

If all primary cloud platforms are simultaneously unreachable or depleted (e.g., severe internet outages or widespread rate limits):
1. The gateway falls back to the **Emergency Local Containment Node** (Ollama).
2. Ollama is prioritized as the ultimate local fail-safe (`999`).
3. An executive alert is embedded inside the API metadata payload so that the frontend UI reflects the resilient containment state.
