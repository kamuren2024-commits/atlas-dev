/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Root Cause Analysis Engine & Recommendation Engine
 * 
 * Root cause investigation and recommendation ranking
 */

import { Mission, Hypothesis, RootCauseAnalysis, Recommendation, RankedRecommendations } from './types';

/**
 * Root Cause Engine
 */
export class RootCauseEngine {
  private static instance: RootCauseEngine | null = null;

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): RootCauseEngine {
    if (!RootCauseEngine.instance) {
      RootCauseEngine.instance = new RootCauseEngine();
    }
    return RootCauseEngine.instance;
  }

  /**
   * Analyze root cause
   */
  public async analyze(mission: Mission): Promise<RootCauseAnalysis> {
    console.log('[ROOT-CAUSE-ENGINE] Analyzing root cause for mission:', mission.id);

    try {
      // Generate hypotheses based on mission type and evidence
      const hypotheses = this.generateHypotheses(mission);

      // Rank hypotheses by evidence and confidence
      const ranked = this.rankHypotheses(hypotheses, mission);

      // Primary hypothesis is highest ranked
      const primaryHypothesis = ranked[0];

      // Identify missing evidence
      const missingEvidence = this.identifyMissingEvidence(primaryHypothesis, mission);

      // Check verification status
      const verificationStatus = this.checkVerificationStatus(ranked, mission);

      console.log('[ROOT-CAUSE-ENGINE] Primary hypothesis:', primaryHypothesis.title);

      return {
        hypotheses: ranked,
        primaryHypothesis,
        confidence: primaryHypothesis.confidence,
        missingEvidence,
        verificationStatus,
      };
    } catch (error) {
      console.error('[ROOT-CAUSE-ENGINE] Analysis error:', error);

      return {
        hypotheses: [],
        primaryHypothesis: {
          id: 'error',
          title: 'Error during analysis',
          description: String(error),
          rank: 'LOW',
          evidenceFor: [],
          evidenceAgainst: [],
          confidence: 0,
          requiredVerification: ['System recovery', 'Retry analysis'],
        },
        confidence: 0,
        missingEvidence: ['All evidence'],
        verificationStatus: {},
      };
    }
  }

  /**
   * Generate hypotheses based on mission type
   */
  private generateHypotheses(mission: Mission): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    switch (mission.type) {
      case 'CRITICAL_OUTAGE':
        hypotheses.push(
          {
            id: 'h1',
            title: 'Primary Protection Relay Misoperation',
            description: 'Protection relay tripped incorrectly due to CT saturation or setting error',
            rank: 'HIGH',
            evidenceFor: ['Sudden loss', 'No pre-event anomalies'],
            evidenceAgainst: ['Relay self-test passed', 'Recent maintenance'],
            confidence: 82,
            requiredVerification: ['Relay logs', 'CT verification'],
          },
          {
            id: 'h2',
            title: 'Equipment Failure',
            description: 'Transformer or breaker failure caused the outage',
            rank: 'MEDIUM',
            evidenceFor: ['Asset age', 'Recent temperature rise'],
            evidenceAgainst: ['Preventive maintenance recent'],
            confidence: 65,
            requiredVerification: ['Device inspection', 'Oil analysis'],
          },
          {
            id: 'h3',
            title: 'Cyber/Physical Attack',
            description: 'Malicious action caused the disconnection',
            rank: 'LOW',
            evidenceFor: [],
            evidenceAgainst: ['No security alerts', 'Physical access controlled'],
            confidence: 15,
            requiredVerification: ['Security logs', 'SCADA audit'],
          }
        );
        break;

      case 'CASCADE_RISK':
        hypotheses.push(
          {
            id: 'h1',
            title: 'Unstable Equilibrium After Contingency',
            description: 'Loss of key element creates oscillatory instability',
            rank: 'HIGH',
            evidenceFor: ['Frequency trending down', 'Voltage oscillation'],
            evidenceAgainst: ['Damping adequate in N-1 studies'],
            confidence: 78,
            requiredVerification: ['PMU recording', 'Stability simulation'],
          },
          {
            id: 'h2',
            title: 'Secondary Failure Chain',
            description: 'Initial failure triggers chain of dependent failures',
            rank: 'MEDIUM',
            evidenceFor: ['Multiple trips observed', 'Sequential timing'],
            evidenceAgainst: ['Fault locating shows independence'],
            confidence: 60,
            requiredVerification: ['Relay coordination check', 'Load flow'],
          }
        );
        break;

      case 'CONGESTION':
        hypotheses.push(
          {
            id: 'h1',
            title: 'Insufficient Reserve Margin',
            description: 'Available reserves insufficient for demand + contingency',
            rank: 'HIGH',
            evidenceFor: ['High loading', 'Limited transfer capability'],
            evidenceAgainst: ['Recent generation dispatch'],
            confidence: 85,
            requiredVerification: ['OPF run', 'Generator dispatch review'],
          },
          {
            id: 'h2',
            title: 'Forced Outage of Key Line',
            description: 'Unplanned outage of critical transmission element',
            rank: 'MEDIUM',
            evidenceFor: ['Line tripping', 'Load redistribution'],
            evidenceAgainst: [],
            confidence: 72,
            requiredVerification: ['Line inspection', 'Fault records'],
          }
        );
        break;

      default:
        hypotheses.push({
          id: 'h1',
          title: 'Generic Grid Disturbance',
          description: 'Unknown cause - requires detailed investigation',
          rank: 'MEDIUM',
          evidenceFor: [],
          evidenceAgainst: [],
          confidence: 50,
          requiredVerification: ['All available diagnostics'],
        });
    }

    return hypotheses;
  }

  /**
   * Rank hypotheses by evidence and logic
   */
  private rankHypotheses(hypotheses: Hypothesis[], mission: Mission): Hypothesis[] {
    // Score each hypothesis
    const scored = hypotheses.map((h) => {
      let score = h.confidence;

      // Weight by severity
      if (mission.severity === 'CRITICAL') score *= 1.1;

      // Penalize low-ranked hypotheses
      if (h.rank === 'LOW') score *= 0.7;
      else if (h.rank === 'MEDIUM') score *= 0.9;

      // Boost if evidence for/against ratio is good
      if (h.evidenceFor.length > h.evidenceAgainst.length) {
        score *= 1.05;
      }

      return { hypothesis: h, score };
    });

    // Sort by score descending
    return scored.sort((a, b) => b.score - a.score).map((s) => s.hypothesis);
  }

  /**
   * Identify missing evidence
   */
  private identifyMissingEvidence(primaryHypothesis: Hypothesis, mission: Mission): string[] {
    const missing: string[] = [];

    // Check required verification items
    primaryHypothesis.requiredVerification.forEach((item) => {
      // Simulate checking if evidence exists
      if (!mission.evidence.some((e) => e.eventType.includes(item))) {
        missing.push(item);
      }
    });

    return missing;
  }

  /**
   * Check verification status
   */
  private checkVerificationStatus(
    hypotheses: Hypothesis[],
    mission: Mission
  ): Record<string, boolean> {
    const status: Record<string, boolean> = {};

    hypotheses.forEach((h) => {
      // Check if required verifications are available
      const allVerified = h.requiredVerification.every((req) =>
        mission.evidence.some((e) => e.eventType.includes(req))
      );

      status[h.id] = allVerified;
    });

    return status;
  }
}

