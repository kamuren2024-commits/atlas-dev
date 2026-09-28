/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: TECHNICAL & FINANCIAL EVALUATION ENGINES + SCORE VERSIONING
 * 
 * Directives:
 * - Directive 10: Technical Evaluation Engine (Criteria, weights, thresholds, variance detection)
 * - Directive 11: Financial Evaluation Engine (Quoted price, arithmetic correction PPADA Sec 82, evaluated price)
 * - Directive 14: Score Immutability & Versioning (Never overwrite scores silently; complete history preserved)
 */

export interface EvaluatorScoreEntry {
  scoreId: string;
  tenderId: string;
  bidderId: string;
  criterionId: string;
  evaluatorId: string;
  evaluatorName: string;
  score: number;
  maxScore: number;
  comments: string;
  supportingEvidenceIds: string[];
  version: number;
  isConsensusScore: boolean;
  timestamp: string;
  digitalSignature: string;
  supersededByScoreId?: string;
  supersededReason?: string;
}

export interface ScoreVersionHistoryItem {
  version: number;
  score: number;
  comments: string;
  modifiedBy: string;
  modifiedAt: string;
  changeReason: string;
  previousScore: number;
}

export interface TechnicalCriterionEvaluationSummary {
  criterionId: string;
  criterionTitle: string;
  weight: number;
  threshold: number;
  individualEvaluatorScores: Array<{
    evaluatorId: string;
    evaluatorName: string;
    score: number;
    comments: string;
  }>;
  arithmeticAverage: number;
  maxScore: number;
  minScore: number;
  variancePercent: number;
  varianceExceeds15Percent: boolean;
  agreedConsensusScore: number;
  passedThreshold: boolean;
  auditFlag: boolean;
}

export interface BidderTechnicalEvaluationResult {
  bidderId: string;
  bidderName: string;
  tenderId: string;
  criteriaSummaries: TechnicalCriterionEvaluationSummary[];
  totalTechnicalScore: number; // Max 100
  minimumPassingThreshold: number; // e.g. 70
  technicalQualificationStatus: 'QUALIFIED' | 'DISQUALIFIED';
  varianceAlertsCount: number;
  requiresConsensusDeliberation: boolean;
  evaluatedAt: string;
}

export interface ArithmeticCorrectionLineItem {
  itemNumber: number;
  description: string;
  quantity: number;
  unit: string;
  quotedUnitRate: number;
  quotedTotal: number;
  arithmeticCalculatedTotal: number;
  discrepancy: number;
  correctionApplied: boolean;
  legalJustification: string; // PPADA 2015 Section 82(2)
}

export interface FinancialEvaluationResult {
  bidderId: string;
  bidderName: string;
  tenderId: string;
  originalQuotedPriceKES: number;
  arithmeticCorrections: ArithmeticCorrectionLineItem[];
  netArithmeticDiscrepancyKES: number;
  correctedTenderPriceKES: number;
  applicableTaxesDutiesKES: number;
  conditionalDiscountsKES: number;
  finalEvaluatedPriceKES: number;
  bidderNotifiedOfCorrection: boolean;
  bidderAcceptedCorrection: boolean;
  rank: number;
  isLowestEvaluatedResponsive: boolean;
  evaluatedBy: string;
  evaluationTimestamp: string;
  auditTrailId: string;
}

export class TechnicalAndFinancialEvaluationService {
  private static instance: TechnicalAndFinancialEvaluationService;
  
  // Score registry: scoreId -> EvaluatorScoreEntry
  private scores: Map<string, EvaluatorScoreEntry> = new Map();
  // History: scoreId -> ScoreVersionHistoryItem[]
  private scoreHistories: Map<string, ScoreVersionHistoryItem[]> = new Map();

  private constructor() {
    this.seedSampleScores();
  }

  public static getInstance(): TechnicalAndFinancialEvaluationService {
    if (!TechnicalAndFinancialEvaluationService.instance) {
      TechnicalAndFinancialEvaluationService.instance = new TechnicalAndFinancialEvaluationService();
    }
    return TechnicalAndFinancialEvaluationService.instance;
  }

