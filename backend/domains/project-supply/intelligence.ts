export interface ProjectSupplyRequirement {
  id: string;
  projectId: string;
  workPackageId?: string | null;
  requirementType: string;
  productId?: string | null;
  description: string;
  requiredQuantity: number;
  unit: string;
  requiredBy?: string | null;
  deliveryLocation?: string | null;
  criticality: string;
  procurementStatus: string;
  supplierId?: string | null;
  contractId?: string | null;
  purchaseOrderId?: string | null;
  milestoneId?: string | null;
}

export interface SupplyPositionInput {
  requirement: ProjectSupplyRequirement;
  grossRequirement: number;
  availableStock: number;
  reservedStock: number;
  allocatedStock: number;
  openPoQuantity: number;
  expectedShipmentQuantity: number;
  expectedReceiptDate?: string | null;
}

export interface SupplyPosition {
  requirementId: string;
  productId?: string | null;
  grossRequirement: number;
  availableStock: number;
  reservedStock: number;
  allocatedStock: number;
  openPoQuantity: number;
  expectedShipmentQuantity: number;
  expectedReceiptDate?: string | null;
  projectedShortage: number;
  projectedSurplus: number;
  status: 'COVERED' | 'SHORTAGE' | 'NO_PRODUCT_LINK';
  formula: string;
  sources: string[];
}

export function calculateSupplyPosition(input: SupplyPositionInput): SupplyPosition {
  const {
    grossRequirement,
    availableStock,
    reservedStock,
    allocatedStock,
    openPoQuantity,
    expectedShipmentQuantity,
  } = input;
  if (!input.requirement.productId) {
    return {
      requirementId: input.requirement.id,
      productId: null,
      grossRequirement,
      availableStock,
      reservedStock,
      allocatedStock,
      openPoQuantity,
      expectedShipmentQuantity,
      expectedReceiptDate: input.expectedReceiptDate,
      projectedShortage: 0,
      projectedSurplus: 0,
      status: 'NO_PRODUCT_LINK',
      formula: 'unavailable: requirement has no product_id',
      sources: ['project_supply_requirement'],
    };
  }

  const projectedBalance = availableStock - reservedStock - allocatedStock + openPoQuantity;
  return {
    requirementId: input.requirement.id,
    productId: input.requirement.productId,
    grossRequirement,
    availableStock,
    reservedStock,
    allocatedStock,
    openPoQuantity,
    expectedShipmentQuantity,
    expectedReceiptDate: input.expectedReceiptDate,
    projectedShortage: Math.max(0, grossRequirement - projectedBalance),
    projectedSurplus: Math.max(0, projectedBalance - grossRequirement),
    status: projectedBalance >= grossRequirement ? 'COVERED' : 'SHORTAGE',
    formula: 'projected balance = available stock - reserved stock - allocated stock + open PO quantity',
    sources: ['project_supply_requirement', 'logistics_stock', 'logistics_order_item', 'logistics_order'],
  };
}
