import crypto from 'crypto';
import { PolicyEngine, PolicyEvaluation, PolicyInput } from './policy-engine';

export class OpaPolicyClient implements PolicyEngine {
  constructor(
    private readonly endpoint: string,
    private readonly policyPath: string,
    private readonly timeoutMs = 5000
  ) {
    if (!endpoint || !policyPath) {
      throw new Error('OPA endpoint and policy path are required.');
    }
  }

  public async evaluate(input: PolicyInput): Promise<PolicyEvaluation> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const inputHash = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
    try {
      const response = await fetch(`${this.endpoint.replace(/\/$/, '')}/v1/data/${this.policyPath}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input }),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`OPA returned HTTP ${response.status}.`);
      }
      const body = await response.json() as {
        result?: {
          decision?: PolicyEvaluation['decision'];
          policyId?: string;
          policyVersion?: string;
          reasonCodes?: string[];
        };
      };
      const result = body.result;
      if (!result?.decision || !['ALLOW', 'DENY', 'REQUIRE_APPROVAL', 'ESCALATE'].includes(result.decision)) {
        throw new Error('OPA returned an invalid policy decision.');
      }
      return {
        decisionId: crypto.randomUUID(),
        policyId: result.policyId || this.policyPath,
        policyVersion: result.policyVersion || 'unknown',
        inputHash,
        decision: result.decision,
        reasonCodes: result.reasonCodes || [],
        timestamp: new Date().toISOString(),
        traceId: input.environment.traceId
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
