import { AgentStatus, ConsensusResult, EvaluationFinding } from '../../src/types/evaluation';

export class ConsensusEngine {
  static buildConsensus(agents: AgentStatus[], findings: EvaluationFinding[]): ConsensusResult {
    const activeAgents = agents.filter(a => a.status === 'COMPLETED');
    const avgConfidence = activeAgents.reduce((acc, a) => acc + (a.confidence || 0), 0) / activeAgents.length;
    
    const compliantCount = findings.filter(f => f.status === 'COMPLIANT').length;
    const nonCompliantCount = findings.filter(f => f.status === 'NON_COMPLIANT').length;
    
    let verdict: ConsensusResult['verdict'] = 'REVIEW_REQUIRED';
    if (nonCompliantCount === 0 && compliantCount > 0 && avgConfidence > 0.8) {
      verdict = 'PASSED';
    } else if (nonCompliantCount > 0) {
      verdict = 'FAILED';
    }

    const maxRisk = Math.max(...agents.map(a => a.riskScore || 0));
    let riskRating: ConsensusResult['riskRating'] = 'LOW';
    if (maxRisk > 0.8) riskRating = 'CRITICAL';
    else if (maxRisk > 0.5) riskRating = 'HIGH';
    else if (maxRisk > 0.2) riskRating = 'MEDIUM';

    return {
      verdict,
      overallConfidence: avgConfidence,
      riskRating,
      minorityOpinions: findings.filter(f => f.confidence < 0.6).map(f => `Low confidence finding on rule ${f.ruleId}`),
      conflictingFindings: [],
      consensusScore: (compliantCount / (compliantCount + nonCompliantCount)) * avgConfidence
    };
  }
}