  private seedSampleScores() {
    const sampleScores: EvaluatorScoreEntry[] = [
      // Bidder 1 - Shanghai Grid
      {
        scoreId: 'SC-SH-01-E1',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-01',
        criterionId: 'TECH-01',
        evaluatorId: 'COMM-01',
        evaluatorName: 'Eng. David Kiprono',
        score: 28,
        maxScore: 30,
        comments: 'Outstanding past projects in comparable 132kV transmission infrastructure.',
        supportingEvidenceIds: ['DOC-SHANGHAI-EXP-01'],
        version: 1,
        isConsensusScore: false,
        timestamp: '2026-08-16T10:00:00Z',
        digitalSignature: 'SIG-DK-01'
      },
      {
        scoreId: 'SC-SH-01-E3',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-01',
        criterionId: 'TECH-01',
        evaluatorId: 'COMM-03',
        evaluatorName: 'Eng. Patrick Ochieng',
        score: 27,
        maxScore: 30,
        comments: 'Demonstrated 6 completed regional projects with clean performance certificates.',
        supportingEvidenceIds: ['DOC-SHANGHAI-EXP-02'],
        version: 1,
        isConsensusScore: false,
        timestamp: '2026-08-16T11:30:00Z',
        digitalSignature: 'SIG-PO-01'
      },
      {
        scoreId: 'SC-SH-02-E1',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-01',
        criterionId: 'TECH-02',
        evaluatorId: 'COMM-01',
        evaluatorName: 'Eng. David Kiprono',
        score: 38,
        maxScore: 40,
        comments: 'Full IEC 62271 compliance with CESI certified type test reports.',
        supportingEvidenceIds: ['DOC-SHANGHAI-TEST-01'],
        version: 1,
        isConsensusScore: false,
        timestamp: '2026-08-16T10:30:00Z',
        digitalSignature: 'SIG-DK-02'
      },
      {
        scoreId: 'SC-SH-02-E3',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-01',
        criterionId: 'TECH-02',
        evaluatorId: 'COMM-03',
        evaluatorName: 'Eng. Patrick Ochieng',
        score: 37,
        maxScore: 40,
        comments: 'Excellent GIS switchgear specifications; all OEM guarantees verified.',
        supportingEvidenceIds: ['DOC-SHANGHAI-TEST-02'],
        version: 1,
        isConsensusScore: false,
        timestamp: '2026-08-16T12:00:00Z',
        digitalSignature: 'SIG-PO-02'
      },
      // Bidder 2 - Athi River
      {
        scoreId: 'SC-AT-01-E1',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-02',
        criterionId: 'TECH-01',
        evaluatorId: 'COMM-01',
        evaluatorName: 'Eng. David Kiprono',
        score: 24,
        maxScore: 30,
        comments: '3 similar projects documented in Kenya and Tanzania.',
        supportingEvidenceIds: ['DOC-ATHI-EXP-01'],
        version: 1,
        isConsensusScore: false,
        timestamp: '2026-08-16T14:00:00Z',
        digitalSignature: 'SIG-DK-03'
      },
      {
        scoreId: 'SC-AT-01-E3',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-02',
        criterionId: 'TECH-01',
        evaluatorId: 'COMM-03',
        evaluatorName: 'Eng. Patrick Ochieng',
        score: 22,
        maxScore: 30,
        comments: 'Adequate track record, satisfies minimum experience requirement.',
        supportingEvidenceIds: ['DOC-ATHI-EXP-02'],
        version: 1,
        isConsensusScore: false,
        timestamp: '2026-08-16T15:00:00Z',
        digitalSignature: 'SIG-PO-03'
      }
    ];

    for (const sc of sampleScores) {
      this.scores.set(sc.scoreId, sc);
    }
  }

