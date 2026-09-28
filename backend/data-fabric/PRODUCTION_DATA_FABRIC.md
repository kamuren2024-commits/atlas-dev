# KETRACO COMMAND CENTER - PHASE 07: PRODUCTION DATA FABRIC

## Section 2 Implementation Complete

This document describes the complete implementation of the **Production Data Fabric** for the KETRACO Command Center Phase 07, as specified in the Phase 07 requirements document.

---

## Architecture Overview

The Production Data Fabric creates a unified, event-driven architecture for consuming data from all grid data sources. It:

1. **Abstracts data providers** behind a consistent interface (`IGridDataProvider`)
2. **Normalizes data** into canonical formats (`GridAsset`, `GridTelemetry`, `GridEvent`)
3. **Enables real-time subscriptions** with flexible filtering
4. **Supports historical queries** with time-series aggregation
5. **Maintains health monitoring** of all data sources
6. **Provides event-driven** architecture for reactive updates
7. **Allows production connectors** to be swapped without modifying Command Center components

---

## Core Components

### 1. GridDataFabric (Main Coordinator)
**Location:** `backend/data-fabric/grid-data-fabric.ts`

The main coordinator class that:
- Maintains singleton instance for application-wide access
- Registers and unregisters data providers
- Aggregates assets and telemetry from all providers
- Coordinates health checks and subscriptions
- Emits events for all significant state changes
- Provides query interfaces for historical data

**Key Methods:**
```typescript
// Initialization
getInstance(options?: GridDataFabricOptions): GridDataFabric
initialize(): Promise<void>

// Provider Management
registerProvider(provider: IGridDataProvider): Promise<void>
unregisterProvider(providerId: string): Promise<void>
getProviders(): IGridDataProvider[]
getProvider(providerId: string): IGridDataProvider | undefined

// Asset Access
getAssets(): GridAsset[]
getAssetsByType(type: string): GridAsset[]
getAsset(assetId: string): GridAsset | undefined

// Telemetry Access
getLatestTelemetry(assetId: string): GridTelemetry | undefined
getTelemetryHistory(assetId: string, limit?: number): GridTelemetry[]
queryTelemetry(params): Promise<GridTelemetry[]>

// Health & Status
getHealthStatus(): Promise<ProviderHealthStatus[]>
getStatus(): Promise<FabricStatus>

// Lifecycle
shutdown(): Promise<void>
```

### 2. IGridDataProvider Interface
**Location:** `backend/data-fabric/types.ts`

Contract that all providers must implement:

```typescript
interface IGridDataProvider {
  // Identification
  getProviderId(): string
  getProviderType(): DataSourceType
  
  // Lifecycle
  connect(): Promise<void>
  disconnect(): Promise<void>
  health(): Promise<ProviderHealthStatus>
  
  // Real-time Subscriptions
  subscribe(callback, filter?): Promise<string>
  unsubscribe(subscriptionId): Promise<void>
  
  // Data Access
  snapshot(): Promise<{ assets, telemetry, timestamp }>
  query(params): Promise<GridTelemetry[]>
  
  // Metadata
  getConfig(): Record<string, any>
  getStats(): Promise<Stats>
}
```

### 3. BaseGridDataProvider
**Location:** `backend/data-fabric/base-provider.ts`

Abstract base class providing:
- Common subscription handling
- Polling-based data collection
- Statistics tracking
- Audit logging
- Connection lifecycle management

Derived classes only need to implement:
- `connect()` - Connect to data source
- `disconnect()` - Disconnect gracefully
- `health()` - Report health status
- `snapshot()` - Get current state
- `query()` - Query historical data

### 4. Data Adapters (9 Implementations)

Each adapter connects to a specific data source:

#### SCADA/EMS Provider
**Location:** `backend/data-fabric/adapters/scada-ems-provider.ts`
- Connects to SCADA and Energy Management Systems
- Provides substation telemetry (voltage, current, power, frequency)
- Supports real-time polling or subscriptions
- Mock data: 3 substations with realistic power flow data

