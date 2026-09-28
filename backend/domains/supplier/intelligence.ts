export type SupplierDataStatus = 'FACT' | 'DERIVED' | 'INSUFFICIENT_DATA' | 'UNAVAILABLE';

export interface SupplierPerformanceInput {
  totalOrders: number;
  deliveredOrders: number;
  delayedOrders: number;
}

export interface SupplierPerformance {
  status: SupplierDataStatus;
  onTimeDeliveryRate?: number;
  delayRate?: number;
  sampleSize: number;
  formula: string;
  source: string;
  calculatedAt: string;
}

export function calculateSupplierPerformance(
  input: SupplierPerformanceInput,
  source = 'logistics_order',
): SupplierPerformance {
  const sampleSize = Math.max(0, input.totalOrders);
  const calculatedAt = new Date().toISOString();
  if (sampleSize === 0) {
    return {
      status: 'INSUFFICIENT_DATA',
      sampleSize,
      formula: 'deliveredOrders / totalOrders',
      source,
      calculatedAt,
    };
  }

  const deliveredOrders = Math.max(0, Math.min(sampleSize, input.deliveredOrders));
  const delayedOrders = Math.max(0, Math.min(sampleSize, input.delayedOrders));
  return {
    status: 'DERIVED',
    onTimeDeliveryRate: Math.round(((deliveredOrders - delayedOrders) / sampleSize) * 1000) / 10,
    delayRate: Math.round((delayedOrders / sampleSize) * 1000) / 10,
    sampleSize,
    formula: 'onTimeDeliveryRate = (deliveredOrders - delayedOrders) / totalOrders',
    source,
    calculatedAt,
  };
}