/**
 * Recommendation Engine
 */
export class RecommendationEngine {
  private static instance: RecommendationEngine | null = null;

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  /**
   * Generate and rank recommendations
   */
  public async generateRecommendations(mission: Mission): Promise<RankedRecommendations> {
    console.log('[RECOMMENDATION-ENGINE] Generating recommendations for mission:', mission.id);

    try {
      // Generate candidate interventions
      const candidates = this.generateCandidates(mission);

      // Rank by multiple criteria
      const ranked = this.rankRecommendations(candidates, mission);

      // "Do nothing" baseline
      const doNothing: Recommendation = {
        id: 'do-nothing',
        title: 'Do Nothing - Monitor Situation',
        description: 'Continue monitoring without intervention',
        expectedBenefit: 0,
        risk: 50, // Risk increases over time
        reversibility: 'HIGH',
        complexity: 'LOW',
        gridImpact: 'None - status quo maintained',
        confidence: 100,
      };

      return {
        bestOption: ranked[0],
        alternative: ranked[1],
        doNothing,
        allRanked: ranked,
      };
    } catch (error) {
      console.error('[RECOMMENDATION-ENGINE] Error generating recommendations:', error);

      return {
        bestOption: {
          id: 'error',
          title: 'Error generating recommendations',
          description: String(error),
          expectedBenefit: 0,
          risk: 100,
          reversibility: 'HIGH',
          complexity: 'HIGH',
          gridImpact: 'Unable to determine',
          confidence: 0,
        },
        doNothing: {
          id: 'do-nothing',
          title: 'Do Nothing',
          description: 'Continue monitoring',
          expectedBenefit: 0,
          risk: 50,
          reversibility: 'HIGH',
          complexity: 'LOW',
          gridImpact: 'None',
          confidence: 100,
        },
        allRanked: [],
      };
    }
  }

