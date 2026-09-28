export const PROCUREMENT_LIFECYCLE = [
  'NEED_IDENTIFIED',
  'REQUIREMENT_CREATED',
  'PLANNED',
  'APPROVED',
  'PROCUREMENT_INITIATED',
  'SOURCING',
  'TENDER_PUBLISHED',
  'BIDDING',
  'EVALUATION',
  'AWARD_DECISION',
  'AWARDED',
  'CONTRACTING',
  'CONTRACT_ACTIVE',
  'PO_ISSUED',
  'DELIVERY',
  'CLOSED',
  'CANCELLED',
  'SUSPENDED',
  'REJECTED',
  'FAILED',
  'RE-TENDERED',
  'DISPUTED',
] as const;

export type ProcurementLifecycleStage = typeof PROCUREMENT_LIFECYCLE[number];

export interface CompetitionSignal {
  status: 'SIGNAL' | 'INSUFFICIENT_EVIDENCE';
  bidderCount: number;
  threshold: number;
  classification: 'LOW_PARTICIPATION' | 'NO_SIGNAL' | 'UNAVAILABLE';
  interpretation: string;
}

export function calculateCompetitionSignal(
  bidderCount: number | null | undefined,
  threshold = 2,
): CompetitionSignal {
  if (bidderCount === null || bidderCount === undefined) {
    return {
      status: 'INSUFFICIENT_EVIDENCE',
      bidderCount: 0,
      threshold,
      classification: 'UNAVAILABLE',
      interpretation: 'Bidder participation data is unavailable; no competition conclusion is made.',
    };
  }
  const count = Math.max(0, Math.floor(bidderCount));
  if (count < threshold) {
    return {
      status: 'SIGNAL',
      bidderCount: count,
      threshold,
      classification: 'LOW_PARTICIPATION',
      interpretation: 'Low participation is a review signal, not evidence of collusion or misconduct.',
    };
  }
  return {
    status: 'INSUFFICIENT_EVIDENCE',
    bidderCount: count,
    threshold,
    classification: 'NO_SIGNAL',
    interpretation: 'Participation meets the configured threshold; no adverse conclusion is made.',
  };
}

export function calculatePipelineMetrics(stages: string[], values: Array<number | null | undefined>) {
  const counts = stages.reduce<Record<string, number>>((result, stage) => {
    result[stage] = (result[stage] || 0) + 1;
    return result;
  }, {});
  const observedValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  return {
    counts,
    observedCaseCount: stages.length,
    observedValueTotal: observedValues.reduce((total, value) => total + value, 0),
    dataStatus: stages.length ? 'DERIVED' : 'UNAVAILABLE',
  };
}
