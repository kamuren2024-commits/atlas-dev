/**
 * Logistics Intelligence - Digital Twin Engine
 * Phase 02: Temporal state modeling and state machines
 * Generated: Phase 02 Implementation (FOUNDATION)
 * Status: FOUNDATION_ONLY
 *
 * This module implements digital twins for logistics entities,
 * tracking temporal state and state transitions.
 */

// ============================================================================
// STATE DEFINITIONS
// ============================================================================

export interface EntityState<T> {
  entityId: string;
  entityType: string;
  state: T;
  timestamp: Date;
  version: number;
  previousState?: T;
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  condition?: (context: any) => boolean;
  action?: (context: any) => void;
  metadata?: Record<string, any>;
}

export interface StateMachine {
  entityType: string;
  states: string[];
  initialState: string;
  transitions: StateTransition[];
  finalStates: string[];
}

// ============================================================================
// FACILITY STATE MACHINE
// ============================================================================

export const FacilityStateMachine: StateMachine = {
  entityType: 'LogisticsFacility',
  states: ['PLANNING', 'ACTIVE', 'MAINTENANCE', 'INACTIVE', 'DECOMMISSIONED'],
  initialState: 'PLANNING',
  finalStates: ['DECOMMISSIONED'],
  transitions: [
    {
      from: 'PLANNING',
      to: 'ACTIVE',
      trigger: 'FACILITY_OPENED',
      metadata: { requiresApproval: true },
    },
    {
      from: 'ACTIVE',
      to: 'MAINTENANCE',
      trigger: 'MAINTENANCE_SCHEDULED',
      metadata: { duration: '24-48 hours' },
    },
    {
      from: 'MAINTENANCE',
      to: 'ACTIVE',
      trigger: 'MAINTENANCE_COMPLETE',
    },
    {
      from: 'ACTIVE',
      to: 'INACTIVE',
      trigger: 'FACILITY_CLOSURE',
      metadata: { requiresApproval: true },
    },
    {
      from: 'INACTIVE',
      to: 'ACTIVE',
      trigger: 'FACILITY_REACTIVATION',
      metadata: { requiresApproval: true },
    },
    {
      from: 'INACTIVE',
      to: 'DECOMMISSIONED',
      trigger: 'FACILITY_DECOMMISSIONED',
      metadata: { permanent: true },
    },
  ],
};

// ============================================================================
// VEHICLE STATE MACHINE
// ============================================================================

export const VehicleStateMachine: StateMachine = {
  entityType: 'LogisticsVehicle',
  states: [
    'REGISTERED',
    'AVAILABLE',
    'IN_TRANSIT',
    'LOADING',
    'UNLOADING',
    'MAINTENANCE',
    'OUT_OF_SERVICE',
  ],
  initialState: 'REGISTERED',
  finalStates: ['OUT_OF_SERVICE'],
  transitions: [
    {
      from: 'REGISTERED',
      to: 'AVAILABLE',
      trigger: 'REGISTRATION_COMPLETE',
    },
    {
      from: 'AVAILABLE',
      to: 'LOADING',
      trigger: 'LOADING_STARTED',
    },
    {
      from: 'LOADING',
      to: 'IN_TRANSIT',
      trigger: 'DEPARTURE',
    },
    {
      from: 'IN_TRANSIT',
      to: 'UNLOADING',
      trigger: 'ARRIVAL',
    },
    {
      from: 'UNLOADING',
      to: 'AVAILABLE',
      trigger: 'UNLOADING_COMPLETE',
    },
    {
      from: 'AVAILABLE',
      to: 'MAINTENANCE',
      trigger: 'MAINTENANCE_DUE',
    },
    {
      from: 'MAINTENANCE',
      to: 'AVAILABLE',
      trigger: 'MAINTENANCE_COMPLETE',
    },
    {
      from: 'AVAILABLE',
      to: 'OUT_OF_SERVICE',
      trigger: 'DECOMMISSIONED',
      metadata: { permanent: true },
    },
  ],
};

// ============================================================================
// ORDER STATE MACHINE
// ============================================================================

