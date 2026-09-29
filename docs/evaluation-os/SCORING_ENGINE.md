# Scoring Engine

**Status: PARTIAL / SCORE COMMAND DISABLED**

## Current service behavior

`EvaluationDbService.submitScore` validates a finite score against the criterion maximum, requires rationale and at least one evidence row, and checks recusal. It writes a score and a hash-linked audit block in a database transaction. Resubmitting the same evaluator/bidder/criterion score now raises `ScoreAlreadySubmittedError` rather than mutating the previous row. The REST score command is disabled with `503 UNAVAILABLE` until authenticated evaluator assignments and policy authorization are connected.

The prior implementation updated an existing `evaluator_scores` row in place. The update path has been removed. There is no authorized amendment workflow yet; amendments must remain blocked rather than silently overwrite the submitted assessment.

## Limitations

- Criteria/weights and the score snapshot are not bound to an immutable tender-versioned evaluation plan.
- The current score representation and average use JavaScript number arithmetic; deterministic decimal calculation is not established.
- The stored `digital_signature` value is a SHA-256 digest, not a public-key digital signature.
- The criterion benchmark variance logic is not a validated tender-specific committee threshold.
- The active REST path does not yet enforce authenticated user assignment, tenant, stage, authorization, idempotency, or concurrency.
- No canonical normalized/weighted score engine, committee aggregation, variance review, or persisted calculation manifest is active.

Never use a generic technical/financial weight ratio. Weights and calculation inputs must be read from the immutable approved plan before enabling scoring.
