/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Grid Data Fabric Initialization Example
 * 
 * Shows how to initialize the fabric and register providers
 */

import { GridDataFabric, ProviderConfig } from '../data-fabric';
import {
  ScadaEmsProvider,
  WamsPmuProvider,
  GisPostgisProvider,
  SapEamProvider,
  HistorianProvider,
  WeatherProvider,
  OutageManagementProvider,
  GenerationProvider,
  MarketDispatchProvider,
} from '../data-fabric/adapters';

/**
 * Initialize the production data fabric
 * Can be called during application startup
 */
export async function initializeGridDataFabric(): Promise<GridDataFabric> {
  const fabric = GridDataFabric.getInstance({
    enablePersistence: true,
    enableEventCaching: true,
    maxCacheSize: 100000,
  });

  await fabric.initialize();

  // Register SCADA/EMS Provider
  const scadaConfig: ProviderConfig = {
    providerId: 'scada-ems-primary',
    type: 'SCADA_EMS',
    enabled: true,
    credentials: {
      endpoint: process.env.SCADA_ENDPOINT || 'tcp://scada.ketraco.local:502',
      username: process.env.SCADA_USERNAME,
      password: process.env.SCADA_PASSWORD,
    },
    polling: {
      enabled: true,
      intervalSeconds: 30,
    },
    subscriptionMode: 'REAL_TIME',
    retryPolicy: {
      maxRetries: 3,
      backoffMs: 5000,
    },
  };
  await fabric.registerProvider(new ScadaEmsProvider(scadaConfig));

  // Register WAMS/PMU Provider
  const wamsConfig: ProviderConfig = {
    providerId: 'wams-pmu-primary',
    type: 'WAMS_PMU',
    enabled: true,
    credentials: {
      endpoint: process.env.WAMS_ENDPOINT || 'tcp://pdc.ketraco.local:4713',
      apiKey: process.env.WAMS_API_KEY,
    },
    polling: {
      enabled: true,
      intervalSeconds: 5, // PMU data is high-frequency
    },
    subscriptionMode: 'REAL_TIME',
  };
  await fabric.registerProvider(new WamsPmuProvider(wamsConfig));

  // Register GIS/PostGIS Provider
  const gisConfig: ProviderConfig = {
    providerId: 'gis-postgis-primary',
    type: 'GIS_POSTGIS',
    enabled: true,
    credentials: {
      endpoint: process.env.POSTGIS_CONNECTION || 'postgresql://gis.ketraco.local/grid_gis',
      username: process.env.POSTGIS_USER,
      password: process.env.POSTGIS_PASSWORD,
    },
    polling: {
      enabled: false, // GIS is event-driven
    },
    subscriptionMode: 'BATCH',
  };
  await fabric.registerProvider(new GisPostgisProvider(gisConfig));

  // Register SAP EAM Provider
  const eamConfig: ProviderConfig = {
    providerId: 'sap-eam-primary',
    type: 'SAP_EAM',
    enabled: true,
    credentials: {
      endpoint: process.env.SAP_EAM_ENDPOINT || 'https://sap.ketraco.local:8000',
      username: process.env.SAP_EAM_USER,
      password: process.env.SAP_EAM_PASSWORD,
    },
    polling: {
      enabled: true,
      intervalSeconds: 300, // Poll every 5 minutes
    },
    subscriptionMode: 'BATCH',
  };
  await fabric.registerProvider(new SapEamProvider(eamConfig));

  // Register Historian Provider
  const historianConfig: ProviderConfig = {
    providerId: 'historian-primary',
    type: 'HISTORIAN',
    enabled: true,
    credentials: {
      endpoint: process.env.HISTORIAN_ENDPOINT || 'http://historian.ketraco.local:7771',
    },
    polling: {
      enabled: false,
    },
    subscriptionMode: 'BATCH',
  };
  await fabric.registerProvider(new HistorianProvider(historianConfig));

  // Register Weather Provider
  const weatherConfig: ProviderConfig = {
    providerId: 'weather-primary',
    type: 'WEATHER',
    enabled: true,
    credentials: {
      apiKey: process.env.OPENWEATHER_API_KEY,
      endpoint: 'https://api.openweathermap.org',
    },
    polling: {
      enabled: true,
      intervalSeconds: 600, // Poll every 10 minutes
    },
    subscriptionMode: 'BATCH',
  };
  await fabric.registerProvider(new WeatherProvider(weatherConfig));

  // Register Outage Management Provider
  const omsConfig: ProviderConfig = {
    providerId: 'outage-mgmt-primary',
    type: 'OUTAGE_MGMT',
    enabled: true,
    credentials: {
      endpoint: process.env.OMS_ENDPOINT || 'https://oms.ketraco.local/api',
      apiKey: process.env.OMS_API_KEY,
    },
    polling: {
      enabled: true,
      intervalSeconds: 60,
    },
    subscriptionMode: 'REAL_TIME',
  };
  await fabric.registerProvider(new OutageManagementProvider(omsConfig));

  // Register Generation Provider
  const genConfig: ProviderConfig = {
    providerId: 'generation-primary',
    type: 'GENERATION',
    enabled: true,
    credentials: {
      endpoint: process.env.GENERATION_ENDPOINT || 'https://gen.kengen.co.ke/api',
      apiKey: process.env.GENERATION_API_KEY,
    },
    polling: {
      enabled: true,
      intervalSeconds: 30,
    },
    subscriptionMode: 'REAL_TIME',
  };
  await fabric.registerProvider(new GenerationProvider(genConfig));

  // Register Market/Dispatch Provider
  const marketConfig: ProviderConfig = {
    providerId: 'market-dispatch-primary',
    type: 'MARKET_DISPATCH',
    enabled: true,
    credentials: {
      endpoint: process.env.MARKET_ENDPOINT || 'https://market.ketraco.local/api',
      apiKey: process.env.MARKET_API_KEY,
    },
    polling: {
      enabled: true,
      intervalSeconds: 60,
    },
    subscriptionMode: 'REAL_TIME',
  };
  await fabric.registerProvider(new MarketDispatchProvider(marketConfig));

  // Setup event listeners for monitoring
  fabric.on('provider-registered', (event) => {
    console.log('[GRID-FABRIC-INIT] Provider registered:', event);
  });

  fabric.on('telemetry-updated', (event) => {
    console.log('[GRID-FABRIC-INIT] Telemetry updated:', {
      assetId: event.assetId,
      provider: event.providerId,
      timestamp: event.timestamp,
    });
  });

  fabric.on('provider-health', (event) => {
    if (event.health !== 'HEALTHY') {
      console.warn('[GRID-FABRIC-INIT] Provider health issue:', event);
    }
  });

  const status = await fabric.getStatus();
  console.log('[GRID-FABRIC-INIT] Fabric initialized:', status);

  return fabric;
}

/**
 * Get the fabric instance (singleton)
 */
export function getGridDataFabric(): GridDataFabric {
  return GridDataFabric.getInstance();
}

export default initializeGridDataFabric;
