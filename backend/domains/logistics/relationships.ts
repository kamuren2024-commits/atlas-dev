/**
 * Logistics Intelligence Domain - Relationship Registry
 * Phase 01: Core relationship definitions and semantics
 * Generated: Phase 01 Implementation
 * Status: IN_PROGRESS
 *
 * This module defines all relationships between logistics entities,
 * including cardinality, constraints, and traversal semantics.
 */

// ============================================================================
// RELATIONSHIP DEFINITIONS
// ============================================================================

export interface Relationship<TSource, TTarget> {
  name: string;
  sourceEntity: string;
  targetEntity: string;
  cardinality: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'MANY_TO_MANY';
  direction: 'FORWARD' | 'BIDIRECTIONAL';
  required: boolean;
  description: string;
  constraints?: RelationshipConstraint[];
}

export interface RelationshipConstraint {
  type: 'UNIQUENESS' | 'TEMPORAL' | 'STATE' | 'BUSINESS_RULE';
  description: string;
  validationRule?: (source: any, target: any) => boolean;
}

// ============================================================================
// FACILITY RELATIONSHIPS
// ============================================================================

export const FacilityRelationships = {
  FACILITY_TO_STOCKS: {
    name: 'facility_has_stocks',
    sourceEntity: 'LogisticsFacility',
    targetEntity: 'LogisticsStock',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A facility contains multiple stocks',
    constraints: [
      {
        type: 'BUSINESS_RULE',
        description: 'Stock capacity cannot exceed facility capacity',
      },
    ],
  },

  FACILITY_TO_MOVEMENTS_ORIGIN: {
    name: 'facility_is_origin_for_movements',
    sourceEntity: 'LogisticsFacility',
    targetEntity: 'LogisticsMovement',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A facility can be origin for multiple outbound movements',
  },

  FACILITY_TO_MOVEMENTS_DESTINATION: {
    name: 'facility_is_destination_for_movements',
    sourceEntity: 'LogisticsFacility',
    targetEntity: 'LogisticsMovement',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A facility can be destination for multiple inbound movements',
  },

  FACILITY_TO_MOVEMENT_LEGS: {
    name: 'facility_hosts_movement_legs',
    sourceEntity: 'LogisticsFacility',
    targetEntity: 'LogisticsMovementLeg',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A facility handles multiple movement legs',
  },

  FACILITY_TO_CONSTRAINTS: {
    name: 'facility_has_constraints',
    sourceEntity: 'LogisticsFacility',
    targetEntity: 'LogisticsConstraint',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A facility has constraints (capacity, hours, etc)',
  },

  FACILITY_TO_EVENTS: {
    name: 'facility_generates_events',
    sourceEntity: 'LogisticsFacility',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A facility generates operational events',
  },
};

// ============================================================================
// VEHICLE RELATIONSHIPS
// ============================================================================

export const VehicleRelationships = {
  VEHICLE_TO_MOVEMENTS: {
    name: 'vehicle_assigned_to_movement',
    sourceEntity: 'LogisticsVehicle',
    targetEntity: 'LogisticsMovement',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A vehicle can execute multiple movements',
    constraints: [
      {
        type: 'TEMPORAL',
        description: 'Vehicle movement times cannot overlap',
      },
      {
        type: 'BUSINESS_RULE',
        description: 'Cargo weight cannot exceed vehicle capacity',
      },
    ],
  },

  VEHICLE_TO_MOVEMENT_LEGS: {
    name: 'vehicle_executes_leg',
    sourceEntity: 'LogisticsVehicle',
    targetEntity: 'LogisticsMovementLeg',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A vehicle can execute multiple movement legs',
  },

  VEHICLE_TO_DRIVER: {
    name: 'vehicle_assigned_driver',
    sourceEntity: 'LogisticsVehicle',
    targetEntity: 'LogisticsDriver',
    cardinality: 'ONE_TO_ONE',
    direction: 'BIDIRECTIONAL',
    required: false,
    description: 'A vehicle is assigned to a driver through assignments',
  },

  VEHICLE_TO_DRIVER_ASSIGNMENTS: {
    name: 'vehicle_has_driver_assignments',
    sourceEntity: 'LogisticsVehicle',
    targetEntity: 'LogisticsDriverAssignment',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A vehicle has multiple driver assignments over time',
  },

  VEHICLE_TO_CONSTRAINTS: {
    name: 'vehicle_has_constraints',
    sourceEntity: 'LogisticsVehicle',
    targetEntity: 'LogisticsConstraint',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A vehicle has constraints (capacity, certification, etc)',
  },

  VEHICLE_TO_EVENTS: {
    name: 'vehicle_generates_events',
    sourceEntity: 'LogisticsVehicle',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A vehicle generates telematics and operational events',
  },
};

// ============================================================================
// PRODUCT RELATIONSHIPS
// ============================================================================

