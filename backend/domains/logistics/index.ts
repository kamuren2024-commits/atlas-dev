/**
 * Logistics Intelligence Domain - Module Index
 * Phase 01: Public API exports
 * Generated: Phase 01 Implementation
 */

// Core types and interfaces
export * from './ontology';
export * from './relationships';
export * from './types';

// Graph engine (Phase 02 foundation)
export * from './graph/engine';
export * from './inventory-intelligence';
export * from './data-quality';

// Re-exports for convenience
export {
  FacilityType,
  VehicleType,
  ProductType,
  OrderType,
  MovementType,
  OrderStatus,
  MovementStatus,
  EVENT_TYPES,
  LOGISTICS_DOMAIN_CONFIG,
} from './types';

export {
  AllRelationships,
  getRelationshipsForEntity,
  getOutgoingRelationships,
  getIncomingRelationships,
} from './relationships';