export const OrderStateMachine: StateMachine = {
  entityType: 'LogisticsOrder',
  states: ['PENDING', 'CONFIRMED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
  initialState: 'PENDING',
  finalStates: ['DELIVERED', 'CANCELLED'],
  transitions: [
    {
      from: 'PENDING',
      to: 'CONFIRMED',
      trigger: 'ORDER_CONFIRMED',
      metadata: { requiresApproval: true },
    },
    {
      from: 'CONFIRMED',
      to: 'DISPATCHED',
      trigger: 'GOODS_DISPATCHED',
    },
    {
      from: 'DISPATCHED',
      to: 'IN_TRANSIT',
      trigger: 'IN_TRANSIT',
    },
    {
      from: 'IN_TRANSIT',
      to: 'DELIVERED',
      trigger: 'GOODS_RECEIVED',
    },
    {
      from: 'PENDING',
      to: 'CANCELLED',
      trigger: 'ORDER_CANCELLED',
      metadata: { requiresApproval: true },
    },
    {
      from: 'CONFIRMED',
      to: 'CANCELLED',
      trigger: 'ORDER_CANCELLED',
      metadata: { requiresApproval: true },
    },
  ],
};

// ============================================================================
// MOVEMENT STATE MACHINE
// ============================================================================

export const MovementStateMachine: StateMachine = {
  entityType: 'LogisticsMovement',
  states: ['PLANNED', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'FAILED'],
  initialState: 'PLANNED',
  finalStates: ['COMPLETED', 'CANCELLED', 'FAILED'],
  transitions: [
    {
      from: 'PLANNED',
      to: 'CONFIRMED',
      trigger: 'MOVEMENT_CONFIRMED',
    },
    {
      from: 'CONFIRMED',
      to: 'IN_TRANSIT',
      trigger: 'DEPARTURE',
    },
    {
      from: 'IN_TRANSIT',
      to: 'COMPLETED',
      trigger: 'ARRIVAL',
    },
    {
      from: 'PLANNED',
      to: 'CANCELLED',
      trigger: 'MOVEMENT_CANCELLED',
    },
    {
      from: 'CONFIRMED',
      to: 'CANCELLED',
      trigger: 'MOVEMENT_CANCELLED',
    },
    {
      from: 'IN_TRANSIT',
      to: 'FAILED',
      trigger: 'MOVEMENT_FAILURE',
      metadata: { requiresInvestigation: true },
    },
  ],
};

// ============================================================================
// STOCK STATE MACHINE
// ============================================================================

export const StockStateMachine: StateMachine = {
  entityType: 'LogisticsStock',
  states: ['AVAILABLE', 'RESERVED', 'DAMAGED', 'QUARANTINED', 'EXPIRED'],
  initialState: 'AVAILABLE',
  finalStates: ['EXPIRED', 'DAMAGED'],
  transitions: [
    {
      from: 'AVAILABLE',
      to: 'RESERVED',
      trigger: 'RESERVED',
    },
    {
      from: 'RESERVED',
      to: 'AVAILABLE',
      trigger: 'RESERVATION_CANCELLED',
    },
    {
      from: 'AVAILABLE',
      to: 'DAMAGED',
      trigger: 'DAMAGE_DETECTED',
      metadata: { requiresInvestigation: true },
    },
    {
      from: 'AVAILABLE',
      to: 'QUARANTINED',
      trigger: 'QUARANTINE_INITIATED',
    },
    {
      from: 'QUARANTINED',
      to: 'AVAILABLE',
      trigger: 'QUARANTINE_RELEASED',
    },
    {
      from: 'AVAILABLE',
      to: 'EXPIRED',
      trigger: 'EXPIRY_DATE_REACHED',
    },
  ],
};

// ============================================================================
// DIGITAL TWIN SNAPSHOT
// ============================================================================

export interface DigitalTwinSnapshot {
  entityId: string;
  entityType: string;
  currentState: string;
  data: Record<string, any>;
  timestamp: Date;
  version: number;
  stateHistory: StateTransition[];
  metadata: {
    lastStateChange: Date;
    stateChanges: number;
    anomalies: Array<{
      type: string;
      description: string;
      severity: 'WARNING' | 'ERROR' | 'CRITICAL';
      detectedAt: Date;
    }>;
  };
}

// ============================================================================
// TEMPORAL TRACKING
// ============================================================================

export interface TemporalEntity {
  entityId: string;
  entityType: string;
  validFrom: Date;
  validTo?: Date;
  data: Record<string, any>;
}

export interface TemporalDimension {
  transactionTime: Date;
  validTime: Date;
  asOfDate?: Date;
}

export interface TemporalQuery {
  entityId: string;
  asOf: Date;
}

// ============================================================================
// CAPACITY TRACKING
// ============================================================================

export interface CapacitySnapshot {
  entityId: string;
  entityType: string;
  totalCapacity: number;
  usedCapacity: number;
  availableCapacity: number;
  utilizationPercent: number;
  timestamp: Date;
  trend?: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface CapacityTimeseries {
  entityId: string;
  snapshots: CapacitySnapshot[];
  averageUtilization: number;
  peakUtilization: number;
  peakTime: Date;
  trend: string;
}

// ============================================================================
// LOCATION TRACKING
// ============================================================================

export interface LocationSnapshot {
  entityId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
  facility?: string;
  speed?: number;
  heading?: number;
}

export interface LocationTimeseries {
  entityId: string;
  snapshots: LocationSnapshot[];
  distance: number;
  duration: number;
  averageSpeed: number;
}

// ============================================================================
// TWIN STATE CALCULATOR
// ============================================================================

export interface ITwinStateCalculator {
  canTransition(
    entityType: string,
    fromState: string,
    toState: string
  ): Promise<boolean>;
  validateTransition(
    entityType: string,
    transition: StateTransition,
    context: any
  ): Promise<{ valid: boolean; reason?: string }>;
  executeTransition(
    entityId: string,
    entityType: string,
    transition: StateTransition,
    context: any
  ): Promise<void>;

  getCurrentState(entityId: string, entityType: string): Promise<string>;
  getStateHistory(
    entityId: string,
    entityType: string,
    limit?: number
  ): Promise<StateTransition[]>;
  getStateAsOf(entityId: string, entityType: string, timestamp: Date): Promise<string>;

  getCapacitySnapshot(entityId: string, entityType: string): Promise<CapacitySnapshot>;
  getCapacityTimeseries(
    entityId: string,
    entityType: string,
    fromDate: Date,
    toDate: Date
  ): Promise<CapacityTimeseries>;

  getLocationSnapshot(entityId: string): Promise<LocationSnapshot>;
  getLocationTimeseries(
    entityId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<LocationTimeseries>;

  getTwinSnapshot(entityId: string, entityType: string): Promise<DigitalTwinSnapshot>;

  bulkUpdateStates(
    updates: Array<{
      entityId: string;
      entityType: string;
      newState: string;
      context: any;
    }>
  ): Promise<void>;
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

export interface AnomalyRule {
  id: string;
  name: string;
  entityType: string;
  condition: (state: any) => boolean;
  severity: 'WARNING' | 'ERROR' | 'CRITICAL';
  action?: (state: any) => void;
}

export interface DetectedAnomaly {
  ruleId: string;
  ruleName: string;
  entityId: string;
  severity: string;
  description: string;
  detectedAt: Date;
  suggestedAction?: string;
}

// ============================================================================
// COMMON ANOMALY PATTERNS
// ============================================================================

export const CommonAnomalies = {
  VEHICLE_PROLONGED_IDLE: {
    name: 'Vehicle in idle state > 24 hours',
    condition: (state: any) =>
      state.status === 'AVAILABLE' &&
      new Date().getTime() - state.lastStatusChange > 24 * 60 * 60 * 1000,
  },

  FACILITY_CAPACITY_EXCEEDED: {
    name: 'Facility capacity exceeded',
    condition: (state: any) => state.utilizationPercent > 100,
  },

  MOVEMENT_DELAY_WARNING: {
    name: 'Movement >30% delayed',
    condition: (state: any) =>
      state.status === 'IN_TRANSIT' &&
      new Date() > new Date(state.plannedDeliveryDate).getTime() * 1.3,
  },

  STOCK_NEAR_EXPIRY: {
    name: 'Stock expiring within 7 days',
    condition: (state: any) => {
      const daysToExpiry =
        (new Date(state.expiryDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000);
      return daysToExpiry > 0 && daysToExpiry <= 7;
    },
  },

  ORDER_IN_PENDING_STATE: {
    name: 'Order pending > 48 hours',
    condition: (state: any) =>
      state.status === 'PENDING' &&
      new Date().getTime() - state.createdAt > 48 * 60 * 60 * 1000,
  },
};
