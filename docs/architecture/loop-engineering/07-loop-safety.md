# Loop Safety, Guardrails & Kill Switches

Autonomous loops must operate within strict safety envelopes to guarantee statutory compliance and prevent catastrophic runaway cycles.

## Core Safety Mechanisms

### 1. Hard Boundaries & Policy Enforcement
The `AgentPolicyManager` acts as an absolute guardrail. If any action contains high-risk operations (such as actual asset disposal awards or contract termination triggers), the loop execution blocks, requiring Human-In-The-Loop (HITL) clearance.

### 2. Validation Pipelines
Our decoupled `ValidationPipeline` guarantees that validation checks are run in isolation. If validation results are invalid, the overall loop result success state is flagged false, preventing any automated state update from continuing.

### 3. Timeout Controls
Every cycle defines a maximum lifespan (default: 5 minutes). If a cycle exceeds this runtime, `TerminationControls` throws a timeout error and forces transition to `TIMED_OUT`.

### 4. Centralized Kill Switch
A global `TerminationControls.activateKillSwitch()` mechanism is available. Once triggered, all active loops immediately abort execution, protecting system integrity.

### 5. Risk-Based Escalation
Decisions are evaluated against risk coefficients. When a score exceeds acceptable thresholds, the decision is escalated to a human administrator for explicit approval.
