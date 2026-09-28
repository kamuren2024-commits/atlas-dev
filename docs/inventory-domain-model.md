# Salience Atlas V2 - Inventory Intelligence Domain Model

This document outlines the core ontology and data structure of the **Inventory Intelligence Domain** inside Salience Atlas V2, making inventory a first-class ontology object integrated with supply project chains.

## Ontology Object Schema: `InventoryItem`

Each physical item within the KETRACO electricity transmission grid inventory is represented as an ontology object containing the following structural segments:

### 1. Identity
*   `id`: `string` (UUID or SAP Material Number baseline, e.g., `MAT-402830`)
*   `name`: `string` (Human-readable catalog name, e.g., `XLPE Insulated Power Cable 132kV`)
*   `description`: `string` (Detailed technical specs, dimensions, material standard)
*   `barcode`: `string` / `RFID`: `string` (Operational tracking parameters)

### 2. Classification
*   `category`: `string` (`Conductors` | `Insulators` | `Transformers` | `Circuit Breakers` | `Gantry Steel` | `Earthing Kits`)
*   `materialGroup`: `string` (SAP Material Group categorization, e.g., `SG-08-CABLES`)
*   `criticality`: `'CRITICAL_SPARE' | 'HIGH' | 'MEDIUM' | 'LOW'` (Determines SLA urgency and reorder priority)
*   `lifecycleStatus`: `'ACTIVE' | 'PHASE_OUT' | 'OBSOLETE' | 'RESTRICTED'`

### 3. Spatial & Stewardship Location
*   `storageLocation`: `string` (Specific depot or bay code, e.g., `BAY-04-ZONE-C`)
*   `warehouseCode`: `string` (Authoritative warehouse, e.g., `CENTRAL_WH_NBI` | `MARIAKANI_DEPOT` | `ISINYA_STORE`)
*   `owningDepartment`: `string` (Responsible technical team, e.g., `EHV_TRANSMISSION_ENGINEERING`)

### 4. Quantities & Thresholds
*   `currentQuantity`: `number` (Physical ledger stock count)
*   `reservedQuantity`: `number` (Committed stock assigned to active project/work orders)
*   `availableQuantity`: `number` (`currentQuantity - reservedQuantity`)
*   `safetyStock`: `number` (Minimum buffer capacity required)
*   `reorderPoint`: `number` (Trigger threshold for demand actions)
*   `unitOfMeasure`: `string` (`Meters` | `Units` | `Kits` | `Metric Tons`)
*   `leadTime`: `number` (Average replenishment timeframe in days, e.g., `45`)

### 5. Multi-Domain Relationships
*   `supplierRelationships`: `string[]` (Linked supplier profile URN hashes, e.g., `urn:atlas:supplier:shanghai-cable`)
*   `projectRelationships`: `string[]` (Linked project scope references, e.g., `urn:atlas:project:suswa-lot-4`)
*   `contractRelationships`: `string[]` (Linked Framework Contracts, e.g., `urn:atlas:contract:fw-2025-09`)
*   `shipmentRelationships`: `string[]` (Active in-transit cargo lines, e.g., `urn:atlas:shipment:sh-nbi-transit-09`)

### 6. Operational History & Logging
*   `auditHistory`: `AuditLogEntry[]` (Ledger receipts, stock transfers, physical count verifications)
*   `decisionHistory`: `DecisionRef[]` (Prior reorder or allocation approvals)

### 7. Core Risk & Simulation Profiles
*   `riskProfile`: `RiskMatrix` (Critical scarcity rating, local environment corrosion rate, delivery delay risk)
*   `simulationProfile`: `SimulationFactors` (Scenario parameters for stress testing supplier failure or demand spike shocks)
