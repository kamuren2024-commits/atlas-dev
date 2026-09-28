# Agent state machine baseline

## Current state

The current runtime in `backend/ai-federation/agents/AgentRuntime.ts` uses a cognitive-phase loop (`PERCEIVE`, `UNDERSTAND`, `RETRIEVE`, `REASON`, `PLAN`, `SIMULATE`, `ACT`, `VERIFY`, `LEARN`) but does not yet implement the explicit enterprise state machine required by the Phase II specification.

## Required production state machine

- CREATED
- OBSERVING
- UNDERSTANDING
- PLANNING
- POLICY_CHECK
- WAITING_APPROVAL
- EXECUTING
- VERIFYING
- REFLECTING
- REPLANNING
- COMPLETED
- FAILED
- ESCALATED
- CANCELLED
- TIMED_OUT
- BUDGET_EXCEEDED

## Compliance note

The current code can return `COMPLETED` or `FAILED` based on verification but does not enforce strict transition validation or an explicit mission state ledger. This is a material gap against the required state-machine contract.

## Risk

Without strict transitions, invalid success states can be reached without durable evidence, making replay, approval, and audit incomplete.
