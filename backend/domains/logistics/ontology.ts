/**
 * Logistics Intelligence Domain Ontology
 * Phase 01: Core entity type definitions and interfaces
 * Generated: Phase 01 Implementation
 * Status: IN_PROGRESS
 *
 * This module defines 39 core logistics entities as TypeScript interfaces.
 * Each entity models operational objects within the logistics network.
 */

import { Prisma } from '@prisma/client';

// ============================================================================
// FACILITY ENTITIES
// ============================================================================

export interface LogisticsFacility {
  id: string;
  tenantId: string;
  name: string;
  facilityType: 'DEPOT' | 'WAREHOUSE' | 'DISTRIBUTION_CENTER' | 'TERMINAL' | 'HUB';
  externalId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';

  // Geographic positioning
  latitude: number;
  longitude: number;
  address: string;
  region: string;
  country: string;

  // Operational capacity
  totalCapacityM3: number;
  availableCapacityM3: number;
  totalCapacityUnits: number;
  availableCapacityUnits: number;

  // Infrastructure metadata
  openingDate: Date;
  closingDate?: Date;
  operatingHours: Record<string, { open: string; close: string }>;

  // Connectivity & systems
  hasRFID: boolean;
  hasBarcode: boolean;
  hasTemperatureControl: boolean;
  connectedToERP: boolean;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsFacilityCreateInput {
  tenantId: string;
  name: string;
  facilityType: LogisticsFacility['facilityType'];
  externalId: string;
  latitude: number;
  longitude: number;
  address: string;
  region: string;
  country: string;
  totalCapacityM3: number;
  totalCapacityUnits: number;
  openingDate: Date;
  operatingHours: LogisticsFacility['operatingHours'];
  createdBy: string;
  hasRFID?: boolean;
  hasBarcode?: boolean;
  hasTemperatureControl?: boolean;
  connectedToERP?: boolean;
}

// ============================================================================
// VEHICLE ENTITIES
// ============================================================================

export interface LogisticsVehicle {
  id: string;
  tenantId: string;
  name: string;
  vehicleType: 'TRUCK' | 'VAN' | 'MOTORCYCLE' | 'RAIL_CAR' | 'BARGE' | 'CONTAINER';
  externalId: string;
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'LOADING' | 'UNLOADING' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

  // Vehicle specifications
  licensePlate: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;

  // Capacity specifications
  loadCapacityKg: number;
  volumeCapacityM3: number;
  palletCapacity: number;
  currentLoadKg?: number;
  currentLoadM3?: number;
  currentLoadUnits?: number;

  // Operational characteristics
  fuelType: 'DIESEL' | 'PETROL' | 'LPG' | 'ELECTRIC' | 'HYBRID';
  averageFuelConsumption: number;
  refrigerated: boolean;
  hazmatCertified: boolean;

  // Location & status
  currentLatitude?: number;
  currentLongitude?: number;
  currentFacilityId?: string;
  lastKnownLocation?: string;
  lastLocationUpdate?: Date;

  // Telematics
  hasGPS: boolean;
  hasTelemetry: boolean;
  telemetryLastUpdate?: Date;

  // Driver assignment
  assignedDriverId?: string;
  currentRoute?: string;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsVehicleCreateInput {
  tenantId: string;
  name: string;
  vehicleType: LogisticsVehicle['vehicleType'];
  externalId: string;
  licensePlate: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  loadCapacityKg: number;
  volumeCapacityM3: number;
  palletCapacity: number;
  fuelType: LogisticsVehicle['fuelType'];
  averageFuelConsumption: number;
  createdBy: string;
  refrigerated?: boolean;
  hazmatCertified?: boolean;
  hasGPS?: boolean;
  hasTelemetry?: boolean;
}

// ============================================================================
// PRODUCT ENTITIES
// ============================================================================

export interface LogisticsProduct {
  id: string;
  tenantId: string;
  name: string;
  externalId: string;
  sku: string;
  status: 'ACTIVE' | 'DISCONTINUED' | 'ARCHIVED';

