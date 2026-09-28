# Knowledge Graph API Contract & Data Schema Specification

**System**: Salience Atlas Enterprise Intelligence Platform  
**Subsystem**: Knowledge Graph REST API Contract  
**Version**: 3.2.0-Enterprise  

---

## Overview

This document specifies the canonical REST API endpoints, request parameters, response schemas, and domain models for the Salience Atlas Knowledge Graph. All endpoints are mounted under both `/api/v3/graph` and the canonical top-level alias `/api/knowledge-graph`.

---

## 1. Domain Object Contracts

### Entity Contract (`GraphNode`)
```typescript
export interface GraphNode {
  id: string;
  type: 
    | 'PERSON' | 'ORGANIZATION' | 'EMPLOYEE' | 'SUPPLIER' | 'DIRECTOR'
    | 'TENDER' | 'BID' | 'EVALUATION' | 'LOT' | 'CONTRACT' | 'PROJECT'
    | 'PROGRAM' | 'ASSET' | 'SUBSTATION' | 'TRANSFORMER' | 'TRANSMISSION_LINE'
    | 'TOWER' | 'SHIPMENT' | 'CONTAINER' | 'WAREHOUSE' | 'INVENTORY_ITEM'
    | 'INVOICE' | 'PAYMENT' | 'RISK' | 'INCIDENT' | 'DOCUMENT' | 'LOCATION'
    | 'COUNTY' | 'PARCEL' | 'WAYLEAVE' | 'COMMUNITY' | 'REGULATION' | 'POLICY'
    | 'CONTROL' | 'WORKFLOW' | 'TASK' | 'MISSION' | 'DECISION' | 'AGENT'
    | 'AI_MODEL' | 'RULE' | 'EVIDENCE' | 'OFFICER' | 'ENTITY';
  label: string;
  properties: {
    tenantId: string;
    sourceSystem: string;
    observedAt: string;
    status?: string;
    title?: string;
    pin?: string;
    ipAddress?: string;
    nationality?: string;
    criticality?: string;
    value?: number;
    [key: string]: any;
  };
}
```

### Relationship Contract (`GraphEdge`)
```typescript
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string; // 'ISSUED_BY' | 'SUBMITTED_BID' | 'DIRECTOR_OF' | 'COMPLIES_WITH' | 'AWARDED' | 'DELIVERS_FOR' | 'DEPENDS_ON' | 'CONTAINS' | 'STORED_AT' | 'USES' | 'HAS_RISK' | 'IMPACTS'
  confidence: number; // 0.0 to 1.0
  relationshipClass?: 'DIRECT' | 'INDIRECT' | 'INFERRED' | 'POTENTIAL';
  properties: Record<string, any>;
  provenance?: {
    source: string;
    sourceRecordId?: string;
    observedAt: string;
    createdBy?: string;
    verificationStatus: 'VERIFIED' | 'SYSTEM_DERIVED' | 'AI_INFERRED' | 'USER_DECLARED' | 'UNVERIFIED';
    confidence?: number;
  };
}
```

---

## 2. API Endpoints Specification

### 1. Get Full Graph Snapshot
* **HTTP Method**: `GET`
* **Path**: `/api/v3/graph` or `/api/knowledge-graph`
* **Response**:
```json
{
  "nodes": [
    {
      "id": "ent-ketraco",
      "type": "ENTITY",
      "label": "KETRACO",
      "properties": {
        "role": "PROCURING_ENTITY",
        "tenantId": "ketraco",
        "sourceSystem": "atlas-seed-adapter",
        "observedAt": "2026-09-25T10:00:00.000Z"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "tender-2026-08",
      "target": "ent-ketraco",
      "type": "ISSUED_BY",
      "confidence": 1.0,
      "properties": {},
      "provenance": {
        "source": "atlas-seed-adapter",
        "sourceRecordId": "tender-2026-08",
        "observedAt": "2026-09-25T10:00:00.000Z",
        "verificationStatus": "VERIFIED",
        "confidence": 1.0
      }
    }
  ]
}
```

