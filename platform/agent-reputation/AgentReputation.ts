export interface AgentScorecard {
  agentId: string;
  successRate: number; // Percentage of tasks resolving successfully without rollback (0 to 100)
  accuracyScore: number; // Confidence/precision rating calculated programmatically (0 to 100)
  costScore: number; // Resource / pricing efficiency index (0 to 100)
  latencyScore: number; // Response time efficiency (0 to 100)
  trustScore: number; // Synthesized operational trust score (0 to 100)
  governanceScore: number; // Adherence to policy-engine restrictions (0 to 100)
  totalEvaluations: number;
}

export class AgentReputationSystem {
  private static instance: AgentReputationSystem;
  private scores = new Map<string, AgentScorecard>();

  private constructor() {}

  public static getInstance(): AgentReputationSystem {
    if (!AgentReputationSystem.instance) {
      AgentReputationSystem.instance = new AgentReputationSystem();
    }
    return AgentReputationSystem.instance;
  }

  /**
   * Evaluates or registers a newly provisioned agent inside the score ledger
   */
  public getOrCreateScorecard(agentId: string): AgentScorecard {
    let scorecard = this.scores.get(agentId);
    if (!scorecard) {
      scorecard = {
        agentId,
        successRate: 95.0, // Default baseline expectation
        accuracyScore: 90.0,
        costScore: 92.0,
        latencyScore: 94.0,
        trustScore: 93.0,
        governanceScore: 100.0, // Start pristine
        totalEvaluations: 0
      };
      this.scores.set(agentId, scorecard);
    }
    return scorecard;
  }

  /**
   * Updates an agents reputation score using progressive rolling weighted Bayesian average
   */
  public updateReputation(
    agentId: string,
    metrics: {
      success: boolean;
      estimatedAccuracy?: number;
      actualLatencyMs?: number;
      governanceBreach?: boolean;
    }
  ): AgentScorecard {
    const card = this.getOrCreateScorecard(agentId);
    card.totalEvaluations += 1;

    // 1. Success Rate rolling update
    const successVal = metrics.success ? 100.0 : 0.0;
    card.successRate = Number(((card.successRate * 19 + successVal) / 20).toFixed(2));

    // 2. Accuracy Update
    if (metrics.estimatedAccuracy !== undefined) {
      card.accuracyScore = Number(((card.accuracyScore * 9 + metrics.estimatedAccuracy) / 10).toFixed(2));
    }

    // 3. Dynamic Latency evaluation
    if (metrics.actualLatencyMs !== undefined) {
      // Benchmark: Under 100ms is perfect (100 pts), 500ms or higher scales down to 50 pts
      const rawLatencyScore = Math.max(0, 100 - (metrics.actualLatencyMs - 100) / 8);
      const cappedLatencyScore = Math.min(100, Math.max(20, rawLatencyScore));
      card.latencyScore = Number(((card.latencyScore * 14 + cappedLatencyScore) / 15).toFixed(2));
    }

    // 4. Governance scorecard
    if (metrics.governanceBreach) {
      card.governanceScore = Math.max(0, card.governanceScore - 15);
    } else {
      card.governanceScore = Math.min(100, card.governanceScore + 0.2); // Symmetrical clean run redemption
    }

    // 5. Synthesize total core Trust Rating
    // Formulate a weighted metric calculation combining overall rates
    const synthesizedTrust = 
      (card.successRate * 0.3) + 
      (card.accuracyScore * 0.2) + 
      (card.latencyScore * 0.15) + 
      (card.governanceScore * 0.25) + 
      (card.costScore * 0.1);

    card.trustScore = Number(synthesizedTrust.toFixed(2));
    return card;
  }

  public getReputation(agentId: string): AgentScorecard {
    return this.getOrCreateScorecard(agentId);
  }

  public getAllReputations(): AgentScorecard[] {
    return Array.from(this.scores.values());
  }

  /**
   * Dynamic router matching based on performance parameters
   */
  public getTopPerformingAgentForCapability(agentIds: string[]): string | null {
    if (agentIds.length === 0) return null;
    let selectedAgent: string | null = null;
    let maxTrust = -1;

    for (const uid of agentIds) {
      const rep = this.getReputation(uid);
      if (rep.trustScore > maxTrust) {
        maxTrust = rep.trustScore;
        selectedAgent = uid;
      }
    }

    return selectedAgent;
  }
}