  /**
   * Record or update an evaluator score with full audit versioning (Directive 14)
   */
  public recordScore(
    scoreEntry: Omit<EvaluatorScoreEntry, 'scoreId' | 'version' | 'timestamp'>,
    actorId: string,
    changeReason?: string
  ): EvaluatorScoreEntry {
    const existing = Array.from(this.scores.values()).find(
      s => s.tenderId === scoreEntry.tenderId && 
           s.bidderId === scoreEntry.bidderId && 
           s.criterionId === scoreEntry.criterionId && 
           s.evaluatorId === scoreEntry.evaluatorId
    );

    if (existing) {
      // Create new version, archive old
      const newVersion = existing.version + 1;
      const historyList = this.scoreHistories.get(existing.scoreId) || [];
      historyList.push({
        version: existing.version,
        score: existing.score,
        comments: existing.comments,
        modifiedBy: actorId,
        modifiedAt: new Date().toISOString(),
        changeReason: changeReason || 'Evaluator updated score post-deliberation.',
        previousScore: existing.score
      });
      this.scoreHistories.set(existing.scoreId, historyList);

      existing.score = scoreEntry.score;
      existing.comments = scoreEntry.comments;
      existing.supportingEvidenceIds = scoreEntry.supportingEvidenceIds;
      existing.version = newVersion;
      existing.timestamp = new Date().toISOString();
      existing.digitalSignature = `SIG-VER-${newVersion}-${Date.now()}`;
      return existing;
    } else {
      const newId = `SC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newScore: EvaluatorScoreEntry = {
        ...scoreEntry,
        scoreId: newId,
        version: 1,
        timestamp: new Date().toISOString()
      };
      this.scores.set(newId, newScore);
      return newScore;
    }
  }

  public getScoreHistory(scoreId: string): ScoreVersionHistoryItem[] {
    return this.scoreHistories.get(scoreId) || [];
  }

  /**
   * Compute comprehensive technical evaluation for a bidder (Directive 10)
   */
  public computeTechnicalEvaluation(
    tenderId: string, 
    bidderId: string, 
    bidderName: string
  ): BidderTechnicalEvaluationResult {
    const bidderScores = Array.from(this.scores.values()).filter(
      s => s.tenderId === tenderId && s.bidderId === bidderId
    );

    // Group by criterion
    const criteriaMap = new Map<string, EvaluatorScoreEntry[]>();
    for (const sc of bidderScores) {
      const list = criteriaMap.get(sc.criterionId) || [];
      list.push(sc);
      criteriaMap.set(sc.criterionId, list);
    }

    const criteriaSummaries: TechnicalCriterionEvaluationSummary[] = [];
    let totalScore = 0;
    let varianceAlerts = 0;

    for (const [critId, entries] of criteriaMap.entries()) {
      const scores = entries.map(e => e.score);
      const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
      const max = Math.max(...scores);
      const min = Math.min(...scores);
      const maxWeight = entries[0]?.maxScore || 30;
      const variancePercent = maxWeight > 0 ? ((max - min) / maxWeight) * 100 : 0;
      const varianceExceeds15 = variancePercent > 15;

      if (varianceExceeds15) varianceAlerts++;

      const summary: TechnicalCriterionEvaluationSummary = {
        criterionId: critId,
        criterionTitle: critId === 'TECH-01' ? 'Specific Experience' : critId === 'TECH-02' ? 'Technical Specifications' : 'Methodology & Staff',
        weight: maxWeight,
        threshold: maxWeight * 0.7,
        individualEvaluatorScores: entries.map(e => ({
          evaluatorId: e.evaluatorId,
          evaluatorName: e.evaluatorName,
          score: e.score,
          comments: e.comments
        })),
        arithmeticAverage: Number(avg.toFixed(2)),
        maxScore: max,
        minScore: min,
        variancePercent: Number(variancePercent.toFixed(1)),
        varianceExceeds15Percent: varianceExceeds15,
        agreedConsensusScore: Number(avg.toFixed(2)),
        passedThreshold: avg >= (maxWeight * 0.7),
        auditFlag: varianceExceeds15
      };

      totalScore += summary.agreedConsensusScore;
      criteriaSummaries.push(summary);
    }

    const minPass = 70;
    return {
      bidderId,
      bidderName,
      tenderId,
      criteriaSummaries,
      totalTechnicalScore: Number(totalScore.toFixed(2)),
      minimumPassingThreshold: minPass,
      technicalQualificationStatus: totalScore >= minPass ? 'QUALIFIED' : 'DISQUALIFIED',
      varianceAlertsCount: varianceAlerts,
      requiresConsensusDeliberation: varianceAlerts > 0,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Perform financial evaluation with arithmetic correction checks (Directive 11)
   */
  public evaluateFinancialProposal(
    tenderId: string,
    bidderId: string,
    bidderName: string,
    originalQuotedKES: number,
    corrections: ArithmeticCorrectionLineItem[]
  ): FinancialEvaluationResult {
    let netDiscrepancy = 0;
    for (const c of corrections) {
      if (c.correctionApplied) {
        netDiscrepancy += c.discrepancy;
      }
    }

    const correctedPrice = originalQuotedKES + netDiscrepancy;
    const finalEvaluatedPrice = correctedPrice; // Net of taxes if specified in STD

    return {
      bidderId,
      bidderName,
      tenderId,
      originalQuotedPriceKES: originalQuotedKES,
      arithmeticCorrections: corrections,
      netArithmeticDiscrepancyKES: netDiscrepancy,
      correctedTenderPriceKES: correctedPrice,
      applicableTaxesDutiesKES: correctedPrice * 0.16, // 16% VAT for tracking
      conditionalDiscountsKES: 0,
      finalEvaluatedPriceKES: finalEvaluatedPrice,
      bidderNotifiedOfCorrection: corrections.length > 0,
      bidderAcceptedCorrection: true,
      rank: 1,
      isLowestEvaluatedResponsive: true,
      evaluatedBy: 'Sarah Mwangi, CPA-K (Finance Member)',
      evaluationTimestamp: new Date().toISOString(),
      auditTrailId: `AUDIT-FIN-${bidderId}-${Date.now()}`
    };
  }
}
