/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Event Fabric Initialization
 * 
 * Automatic setup of real-time event fabric on application startup
 */

import { Server as HTTPServer } from 'http';
import { EventFabric } from '../event-fabric';
import { DataEventFabricIntegration } from './data-event-integration';

/**
 * Initialize event fabric
 */
export async function initializeEventFabric(httpServer?: HTTPServer): Promise<EventFabric> {
  console.log('[EVENT-INIT] Initializing event fabric...');

  const eventFabric = EventFabric.getInstance();

  try {
    // Initialize event fabric with HTTP server for WebSocket
    await eventFabric.initialize(httpServer);

    console.log('[EVENT-INIT] Event fabric initialized successfully');
    return eventFabric;
  } catch (error) {
    console.error('[EVENT-INIT] Failed to initialize event fabric:', error);
    throw error;
  }
}

/**
 * Initialize data-event fabric integration
 */
export async function initializeDataEventIntegration(): Promise<DataEventFabricIntegration> {
  console.log('[EVENT-INIT] Initializing data-event fabric integration...');

  const integration = DataEventFabricIntegration.getInstance();

  try {
    await integration.initialize();

    console.log('[EVENT-INIT] Data-event integration initialized successfully');
    return integration;
  } catch (error) {
    console.error('[EVENT-INIT] Failed to initialize data-event integration:', error);
    throw error;
  }
}

/**
 * Initialize all event fabric components
 */
export async function initializeCompleteEventFabric(
  httpServer?: HTTPServer
): Promise<{
  eventFabric: EventFabric;
  integration: DataEventFabricIntegration;
}> {
  console.log('[EVENT-INIT] Initializing complete event fabric stack...');

  try {
    const eventFabric = await initializeEventFabric(httpServer);
    const integration = await initializeDataEventIntegration();

    console.log('[EVENT-INIT] Complete event fabric stack initialized');

    return {
      eventFabric,
      integration,
    };
  } catch (error) {
    console.error('[EVENT-INIT] Failed to initialize complete event fabric:', error);
    throw error;
  }
}

/**
 * Shutdown event fabric
 */
export async function shutdownEventFabric(): Promise<void> {
  console.log('[EVENT-INIT] Shutting down event fabric...');

  const eventFabric = EventFabric.getInstance();
  const integration = DataEventFabricIntegration.getInstance();

  try {
    await integration.shutdown();
    await eventFabric.shutdown();

    console.log('[EVENT-INIT] Event fabric shut down successfully');
  } catch (error) {
    console.error('[EVENT-INIT] Error during event fabric shutdown:', error);
  }
}

export {
  EventFabric,
  DataEventFabricIntegration,
};
