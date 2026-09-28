/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - REST API Routes
 * 
 * Exposes event fabric via HTTP endpoints
 */

import { Router, Request, Response } from 'express';
import { EventFabric } from './event-fabric';
import { EventFilter } from './types';

/**
 * Create event API router
 */
export function createEventApiRouter(): Router {
  const router = Router();
  const eventFabric = EventFabric.getInstance();

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * POST /api/events/subscribe
   * Subscribe to events with optional filter
   */
  router.post('/subscribe', async (req: Request, res: Response) => {
    try {
      const { filter, duration } = req.body;

      if (!filter) {
        return res.status(400).json({
          error: 'Missing filter parameter',
        });
      }

      const subscriptionId = eventFabric.subscribe(filter as EventFilter, async (event) => {
        // HTTP polling subscriptions just create a record
        // Actual delivery happens via POST /query or WebSocket/SSE
      });

      res.json({
        subscriptionId,
        status: 'active',
        message: 'Subscription created. Poll /api/events/query for new events.',
      });
    } catch (error) {
      console.error('[EVENT-API] Subscribe error:', error);
      res.status(500).json({
        error: 'Failed to create subscription',
      });
    }
  });

  /**
   * DELETE /api/events/subscribe/:subscriptionId
   * Unsubscribe from events
   */
  router.delete('/subscribe/:subscriptionId', (req: Request, res: Response) => {
    try {
      const { subscriptionId } = req.params;
      eventFabric.unsubscribe(subscriptionId);

      res.json({
        status: 'unsubscribed',
        subscriptionId,
      });
    } catch (error) {
      console.error('[EVENT-API] Unsubscribe error:', error);
      res.status(500).json({
        error: 'Failed to unsubscribe',
      });
    }
  });

  // ==================== EVENT QUERIES ====================

  /**
   * POST /api/events/query
   * Query events with filter
   */
  router.post('/query', async (req: Request, res: Response) => {
    try {
      const { filter, limit = 100, offset = 0 } = req.body;

      if (!filter) {
        return res.status(400).json({
          error: 'Missing filter parameter',
        });
      }

      const events = eventFabric.queryEvents(filter as EventFilter, limit, offset);

      res.json({
        count: events.length,
        events,
      });
    } catch (error) {
      console.error('[EVENT-API] Query error:', error);
      res.status(500).json({
        error: 'Failed to query events',
      });
    }
  });

  /**
   * GET /api/events/query
   * Query events with query parameters
   */
  router.get('/query', async (req: Request, res: Response) => {
    try {
      const {
        categories,
        eventTypes,
        assetIds,
        severity,
        limit = '100',
        offset = '0',
      } = req.query;

      const filter: EventFilter = {};

      if (categories) {
        filter.categories = (categories as string).split(',') as EventFilter['categories'];
      }

      if (eventTypes) {
        filter.eventTypes = (eventTypes as string).split(',');
      }

      if (assetIds) {
        filter.assetIds = (assetIds as string).split(',');
      }

      if (severity) {
        filter.severities = [severity as any];
      }

      const events = eventFabric.queryEvents(
        filter,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        count: events.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        events,
      });
    } catch (error) {
      console.error('[EVENT-API] Query error:', error);
      res.status(500).json({
        error: 'Failed to query events',
      });
    }
  });

  /**
   * GET /api/events/event/:eventId
   * Get specific event by ID
   */
  router.get('/event/:eventId', async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const bus = eventFabric.getEventBus();
      const event = bus.getEventHistory().find((e) => e.id === eventId);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
        });
      }

      res.json({
        event,
      });
    } catch (error) {
      console.error('[EVENT-API] Get event error:', error);
      res.status(500).json({
        error: 'Failed to retrieve event',
      });
    }
  });

  // ==================== STATE ====================

  /**
   * GET /api/events/state
   * Get current grid state
   */
  router.get('/state', (req: Request, res: Response) => {
    try {
      const state = eventFabric.getState();

      res.json({
        timestamp: new Date().toISOString(),
        state,
      });
    } catch (error) {
      console.error('[EVENT-API] Get state error:', error);
      res.status(500).json({
        error: 'Failed to retrieve state',
      });
    }
  });

  /**
   * GET /api/events/state/assets
   * Get state for all assets
   */
  router.get('/state/assets', (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const state = eventFabric.getState();

      let assets = state.assets;

      if (category) {
        assets = assets.filter((a) => a.category === category);
      }

      res.json({
        timestamp: new Date().toISOString(),
        count: assets.length,
        assets,
      });
    } catch (error) {
      console.error('[EVENT-API] Get assets error:', error);
      res.status(500).json({
        error: 'Failed to retrieve asset state',
      });
    }
  });

  /**
   * GET /api/events/state/asset/:assetId
   * Get state for specific asset
   */
  router.get('/state/asset/:assetId', (req: Request, res: Response) => {
    try {
      const { assetId } = req.params;
      const store = eventFabric.getStateStore();

      if (!store) {
        return res.status(500).json({
          error: 'State store not available',
        });
      }

      const state = store.getAssetState(assetId);

      if (!state) {
        return res.status(404).json({
          error: 'Asset not found',
        });
      }

      res.json({
        assetId,
        state,
      });
    } catch (error) {
      console.error('[EVENT-API] Get asset state error:', error);
      res.status(500).json({
        error: 'Failed to retrieve asset state',
      });
    }
  });

  // ==================== STATISTICS ====================

  /**
   * GET /api/events/stats
   * Get event statistics
   */
  router.get('/stats', (req: Request, res: Response) => {
    try {
      const stats = eventFabric.getStatistics();

      res.json({
        timestamp: new Date().toISOString(),
        ...stats,
      });
    } catch (error) {
      console.error('[EVENT-API] Get stats error:', error);
      res.status(500).json({
        error: 'Failed to retrieve statistics',
      });
    }
  });

  /**
   * GET /api/events/stats/categories
   * Get statistics by event category
   */
  router.get('/stats/categories', (req: Request, res: Response) => {
    try {
      const bus = eventFabric.getEventBus();
      const stats = bus.getStatistics();

      res.json({
        timestamp: new Date().toISOString(),
        categories: stats.eventsByCategory || {},
      });
    } catch (error) {
      console.error('[EVENT-API] Get category stats error:', error);
      res.status(500).json({
        error: 'Failed to retrieve category statistics',
      });
    }
  });

  /**
   * GET /api/events/stats/publishers
   * Get statistics by event publisher
   */
  router.get('/stats/publishers', (req: Request, res: Response) => {
    try {
      const bus = eventFabric.getEventBus();
      const stats = bus.getStatistics();

      res.json({
        timestamp: new Date().toISOString(),
        publishers: (stats as any).eventsByPublisher || {},
      });
    } catch (error) {
      console.error('[EVENT-API] Get publisher stats error:', error);
      res.status(500).json({
        error: 'Failed to retrieve publisher statistics',
      });
    }
  });

  // ==================== CONNECTIONS ====================

  /**
   * GET /api/events/connections
   * Get real-time connection info
   */
  router.get('/connections', (req: Request, res: Response) => {
    try {
      const wsHandler = eventFabric.getWebSocketHandler();
      const sseHandler = eventFabric.getSSEHandler();

      res.json({
        timestamp: new Date().toISOString(),
        websocket: {
          clients: wsHandler.getClientCount(),
          subscriptions: 'See /stats for subscription count',
        },
        sse: {
          clients: sseHandler.getClientCount(),
        },
      });
    } catch (error) {
      console.error('[EVENT-API] Get connections error:', error);
      res.status(500).json({
        error: 'Failed to retrieve connection info',
      });
    }
  });

  // ==================== HEALTH ====================

  /**
   * GET /api/events/health
   * Health check
   */
  router.get('/health', (req: Request, res: Response) => {
    try {
      const stats = eventFabric.getStatistics();

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats: {
          totalEvents: stats.events.totalEvents,
          subscribers: stats.subscribers,
          wsClients: stats.wsClients,
          sseClients: stats.sseClients,
          bufferedEvents: stats.buffer.bufferedEvents,
        },
      });
    } catch (error) {
      console.error('[EVENT-API] Health check error:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Failed to retrieve health status',
      });
    }
  });

  return router;
}

export default createEventApiRouter;
