// 2026 KETRACO Enterprise SCM Intelligence Platform
// Bounded Domain: Inventory Domain Models & Schemas

export type CriticalityLevel = 'CRITICAL_SPARE' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface MaterialMaster {
  code: string;
  name: string;
  category: string;
  specifications: string;
  criticality: CriticalityLevel;
  supplier: string;
  documents: string[];
  compliance: string;
  safetyStock: number;
}

export interface InventoryPosition {
  itemId: string;
  materialCode: string;
  name: string;
  category: string;
  warehouseId: string;
  locationBin: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number; // Derived: qtyOnHand - qtyReserved
  safetyStock: number;
  reorderLevel: number;
  unit: string;
  leadTimeDays: number;
  supplierName: string;
}

export interface WarehouseNode {
  id: string;
  name: string;
  type: 'NATIONAL_HUB' | 'REGIONAL_DEPOT' | 'SITE_LAYDOWN' | 'BIN_ZONE';
  parentLocationId?: string;
  capacityTotal: number;
  capacityUsed: number;
  utilizationPercent: number; // Derived
  latitude: number;
  longitude: number;
  status: 'optimal' | 'warning' | 'critical' | 'normal';
  details: string;
}

export type TransactionType = 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';

export interface LedgerTransaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  materialCode: string;
  quantity: number;
  warehouseId: string;
  operatorId: string;
  hash: string;
  projectRef?: string;
}

export interface GoodsReceipt {
  id: string;
  poReference: string;
  materialCode: string;
  expectedQty: number;
  receivedQty: number;
  inspectionPassed: boolean;
  varianceDetected: boolean;
  qualityStatus: 'PASSED' | 'FAILED' | 'PENDING';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  step: 'PO_VERIFICATION' | 'PHYSICAL_DELIVERY' | 'TECHNICAL_INSPECTION' | 'QUALITY_ACCEPTANCE' | 'LEDGER_UPDATE';
}

export interface MaterialIssue {
  id: string;
  requestId: string;
  materialCode: string;
  requestedQty: number;
  projectRef: string;
  purpose: 'MAINTENANCE' | 'CONSTRUCTION_PROJECT' | 'OPERATIONS';
  step: 'REQUEST' | 'APPROVAL' | 'PICKING' | 'ISSUE' | 'LEDGER_UPDATE';
  status: 'Draft' | 'Approved' | 'Picked' | 'Dispatched' | 'Completed';
  authorizedSigner?: string;
}

export interface SCMDecisionNode {
  id: string;
  title: string;
  type: 'Reorder' | 'Transfer' | 'Emergency Procurement' | 'Supplier Substitution' | 'Inventory Rationalization';
  description: string;
  evidence: string[];
  risks: string[];
  complianceScore: number;
  alternatives: { option: string; cost: string; timeline: string; risk: string }[];
  approved: boolean;
  signerAndDate?: string;
}