  /**
   * Generate candidate interventions
   */
  private generateCandidates(mission: Mission): Recommendation[] {
    const candidates: Recommendation[] = [];

    switch (mission.type) {
      case 'CRITICAL_OUTAGE':
        candidates.push(
          {
            id: 'rec1',
            title: 'Isolate Faulted Element',
            description: 'Manually or automatically disconnect the faulted component',
            expectedBenefit: 80,
            risk: 20,
            reversibility: 'MEDIUM',
            complexity: 'MEDIUM',
            gridImpact: 'Reduced service to some customers, but prevents cascade',
            confidence: 92,
            actionItems: [
              'Send field crew to inspect',
              'Issue SCADA command to isolate',
              'Verify isolation in network model',
            ],
            estimatedDuration: 30,
          },
          {
            id: 'rec2',
            title: 'Energize Backup Path',
            description: 'Route power through alternate transmission path',
            expectedBenefit: 70,
            risk: 35,
            reversibility: 'HIGH',
            complexity: 'HIGH',
            gridImpact: 'Restores service, may increase loading elsewhere',
            confidence: 78,
            actionItems: [
              'Confirm backup path available',
              'Calculate new power flows',
              'Execute reroute procedure',
            ],
            estimatedDuration: 15,
          },
          {
            id: 'rec3',
            title: 'Restore from Conventional Spare',
            description: 'Replace damaged equipment with spare transformer/breaker',
            expectedBenefit: 95,
            risk: 10,
            reversibility: 'MEDIUM',
            complexity: 'HIGH',
            gridImpact: 'Full service restoration after installation',
            confidence: 88,
            actionItems: [
              'Request spare equipment',
              'Schedule installation window',
              'Execute installation',
            ],
            estimatedDuration: 240, // 4 hours
          }
        );
        break;

      case 'CONGESTION':
        candidates.push(
          {
            id: 'rec1',
            title: 'Redispatch Generation',
            description: 'Shift generation to reduce flow on congested line',
            expectedBenefit: 75,
            risk: 15,
            reversibility: 'HIGH',
            complexity: 'MEDIUM',
            gridImpact: 'Relieves congestion, increases cost',
            confidence: 85,
            estimatedDuration: 5,
          },
          {
            id: 'rec2',
            title: 'Demand Response',
            description: 'Request voluntary load reduction from consumers',
            expectedBenefit: 50,
            risk: 25,
            reversibility: 'HIGH',
            complexity: 'MEDIUM',
            gridImpact: 'Reduced demand relieves congestion',
            confidence: 70,
            estimatedDuration: 10,
          },
          {
            id: 'rec3',
            title: 'HVDC Modulation',
            description: 'Adjust HVDC setpoint to reduce AC line flow',
            expectedBenefit: 60,
            risk: 20,
            reversibility: 'HIGH',
            complexity: 'MEDIUM',
            gridImpact: 'Balances AC/DC flows',
            confidence: 80,
            estimatedDuration: 5,
          }
        );
        break;

      case 'CASCADE_RISK':
        candidates.push(
          {
            id: 'rec1',
            title: 'Activate Automatic Load Shedding',
            description: 'Enable underfrequency load shedding relays',
            expectedBenefit: 85,
            risk: 40,
            reversibility: 'MEDIUM',
            complexity: 'LOW',
            gridImpact: 'Controlled blackout of priority loads prevents total collapse',
            confidence: 90,
            estimatedDuration: 1,
          },
          {
            id: 'rec2',
            title: 'Emergency Generation Start',
            description: 'Start emergency generation units to support frequency',
            expectedBenefit: 80,
            risk: 30,
            reversibility: 'HIGH',
            complexity: 'MEDIUM',
            gridImpact: 'Frequency support without load shedding',
            confidence: 82,
            estimatedDuration: 15,
          }
        );
        break;

      default:
        candidates.push({
          id: 'rec1',
          title: 'Monitor and Investigate',
          description: 'Continue monitoring without immediate intervention',
          expectedBenefit: 30,
          risk: 60,
          reversibility: 'HIGH',
          complexity: 'LOW',
          gridImpact: 'Allows problem to potentially worsen',
          confidence: 75,
        });
    }

    return candidates;
  }

  /**
   * Rank recommendations by weighted criteria
   */
  private rankRecommendations(
    candidates: Recommendation[],
    mission: Mission
  ): Recommendation[] {
    const scored = candidates.map((rec) => {
      // Weight different factors based on mission severity
      let score = 0;

      // Expected benefit (40%)
      score += (rec.expectedBenefit / 100) * 40;

      // Risk inverse (30%) - lower risk is better
      score += ((100 - rec.risk) / 100) * 30;

      // Confidence (20%)
      score += (rec.confidence / 100) * 20;

      // Reversibility bonus (10%)
      const reversibilityScore =
        rec.reversibility === 'HIGH' ? 100 : rec.reversibility === 'MEDIUM' ? 50 : 25;
      score += (reversibilityScore / 100) * 10;

      return { recommendation: rec, score };
    });

    // Sort by score descending
    return scored
      .sort((a, b) => b.score - a.score)
      .map((s) => ({
        ...s.recommendation,
        confidence: Math.min(100, s.score),
      }));
  }
}

export default { RootCauseEngine, RecommendationEngine };
