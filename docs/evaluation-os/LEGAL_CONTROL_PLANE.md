# Legal Control Plane

The authoritative legal catalog remains [authoritative-sources.ts](../../backend/evaluation/governance/authoritative-sources.ts). Phase 04 adds the typed control-plane boundary in `backend/evaluation/legal-control-plane/`.

## Model

`LegalFramework -> LegalVersion -> ControlDefinition -> RequirementControl -> EvidenceInput -> ControlEvaluation -> DecisionTrace`.

Controls are versioned, effective-date aware, evidence-bound, and explicit about `INSUFFICIENT_EVIDENCE` and `REQUIRES_LEGAL_REVIEW`. The registry rejects unknown legal versions and duplicate control IDs.

The control plane does not invent Kenyan law. Source text and citations require authoritative verification; uncertain applicability is represented as legal review, not an inferred rule.

## Existing engine integration

The Phase 03 `VersionedLegalRuleEngine` remains the existing rule implementation. The new registry/evaluator is the canonical boundary for newly wired deterministic controls and can consume the existing authoritative source catalog. No second legal authority is introduced.