#### WAMS/PMU Provider
**Location:** `backend/data-fabric/adapters/wams-pmu-provider.ts`
- Wide Area Monitoring Systems and Phasor Measurement Units
- High-resolution synchronized phasor data
- Provides voltage/current phase angles and rates of change
- Critical for grid stability monitoring

#### GIS/PostGIS Provider
**Location:** `backend/data-fabric/adapters/gis-postgis-provider.ts`
- Geographic Information Systems with spatial database
- Assets: Feeders, Transformers, Breakers, Capacitors
- Provides network topology and asset locations
- Mock data: CBD network with 4 different asset types

#### SAP EAM Provider
**Location:** `backend/data-fabric/adapters/sap-eam-provider.ts`
- Enterprise Asset Management
- Maintenance schedules, work orders, asset lifecycle
- Provides MTBF, reliability metrics, maintenance status
- Integrates asset aging and maintenance history

#### Historian Provider
**Location:** `backend/data-fabric/adapters/historian-provider.ts`
- Time-series data historian
- Efficient retrieval of historical telemetry
- Optimized for 1m, 5m, 15m, 1h, 24h aggregations
- Supports millions of data points

#### Weather Provider
**Location:** `backend/data-fabric/adapters/weather-provider.ts`
- Integration with weather APIs (OpenWeather, NOAA)
- Temperature, humidity, wind, solar radiation, rainfall
- Critical for renewable generation forecasting
- Mock data: 2 weather stations

#### Outage Management Provider
**Location:** `backend/data-fabric/adapters/outage-mgmt-provider.ts`
- Tracks power outages and service disruptions
- Outage duration, affected customers, root cause
- Real-time incident tracking
- Historical outage analysis

#### Generation Provider
**Location:** `backend/data-fabric/adapters/generation-provider.ts`
- Power plant operational data
- Thermal, hydro, solar, wind generation
- Provides: Generation MW, utilization, efficiency, temperature
- Mock data: Olkaria Geothermal, Kiambere Hydro, Solar Farm

#### Market/Dispatch Provider
**Location:** `backend/data-fabric/adapters/market-dispatch-provider.ts`
- Market operations and dispatch systems
- Spot prices, demand forecasts, reserve margins
- Dispatch instructions and operational constraints
- Market congestion levels

---

## Canonical Data Types

### GridAsset
```typescript
interface GridAsset {
  id: string
  type: 'SUBSTATION' | 'FEEDER' | 'TRANSFORMER' | 'BREAKER' | 'GENERATOR' | 'LOAD' | 'CAPACITOR' | 'REACTOR'
  name: string
  location: {
    latitude: number
    longitude: number
    zone?: string
    region?: string
  }
  owner: string
  operatingVoltage: number
  ratedCapacity?: number
  metadata: Record<string, any>
  lastUpdated: string
}
```

### GridTelemetry
```typescript
interface GridTelemetry {
  assetId: string
  timestamp: string
  measurements: {
    voltage?: number
    current?: number
    activePower?: number
    reactivePower?: number
    powerFactor?: number
    frequency?: number
    temperature?: number
    [key: string]: any
  }
  quality: {
    confidence: number  // 0-100
    source: string
    lastVerified: string
  }
  raw?: Record<string, any>  // Original provider format
}
```

### GridEvent
```typescript
interface GridEvent {
  id: string
  type: 'TELEMETRY_UPDATED' | 'ASSET_STATE_CHANGED' | 'BREAKER_CHANGED' | 'ALARM_CREATED' | 'ALARM_CLEARED' | 'OUTAGE_CREATED' | 'OUTAGE_UPDATED' | 'FORECAST_UPDATED' | 'RISK_UPDATED' | 'INCIDENT_CREATED' | 'INCIDENT_RESOLVED'
  sourceId: string
  timestamp: string
  payload: Record<string, any>
  severity: 'INFO' | 'WARNING' | 'CRITICAL'
}
```

---

## API Endpoints

**Base Path:** `/api/fabric`

### Fabric Status & Health
```
GET /status                          # Overall fabric status
GET /health                          # All provider health status
GET /providers                       # List registered providers
```