export const ProductRelationships = {
  PRODUCT_TO_STOCKS: {
    name: 'product_has_stocks',
    sourceEntity: 'LogisticsProduct',
    targetEntity: 'LogisticsStock',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A product appears in multiple facility stocks',
  },

  PRODUCT_TO_ORDER_ITEMS: {
    name: 'product_ordered_in_items',
    sourceEntity: 'LogisticsProduct',
    targetEntity: 'LogisticsOrderItem',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A product can be ordered in multiple order items',
  },

  PRODUCT_TO_INVENTORY_ITEMS: {
    name: 'product_tracked_by_items',
    sourceEntity: 'LogisticsProduct',
    targetEntity: 'LogisticsInventoryItem',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A product is tracked through inventory items',
  },

  PRODUCT_TO_CONSTRAINTS: {
    name: 'product_has_constraints',
    sourceEntity: 'LogisticsProduct',
    targetEntity: 'LogisticsConstraint',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A product has handling constraints (hazmat, temp, etc)',
  },

  PRODUCT_TO_EVENTS: {
    name: 'product_generates_events',
    sourceEntity: 'LogisticsProduct',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'Product events (shelf life, condition, etc)',
  },
};

// ============================================================================
// STOCK RELATIONSHIPS
// ============================================================================

export const StockRelationships = {
  STOCK_TO_INVENTORY_ITEMS: {
    name: 'stock_contains_items',
    sourceEntity: 'LogisticsStock',
    targetEntity: 'LogisticsInventoryItem',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A stock contains multiple inventory items (for tracking)',
  },

  STOCK_TO_INVENTORY_MOVEMENTS: {
    name: 'stock_involved_in_movements',
    sourceEntity: 'LogisticsStock',
    targetEntity: 'LogisticsInventoryMovement',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A stock record can be involved in multiple inventory movements',
  },

  STOCK_TO_EVENTS: {
    name: 'stock_generates_events',
    sourceEntity: 'LogisticsStock',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'Stock events (received, expired, damaged, etc)',
  },
};

// ============================================================================
// ORDER RELATIONSHIPS
// ============================================================================

export const OrderRelationships = {
  ORDER_TO_ITEMS: {
    name: 'order_has_items',
    sourceEntity: 'LogisticsOrder',
    targetEntity: 'LogisticsOrderItem',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: true,
    description: 'An order contains one or more items',
    constraints: [
      {
        type: 'BUSINESS_RULE',
        description: 'Order must have at least one item',
      },
    ],
  },

  ORDER_TO_MOVEMENTS: {
    name: 'order_fulfilled_by_movement',
    sourceEntity: 'LogisticsOrder',
    targetEntity: 'LogisticsMovement',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'An order can be fulfilled by multiple movements (partial shipments)',
  },

  ORDER_TO_EVENTS: {
    name: 'order_generates_events',
    sourceEntity: 'LogisticsOrder',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'Order lifecycle events (confirmed, dispatched, delivered, etc)',
  },
};

// ============================================================================
// MOVEMENT RELATIONSHIPS
// ============================================================================

export const MovementRelationships = {
  MOVEMENT_TO_LEGS: {
    name: 'movement_has_legs',
    sourceEntity: 'LogisticsMovement',
    targetEntity: 'LogisticsMovementLeg',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: true,
    description: 'A movement consists of one or more legs',
    constraints: [
      {
        type: 'BUSINESS_RULE',
        description: 'Movement legs must be sequential and connected',
      },
      {
        type: 'TEMPORAL',
        description: 'Leg times must be in sequence',
      },
    ],
  },

  MOVEMENT_TO_EVENTS: {
    name: 'movement_generates_events',
    sourceEntity: 'LogisticsMovement',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'Movement lifecycle events (picked, in-transit, delivered, etc)',
  },
};

// ============================================================================
// DRIVER RELATIONSHIPS
// ============================================================================

export const DriverRelationships = {
  DRIVER_TO_ASSIGNMENTS: {
    name: 'driver_has_assignments',
    sourceEntity: 'LogisticsDriver',
    targetEntity: 'LogisticsDriverAssignment',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A driver has multiple vehicle assignments over time',
  },

  DRIVER_TO_CONSTRAINTS: {
    name: 'driver_has_constraints',
    sourceEntity: 'LogisticsDriver',
    targetEntity: 'LogisticsConstraint',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'A driver has constraints (license type, certifications, etc)',
  },

  DRIVER_TO_EVENTS: {
    name: 'driver_generates_events',
    sourceEntity: 'LogisticsDriver',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'Driver lifecycle events (assigned, on-duty, accidents, etc)',
  },
};

// ============================================================================
// ROUTE RELATIONSHIPS
// ============================================================================

