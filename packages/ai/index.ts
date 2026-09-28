export const CONFIDENCE_BANDS = [
  { minimum: 95, label: 'HIGH CONFIDENCE' },
  { minimum: 85, label: 'STRONG' },
  { minimum: 70, label: 'REVIEW' },
  { minimum: 0, label: 'UNCERTAIN' }
] as const;

export const MODEL_GOVERNANCE_METRICS = [
  'precision',
  'recall',
  'F1',
  'mAP',
  'IoU',
  'calibration',
  'false_negative_rate',
  'false_positive_rate'
] as const;

export type ModelProvider = 'PRIMARY_VISION' | 'SECONDARY_VISION' | 'LOCAL_MODEL' | 'CLOUD_MODEL' | 'EMBEDDING_MODEL' | 'REASONING_MODEL' | 'OCR_MODEL';
export type ModelApproval = 'DRAFT' | 'APPROVED' | 'CHAMPION' | 'CHALLENGER' | 'ROLLED_BACK';

export interface ModelVersion {
  id: string;
  provider: ModelProvider;
  version: string;
  approval: ModelApproval;
  createdAt: string;
}
