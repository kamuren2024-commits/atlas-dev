/**
 * Inventory and spare-parts intelligence primitives.
 *
 * These calculations are deliberately deterministic. They only score factors
 * supplied by the caller and expose missing inputs instead of inventing them.
 */

export type InventoryCriticality = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
export type StockRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export interface CriticalityInputs {
  assetImportance?: number;
  gridImpact?: number;
  failureProbability?: number;
  replacementLeadTimeDays?: number;
  supplierAvailability?: number;
  alternativeAvailability?: number;
  projectDependency?: number;
  repairability?: number;
}

export interface CriticalityAssessment {
  level: InventoryCriticality;
  score?: number;
  inputs: CriticalityInputs;
  method: 'weighted-available-factors' | 'insufficient-data';
  missingFactors: string[];
  confidence: 'high' | 'medium' | 'low' | 'none';
  calculatedAt: string;
  dataSource: string;
}

export interface StockRiskInputs {
  quantityOnHand: number;
  reservedQuantity: number;
  dailyConsumption?: number;
  leadTimeDays?: number;
  safetyStock?: number;
  openPurchaseOrderQuantity?: number;
}

export interface StockRiskAssessment {
  level: StockRiskLevel;
  availableQuantity: number;
  projectedQuantityAtLeadTime?: number;
  stockoutDate?: string;
  stockoutProbability?: number;
  recommendedAction: string;
  method: 'deterministic-runout' | 'insufficient-data';
  missingInputs: string[];
  calculatedAt: string;
  dataSource: string;
}

const FACTOR_NAMES: Array<keyof CriticalityInputs> = [
  'assetImportance',
  'gridImpact',
  'failureProbability',
  'replacementLeadTimeDays',
  'supplierAvailability',
  'alternativeAvailability',
  'projectDependency',
  'repairability',
];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function normaliseLeadTime(value: number): number {
  return clamp(value / 180 * 100);
}

function inverseAvailability(value: number): number {
  return 100 - clamp(value);
}

export function assessCriticality(inputs: CriticalityInputs, dataSource: string): CriticalityAssessment {
  const values: number[] = [];
  if (inputs.assetImportance !== undefined) values.push(clamp(inputs.assetImportance));
  if (inputs.gridImpact !== undefined) values.push(clamp(inputs.gridImpact));
  if (inputs.failureProbability !== undefined) values.push(clamp(inputs.failureProbability));
  if (inputs.replacementLeadTimeDays !== undefined) values.push(normaliseLeadTime(inputs.replacementLeadTimeDays));
  if (inputs.supplierAvailability !== undefined) values.push(inverseAvailability(inputs.supplierAvailability));
  if (inputs.alternativeAvailability !== undefined) values.push(inverseAvailability(inputs.alternativeAvailability));
  if (inputs.projectDependency !== undefined) values.push(clamp(inputs.projectDependency));
  if (inputs.repairability !== undefined) values.push(inverseAvailability(inputs.repairability));

  const missingFactors = FACTOR_NAMES.filter(name => inputs[name] === undefined);
  const calculatedAt = new Date().toISOString();
  if (values.length === 0) {
    return {
      level: 'UNVERIFIED',
      inputs,
      method: 'insufficient-data',
      missingFactors,
      confidence: 'none',
      calculatedAt,
      dataSource,
    };
  }

  const score = Math.round(values.reduce((total, value) => total + value, 0) / values.length);
  return {
    level: score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW',
    score,
    inputs,
    method: 'weighted-available-factors',
    missingFactors,
    confidence: values.length >= 6 ? 'high' : values.length >= 3 ? 'medium' : 'low',
    calculatedAt,
    dataSource,
  };
}

export function assessStockRisk(inputs: StockRiskInputs, dataSource: string): StockRiskAssessment {
  const calculatedAt = new Date().toISOString();
  const availableQuantity = Math.max(0, inputs.quantityOnHand - inputs.reservedQuantity);
  const missingInputs: string[] = [];
  if (inputs.dailyConsumption === undefined || inputs.dailyConsumption <= 0) missingInputs.push('dailyConsumption');
  if (inputs.leadTimeDays === undefined || inputs.leadTimeDays < 0) missingInputs.push('leadTimeDays');

  if (missingInputs.length > 0) {
    return {
      level: 'UNVERIFIED',
      availableQuantity,
      recommendedAction: 'Collect validated consumption and supplier lead-time data before forecasting stockout.',
      method: 'insufficient-data',
      missingInputs,
      calculatedAt,
      dataSource,
    };
  }

  const demand = inputs.dailyConsumption as number;
  const leadTime = inputs.leadTimeDays as number;
  const inbound = inputs.openPurchaseOrderQuantity || 0;
  const projectedQuantityAtLeadTime = availableQuantity + inbound - demand * leadTime;
  const daysToStockout = availableQuantity / demand;
  const stockoutDate = new Date(Date.now() + daysToStockout * 86400000).toISOString();
  const safetyStock = inputs.safetyStock || 0;
  const stockoutProbability = projectedQuantityAtLeadTime <= 0 ? 1 : projectedQuantityAtLeadTime < safetyStock ? 0.7 : 0.1;
  const level: StockRiskLevel = projectedQuantityAtLeadTime <= 0
    ? 'CRITICAL'
    : projectedQuantityAtLeadTime < safetyStock
      ? 'HIGH'
      : projectedQuantityAtLeadTime < safetyStock * 1.5
        ? 'MEDIUM'
        : 'LOW';

  return {
    level,
    availableQuantity,
    projectedQuantityAtLeadTime,
    stockoutDate,
    stockoutProbability,
    recommendedAction: level === 'CRITICAL'
      ? 'Escalate replenishment or approved inter-warehouse transfer.'
      : level === 'HIGH'
        ? 'Review reorder requirement and maintenance/project reservations.'
        : 'Monitor against the validated demand plan.',
    method: 'deterministic-runout',
    missingInputs,
    calculatedAt,
    dataSource,
  };
}
