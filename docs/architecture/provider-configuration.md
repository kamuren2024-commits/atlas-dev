# Salience Atlas V2 - AI Provider Configuration Architecture

This document outlines the design and operational standards for the Salience Atlas V2 dynamic environment-driven AI Provider registry.

## Core Architecture Design

The AI Provider Registry is completely decoupled from any specific LLM SDK or vendor. Rather than hardcoding fallback behaviors, endpoints, and credentials, the entire system is built on a central **AI Environment Governance Layer**.

```
  +-------------------------------------------------------------+
  |                   Environment Variables                     |
  |   (e.g., GEMINI_API_KEY, GROQ_ENABLED, FORCE_PROVIDER, ...)  |
  +------------------------------+------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |              /backend/ai-federation/config                  |
  |  - provider-config.ts     (Loader / Parser)                 |
  |  - provider-types.ts      (Typed Interfaces)                |
  |  - provider-validator.ts  (Startup validation rules)        |
  |  - provider-registry.ts   (Dynamic fallback resolver)       |
  +------------------------------+------------------------------+
                                 |
                                 v
  +-------------------------------------------------------------+
  |                  Model Router (Realtime)                    |
  |  - Discovers sorted active failover chain                   |
  |  - Dispatches calls to instantiated active providers        |
  |  - Triggers circuit breaker and offline simulators          |
  +-------------------------------------------------------------+
```

## Configuration Interface

Configurations are fully typed via `AIEnvironmentConfig` and mapped strictly to environmental schemas.

```typescript
export interface ProviderInfo {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  model: string;
  fallbackPriority: number;
  apiBase?: string;
}
```

## Runtime Priority Sorting

At startup or runtime, the active failover chain is dynamically computed by reading the enabled providers and sorting them in ascending order of their `fallbackPriority` (from `1` to `N`). 

This mechanism allows immediate, zero-redeploy reordering of the network path if an upstream cluster begins reporting elevated error rates or billing spikes.
