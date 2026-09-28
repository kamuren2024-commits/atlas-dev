import crypto from 'crypto';

export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'ESCALATE';

export interface PolicyInput {
  subject: { id: string; roles: string[]; tenantId: string };
  action: string;
  resource: { type: string; id: string; tenantId: string; classification?: string };
  environment: { workflowState?: string; evaluationStage?: string; traceId: string };
}

export interface PolicyEvaluation {
  decisionId: string;
  policyId: string;
  policyVersion: string;
  inputHash: string;
  decision: PolicyDecision;
  reasonCodes: string[];
  timestamp: string;
  traceId: string;
}

export interface PolicyEngine {
  evaluate(input: PolicyInput): Promise<PolicyEvaluation>;
}

export class FailClosedPolicyEngine implements PolicyEngine {
  public async evaluate(input: PolicyInput): Promise<PolicyEvaluation> {
    const inputHash = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const sameTenant = input.subject.tenantId === input.resource.tenantId;
    const decision: PolicyDecision = sameTenant ? 'REQUIRE_APPROVAL' : 'DENY';
    return {
      decisionId: crypto.randomUUID(),
      policyId: 'evaluation-os-default',
      policyVersion: 'unconfigured-v1',
      inputHash,
      decision,
      reasonCodes: sameTenant ? ['HUMAN_APPROVAL_REQUIRED'] : ['TENANT_ISOLATION_FAILURE'],
      timestamp: new Date().toISOString(),
      traceId: input.environment.traceId
    };
  }
}
