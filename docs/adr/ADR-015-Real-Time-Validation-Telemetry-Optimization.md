# ADR-015: Real-Time Validation Telemetry Optimization

## Status
**ACCEPTED**

## Date
2026-06-28

## Context
During high-volume real-time validation testing under ACP-12, the platform SRE team identified minor telemetry query queue bottlenecks when processing high-volume transformer sensor streams alongside complex AI reasoning logs.

## Decision
We optimize the real-time telemetry pipelines by implementing:
1. **Dynamic Debouncing**: Front-end widgets debounce rapid WebGL coordinate re-renders (capped at a maximum of 60 renders per second).
2. **Redis Buffer Pools**: Telemetry inputs are buffered into Redis streams before getting batched and written to the persistent PostgreSQL datastore.
3. **Decoupled API Routing**: Telemetry processing requests are handled by dedicated background workers, keeping the main Express-Vite portal threads entirely clear for user interaction.

## Consequences
* **Positive**: Eliminates database query queues under sustained 1,200 RPS loads.
* **Positive**: Guarantees fluid, high-frame-rate rendering on the Kenya Digital Twin canvas.
* **Neutral**: Adds minor Redis buffering complexity for live metrics tracing.
