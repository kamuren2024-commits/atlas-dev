# Supported Loop Types

This document outlines the operational configurations for the loop models supported by our architecture.

---

## 1. OODA Loop (Observe, Orient, Decide, Act)
- **Purpose**: Rapid threat assessment and tactical response.
- **Inputs**: Immediate environmental signals, logistics notifications, market shifts.
- **Outputs**: Tactical mitigations, routing adjustments.
- **Use Case**: Direct routing changes during immediate Mombasa Port gridlocks.

---

## 2. PDCA Loop (Plan, Do, Check, Act)
- **Purpose**: Operational continuous improvement.
- **Inputs**: Historical supplier performance, delivery times.
- **Outputs**: Supplier SLA updates, pre-qualification criteria revisions.
- **Use Case**: Bi-annual supplier rating adjustment and risk recalculation.

---

## 3. ReAct Loop (Reason + Act)
- **Purpose**: LLM tool use orchestration.
- **Inputs**: Natural language user prompts, target endpoints.
- **Outputs**: API payload execution, reasoning traces.
- **Use Case**: Multi-step contract analysis and document generation.

---

## 4. Reflection Loop
- **Purpose**: Post-execution review.
- **Inputs**: Action output, validation results.
- **Outputs**: Critique reports, improvement plans.
- **Use Case**: Compliance audits post tender awarding.

---

## 5. Reflexion Loop
- **Purpose**: Dynamic self-correction during active reasoning.
- **Inputs**: Mid-execution state, evaluation scores.
- **Outputs**: Reprioritized steps, memory updates.
- **Use Case**: Auto-adjusting a procurement requisition draft before human presentation.

---

## 6. Goal Loop
- **Purpose**: Objective-driven decompositon.
- **Inputs**: Broad milestone targets (e.g., "Reduce delivery overhead").
- **Outputs**: Segmented task graphs, sub-agent assignments.
- **Use Case**: Planning long-term interconnector materials procurement.

---

## 7. Event Loop
- **Purpose**: Asynchronous system-signal reaction.
- **Inputs**: System-wide event payloads.
- **Outputs**: Event notifications, downstream worker trigger.
- **Use Case**: Initiating automatic bid evaluation when a submission deadline is crossed.

---

## 8. Memory Loop
- **Purpose**: Strategic knowledge indexing.
- **Inputs**: Unstructured transaction records.
- **Outputs**: Semantic vector memories, structured lessons-learned.
- **Use Case**: Recording steel price fluctuations during Shanghai freight runs.

---

## 9. Multi-Agent Loop
- **Purpose**: Collaborative multi-specialty problem solving.
- **Inputs**: Broad SCM queries.
- **Outputs**: Synthesized unified executive briefings.
- **Use Case**: Coordinating Logistics, Sourcing, and Compliance agents.

---

## 10. Enterprise Intelligence Loop
- **Purpose**: Autonomous, compliance-mapped decision generation.
- **Inputs**: Corporate goals, procurement plans, legal frameworks.
- **Outputs**: Traceable, legally defensive recommendations.
- **Use Case**: The primary loop orchestrating the KETRACO Procurement Decision Engine.
