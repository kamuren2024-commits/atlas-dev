/**
 * Logistics Intelligence Domain - Shared Types and Constants
 * Phase 01: Enums, constants, and utility types
 * Generated: Phase 01 Implementation
 * Status: IN_PROGRESS
 */

// ============================================================================
// ENTITY ENUMS
// ============================================================================

export enum FacilityType {
  DEPOT = 'DEPOT',
  WAREHOUSE = 'WAREHOUSE',
  DISTRIBUTION_CENTER = 'DISTRIBUTION_CENTER',
  TERMINAL = 'TERMINAL',
  HUB = 'HUB',
}

export enum FacilityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum VehicleType {
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  MOTORCYCLE = 'MOTORCYCLE',
  RAIL_CAR = 'RAIL_CAR',
  BARGE = 'BARGE',
  CONTAINER = 'CONTAINER',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_TRANSIT = 'IN_TRANSIT',
  LOADING = 'LOADING',
  UNLOADING = 'UNLOADING',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum FuelType {
  DIESEL = 'DIESEL',
  PETROL = 'PETROL',
  LPG = 'LPG',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export enum ProductType {
  GENERAL = 'GENERAL',
  HAZMAT = 'HAZMAT',
  FRAGILE = 'FRAGILE',
  PERISHABLE = 'PERISHABLE',
  VALUABLE = 'VALUABLE',
  BULK = 'BULK',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DISCONTINUED = 'DISCONTINUED',
  ARCHIVED = 'ARCHIVED',
}

export enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  DAMAGED = 'DAMAGED',
  QUARANTINED = 'QUARANTINED',
  EXPIRED = 'EXPIRED',
}

export enum InventoryItemStatus {
  AVAILABLE = 'AVAILABLE',
  ALLOCATED = 'ALLOCATED',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
}

export enum OrderType {
  PURCHASE = 'PURCHASE',
  SALES = 'SALES',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum OrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  RETURN = 'RETURN',
}

export enum MovementStatus {
  PLANNED = 'PLANNED',
  CONFIRMED = 'CONFIRMED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum MovementLegType {
  PICKUP = 'PICKUP',
  DROPOFF = 'DROPOFF',
  HUB_TRANSFER = 'HUB_TRANSFER',
  CONSOLIDATION = 'CONSOLIDATION',
  CROSS_DOCK = 'CROSS_DOCK',
}

export enum MovementLegStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum InventoryMovementType {
  RECEIPT = 'RECEIPT',
  DISPATCH = 'DISPATCH',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

export enum InventoryMovementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_DUTY = 'ON_DUTY',
  OFF_DUTY = 'OFF_DUTY',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum LicenseType {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
}

export enum DriverAssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum RouteType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  PICKUP_DELIVERY = 'PICKUP_DELIVERY',
  TRANSFER = 'TRANSFER',
  CIRCULAR = 'CIRCULAR',
}

export enum RouteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum ConstraintType {
  CAPACITY = 'CAPACITY',
  TIME_WINDOW = 'TIME_WINDOW',
  FACILITY = 'FACILITY',
  VEHICLE = 'VEHICLE',
  PRODUCT = 'PRODUCT',
  DRIVER = 'DRIVER',
  ROUTE = 'ROUTE',
  REGULATORY = 'REGULATORY',
}

export enum ConstraintStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum RuleSeverity {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum EventCategory {
  OPERATIONAL = 'OPERATIONAL',
  QUALITY = 'QUALITY',
  EXCEPTION = 'EXCEPTION',
  COMPLIANCE = 'COMPLIANCE',
  SAFETY = 'SAFETY',
  PERFORMANCE = 'PERFORMANCE',
}

export enum EventSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum AuditOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum UnitOfMeasure {
  PCS = 'PCS',
  KG = 'KG',
  L = 'L',
  M3 = 'M3',
  PALLET = 'PALLET',
  CARTON = 'CARTON',
}

// ============================================================================
// DOMAIN CONSTANTS
// ============================================================================

export const LOGISTICS_DOMAIN_CONFIG = {
  // Entity counts
  ENTITY_COUNT: 39,
  RELATIONSHIP_TYPES: 30,
  EVENT_TYPES: 29,

  // Capacity constraints
  MAX_FACILITY_CAPACITY_M3: 1000000,
  MAX_VEHICLE_CAPACITY_KG: 50000,
  MAX_PALLET_STACK_HEIGHT: 2000,

  // Time windows
  DEFAULT_ORDER_LEAD_TIME_DAYS: 7,
  FACILITY_OPERATING_HOURS: {
    monday: { open: '06:00', close: '22:00' },
    tuesday: { open: '06:00', close: '22:00' },
    wednesday: { open: '06:00', close: '22:00' },
    thursday: { open: '06:00', close: '22:00' },
    friday: { open: '06:00', close: '22:00' },
    saturday: { open: '08:00', close: '18:00' },
    sunday: { open: '08:00', close: '18:00' },
  },

  // Geographic precision
  LOCATION_PRECISION_METERS: 10,
  ROUTE_RECALC_DISTANCE_THRESHOLD_KM: 0.5,

  // Performance targets
  ORDER_ON_TIME_TARGET_PERCENT: 95,
  FACILITY_UTILIZATION_TARGET_PERCENT: 85,
  VEHICLE_UTILIZATION_TARGET_PERCENT: 80,
  DELIVERY_ACCURACY_TARGET_PERCENT: 99,

  // Quality thresholds
  ALERT_DELIVERY_LATE_HOURS: 2,
  ALERT_CAPACITY_THRESHOLD_PERCENT: 90,
  ALERT_STOCK_NEAR_EXPIRY_DAYS: 30,
  ALERT_VEHICLE_MAINTENANCE_DAYS: 7,
};

// ============================================================================
// EVENT TYPE CONSTANTS
// ============================================================================

export const EVENT_TYPES = {
  // Facility events
  FACILITY_CREATED: 'FACILITY_CREATED',
  FACILITY_ACTIVATED: 'FACILITY_ACTIVATED',
  FACILITY_DEACTIVATED: 'FACILITY_DEACTIVATED',
  FACILITY_CAPACITY_EXCEEDED: 'FACILITY_CAPACITY_EXCEEDED',
  FACILITY_TEMPERATURE_ALERT: 'FACILITY_TEMPERATURE_ALERT',
  FACILITY_POWER_FAILURE: 'FACILITY_POWER_FAILURE',

  // Vehicle events
  VEHICLE_REGISTERED: 'VEHICLE_REGISTERED',
  VEHICLE_DEPARTED: 'VEHICLE_DEPARTED',
  VEHICLE_ARRIVED: 'VEHICLE_ARRIVED',
  VEHICLE_BREAKDOWN: 'VEHICLE_BREAKDOWN',
  VEHICLE_MAINTENANCE_DUE: 'VEHICLE_MAINTENANCE_DUE',
  VEHICLE_FUEL_LOW: 'VEHICLE_FUEL_LOW',
  VEHICLE_LOCATION_UPDATE: 'VEHICLE_LOCATION_UPDATE',

  // Stock events
  STOCK_RECEIVED: 'STOCK_RECEIVED',
  STOCK_DISPATCHED: 'STOCK_DISPATCHED',
  STOCK_DAMAGED: 'STOCK_DAMAGED',
  STOCK_EXPIRED: 'STOCK_EXPIRED',
  STOCK_QUARANTINED: 'STOCK_QUARANTINED',
  STOCK_ADJUSTMENT: 'STOCK_ADJUSTMENT',

  // Order events
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_DISPATCHED: 'ORDER_DISPATCHED',
  ORDER_PARTIAL_DELIVERY: 'ORDER_PARTIAL_DELIVERY',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_DELAYED: 'ORDER_DELAYED',

  // Movement events
  MOVEMENT_PLANNED: 'MOVEMENT_PLANNED',
  MOVEMENT_CONFIRMED: 'MOVEMENT_CONFIRMED',
  MOVEMENT_STARTED: 'MOVEMENT_STARTED',
  MOVEMENT_COMPLETED: 'MOVEMENT_COMPLETED',
  MOVEMENT_FAILED: 'MOVEMENT_FAILED',
  MOVEMENT_DELAY_WARNING: 'MOVEMENT_DELAY_WARNING',

  // Driver events
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_ON_DUTY: 'DRIVER_ON_DUTY',
  DRIVER_OFF_DUTY: 'DRIVER_OFF_DUTY',
  DRIVER_LICENSE_EXPIRY_WARNING: 'DRIVER_LICENSE_EXPIRY_WARNING',
  DRIVER_ACCIDENT: 'DRIVER_ACCIDENT',
  DRIVER_SAFETY_VIOLATION: 'DRIVER_SAFETY_VIOLATION',

  // Route events
  ROUTE_OPTIMIZED: 'ROUTE_OPTIMIZED',
  ROUTE_DELAY_WARNING: 'ROUTE_DELAY_WARNING',
  ROUTE_DEVIATION: 'ROUTE_DEVIATION',

  // Constraint events
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  CONSTRAINT_WAIVER_REQUESTED: 'CONSTRAINT_WAIVER_REQUESTED',
  CONSTRAINT_WAIVER_APPROVED: 'CONSTRAINT_WAIVER_APPROVED',

  // System events
  INVENTORY_SYNC_COMPLETE: 'INVENTORY_SYNC_COMPLETE',
  INVENTORY_DISCREPANCY: 'INVENTORY_DISCREPANCY',
  NETWORK_HEALTH_CHECK: 'NETWORK_HEALTH_CHECK',
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALIDATION_RULES = {
  // Capacity rules
  STOCK_CAPACITY_BUFFER_PERCENT: 5,
  VEHICLE_LOAD_CAPACITY_BUFFER_PERCENT: 10,

  // Temporal rules
  MIN_MOVEMENT_DURATION_HOURS: 0.5,
  MAX_MOVEMENT_DURATION_DAYS: 30,
  MIN_DWELL_TIME_MINUTES: 15,
  MAX_DWELL_TIME_HOURS: 24,

  // Quality rules
  MAX_INVENTORY_DISCREPANCY_PERCENT: 2,
  MIN_LOCATION_UPDATE_INTERVAL_SECONDS: 60,
  MAX_STALE_LOCATION_AGE_MINUTES: 30,

  // Business rules
  MIN_FACILITY_OPENING_HOURS: 6,
  MAX_DRIVER_SHIFT_HOURS: 11,
  MIN_VEHICLE_INSPECTION_DAYS: 30,
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type EntityType =
  | 'LogisticsFacility'
  | 'LogisticsVehicle'
  | 'LogisticsProduct'
  | 'LogisticsStock'
  | 'LogisticsInventoryItem'
  | 'LogisticsOrder'
  | 'LogisticsOrderItem'
  | 'LogisticsMovement'
  | 'LogisticsMovementLeg'
  | 'LogisticsInventoryMovement'
  | 'LogisticsDriver'
  | 'LogisticsDriverAssignment'
  | 'LogisticsRoute'
  | 'LogisticsRouteWaypoint'
  | 'LogisticsConstraint'
  | 'LogisticsEvent'
  | 'LogisticsAudit';

export interface AggregateStats {
  totalFacilities: number;
  totalVehicles: number;
  totalOrders: number;
  totalInventoryValue: number;
  activeMovements: number;
  averageDeliveryTime: number;
  onTimePercentage: number;
  capacityUtilization: number;
}

export interface OperationalKPI {
  metric: string;
  target: number;
  actual: number;
  variance: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  lastUpdated: Date;
}

export interface GraphQuery {
  startNode: EntityType;
  startId: string;
  relationshipPath: string[];
  depth: number;
  filters?: Record<string, any>;
}

export interface TemporalQuery {
  entityType: EntityType;
  startDate: Date;
  endDate: Date;
  eventTypes?: string[];
}

export interface BulkOperationResult {
  totalAttempted: number;
  totalSucceeded: number;
  totalFailed: number;
  errors: Array<{ id: string; error: string }>;
  duration: number;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

import { randomUUID } from 'crypto';

export function createEntityId(entityType: EntityType): string {
  const prefix = entityType.substring(9).toLowerCase();
  return `${prefix}_${Date.now()}_${randomUUID().replace(/-/g, '').substring(0, 8)}`;
}

export function isValidEntityType(value: any): value is EntityType {
  const validTypes: EntityType[] = [
    'LogisticsFacility',
    'LogisticsVehicle',
    'LogisticsProduct',
    'LogisticsStock',
    'LogisticsInventoryItem',
    'LogisticsOrder',
    'LogisticsOrderItem',
    'LogisticsMovement',
    'LogisticsMovementLeg',
    'LogisticsInventoryMovement',
    'LogisticsDriver',
    'LogisticsDriverAssignment',
    'LogisticsRoute',
    'LogisticsRouteWaypoint',
    'LogisticsConstraint',
    'LogisticsEvent',
    'LogisticsAudit',
  ];
  return validTypes.includes(value);
}

export function getEntityTableName(entityType: EntityType): string {
  return `logistics_${entityType.substring(9).toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase()}`;
}
