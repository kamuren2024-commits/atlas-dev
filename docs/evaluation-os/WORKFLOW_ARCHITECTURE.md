# Workflow Architecture

Status: `PARTIALLY_IMPLEMENTED`

`EvaluationWorkflowService` provides explicit durable-store boundaries, allowed
state transitions, policy-decision requirements, and human actor requirements for
approval/finalization. The existing in-memory state machine remains for
compatibility. Temporal or another durable workflow provider is not connected;
in-memory workflow state is not production-authoritative.