export const RouteRelationships = {
  ROUTE_TO_WAYPOINTS: {
    name: 'route_has_waypoints',
    sourceEntity: 'LogisticsRoute',
    targetEntity: 'LogisticsRouteWaypoint',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: true,
    description: 'A route consists of ordered waypoints',
    constraints: [
      {
        type: 'BUSINESS_RULE',
        description: 'Route must have at least 2 waypoints (origin, destination)',
      },
      {
        type: 'BUSINESS_RULE',
        description: 'Waypoints must be in sequence without gaps',
      },
    ],
  },

  ROUTE_TO_EVENTS: {
    name: 'route_generates_events',
    sourceEntity: 'LogisticsRoute',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'Route optimization and execution events',
  },
};

// ============================================================================
// CONSTRAINT RELATIONSHIPS
// ============================================================================

export const ConstraintRelationships = {
  CONSTRAINT_VIOLATION_EVENT: {
    name: 'constraint_violation_generates_event',
    sourceEntity: 'LogisticsConstraint',
    targetEntity: 'LogisticsEvent',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'Constraint violations generate exception events',
  },
};

// ============================================================================
// CROSS-ENTITY RELATIONSHIPS
// ============================================================================

export const CrossEntityRelationships = {
  // Facility Network
  FACILITY_TO_FACILITY_ROUTE: {
    name: 'facility_connected_by_route',
    sourceEntity: 'LogisticsFacility',
    targetEntity: 'LogisticsRoute',
    cardinality: 'MANY_TO_MANY',
    direction: 'BIDIRECTIONAL',
    required: false,
    description: 'Routes connect facilities in the logistics network',
  },

  // Order Fulfillment Pipeline
  ORDER_TO_FACILITY_ORIGIN: {
    name: 'order_originates_from_facility',
    sourceEntity: 'LogisticsOrder',
    targetEntity: 'LogisticsFacility',
    cardinality: 'MANY_TO_ONE',
    direction: 'FORWARD',
    required: false,
    description: 'Orders originate from origin facility',
  },

  ORDER_TO_FACILITY_DESTINATION: {
    name: 'order_goes_to_facility',
    sourceEntity: 'LogisticsOrder',
    targetEntity: 'LogisticsFacility',
    cardinality: 'MANY_TO_ONE',
    direction: 'FORWARD',
    required: false,
    description: 'Orders are delivered to destination facility',
  },

  // Inventory Allocation Pipeline
  ORDER_ITEM_TO_STOCK: {
    name: 'order_item_fulfilled_from_stock',
    sourceEntity: 'LogisticsOrderItem',
    targetEntity: 'LogisticsStock',
    cardinality: 'MANY_TO_ONE',
    direction: 'FORWARD',
    required: false,
    description: 'Order items are fulfilled from allocated stocks',
  },

  // Temporal State Tracking
  MOVEMENT_LEG_TRACK_VEHICLE_LOCATION: {
    name: 'leg_execution_tracked_by_vehicle',
    sourceEntity: 'LogisticsMovementLeg',
    targetEntity: 'LogisticsVehicle',
    cardinality: 'MANY_TO_ONE',
    direction: 'FORWARD',
    required: false,
    description: 'Leg execution is tracked through vehicle telemetry',
  },

  // Inventory Timeline
  INVENTORY_ITEM_FROM_STOCK: {
    name: 'inventory_item_from_stock',
    sourceEntity: 'LogisticsInventoryItem',
    targetEntity: 'LogisticsStock',
    cardinality: 'MANY_TO_ONE',
    direction: 'FORWARD',
    required: true,
    description: 'Inventory items belong to stocks',
  },

  INVENTORY_MOVEMENT_TRANSFER: {
    name: 'inventory_movement_transfers_items',
    sourceEntity: 'LogisticsInventoryMovement',
    targetEntity: 'LogisticsInventoryItem',
    cardinality: 'ONE_TO_MANY',
    direction: 'FORWARD',
    required: false,
    description: 'Inventory movements transfer items',
  },
};

// ============================================================================
// RELATIONSHIP REGISTRY (for queries)
// ============================================================================

export const AllRelationships = {
  ...FacilityRelationships,
  ...VehicleRelationships,
  ...ProductRelationships,
  ...StockRelationships,
  ...OrderRelationships,
  ...MovementRelationships,
  ...DriverRelationships,
  ...RouteRelationships,
  ...ConstraintRelationships,
  ...CrossEntityRelationships,
};

export function getRelationshipsForEntity(entityName: string): Record<string, any> {
  return Object.fromEntries(
    Object.entries(AllRelationships).filter(
      ([_, rel]) =>
        (rel as any).sourceEntity === entityName ||
        (rel as any).targetEntity === entityName
    )
  );
}

export function getOutgoingRelationships(entityName: string): Record<string, any> {
  return Object.fromEntries(
    Object.entries(AllRelationships).filter(
      ([_, rel]) => (rel as any).sourceEntity === entityName
    )
  );
}

export function getIncomingRelationships(entityName: string): Record<string, any> {
  return Object.fromEntries(
    Object.entries(AllRelationships).filter(
      ([_, rel]) => (rel as any).targetEntity === entityName
    )
  );
}