  // Product classification
  category: string;
  subcategory?: string;
  productType: 'GENERAL' | 'HAZMAT' | 'FRAGILE' | 'PERISHABLE' | 'VALUABLE' | 'BULK';

  // Physical specifications
  weightKg: number;
  volumeM3: number;
  length?: number;
  width?: number;
  height?: number;

  // Handling requirements
  handlingTemperatureMin?: number;
  handlingTemperatureMax?: number;
  handlingHumidityMin?: number;
  handlingHumidityMax?: number;
  requiresRefrigeration: boolean;
  requiresHazmatHandling: boolean;

  // Inventory unit
  unitOfMeasure: 'PCS' | 'KG' | 'L' | 'M3' | 'PALLET' | 'CARTON';
  unitsPerPallet?: number;
  palletWeight?: number;

  // Supplier & sourcing
  supplierId?: string;
  leadTimeDays?: number;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsProductCreateInput {
  tenantId: string;
  name: string;
  externalId: string;
  sku: string;
  category: string;
  productType: LogisticsProduct['productType'];
  weightKg: number;
  volumeM3: number;
  unitOfMeasure: LogisticsProduct['unitOfMeasure'];
  createdBy: string;
  subcategory?: string;
  length?: number;
  width?: number;
  height?: number;
  handlingTemperatureMin?: number;
  handlingTemperatureMax?: number;
  handlingHumidityMin?: number;
  handlingHumidityMax?: number;
  requiresRefrigeration?: boolean;
  requiresHazmatHandling?: boolean;
  unitsPerPallet?: number;
  palletWeight?: number;
  supplierId?: string;
  leadTimeDays?: number;
}

// ============================================================================
// STOCK ENTITIES
// ============================================================================

export interface LogisticsStock {
  id: string;
  tenantId: string;
  facilityId: string;
  productId: string;
  externalId: string;

  // Stock quantities
  quantityUnits: number;
  quantityKg: number;
  quantityM3: number;
  palletCount: number;

  // Stock location in facility
  zone?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;

  // Stock condition
  status: 'AVAILABLE' | 'RESERVED' | 'DAMAGED' | 'QUARANTINED' | 'EXPIRED';
  conditionPercentage: number;

  // Temporal information
  receivedDate: Date;
  expiryDate?: Date;
  lastCountDate?: Date;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsStockCreateInput {
  tenantId: string;
  facilityId: string;
  productId: string;
  externalId: string;
  quantityUnits: number;
  quantityKg: number;
  quantityM3: number;
  palletCount: number;
  receivedDate: Date;
  createdBy: string;
  zone?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  expiryDate?: Date;
}

// ============================================================================
// INVENTORY ITEM ENTITIES
// ============================================================================

export interface LogisticsInventoryItem {
  id: string;
  tenantId: string;
  stockId: string;
  productId: string;
  externalId: string;

  // Item tracking
  serialNumber?: string;
  batchNumber?: string;
  lotNumber?: string;

  // Item status
  status: 'AVAILABLE' | 'ALLOCATED' | 'IN_TRANSIT' | 'RECEIVED' | 'DAMAGED' | 'LOST';

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsInventoryItemCreateInput {
  tenantId: string;
  stockId: string;
  productId: string;
  externalId: string;
  createdBy: string;
  serialNumber?: string;
  batchNumber?: string;
  lotNumber?: string;
}

// ============================================================================
// ORDER ENTITIES
// ============================================================================

export interface LogisticsOrder {
  id: string;
  tenantId: string;
  externalId: string;
  orderNumber: string;

  // Order classification
  orderType: 'PURCHASE' | 'SALES' | 'TRANSFER' | 'RETURN';
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  // Party information
  originFacilityId?: string;
  destinationFacilityId?: string;
  customerId?: string;
  supplierId?: string;

  // Dates
  createdDate: Date;
  requiredDeliveryDate: Date;
  actualDeliveryDate?: Date;

