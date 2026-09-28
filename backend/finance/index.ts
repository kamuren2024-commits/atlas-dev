/**
 * KETRACO FINANCE MODULE — PHASE 01: FINANCE DATA FABRIC
 *
 * Central export barrel for the KETRACO Finance bounded context.
 *
 * This module implements:
 *   - 01-01 Finance Entity Types        (packages/domain)
 *   - 01-02 Domain Contracts            (packages/contracts)
 *   - 01-03 Finance Source Registry
 *   - 01-04 Finance Connector Contract
 *   - 01-05 Database Migration 003      (backend/database/migration-003-finance-data-fabric.ts)
 *   - 01-06 Repository Layer
 *   - 01-07 Ingestion Service
 *   - 01-08 Normalization
 *   - 01-09 Validation
 *   - 01-10 Profiling
 *   - 01-11 Data Quality
 *   - 01-12 Entity Resolution
 *   - 01-13 Ontology Mapping
 *   - 01-14 Graph Synchronization
 *   - 01-15 Data Lineage
 *   - 01-16 /api/finance API Routes
 *   - 01-17 API Contracts
 *   - 01-18 RBAC / ABAC                 (backend/security/authorization-service.ts)
 *   - 01-19 Production Fixture Protection  (CP-03)
 *   - 01-20 Observability
 *   - 01-21 Testing
 *   - 01-22 Documentation + Gate
 *
 * Status:  IMPLEMENTATION — Phase 01 Data Fabric
 * Author:  KETRACO Atlas Finance Engineering
 * Date:    2026-08-31
 */

export * from './types';
export * from './sources';
export * from './connector';
export * from './fixture-protection';
export * from './repositories';
export * from './normalization';
export * from './validation';
export * from './profiling';
export * from './quality';
export * from './entity-resolution';
export * from './ontology-mapping';
export * from './graph-sync';
export * from './lineage';
export * from './ingestion';
export * from './api-routes';
export * from './observability';
export * from './finance-state-service';
