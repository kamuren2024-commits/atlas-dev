# Loop controls and budget enforcement

## Current baseline

The runtime has a basic `iterations` and `maxIterations` record, but it does not yet enforce the full loop-control contract required for mission-level safety:

- maxIterations
- maxToolCalls
- maxRetries
- maxDelegations
- maxExecutionTime
- maxTokens
- maxContextSize
- maxWorkflowDepth

## Observed issue

The `phaseVerify` implementation checks only whether reasoning exists and whether actions were blocked. It does not validate the required evidence chain, policy compliance, tool execution success, authorization, or side-effects. A verification pass in this code is therefore weaker than the mandated standard.

## Required behavior

A mission should stop or escalate when:

- verification fails
- tool execution is blocked or unauthorized
- budget is exhausted
- policy or approval gates fail
- workflow depth exceeds the allowed threshold

## Result

Loop budgeting and replan governance remain a gap in the current implementation; this is not production-ready for autonomous mission execution.