  // Order metrics
  totalQuantityUnits: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  totalValue: number;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsOrderCreateInput {
  tenantId: string;
  externalId: string;
  orderNumber: string;
  orderType: LogisticsOrder['orderType'];
  requiredDeliveryDate: Date;
  totalQuantityUnits: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  totalValue: number;
  createdBy: string;
  priority?: LogisticsOrder['priority'];
  originFacilityId?: string;
  destinationFacilityId?: string;
  customerId?: string;
  supplierId?: string;
}

// ============================================================================
// ORDER ITEM ENTITIES
// ============================================================================

export interface LogisticsOrderItem {
  id: string;
  tenantId: string;
  orderId: string;
  productId: string;
  externalId: string;

  // Item quantities
  quantityOrdered: number;
  quantityAllocated: number;
  quantityDispatched: number;
  quantityReceived: number;
  quantityRejected: number;

  // Unit information
  unitPrice: number;
  totalPrice: number;

  // Status
  status: 'PENDING' | 'ALLOCATED' | 'DISPATCHED' | 'RECEIVED' | 'PARTIAL' | 'CANCELLED';

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsOrderItemCreateInput {
  tenantId: string;
  orderId: string;
  productId: string;
  externalId: string;
  quantityOrdered: number;
  unitPrice: number;
  totalPrice: number;
  createdBy: string;
}

// ============================================================================
// MOVEMENT ENTITIES
// ============================================================================

export interface LogisticsMovement {
  id: string;
  tenantId: string;
  orderId?: string;
  externalId: string;

  // Movement classification
  movementType: 'INBOUND' | 'OUTBOUND' | 'INTERNAL_TRANSFER' | 'RETURN';
  status: 'PLANNED' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

  // Route information
  originFacilityId: string;
  destinationFacilityId: string;

  // Assignment
  assignedVehicleId?: string;
  assignedRoutePlanId?: string;

  // Dates
  plannedPickupDate: Date;
  plannedDeliveryDate: Date;
  actualPickupDate?: Date;
  actualDeliveryDate?: Date;

  // Cargo information
  totalWeightKg: number;
  totalVolumeM3: number;
  totalPallets: number;
  totalValue: number;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsMovementCreateInput {
  tenantId: string;
  externalId: string;
  movementType: LogisticsMovement['movementType'];
  originFacilityId: string;
  destinationFacilityId: string;
  plannedPickupDate: Date;
  plannedDeliveryDate: Date;
  totalWeightKg: number;
  totalVolumeM3: number;
  totalPallets: number;
  totalValue: number;
  createdBy: string;
  orderId?: string;
  assignedVehicleId?: string;
  assignedRoutePlanId?: string;
}

// ============================================================================
// MOVEMENT LEG ENTITIES
// ============================================================================

export interface LogisticsMovementLeg {
  id: string;
  tenantId: string;
  movementId: string;
  facilityId: string;
  vehicleId?: string;
  externalId: string;
  legSequence: number;

  // Leg classification
  legType: 'PICKUP' | 'DROPOFF' | 'HUB_TRANSFER' | 'CONSOLIDATION' | 'CROSS_DOCK';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

  // Planned vs actual
  plannedArrivalTime: Date;
  plannedDepartureTime: Date;
  actualArrivalTime?: Date;
  actualDepartureTime?: Date;

  // Dwell information
  plannedDwellMinutes: number;
  actualDwellMinutes?: number;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsMovementLegCreateInput {
  tenantId: string;
  movementId: string;
  facilityId: string;
  externalId: string;
  legSequence: number;
  legType: LogisticsMovementLeg['legType'];
  plannedArrivalTime: Date;
  plannedDepartureTime: Date;
  plannedDwellMinutes: number;
  createdBy: string;
  vehicleId?: string;
}

// ============================================================================
// INVENTORY MOVEMENT ENTITIES
// ============================================================================

export interface LogisticsInventoryMovement {
  id: string;
  tenantId: string;
  stockId: string;
  itemId?: string;
  externalId: string;

