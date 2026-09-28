/**
 * Logistics Intelligence - Graph Engine
 * Phase 02: Graph-first query and traversal engine
 * Generated: Phase 01 Implementation (prepared for Phase 02)
 * Status: FOUNDATION_ONLY
 *
 * This module provides graph-first query capabilities using PostgreSQL JSON/GIN indices.
 * Implements common logistics network queries as reusable patterns.
 */

import { Prisma } from '@prisma/client';

// ============================================================================
// GRAPH QUERY TYPES
// ============================================================================

export interface GraphNode {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  metadata?: Record<string, any>;
}

export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  cost: number;
  hops: number;
}

export interface GraphQuery {
  startNodeId: string;
  startNodeType: string;
  relationshipPath: string[];
  filters?: QueryFilter[];
  depth?: number;
  limit?: number;
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'contains' | 'between';
  value: any;
}

// ============================================================================
// SPECIALIZED QUERY PATTERNS (Phase 02 Ready)
// ============================================================================

/**
 * Core Query 1: Find all stock in a facility
 * Pattern: Facility -> Stocks
 */
export interface FacilityInventoryQuery {
  facilityId: string;
  includeExpired?: boolean;
  groupByZone?: boolean;
}

/**
 * Core Query 2: Trace order fulfillment chain
 * Pattern: Order -> OrderItems -> Stocks -> Facility
 */
export interface OrderFulfillmentChainQuery {
  orderId: string;
  includeMovements?: boolean;
}

/**
 * Core Query 3: Vehicle capacity and load tracking
 * Pattern: Vehicle -> CurrentMovement -> Cargo -> Products
 */
export interface VehicleLoadQuery {
  vehicleId: string;
  includeHistory?: boolean;
  hoursBack?: number;
}

/**
 * Core Query 4: Route optimization analysis
 * Pattern: Route -> Waypoints -> Facilities -> Stocks/Orders
 */
export interface RouteAnalysisQuery {
  routeId: string;
  optimizationCriteria: 'distance' | 'time' | 'cost' | 'emissions';
}

/**
 * Core Query 5: Network connectivity analysis
 * Pattern: Facility -> connectedRoutes -> LinkedFacilities
 */
export interface NetworkConnectivityQuery {
  facilityId: string;
  maxHops?: number;
}

/**
 * Core Query 6: Constraint violation detection
 * Pattern: Entity -> ApplicableConstraints -> ViolationCheck
 */
export interface ConstraintViolationQuery {
  entityType: string;
  entityId: string;
  asOf?: Date;
}

/**
 * Core Query 7: Temporal event chain
 * Pattern: Entity -> Events (ordered by timestamp)
 */
export interface TemporalEventChainQuery {
  entityType: string;
  entityId: string;
  startDate: Date;
  endDate: Date;
  eventCategories?: string[];
}

/**
 * Core Query 8: Supply chain traceability
 * Pattern: InventoryItem -> Stock -> Facility -> ReceivingMovement -> OriginFacility
 */
export interface SupplyChainTraceabilityQuery {
  itemId: string;
  includeProductInfo?: boolean;
}

/**
 * Core Query 9: Driver assignment history
 * Pattern: Driver -> Assignments -> Vehicles -> Movements
 */
export interface DriverHistoryQuery {
  driverId: string;
  fromDate: Date;
  toDate: Date;
}

/**
 * Core Query 10: Facility performance metrics
 * Pattern: Facility -> Movements -> calculateMetrics(throughput, accuracy, on-time)
 */
export interface FacilityPerformanceQuery {
  facilityId: string;
  period: 'day' | 'week' | 'month' | 'year';
}

// ============================================================================
// GRAPH ENGINE INTERFACE (Phase 02 Implementation)
// ============================================================================

export interface IGraphEngine {
  // Basic traversal
  findNode(nodeId: string, nodeType: string): Promise<GraphNode | null>;
  findPath(query: GraphQuery): Promise<GraphPath | null>;
  findAllPaths(query: GraphQuery): Promise<GraphPath[]>;

  // Specialized queries (to be implemented in Phase 02)
  queryFacilityInventory(query: FacilityInventoryQuery): Promise<any>;
  queryOrderFulfillment(query: OrderFulfillmentChainQuery): Promise<any>;
  queryVehicleLoad(query: VehicleLoadQuery): Promise<any>;
  queryRouteAnalysis(query: RouteAnalysisQuery): Promise<any>;
  queryNetworkConnectivity(query: NetworkConnectivityQuery): Promise<any>;
  queryConstraintViolations(query: ConstraintViolationQuery): Promise<any>;
  queryTemporalEvents(query: TemporalEventChainQuery): Promise<any>;
  querySupplyChainTraceability(query: SupplyChainTraceabilityQuery): Promise<any>;
  queryDriverHistory(query: DriverHistoryQuery): Promise<any>;
  queryFacilityPerformance(query: FacilityPerformanceQuery): Promise<any>;

