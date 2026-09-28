/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Data Fabric ↔ Event Fabric Integration
 * 
 * Connects grid data sources to real-time event streaming
 */

import { GridDataFabric } from '../data-fabric/grid-data-fabric';
import { EventFabric } from './event-fabric';

/**
 * Integration coordinator
 */
export class DataEventFabricIntegration {
  private static instance: DataEventFabricIntegration | null = null;
  private dataFabric: GridDataFabric;
  private eventFabric: EventFabric;
  private telemetryListenerIds: string[] = [];
  private initialized = false;

  private constructor() {
    this.dataFabric = GridDataFabric.getInstance();
    this.eventFabric = EventFabric.getInstance();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): DataEventFabricIntegration {
    if (!DataEventFabricIntegration.instance) {
      DataEventFabricIntegration.instance = new DataEventFabricIntegration();
    }
    return DataEventFabricIntegration.instance;
  }

  /**
   * Initialize integration
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[DATA-EVENT-INTEGRATION] Initializing fabric integration...');

    // Subscribe to data fabric telemetry events
    this.subscribeTelemetryEvents();

    // Subscribe to data fabric grid events
    this.subscribeGridEvents();

    this.initialized = true;
    console.log('[DATA-EVENT-INTEGRATION] Fabric integration initialized');
  }

  /**
   * Subscribe to telemetry updates from data fabric
   */
  private subscribeTelemetryEvents(): void {
    // This assumes GridDataFabric emits events
    // For now, we'll create a polling mechanism

    setInterval(async () => {
      try {
        const providers = this.dataFabric.getProviders();

        for (const provider of providers) {
          try {
            // Get latest telemetry from provider
            const assets = await provider.snapshot();

            for (const asset of assets) {
              // For each asset, query its recent telemetry
              const telemetry = await provider.query({
                assetId: asset.id,
                measurementTypes: ['voltage', 'current', 'power'],
                limit: 1, // Get most recent
              });

              // Publish as events
              for (const t of telemetry) {
                await this.eventFabric.publishTelemetry(provider.getId(), t);
              }
            }
          } catch (error) {
            console.error(
              `[DATA-EVENT-INTEGRATION] Error processing provider ${provider.getId()}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error('[DATA-EVENT-INTEGRATION] Telemetry subscription error:', error);
      }
    }, 5000); // Poll every 5 seconds

    console.log('[DATA-EVENT-INTEGRATION] Telemetry subscription established');
  }

  /**
   * Subscribe to grid events from data fabric
   */
  private subscribeGridEvents(): void {
    // This would subscribe to events like outages, alerts, maintenance from data fabric
    // For now, we'll create a polling mechanism for event-generating sources

    setInterval(async () => {
      try {
        const providers = this.dataFabric.getProviders();

        for (const provider of providers) {
          try {
            // Query for grid events
            const events = await provider.query({
              eventTypes: ['outage', 'alarm', 'maintenance', 'incident'],
              limit: 10,
            });

            for (const event of events) {
              if ('eventType' in event) {
                // Normalize and publish
                await this.eventFabric.publishGridEvent(provider.getId(), event as any);
              }
            }
          } catch (error) {
            // Many providers won't have events, that's okay
            if (!error || !(error as Error).toString().includes('not supported')) {
              console.debug(
                `[DATA-EVENT-INTEGRATION] Provider ${provider.getId()} events not available`
              );
            }
          }
        }
      } catch (error) {
        console.error('[DATA-EVENT-INTEGRATION] Grid event subscription error:', error);
      }
    }, 10000); // Poll every 10 seconds

    console.log('[DATA-EVENT-INTEGRATION] Grid event subscription established');
  }

  /**
   * Publish manual event (for testing/operations)
   */
  public async publishManualEvent(providerId: string, eventData: any): Promise<void> {
    await this.eventFabric.publishEvent({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      category: eventData.category || 'INCIDENT',
      eventType: eventData.eventType || 'MANUAL_EVENT',
      severity: eventData.severity || 'INFO',
      source: {
        providerId,
        name: 'Manual Event',
      },
      ...eventData,
    });
  }

  /**
   * Get data fabric
   */
  public getDataFabric(): GridDataFabric {
    return this.dataFabric;
  }

  /**
   * Get event fabric
   */
  public getEventFabric(): EventFabric {
    return this.eventFabric;
  }

  /**
   * Get integration status
   */
  public getStatus(): {
    initialized: boolean;
    dataProviders: number;
    eventSubscribers: number;
  } {
    return {
      initialized: this.initialized,
      dataProviders: this.dataFabric.getProviders().length,
      eventSubscribers: this.eventFabric.getStatistics().subscribers,
    };
  }

  /**
   * Shutdown integration
   */
  public async shutdown(): Promise<void> {
    console.log('[DATA-EVENT-INTEGRATION] Shutting down fabric integration...');
    this.initialized = false;
    console.log('[DATA-EVENT-INTEGRATION] Fabric integration shut down');
  }
}

export default DataEventFabricIntegration;
