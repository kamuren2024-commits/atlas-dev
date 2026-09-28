# Salience Atlas V2 - SAP ERP Federation Layer

This document details the **SAP ERP Federation Architecture**, establishing KETRACO's SAP ERP as the authoritative system of record while deploying Atlas as the cognitive intelligence layer.

## The Architectural Core Principle

*   **SAP ERP S/4HANA & ECC** remain the absolute **authoritative single source of truth** for all asset levels, ledger balances, general ledgers, purchase registers, and warehouse assets.
*   **Salience Atlas V2** operates as a read-only analytical and event-driven orchestration overlay. It does NOT write straight database updates to ERP without human approval and structural validation.

```
+-----------------------------------+
|      SALIENCE ATLAS ENGINE        |
|                                   |
|   +---------------------------+   |
|   |   Cognitive Agents (OS)   |   |
|   +---------------------------+   |
|                 ▲                 |
|                 │ Event / Stream  |
|                 ▼                 |
|   +---------------------------+   |
|   |    Federation Adapter     |   |
|   +---------------------------+   |
+-----------------▲-----------------+
                  │ RFC/OData
                  ▼
+-----------------------------------+
|    SAP S/4HANA / ENTERPRISE ERP   |
|                                   |
|   +---------------------------+   |
|   |   Database Ledger (DB)    |   |
|   +---------------------------+   |
+-----------------------------------+
```

---

## Federation Component Framework

### 1. ERP Adapter Layer
*   Exposes a unified contract API mapping ERP structural structures (SAP BAPIs / RFMs / OData services) to the internal Salience Atlas entity types.
*   Supports adapters for **SAP S/4HANA**, **SAP ECC 6.0**, **Oracle Fusion**, **Microsoft Dynamics F&O**, and **IFS Application Suite**.

### 2. ERP Event Bridge
*   Listens to enterprise message brokers (e.g., SAP Enterprise Messaging, Kafka, RabbitMQ) for Change Data Capture (CDC) events such as Goods receipts, Goods issues, and stock balance shifts.

### 3. ERP Sync Engine
*   Manages both bulk batch sync routines (e.g., nightly material master downloads) and streaming triggers.
*   Incorporates **Replay & Recovery** buffers to handle connection gaps without losing state history.

### 4. ERP Federation Cache
*   Maintains a lightning-fast, schema-aligned materialized copy of stock quantities to power agent calculations and live twin interactions without overloading transactional SAP database loops.
