# ADR-005: Multi-Agent Orchestration

* **Status**: ✅ Approved
* **Owner**: Principal AI Scientist
* **Review Date**: 2026-07-28
* **Related Components**: `ContractAuditor`, `BidParser`

---

## 1. Context & Problem Statement

KETRACO contract and procurement auditing requires complex reasoning. Single-shot prompt executions struggle with large bid documents, resulting in missed risk factors or generic audits.

## 2. Alternatives Considered

* **Option A: Large Single Prompts**: Put entire bids in one model prompt. Exceeds standard tokens, misses critical clauses, and lacks focus.
* **Option B: Decoupled Multi-Agent Workflows (Selected)**: Deploy dedicated agent personas (Procurement, Risk, Technical) that collaborate to audit bids step-by-step.

## 3. Decision

We implemented a multi-agent orchestration architecture. One agent parses and normalizes the bid documents, another reviews technical parameters, and a third evaluates compliance risks, providing a consolidated, high-fidelity audit report.

## 4. Consequences & Tradeoffs

### Pros:
* **Deep Analysis**: Significantly higher precision in identifying compliance gaps and hazard ratings.
* **Modularity**: Personnel can refine prompts or models for individual agent personas independently.

### Cons:
* **Token Costs**: Multi-agent loops consume more tokens than single-shot queries (safeguarded via `AI_MAX_AGENT_DEPTH`).
