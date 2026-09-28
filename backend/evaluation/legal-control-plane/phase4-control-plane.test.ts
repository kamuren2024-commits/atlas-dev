import assert from 'node:assert/strict';
import { DeterministicControlEvaluator } from './deterministic-engine';
import { ControlDefinition, RequirementControl } from './contracts';
import { LegalRegistry } from './registry';

const registry = LegalRegistry.createKenyaProcurementRegistry();
const sourceVersion = 'Act No. 33 of 2015 (Rev. 2022)';
const control: ControlDefinition = {
  controlId: 'TEST-TAX-VALIDITY',
  title: 'Tax evidence validity',
  description: 'Verified tax evidence must remain valid at evaluation time.',
  legalSourceId: 'PPADA-2015-SEC-71',
  legalVersion: sourceVersion,
  provision: 'Section 71',
  effectiveFrom: '2016-01-07T00:00:00Z',
  applicability: 'ALWAYS',
  mandatory: true,
  severity: 'CRITICAL',
  evaluationMethod: 'DATE_VALIDITY',
  requiredEvidence: ['TAX_CERTIFICATE'],
  failureState: 'NON_COMPLIANT',
  humanReviewRequired: true,
  stage: 'PRELIMINARY'
};
registry.registerControl(control);
const requirement: RequirementControl = {
  requirementId: 'REQ-TAX',
  controlId: control.controlId,
  requirementCode: 'TAX-COMPLIANCE',
  description: 'Current tax compliance evidence',
  source: 'LEGAL_FRAMEWORK'
};
registry.mapRequirement(requirement);

const evaluator = new DeterministicControlEvaluator();
const result = evaluator.evaluate(control, requirement, {
  asOf: '2026-09-22T00:00:00Z',
  evidence: [{
    evidenceId: 'E-1',
    type: 'TAX_CERTIFICATE',
    hash: 'hash',
    status: 'VERIFIED',
    validTo: '2026-09-21T23:59:59Z'
  }]
});
assert.equal(result.result, 'FAIL');
