# Evaluation Control Plane

`AgentControlPlane.ts` introduces typed suites, cases, runs, observations, assertions, metrics, failures, artifacts, and decisions. Results preserve multidimensional metrics and include version, input hash, trace, evidence, environment, and status fields; the contracts do not persist prompts or secrets.

An agent with no evaluation profile is blocked. Profile identity must match agent version, provider, and model. Autonomous execution requires `PASSED`; `PASSED_WITH_RESTRICTIONS` is not sufficient for autonomous work. Expired, failed, and revoked profiles are blocked. Skill functional and security results are independent; both must pass before activation.

The existing `AgentEvaluator` and `ModelEvaluator` remain in place and have not been replaced. They are not equivalent to the new conformance harness, and this increment does not claim a scored evaluation suite, durable results, model-route filtering, evaluation regression invalidation, or production TEVV coverage.

Run focused contract tests:

```powershell
npm.cmd run test:agent-control-plane
```

Provider SDK orchestration statuses are recorded as `NOT_CONFIGURED`/`UNVERIFIED` in the TEVV artifacts until real adapters and runtime evaluations exist. No fabricated provider success fixtures are used as production evidence.