### Asset Access
```
GET /assets                          # All assets
GET /assets/:type                    # Assets by type (SUBSTATION, FEEDER, etc)
GET /telemetry/:assetId             # Latest telemetry
GET /telemetry/:assetId/history     # Telemetry history (limit queryable)
```

### Provider Operations
```
POST /query                          # Query telemetry across providers
GET /providers/:providerId/stats     # Provider statistics
GET /providers/:providerId/health    # Provider health
POST /providers/:providerId/snapshot # Get provider snapshot
```

### Example Requests

**Query telemetry for a 24-hour period with 1-hour aggregation:**
```bash
POST /api/fabric/query
{
  "assetIds": ["asset-id-1", "asset-id-2"],
  "startTime": "2026-08-29T00:00:00Z",
  "endTime": "2026-08-30T00:00:00Z",
  "aggregation": "1h"
}
```

**Get latest telemetry for an asset:**
```bash
GET /api/fabric/telemetry/asset-id-1
```

**Get provider statistics:**
```bash
GET /api/fabric/providers/scada-ems-primary/stats
```

---

## Initialization

### Automatic Initialization
The fabric should be initialized during application startup:

```typescript
import { initializeGridDataFabric } from './backend/integration/fabric-init';

// In application startup
async function startup() {
  const fabric = await initializeGridDataFabric();
  // Fabric now has all providers registered and listening
}
```

### Manual Provider Registration
```typescript
import { GridDataFabric, ScadaEmsProvider, ProviderConfig } from './backend/data-fabric';

const fabric = GridDataFabric.getInstance();
const config: ProviderConfig = {
  providerId: 'scada-ems-backup',
  type: 'SCADA_EMS',
  enabled: true,
  credentials: { endpoint: 'tcp://backup-scada.local:502' },
  subscriptionMode: 'REAL_TIME',
  polling: { enabled: true, intervalSeconds: 60 }
};
await fabric.registerProvider(new ScadaEmsProvider(config));
```

---

## Event Emission

The GridDataFabric extends EventEmitter and emits events:

```typescript
// Provider registered
fabric.on('provider-registered', (event) => {
  console.log(`Provider ${event.providerId} registered`);
});

// Real-time telemetry updates
fabric.on('telemetry-updated', (event) => {
  console.log(`Asset ${event.assetId}: ${event.measurements.voltage}V`);
});

// Provider health changes
fabric.on('provider-health', (event) => {
  if (event.health !== 'HEALTHY') {
    console.warn(`Provider ${event.providerId} degraded`);
  }
});

// Snapshot synchronized
fabric.on('snapshot-synced', (event) => {
  console.log(`Synced ${event.assetCount} assets from ${event.providerId}`);
});

// Provider unregistered
fabric.on('provider-unregistered', (event) => {
  console.log(`Provider ${event.providerId} removed`);
});
```

---

## Configuration via Environment Variables

The fabric initializes providers based on environment variables:

```bash
# SCADA/EMS
SCADA_ENDPOINT=tcp://scada.ketraco.local:502
SCADA_USERNAME=admin
SCADA_PASSWORD=***

# WAMS/PMU
WAMS_ENDPOINT=tcp://pdc.ketraco.local:4713
WAMS_API_KEY=***

# GIS/PostGIS
POSTGIS_CONNECTION=postgresql://gis.ketraco.local/grid_gis
POSTGIS_USER=gis_admin
POSTGIS_PASSWORD=***

# SAP EAM
SAP_EAM_ENDPOINT=https://sap.ketraco.local:8000
SAP_EAM_USER=eam_system
SAP_EAM_PASSWORD=***

# Historian
HISTORIAN_ENDPOINT=http://historian.ketraco.local:7771

# Weather
OPENWEATHER_API_KEY=***

# Outage Management
OMS_ENDPOINT=https://oms.ketraco.local/api
OMS_API_KEY=***

# Generation
GENERATION_ENDPOINT=https://gen.kengen.co.ke/api
GENERATION_API_KEY=***

# Market/Dispatch
MARKET_ENDPOINT=https://market.ketraco.local/api
MARKET_API_KEY=***
```

