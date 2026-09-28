import {
  ControlDefinition,
  ControlEvaluation,
  EvidenceInput,
  RequirementControl,
  DeterministicResult
} from './contracts';

export interface DeterministicEvaluationContext {
  asOf: string;
  numericValue?: number;
  exactValue?: string | number | boolean;
  evidence: EvidenceInput[];
}

export class DeterministicControlEvaluator {
  public evaluate(
    control: ControlDefinition,
    requirement: RequirementControl | undefined,
    context: DeterministicEvaluationContext
  ): ControlEvaluation {
    const evidence = context.evidence.filter(item => control.requiredEvidence.includes(item.type));
    const base = {
      controlId: control.controlId,
      requirementId: requirement?.requirementId,
      evidenceIds: evidence.map(item => item.evidenceId),
      legalSourceId: control.legalSourceId,
      legalVersion: control.legalVersion,
      evaluatedAt: new Date().toISOString(),
      humanReviewRequired: control.humanReviewRequired
    };

    if (control.applicability === 'CONFIGURED' && !requirement) {
      return { ...base, result: 'NOT_APPLICABLE', reason: 'Control has no tender requirement mapping.', evidenceIds: [] };
    }
    if (evidence.some(item => item.status === 'INVALID')) {
      return { ...base, result: 'FAIL', reason: 'Required evidence contains an invalid artifact.' };
    }
    if (evidence.length < control.requiredEvidence.length) {
      return { ...base, result: 'INSUFFICIENT_EVIDENCE', reason: 'One or more required evidence types are missing.' };
    }

    if (control.evaluationMethod === 'DATE_VALIDITY') {
      const valid = evidence.every(item => !item.validTo || new Date(item.validTo).getTime() >= new Date(context.asOf).getTime());
      return { ...base, result: valid ? 'PASS' : 'FAIL', reason: valid ? 'All evidence is valid at the evaluation date.' : 'Evidence expired before the evaluation date.' };
    }
    if (control.evaluationMethod === 'NUMERIC_THRESHOLD') {
      const configured = requirement?.configuredValue;
      const pass = typeof configured === 'number' && typeof context.numericValue === 'number' && context.numericValue >= configured;
      return { ...base, result: pass ? 'PASS' : 'FAIL', reason: pass ? 'Numeric threshold satisfied.' : 'Numeric threshold not satisfied.' };
    }
    if (control.evaluationMethod === 'EXACT_VALUE') {
      const pass = requirement?.configuredValue !== undefined && context.exactValue === requirement.configuredValue;
      return { ...base, result: pass ? 'PASS' : 'FAIL', reason: pass ? 'Configured value matched exactly.' : 'Configured value did not match.' };
    }
    return { ...base, result: 'PASS', reason: 'Required evidence is present and verified.' };
  }

  public assertDeterministicResult(result: ControlEvaluation): DeterministicResult {
    return result.result;
  }
}
