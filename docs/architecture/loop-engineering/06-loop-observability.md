# Loop Observability & Auditing

Every autonomous decision cycle must be 100% traceable, and audit-logged to support regulatory accountability.

## Tracing Parameters

Every reasoning cycle generates three hierarchical tracing headers:
- **Loop ID (`loopId`)**: Uniquely identifies a specific continuous cycle (e.g., `loop-16987514`).
- **Execution ID (`executionId`)**: Identifies a single pass of the observe-plan-execute loop.
- **Parent Workflow ID (`parentWorkflowId`)**: Correlates the cycle to a broader, multi-agent business process.

## Tracing Log Schema

```json
{
  "timestamp": 178280128400,
  "level": "INFO",
  "loopId": "loop-17828012",
  "executionId": "exec-17828014",
  "parentWorkflowId": "wf-99812",
  "stateFrom": "OBSERVING",
  "stateTo": "PLANNING",
  "stepDurationMs": 240,
  "totalDurationMs": 810,
  "signature": "SHA256_f828012_SCM_FABRIC_NEXUS"
}
```

## Performance Metrics Tracked

1. **Phase Latency**: Duration of individual stages.
2. **RAG Precision**: Relevance scores of retrieved compliance documentation.
3. **Rule Coverage**: Percentage of validation rule sets verified during a cycle.
4. **Audit Confidence**: Calculated score indicating the reliability of recommendations.
