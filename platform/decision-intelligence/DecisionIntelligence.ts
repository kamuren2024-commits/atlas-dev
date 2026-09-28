import { ObservabilityEngine } from '../observability/Observability';
import { generateShortId } from '../../src/core/shared/crypto';
import { DecisionStore } from '../persistence';

export interface DecisionRecord {
  id: string;
  tenantId: string;
  agentId: string;
  decisionName: string;
  timestamp: string;
  reasoning: string[];
  evidenceKeys: string[]; // Ties into Knowledge Lineage or Ontological entity IDs
  alternativesEvaluated: Array<{
    optionName: string;
    score: number;
    reasonToDiscard: string;
  }>;
  confidenceScore: number; // 0 to 1 representing certainty
  outcomeStatus: 'optimal' | 'remediated' | 'disputed' | 'unverified';
  traceId: string;
}

export class DecisionIntelligenceFabric {
  private static instance: DecisionIntelligenceFabric;
  private decisions: DecisionRecord[] = [];

  private constructor() {
    this.seedDecisions();
  }

  public static getInstance(): DecisionIntelligenceFabric {
    if (!DecisionIntelligenceFabric.instance) {
      DecisionIntelligenceFabric.instance = new DecisionIntelligenceFabric();
    }
    return DecisionIntelligenceFabric.instance;
  }

  /**
   * Log a new decision record to the searchable audit ledger
   */
  public logDecision(record: Omit<DecisionRecord, 'id' | 'timestamp'>): string {
    const decisionId = generateShortId('dec');
    const fullRecord: DecisionRecord = {
      ...record,
      id: decisionId,
      timestamp: new Date().toISOString()
    };
    
    this.decisions.push(fullRecord);

    // Maintain size limits (cap at 1000 items)
    if (this.decisions.length > 1000) {
      this.decisions.shift();
    }

    // Persist to database (async, non-blocking)
    DecisionStore.save({
      decisionId: decisionId,
      tenantId: record.tenantId,
      agentId: record.agentId,
      outcome: record.outcomeStatus,
      confidence: record.confidenceScore,
      reasoningChain: record.reasoning,
      evidenceKeys: record.evidenceKeys,
      alternatives: record.alternativesEvaluated,
      traceId: record.traceId,
    }).catch(err => console.error('[DecisionIntelligence] Failed to persist decision:', err.message));

    return decisionId;
  }

  /**
   * Powerful search engine locating historical choices by metadata
   */
  public queryDecisions(filters: {
    tenantId?: string;
    agentId?: string;
    outcomeStatus?: DecisionRecord['outcomeStatus'];
    minimumConfidence?: number;
  }): DecisionRecord[] {
    return this.decisions.filter(dec => {
      if (filters.tenantId && dec.tenantId !== filters.tenantId) return false;
      if (filters.agentId && dec.agentId !== filters.agentId) return false;
      if (filters.outcomeStatus && dec.outcomeStatus !== filters.outcomeStatus) return false;
      if (filters.minimumConfidence && dec.confidenceScore < filters.minimumConfidence) return false;
      return true;
    });
  }

  public getDecision(id: string): DecisionRecord | undefined {
    return this.decisions.find(d => d.id === id);
  }

  /**
   * Replays exactly what was observed when the decision occurred
   */
  public replayDecision(id: string): { decision: DecisionRecord; traceTrail: any[] } {
    const dec = this.getDecision(id);
    if (!dec) throw new Error(`Decision [${id}] not registered in Fabric.`);

    const traceTrail = ObservabilityEngine.getTraceTree(dec.traceId);
    return {
      decision: dec,
      traceTrail
    };
  }

  /**
   * Performs dynamic side-by-side analytical comparisons of alternative options (Requirement 4)
   */
  public compareOptions(id: string): {
    chosen: { name: string; score: number };
    alternatives: Array<{ name: string; score: number; deltaPercent: number }>;
  } {
    const dec = this.getDecision(id);
    if (!dec) throw new Error(`Decision [${id}] missing for comparative visualization.`);

    const chosenScore = dec.confidenceScore * 100;
    const items = dec.alternativesEvaluated.map(alt => {
      const delta = chosenScore - (alt.score * 100);
      return {
        name: alt.optionName,
        score: alt.score * 100,
        deltaPercent: Number(delta.toFixed(2))
      };
    });

    return {
      chosen: { name: dec.decisionName, score: chosenScore },
      alternatives: items
    };
  }

  private seedDecisions(): void {
    this.logDecision({
      tenantId: 'GLOBAL_TENANT',
      agentId: 'supplier-risk-agent',
      decisionName: 'Reroute Shanghai Logistics via Mombasa alternate carrier',
      reasoning: [
        'Geopolitical SCM risk indicators rose beyond critical trigger threshold (75)',
        'Shanghai Electrical Cable output delayed by severe shipping backlogs',
        'Mombasa terminal alternative offers immediate availability with optimal transit timelines'
      ],
      evidenceKeys: ['Supplier:shanghai-cable-corp', 'Contract:contract-susp-l4'],
      alternativesEvaluated: [
        {
          optionName: 'Retain Shanghai Direct Route and accept penalty clauses',
          score: 0.42,
          reasonToDiscard: 'Lead time penalty costs exceeded alternative carrier freight margins '
        },
        {
          optionName: 'Initiate active supply search via Hamburg depot network',
          score: 0.68,
          reasonToDiscard: 'Import duties across German regulatory zones decreased net margin targets'
        }
      ],
      confidenceScore: 0.94,
      outcomeStatus: 'optimal',
      traceId: 'trc-default-routing-seed'
    });
  }
}
