# ADR-009: Plugin Framework

* **Status**: ✅ Approved
* **Owner**: Chief SCM Architect
* **Review Date**: 2026-07-28
* **Related Components**: SCM Intelligent Core, Twin Canvas

---

## 1. Context & Problem Statement

KETRACO's SCM requirements grow dynamically. We need a modular architecture that allows adding new simulation engines (such as a weather disruption calculator or port logistics analyzer) without rewriting core UI files.

## 2. Alternatives Considered

* **Option A: Monolithic UI Components**: Add all logic directly inside a single file. Prone to token limits, merge conflicts, and high complexity.
* **Option B: Modular Component Registry (Selected)**: Create a decoupled visual structure where widgets and models register as modular plugins.

## 3. Decision

We designed a modular UI structure where the SCM Digital Twin, Contract Auditor, and Supplier Scorecard operate as distinct widgets in `/src/components/`, isolated from the primary layout framework.

## 4. Consequences & Tradeoffs

### Pros:
* **High Modularity**: New SCM modules can be introduced with zero regression risk to existing panels.
* **Maintainability**: Streamlined files prevent token limits during code generations.

### Cons:
* **Coordination Layer**: Requires state prop passing or React Context to sync selections (handled via robust TypeScript interfaces).