  // Batch operations
  bulkCreateNodes(nodes: GraphNode[]): Promise<void>;
  bulkCreateEdges(edges: GraphEdge[]): Promise<void>;
  bulkUpdateNodes(updates: Array<{ id: string; data: Record<string, any> }>): Promise<void>;

  // Index management
  ensureIndices(): Promise<void>;
  rebuildIndices(): Promise<void>;
  getIndexStats(): Promise<Record<string, any>>;
}

// ============================================================================
// QUERY RESULT TYPES
// ============================================================================

export interface FacilityInventoryResult {
  facilityId: string;
  totalUnits: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  totalValue: number;
  byZone: Record<string, { units: number; value: number }>;
  byProduct: Record<string, { units: number; value: number }>;
  capacityUtilization: number;
}

export interface OrderFulfillmentResult {
  orderId: string;
  orderStatus: string;
  items: Array<{
    orderedQuantity: number;
    allocatedQuantity: number;
    dispatchedQuantity: number;
    receivedQuantity: number;
    fulfillmentPercent: number;
  }>;
  movements: Array<{
    movementId: string;
    status: string;
    originFacility: string;
    destinationFacility: string;
  }>;
}

export interface VehicleLoadResult {
  vehicleId: string;
  currentStatus: string;
  currentCapacityKg: number;
  currentCapacityM3: number;
  loadPercentageKg: number;
  loadPercentageM3: number;
  currentMovement?: {
    movementId: string;
    status: string;
    origin: string;
    destination: string;
  };
  recentMovements?: Array<{
    movementId: string;
    status: string;
    duration: number;
  }>;
}

export interface RouteAnalysisResult {
  routeId: string;
  routeName: string;
  waypoints: number;
  estimatedDistanceKm: number;
  estimatedTimeMinutes: number;
  optimizationScore: number;
  suggestions: Array<{
    type: string;
    impact: string;
    recommendation: string;
  }>;
}

export interface NetworkConnectivityResult {
  source: string;
  reachableNodes: number;
  averageHops: number;
  connectivity: Array<{
    targetFacility: string;
    hops: number;
    routes: string[];
  }>;
}

export interface ConstraintViolationResult {
  entityId: string;
  violations: Array<{
    constraintId: string;
    constraintName: string;
    severity: string;
    violationDescription: string;
    detectedAt: Date;
  }>;
  totalViolations: number;
}

export interface TemporalEventChainResult {
  entityId: string;
  periodStart: Date;
  periodEnd: Date;
  totalEvents: number;
  events: Array<{
    eventId: string;
    eventType: string;
    eventCategory: string;
    eventSeverity: string;
    timestamp: Date;
    description: string;
  }>;
  timeline: string;
}

export interface SupplyChainTraceabilityResult {
  itemId: string;
  product: { sku: string; name: string };
  receivedDate: Date;
  currentLocation: string;
  currentStatus: string;
  chain: Array<{
    facilityId: string;
    facilityName: string;
    arrivalDate: Date;
    departureDate?: Date;
    duration?: number;
  }>;
  movementHistory: Array<{
    movementId: string;
    from: string;
    to: string;
    date: Date;
    vehicle?: string;
  }>;
}

export interface DriverHistoryResult {
  driverId: string;
  driverName: string;
  periodStart: Date;
  periodEnd: Date;
  totalAssignments: number;
  assignments: Array<{
    vehicleId: string;
    vehicleName: string;
    assignedDate: Date;
    unassignedDate?: Date;
    movements: number;
    totalHours: number;
  }>;
}

export interface FacilityPerformanceResult {
  facilityId: string;
  facilityName: string;
  period: string;
  metrics: {
    throughputUnits: number;
    throughputValue: number;
    accuracyPercent: number;
    onTimePercent: number;
    capacityUtilizationPercent: number;
    damageLossPercent: number;
    averageProcessingTimeHours: number;
  };
  kpis: Array<{
    name: string;
    target: number;
    actual: number;
    variance: number;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  }>;
}

// ============================================================================
// GRAPH INDEX CONFIGURATION (PostgreSQL GIN)
// ============================================================================

