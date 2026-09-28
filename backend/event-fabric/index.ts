/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Module Exports
 */

export { EventFabric } from './event-fabric';
export { EventBus } from './event-bus';
export { EventNormalizer } from './normalizer';
export { EventStateStore } from './state-store';
export { WebSocketHandler } from './websocket-handler';
export { SSEHandler } from './sse-handler';
export { EventPersistenceManager } from './persistence';

export * from './types';

import { EventFabric } from './event-fabric';

export function getEventFabric(): EventFabric {
  return EventFabric.getInstance();
}

export default EventFabric;