  // Movement type
  movementType: 'RECEIPT' | 'DISPATCH' | 'INTERNAL_TRANSFER' | 'ADJUSTMENT' | 'RETURN';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

  // Source & destination
  fromFacilityId?: string;
  toFacilityId?: string;
  fromZone?: string;
  toZone?: string;

  // Quantity
  quantityUnits: number;
  quantityKg: number;
  quantityM3: number;

  // Timing
  requestedDate: Date;
  completedDate?: Date;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsInventoryMovementCreateInput {
  tenantId: string;
  stockId: string;
  externalId: string;
  movementType: LogisticsInventoryMovement['movementType'];
  quantityUnits: number;
  quantityKg: number;
  quantityM3: number;
  requestedDate: Date;
  createdBy: string;
  itemId?: string;
  fromFacilityId?: string;
  toFacilityId?: string;
  fromZone?: string;
  toZone?: string;
}

// ============================================================================
// DRIVER ENTITIES
// ============================================================================

export interface LogisticsDriver {
  id: string;
  tenantId: string;
  externalId: string;
  name: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY' | 'SUSPENDED' | 'TERMINATED';

  // Driver information
  licenseType: 'A' | 'B' | 'C' | 'D' | 'E';
  licenseExpiryDate: Date;
  hazmatCertified: boolean;

  // Contact
  phoneNumber?: string;
  email?: string;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsDriverCreateInput {
  tenantId: string;
  externalId: string;
  name: string;
  licenseNumber: string;
  licenseType: LogisticsDriver['licenseType'];
  licenseExpiryDate: Date;
  createdBy: string;
  hazmatCertified?: boolean;
  phoneNumber?: string;
  email?: string;
}

// ============================================================================
// DRIVER ASSIGNMENT ENTITIES
// ============================================================================

export interface LogisticsDriverAssignment {
  id: string;
  tenantId: string;
  driverId: string;
  vehicleId: string;
  externalId: string;

  // Assignment timing
  assignedDate: Date;
  unassignedDate?: Date;

  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsDriverAssignmentCreateInput {
  tenantId: string;
  driverId: string;
  vehicleId: string;
  externalId: string;
  createdBy: string;
  assignedDate?: Date;
}

// ============================================================================
// ROUTE ENTITIES
// ============================================================================

export interface LogisticsRoute {
  id: string;
  tenantId: string;
  externalId: string;
  routeName: string;

  // Route definition
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  routeType: 'PICKUP' | 'DELIVERY' | 'PICKUP_DELIVERY' | 'TRANSFER' | 'CIRCULAR';

  // Route metrics
  estimatedDistanceKm: number;
  estimatedTimeMinutes: number;
  estimatedFuelCost?: number;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsRouteCreateInput {
  tenantId: string;
  externalId: string;
  routeName: string;
  routeType: LogisticsRoute['routeType'];
  estimatedDistanceKm: number;
  estimatedTimeMinutes: number;
  createdBy: string;
  estimatedFuelCost?: number;
}

// ============================================================================
// ROUTE WAYPOINT ENTITIES
// ============================================================================

export interface LogisticsRouteWaypoint {
  id: string;
  tenantId: string;
  routeId: string;
  externalId: string;

  // Waypoint sequence
  sequenceNumber: number;

  // Location
  latitude: number;
  longitude: number;
  address?: string;
  facilityId?: string;

  // Timing
  plannedArrivalTime?: Date;
  plannedDepartureTime?: Date;
  plannedDwellMinutes?: number;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsRouteWaypointCreateInput {
  tenantId: string;
  routeId: string;
  externalId: string;
  sequenceNumber: number;
  latitude: number;
  longitude: number;
  createdBy: string;
  address?: string;
  facilityId?: string;
  plannedArrivalTime?: Date;
  plannedDepartureTime?: Date;
  plannedDwellMinutes?: number;
}

// ============================================================================
// CONSTRAINT ENTITIES
// ============================================================================

export interface LogisticsConstraint {
  id: string;
  tenantId: string;
  externalId: string;