export const GRAPH_INDICES = {
  // Entity indices
  'logistics_facility_type_idx': {
    table: 'logistics_facility',
    columns: ['tenantId', 'facilityType'],
    type: 'B-Tree',
  },
  'logistics_facility_location_idx': {
    table: 'logistics_facility',
    columns: ['latitude', 'longitude'],
    type: 'B-Tree',
  },

  // Relationship indices
  'logistics_stock_facility_idx': {
    table: 'logistics_stock',
    columns: ['tenantId', 'facilityId'],
    type: 'B-Tree',
  },
  'logistics_movement_facility_idx': {
    table: 'logistics_movement',
    columns: ['tenantId', 'originFacilityId', 'destinationFacilityId'],
    type: 'B-Tree',
  },
  'logistics_movement_vehicle_idx': {
    table: 'logistics_movement',
    columns: ['tenantId', 'assignedVehicleId'],
    type: 'B-Tree',
  },
  'logistics_order_facility_idx': {
    table: 'logistics_order',
    columns: ['tenantId', 'originFacilityId', 'destinationFacilityId'],
    type: 'B-Tree',
  },

  // Event indices
  'logistics_event_temporal_idx': {
    table: 'logistics_event',
    columns: ['tenantId', 'eventTimestamp'],
    type: 'B-Tree',
  },
  'logistics_event_source_idx': {
    table: 'logistics_event',
    columns: ['tenantId', 'sourceEntityType', 'sourceEntityId'],
    type: 'B-Tree',
  },

  // JSON indices (for flexible querying)
  'logistics_event_data_gin': {
    table: 'logistics_event',
    columns: ['eventData'],
    type: 'GIN',
  },
  'logistics_constraint_expression_gin': {
    table: 'logistics_constraint',
    columns: ['ruleExpression'],
    type: 'GIN',
  },
};

// ============================================================================
// COMMON GRAPH PATTERNS (for reuse)
// ============================================================================

export const COMMON_PATTERNS = {
  // Pattern 1: Find all entities of a type in a facility
  FACILITY_ENTITIES: `
    SELECT * FROM {table}
    WHERE tenantId = $1 AND facilityId = $2
    ORDER BY createdAt DESC
  `,

  // Pattern 2: Trace movement lineage
  MOVEMENT_LINEAGE: `
    WITH RECURSIVE movement_chain AS (
      SELECT id, originFacilityId, destinationFacilityId, orderId, 1 as depth
      FROM logistics_movement
      WHERE orderId = $1
      UNION ALL
      SELECT m.id, m.originFacilityId, m.destinationFacilityId, m.orderId, mc.depth + 1
      FROM logistics_movement m
      JOIN movement_chain mc ON m.orderId = mc.orderId
      WHERE mc.depth < 10
    )
    SELECT * FROM movement_chain
  `,

  // Pattern 3: Facility inventory snapshot
  FACILITY_INVENTORY_SNAPSHOT: `
    SELECT 
      facilityId,
      SUM(quantityUnits) as totalUnits,
      SUM(quantityKg) as totalKg,
      SUM(quantityM3) as totalM3,
      COUNT(DISTINCT productId) as uniqueProducts,
      COUNT(*) as stockRecords
    FROM logistics_stock
    WHERE tenantId = $1 AND facilityId = $2 AND status != 'EXPIRED'
    GROUP BY facilityId
  `,

  // Pattern 4: Order fulfillment tracking
  ORDER_FULFILLMENT_TRACKING: `
    SELECT
      oi.id,
      oi.productId,
      oi.quantityOrdered,
      oi.quantityAllocated,
      oi.quantityDispatched,
      oi.quantityReceived,
      ROUND(100.0 * oi.quantityReceived / oi.quantityOrdered, 2) as fulfillmentPercent
    FROM logistics_order_item oi
    WHERE oi.orderId = $1
    ORDER BY oi.id
  `,

  // Pattern 5: Vehicle utilization
  VEHICLE_UTILIZATION: `
    SELECT
      v.id,
      v.name,
      v.loadCapacityKg,
      v.currentLoadKg,
      ROUND(100.0 * v.currentLoadKg / v.loadCapacityKg, 2) as utilizationPercent,
      m.id as currentMovementId,
      m.status as movementStatus
    FROM logistics_vehicle v
    LEFT JOIN logistics_movement m ON v.id = m.assignedVehicleId AND m.status IN ('PLANNED', 'CONFIRMED', 'IN_TRANSIT')
    WHERE v.tenantId = $1
    ORDER BY v.id
  `,
};