---

## Key Design Principles

### 1. Provider Abstraction
All providers implement the same interface. The Command Center doesn't know or care about provider details.

### 2. Runtime Swappability
Providers can be:
- Added/removed while running
- Replaced with different implementations
- Disabled without affecting others
- Modified for production credentials

### 3. Canonical Normalization
All provider data is normalized into `GridAsset`, `GridTelemetry`, `GridEvent` types, ensuring consistent Command Center logic.

### 4. Event-Driven
- Real-time updates via subscriptions
- Event queue for processing
- Health monitoring with automatic escalation
- Graceful degradation

### 5. Persistent & Queryable
- Telemetry caching (configurable limits)
- Historical query support
- Event archival for audit
- Integration with database/Redis

### 6. Production-Ready
- Retry policies
- Health checks
- Error handling
- Audit logging
- Statistics tracking

---

## Testing the Fabric

### 1. Basic Connectivity
```bash
curl http://localhost:3000/api/fabric/status
```

### 2. Provider Health
```bash
curl http://localhost:3000/api/fabric/health
```

### 3. List Assets
```bash
curl http://localhost:3000/api/fabric/assets
```

### 4. Query Telemetry
```bash
curl -X POST http://localhost:3000/api/fabric/query \
  -H "Content-Type: application/json" \
  -d '{
    "assetIds": ["<asset-id>"],
    "startTime": "2026-08-29T00:00:00Z",
    "endTime": "2026-08-30T00:00:00Z",
    "aggregation": "1h"
  }'
```

---

## Next Steps

### Phase 07 Section 3: Real-Time Event Fabric
- Implement event bus (Kafka/Redpanda)
- Create event subscribers and processors
- Setup real-time WebSocket/SSE connections
- Implement event persistence

### Phase 07 Section 4: Persistence
- Store assets in database
- Archive telemetry points
- Persist alarm/incident records
- Implement retention policies

### Phase 07 Section 5: Time-Series Telemetry
- Optimize storage for different aggregation levels
- Implement time-series compression
- Create query optimizer
- Add anomaly detection

---

## File Structure

```
backend/data-fabric/
├── index.ts                           # Module exports
├── types.ts                           # Canonical data types
├── grid-data-fabric.ts                # Main coordinator
├── base-provider.ts                   # Abstract base class
└── adapters/
    ├── index.ts                       # Adapter exports
    ├── scada-ems-provider.ts          # SCADA/EMS adapter
    ├── wams-pmu-provider.ts           # WAMS/PMU adapter
    ├── gis-postgis-provider.ts        # GIS/PostGIS adapter
    ├── sap-eam-provider.ts            # SAP EAM adapter
    ├── historian-provider.ts          # Historian adapter
    ├── weather-provider.ts            # Weather adapter
    ├── outage-mgmt-provider.ts        # Outage Management adapter
    ├── generation-provider.ts         # Generation adapter
    └── market-dispatch-provider.ts    # Market/Dispatch adapter

backend/integration/
├── fabric-init.ts                     # Initialization & setup
├── fabric-api-routes.ts               # REST API endpoints
└── connector-framework.ts             # (existing)
```

---

## Success Criteria

✅ **Unified Data Fabric** - All grid data flows through single interface
✅ **9 Data Adapters** - SCADA, WAMS, GIS, SAP, Historian, Weather, OMS, Generation, Market
✅ **Real-time Subscriptions** - Event-driven data delivery
✅ **Historical Queries** - Time-series data with aggregation
✅ **Health Monitoring** - Automatic provider health checks
✅ **Event-Driven Architecture** - Observable state changes
✅ **Production Connectors Replaceable** - No Command Center code changes needed
✅ **REST API Exposed** - Full fabric access via HTTP endpoints
✅ **Environment Configuration** - Provider credentials via env vars
✅ **Comprehensive Documentation** - This document

---

**Status:** ✅ COMPLETE - Section 2: Production Data Fabric is fully implemented and ready for production integration.
