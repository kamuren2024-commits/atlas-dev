import { DecisionRecommendation, ManagedDocument, EvaluationFinding } from '../../src/types/evaluation';
import { v4 as uuidv4 } from 'uuid';

export class DecisionIntelligenceEngine {
  private static instance: DecisionIntelligenceEngine;
  private decisions: Map<string, DecisionRecommendation[]> = new Map();

  private constructor() {}

  public static getInstance(): DecisionIntelligenceEngine {
    if (!DecisionIntelligenceEngine.instance) {
      DecisionIntelligenceEngine.instance = new DecisionIntelligenceEngine();
    }
    return DecisionIntelligenceEngine.instance;
  }

  public generateRecommendation(evaluationId: string, findings: EvaluationFinding[]): DecisionRecommendation {
    const nonCompliant = findings.filter(f => f.status === 'NON_COMPLIANT');
    const confidence = findings.reduce((acc, f) => acc + f.confidence, 0) / findings.length;
    
    let decision: DecisionRecommendation['decision'] = 'AWARD';
    const evidence: string[] = [];
    const laws: string[] = [];
    const risks: string[] = [];

    if (nonCompliant.length > 0) {
      decision = 'REJECT';
      nonCompliant.forEach(f => {
        risks.push(`Violation of ${f.ruleId}`);
        laws.push(f.ruleId);
        evidence.push(...f.reasoningChain);
      });
    }

    const recommendation: DecisionRecommendation = {
      id: uuidv4(),
      evaluationId,
      decision,
      confidence,
      evidence,
      applicableLaws: Array.from(new Set(laws)),
      riskAssessment: {
        score: nonCompliant.length * 20,
        findings: risks
      },
      alternatives: decision === 'REJECT' ? ['Request clarification', 'Technical re-evaluation'] : ['Proceed to Financial Stage'],
      outcomes: decision === 'AWARD' ? ['Successful delivery', 'Compliance satisfied'] : ['Procurement delay', 'Potential appeal'],
      status: 'DRAFT'
    };

    const existing = this.decisions.get(evaluationId) || [];
    existing.push(recommendation);
    this.decisions.set(evaluationId, existing);

    return recommendation;
  }

  public getDecisions(evaluationId: string) {
    return this.decisions.get(evaluationId) || [];
  }
}
