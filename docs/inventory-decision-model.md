# Salience Atlas V2 - Inventory Decision Model

This document outlines the **Decision Intelligence framework** implemented within the Inventory Intelligence Domain to ensure structured, safe, and transparent actions.

## Decisions as First-Class Ontology Objects

In Salience Atlas, decisions are not transient inputs; they are structured, persistent nodes linked directly to the system's ontology graph.

### Core Structure of a Decision Node

```json
{
  "decisionId": "DEC-INV-001",
  "category": "REORDER_PLAN | STOCK_TRANSFER | EMERGENCY_DIRECT | SUPPLIER_SUBSTITUTION",
  "title": "XLPE Cable Direct Procurement Execution",
  "recommendedAction": "Establish direct award to Shanghai Grid Cable Corp..."
  "confidenceScore": 94.2,
  "groundedEvidence": [
    { "source": "ERP Balance: 1250 Meters", "urn": "urn:atlas:erp:stock:xlpe-132kv" },
    { "source": "Min Buffer Rule: 1500 Meters", "urn": "urn:atlas:policy:min-buffer:xlpe-132" },
    { "source": "Suswa Project Critical Path", "urn": "urn:atlas:project:suswa-critical-path" }
  ],
  "riskMatrix": [
    { "risk": "Freight Premium (+$50k)", "severity": "MEDIUM", "probability": "HIGH" }
  ],
  "evaluatedAlternatives": [
    { "option": "Air-freight Direct Award", "costDelta": "$820k", "timeSLA": "4 Days", "gridRisk": "LOW" },
    { "option": "National Restricted Tender", "costDelta": "$680k", "timeSLA": "45 Days", "gridRisk": "HIGH" }
  ],
  "associatedContracts": [ "urn:atlas:contract:ct-2025-08" ],
  "simulationDeltas": {
    "cost": "+$140,000 shipping overhead",
    "schedule": "Recovers 14 days grid-connection delay"
  },
  "complianceAuditPath": "PPADA 2015 Section 103 (Direct Emergency Sourcing Guidelines)"
}
```

---

## Standard Operational Decision Types

1.  **Dynamic Reorder Actions**: Automatically compiled when available stock falls below safety parameters. Collects supplier performance metrics and active contract values.
2.  **Stock Transfer Decisions**: Cross-depot rebalancing proposals. For instance, shifting 20 insulation kits from Mariakani to Isinya based on relative urgency.
3.  **Emergency Direct Procurement**: Triggers when critical substation equipment fails, posing immediate grid blackout threats.
4.  **Supplier Substitution**: Recommendation to switch to secondary suppliers when a primary supplier's delivery risks exceed limit parameters (e.g., index rating drop below 60%).
