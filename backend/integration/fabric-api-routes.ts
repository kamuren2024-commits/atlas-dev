/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Grid Data Fabric API Routes
 * 
 * RESTful endpoints for accessing the production data fabric
 */

import { Router, Request, Response } from 'express';
import { getGridDataFabric } from './fabric-init';

const router = Router();

/**
 * GET /api/fabric/status
 * Get overall fabric status and health
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const status = await fabric.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/fabric/health
 * Get health status of all providers
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const health = await fabric.getHealthStatus();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/fabric/providers
 * List all registered providers
 */
router.get('/providers', (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const providers = fabric.getProviders().map((p) => ({
      id: p.getProviderId(),
      type: p.getProviderType(),
      config: p.getConfig(),
    }));
    res.json(providers);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/fabric/assets
 * Get all assets across all providers
 */
router.get('/assets', (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const assets = fabric.getAssets();
    res.json(assets);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/fabric/assets?type=SUBSTATION
 * Get assets by type
 */
router.get('/assets/:type', (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const { type } = req.params;
    const assets = fabric.getAssetsByType(type);
    res.json(assets);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/fabric/telemetry/:assetId
 * Get latest telemetry for an asset
 */
router.get('/telemetry/:assetId', (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const { assetId } = req.params;
    const telemetry = fabric.getLatestTelemetry(assetId);
    res.json(telemetry || { error: 'No telemetry found' });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/fabric/telemetry/:assetId/history
 * Get telemetry history for an asset
 * Query params: limit (default 100)
 */
router.get('/telemetry/:assetId/history', (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const { assetId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const history = fabric.getTelemetryHistory(assetId, limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/fabric/query
 * Query telemetry across providers
 * Body: { assetIds: string[], startTime: string, endTime: string, aggregation?: string }
 */
router.post('/query', async (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const { assetIds, startTime, endTime, aggregation } = req.body;

    if (!assetIds || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: assetIds, startTime, endTime',
      });
    }

    const results = await fabric.queryTelemetry({
      assetIds,
      startTime,
      endTime,
      aggregation,
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/fabric/providers/:providerId/stats
 * Get provider statistics
 */
router.get('/providers/:providerId/stats', async (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const { providerId } = req.params;
    const provider = fabric.getProvider(providerId);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const stats = await provider.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/fabric/providers/:providerId/health
 * Get provider health
 */
router.get('/providers/:providerId/health', async (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const { providerId } = req.params;
    const provider = fabric.getProvider(providerId);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const health = await provider.health();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/fabric/providers/:providerId/snapshot
 * Get provider snapshot
 */
router.post('/providers/:providerId/snapshot', async (req: Request, res: Response) => {
  try {
    const fabric = getGridDataFabric();
    const { providerId } = req.params;
    const provider = fabric.getProvider(providerId);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const snapshot = await provider.snapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
