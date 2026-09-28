# ADR-001: AI Federation Architecture

* **Status**: ✅ Approved
* **Owner**: Principal AI Architect
* **Review Date**: 2026-07-28
* **Related Components**: `ModelRouter`, `ProviderRegistry`, `KeysVault`

---

## 1. Context & Problem Statement

KETRACO requires a highly resilient, enterprise-grade AI execution layer. Directly binding SCM features to a single AI provider poses substantial business continuity risks, including vendor lock-in, API throttling, quota depletion, and service outages. 

## 2. Alternatives Considered

* **Option A: Single Provider Lock-In (Gemini Only)**: Lower complexity, but creates a single point of failure and removes cost/performance flexibility.
* **Option B: Independent Provider Clients**: Implement client wrappers directly inside components. Results in extreme code duplication, inconsistent secrets handling, and complex maintenance.
* **Option C: Unified Federation Layer (Selected)**: Dynamically route requests across a priority-sorted, health-monitored list of active providers.

## 3. Decision

We implemented a unified, server-side **AI Provider Federation Layer (Salience Atlas V2)**. It decouples high-level business queries from specific APIs, managing route selection, failovers, rate throttles, and credential rotation.

## 4. Consequences & Tradeoffs

### Pros:
* **High Availability**: Outages in Google Gemini trigger automatic failover to alternative routes (e.g. Groq, OpenAI).
* **Cost Efficiency**: High-cost models are only called as fallbacks; standard requests route to cost-optimized baselines.
* **Dynamic Key Rotations**: Throttled API keys are automatically cycled under HTTP 429 errors.

### Cons:
* **Output Variability**: Different providers may return slightly different response schema formats. Mitigated through JSON Schema forcing and strict output validation.
