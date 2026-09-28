/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Mission Memory & Pattern Learning
 * 
 * Persist successful investigations for pattern matching and future optimization
 */

import { Mission, RootCauseAnalysis, Recommendation } from './types';

interface MissionRecord {
  missionId: string;
  type: string;
  severity: string;
  rootCause: string;
  resolutionTime: number;
  bestRecommendation: string;
  outcome: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  affectedAssets: string[];
  timestamp: string;
  tags: string[];
}

interface PatternMatch {
  pattern: string;
  matchCount: number;
  avgResolutionTime: number;
  successRate: number;
  recommendedApproach: string;
}

/**
 * Mission Memory Engine
 */
export class MissionMemory {
  private static instance: MissionMemory | null = null;
  private records: MissionRecord[] = [];
  private patterns: Map<string, PatternMatch> = new Map();

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): MissionMemory {
    if (!MissionMemory.instance) {
      MissionMemory.instance = new MissionMemory();
    }
    return MissionMemory.instance;
  }

  /**
   * Record mission completion
   */
  public recordMission(
    mission: Mission,
    rootCause: RootCauseAnalysis,
    recommendation: Recommendation,
    resolutionTime: number,
    outcome: 'SUCCESS' | 'PARTIAL' | 'FAILED'
  ): void {
    console.log('[MISSION-MEMORY] Recording mission:', mission.id);

    const record: MissionRecord = {
      missionId: mission.id,
      type: mission.type,
      severity: mission.severity,
      rootCause: rootCause.primaryHypothesis.title,
      resolutionTime,
      bestRecommendation: recommendation.title,
      outcome,
      affectedAssets: mission.affectedAssets,
      timestamp: new Date().toISOString(),
      tags: this.generateTags(mission, rootCause, recommendation),
    };

    this.records.push(record);

    // Update patterns
    this.updatePatterns(record);

    console.log('[MISSION-MEMORY] Mission recorded. Total records:', this.records.length);
  }

  /**
   * Search similar missions
   */
  public findSimilarMissions(
    missionType: string,
    severity?: string,
    assetId?: string
  ): MissionRecord[] {
    return this.records.filter((r) => {
      const typeMatch = r.type === missionType;
      const severityMatch = !severity || r.severity === severity;
      const assetMatch = !assetId || r.affectedAssets.includes(assetId);

      return typeMatch && severityMatch && assetMatch;
    });
  }

  /**
   * Get pattern matches
   */
  public getPatternMatches(missionType: string): PatternMatch[] {
    const matches: PatternMatch[] = [];

    this.patterns.forEach((pattern, key) => {
      if (key.startsWith(missionType)) {
        matches.push(pattern);
      }
    });

    return matches.sort((a, b) => b.matchCount - a.matchCount);
  }

  /**
   * Get recommended approach for mission
   */
  public getRecommendedApproach(missionType: string, severity: string): string | null {
    const key = `${missionType}_${severity}`;
    const pattern = this.patterns.get(key);

    if (pattern && pattern.successRate > 0.75) {
      return pattern.recommendedApproach;
    }

    return null;
  }

  /**
   * Get resolution time estimate
   */
  public getResolutionTimeEstimate(missionType: string, severity: string): number {
    const key = `${missionType}_${severity}`;
    const pattern = this.patterns.get(key);

    if (pattern) {
      return pattern.avgResolutionTime;
    }

    // Default estimates
    const defaults: Record<string, Record<string, number>> = {
      CRITICAL_OUTAGE: { CRITICAL: 45, HIGH: 60, MEDIUM: 90 },
      CONGESTION: { CRITICAL: 15, HIGH: 30, MEDIUM: 45 },
      CASCADE_RISK: { CRITICAL: 20, HIGH: 40, MEDIUM: 60 },
    };

    return defaults[missionType]?.[severity] || 60;
  }

  /**
   * Get success metrics
   */
  public getSuccessMetrics(missionType: string): {
    successRate: number;
    avgResolutionTime: number;
    totalAttempts: number;
  } {
    const relevant = this.records.filter((r) => r.type === missionType);

    if (relevant.length === 0) {
      return { successRate: 0, avgResolutionTime: 0, totalAttempts: 0 };
    }

    const successes = relevant.filter((r) => r.outcome === 'SUCCESS').length;
    const totalTime = relevant.reduce((sum, r) => sum + r.resolutionTime, 0);

    return {
      successRate: successes / relevant.length,
      avgResolutionTime: totalTime / relevant.length,
      totalAttempts: relevant.length,
    };
  }

  /**
   * Generate tags for mission
   */
  private generateTags(
    mission: Mission,
    rootCause: RootCauseAnalysis,
    recommendation: Recommendation
  ): string[] {
    const tags: string[] = [];

    // Type tag
    tags.push(`type:${mission.type}`);

    // Severity tag
    tags.push(`severity:${mission.severity}`);

    // Root cause tag
    if (rootCause.primaryHypothesis.rank === 'HIGH') {
      tags.push('confirmed-root-cause');
    } else {
      tags.push('unconfirmed-cause');
    }

    // Recommendation tag
    if (recommendation.risk < 30) {
      tags.push('low-risk-solution');
    } else if (recommendation.risk < 60) {
      tags.push('medium-risk-solution');
    } else {
      tags.push('high-risk-solution');
    }

    // Asset tags
    mission.affectedAssets.forEach((asset) => {
      tags.push(`asset:${asset}`);
    });

    return tags;
  }

  /**
   * Update pattern database
   */
  private updatePatterns(record: MissionRecord): void {
    const key = `${record.type}_${record.severity}`;

    const existing = this.patterns.get(key);

    if (existing) {
      // Update existing pattern
      const newCount = existing.matchCount + 1;
      const newTotalTime =
        existing.avgResolutionTime * existing.matchCount + record.resolutionTime;

      const successCount =
        (existing.successRate * existing.matchCount +
          (record.outcome === 'SUCCESS' ? 1 : 0)) /
        newCount;

      existing.matchCount = newCount;
      existing.avgResolutionTime = newTotalTime / newCount;
      existing.successRate = successCount;
      existing.recommendedApproach = record.bestRecommendation;
    } else {
      // Create new pattern
      this.patterns.set(key, {
        pattern: key,
        matchCount: 1,
        avgResolutionTime: record.resolutionTime,
        successRate: record.outcome === 'SUCCESS' ? 1 : 0,
        recommendedApproach: record.bestRecommendation,
      });
    }
  }

  /**
   * Get all records
   */
  public getAllRecords(): MissionRecord[] {
    return [...this.records];
  }

  /**
   * Clear memory
   */
  public clear(): void {
    this.records = [];
    this.patterns.clear();
  }

  /**
   * Export patterns for analysis
   */
  public exportPatterns(): Record<string, PatternMatch> {
    const exported: Record<string, PatternMatch> = {};

    this.patterns.forEach((pattern, key) => {
      exported[key] = pattern;
    });

    return exported;
  }
}

export default MissionMemory;