---

### 2. Traverse Graph Neighborhood
* **HTTP Method**: `GET`
* **Path**: `/api/v3/graph/traverse/:id?depth=2` or `/api/knowledge-graph/traverse/:id?depth=2`
* **Parameters**:
  * `id` (path): Target entity ID.
  * `depth` (query, optional): Search depth (1 to 3, default 2).
* **Response**:
```json
{
  "nodes": [ ... ],
  "edges": [ ... ]
}
```

---

### 3. Search Graph
* **HTTP Method**: `GET`
* **Path**: `/api/v3/graph/search?q=:q` or `/api/knowledge-graph/search?q=:q`
* **Parameters**:
  * `q` (query): Search term.
* **Response**:
```json
[
  {
    "id": "supplier-shanghai",
    "type": "SUPPLIER",
    "label": "Shanghai Grid Metal Corp",
    "properties": {
      "pin": "P051284920K",
      "ipAddress": "192.168.1.50"
    }
  }
]
```

---

### 4. Graph Impact Analysis
* **HTTP Method**: `GET`
* **Path**: `/api/v3/graph/impact/:id` or `/api/knowledge-graph/impact/:id`
* **Response**:
```json
{
  "trigger": {
    "id": "shipment-cable-01",
    "type": "SHIPMENT",
    "label": "Shipment SHP-CABLE-01",
    "properties": { "status": "DELAYED" }
  },
  "affectedNodes": [ ... ],
  "relationships": [ ... ],
  "risks": [
    {
      "id": "risk-shipment-delay",
      "type": "RISK",
      "label": "Shipment delay exposure",
      "properties": { "severity": "HIGH", "status": "OPEN" }
    }
  ]
}
```

---

### 5. Find Shortest Path
* **HTTP Method**: `GET`
* **Path**: `/api/v3/graph/path?from=:from&to=:to&depth=5` or `/api/knowledge-graph/path?from=:from&to=:to`
* **Parameters**:
  * `from` (query): Starting node ID.
  * `to` (query): Target node ID.
* **Response**:
```json
{
  "nodes": [ ... ],
  "edges": [ ... ]
}
```

---

### 6. Get Single Entity Details
* **HTTP Method**: `GET`
* **Path**: `/api/v3/graph/entities/:id` or `/api/knowledge-graph/entities/:id`
* **Response**: Returns canonical `GraphNode` object or `404 Entity not found`.

---

### 7. Get Graph Statistics
* **HTTP Method**: `GET`
* **Path**: `/api/v3/graph/stats` or `/api/knowledge-graph/stats`
* **Response**:
```json
{
  "nodeCount": 14,
  "edgeCount": 14,
  "nodeTypes": {
    "ENTITY": 1,
    "TENDER": 1,
    "SUPPLIER": 2,
    "DIRECTOR": 2,
    "RULE": 1,
    "CONTRACT": 1,
    "PROJECT": 1,
    "SHIPMENT": 1,
    "INVENTORY_ITEM": 1,
    "WAREHOUSE": 1,
    "TRANSFORMER": 1,
    "RISK": 1
  },
  "status": "SYNCED",
  "activeConflicts": 2,
  "lastUpdated": "2026-09-25T10:00:00.000Z"
}
```

---

### 8. Collusion Intelligence Analysis
* **HTTP Method**: `GET`
* **Path**: `/api/v3/collusion/analyze` or `/api/knowledge-graph/collusion/analyze`
* **Response**:
```json
[
  {
    "id": "collusion-01",
    "title": "Horizontal Bidder Collusion Detected",
    "tenderId": "tender-2026-08",
    "bidders": ["supplier-shanghai", "supplier-siemens"],
    "commonDirectors": ["director-liang"],
    "matchingIp": "192.168.1.50",
    "riskLevel": "CRITICAL",
    "confidence": 0.98,
    "provenance": {
      "source": "collusion-detection-engine",
      "observedAt": "2026-09-25T10:00:00.000Z",
      "verificationStatus": "SYSTEM_DERIVED"
    }
  }
]
```