  // Constraint definition
  constraintType:
    | 'CAPACITY'
    | 'TIME_WINDOW'
    | 'FACILITY'
    | 'VEHICLE'
    | 'PRODUCT'
    | 'DRIVER'
    | 'ROUTE'
    | 'REGULATORY';
  constraintName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

  // Scoping
  applicableToFacilityId?: string;
  applicableToVehicleId?: string;
  applicableToProductId?: string;
  applicableToRouteName?: string;

  // Constraint rules
  ruleName: string;
  ruleDescription: string;
  ruleSeverity: 'WARNING' | 'ERROR' | 'CRITICAL';
  ruleExpression: Record<string, any>;

  // Temporal scope
  validFromDate: Date;
  validToDate?: Date;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface LogisticsConstraintCreateInput {
  tenantId: string;
  externalId: string;
  constraintType: LogisticsConstraint['constraintType'];
  constraintName: string;
  ruleName: string;
  ruleDescription: string;
  ruleSeverity: LogisticsConstraint['ruleSeverity'];
  ruleExpression: LogisticsConstraint['ruleExpression'];
  validFromDate: Date;
  createdBy: string;
  applicableToFacilityId?: string;
  applicableToVehicleId?: string;
  applicableToProductId?: string;
  applicableToRouteName?: string;
  validToDate?: Date;
}

// ============================================================================
// EVENT ENTITIES
// ============================================================================

export interface LogisticsEvent {
  id: string;
  tenantId: string;
  externalId: string;

  // Event classification
  eventType: string;
  eventCategory: 'OPERATIONAL' | 'QUALITY' | 'EXCEPTION' | 'COMPLIANCE' | 'SAFETY' | 'PERFORMANCE';
  eventSeverity: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

  // Event source & target
  sourceEntityType?: string;
  sourceEntityId?: string;
  targetEntityType?: string;
  targetEntityId?: string;

  // Event payload
  eventTimestamp: Date;
  eventDescription: string;
  eventData: Record<string, any>;

  // Audit trail
  createdAt: Date;
  version: number;
}

export interface LogisticsEventCreateInput {
  tenantId: string;
  externalId: string;
  eventType: string;
  eventCategory: LogisticsEvent['eventCategory'];
  eventTimestamp: Date;
  eventDescription: string;
  eventData: LogisticsEvent['eventData'];
  eventSeverity?: LogisticsEvent['eventSeverity'];
  sourceEntityType?: string;
  sourceEntityId?: string;
  targetEntityType?: string;
  targetEntityId?: string;
}

// ============================================================================
// AUDIT LOG ENTITIES
// ============================================================================

export interface LogisticsAudit {
  id: string;
  tenantId: string;

  // Change information
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  changeDescription: string;
  changeData: Record<string, any>;

  // Who & when
  performedBy: string;
  performedAt: Date;
}

export interface LogisticsAuditCreateInput {
  tenantId: string;
  entityType: string;
  entityId: string;
  operation: LogisticsAudit['operation'];
  changeDescription: string;
  changeData: LogisticsAudit['changeData'];
  performedBy: string;
}

// ============================================================================
// AGGREGATE TYPES (for bulk operations)
// ============================================================================

export interface LogisticsOperationalSnapshot {
  timestamp: Date;
  facilitiesCount: number;
  activeVehicles: number;
  inTransitMovements: number;
  totalInventoryUnits: number;
  totalInventoryValue: number;
  averageDeliveryLateness: number;
  capacityUtilization: number;
  constraintViolations: number;
  recentEvents: LogisticsEvent[];
}

export interface LogisticsNetworkHealth {
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  facilityHealth: Record<string, 'HEALTHY' | 'DEGRADED' | 'CRITICAL'>;
  vehicleHealth: Record<string, 'HEALTHY' | 'DEGRADED' | 'CRITICAL'>;
  routeHealth: Record<string, 'HEALTHY' | 'DEGRADED' | 'CRITICAL'>;
  lastUpdated: Date;
}
