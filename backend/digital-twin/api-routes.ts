/**
 * KETRACO TRANSMISSION DIGITAL TWIN - API ROUTES
 * Unified REST & SSE Server-Sent Events API for Grid Operations Intelligence
 */

import { Router, Request, Response } from 'express';
import { DigitalTwinService } from './digital-twin-service';
import { CanonicalGridModel } from './canonical-model';
import { StateEstimationEngine } from './state-estimation-engine';
import { ContingencyEngine } from './contingency-engine';
import { GridRiskEngine } from './grid-risk-engine';
import { PredictiveAssetEngine } from './predictive-asset-engine';
import { KnowledgeGraphEngine } from './knowledge-graph-engine';
import { NotificationEngine } from './notification-engine';
import { OperatorAdvisoryEngine } from './operator-advisory-engine';
import { IncidentOutageEngine } from './incident-outage-engine';
import { TimeseriesLineageEngine } from './timeseries-lineage-engine';
import { AccuracyTrustEngine } from './accuracy-trust-engine';
import { SloObservabilityEngine } from './slo-observability-engine';

export function createDigitalTwinApiRouter(): Router {
  const router = Router();
  const twinService = DigitalTwinService.getInstance();
  twinService.initialize();

  // 1. Overview
  router.get('/overview', (req: Request, res: Response) => {
    try {
      const overview = twinService.getCommandCenterOverview();
      res.json(overview);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch digital twin overview' });
    }
  });

  // 2. Canonical Assets
  router.get('/assets', (req: Request, res: Response) => {
    try {
      const { type, substation_id, voltage } = req.query;
      let assets = CanonicalGridModel.getAllAssets();

      if (type) {
        assets = assets.filter(a => a.asset_type === type);
      }
      if (substation_id) {
        assets = assets.filter(a => a.substation_id === substation_id);
      }
      if (voltage) {
        assets = assets.filter(a => a.voltage_level === voltage);
      }

      res.json({
        data_provenance: 'REFERENCE_DATA',
        total: assets.length,
        assets
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch assets' });
    }
  });

  router.get('/assets/:id', (req: Request, res: Response) => {
    try {
      const asset = CanonicalGridModel.getAssetById(req.params.id);
      if (!asset) {
        return res.status(404).json({ error: `Asset ${req.params.id} not found` });
      }

      const health = PredictiveAssetEngine.getAssetHealth(req.params.id);
      const impact = KnowledgeGraphEngine.analyzeMultiTierImpact(req.params.id);
      const history = TimeseriesLineageEngine.getTelemetryHistory(req.params.id);

      res.json({
        data_provenance: 'REFERENCE_DATA',
        asset,
        predictive_health: health,
        dependency_impact: impact,
        recent_telemetry: history
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch asset detail' });
    }
  });

  // 3. Topology
  router.get('/topology', (req: Request, res: Response) => {
    try {
      const branches = CanonicalGridModel.getBranches();
      const assets = CanonicalGridModel.getAllAssets();
      res.json({
        data_provenance: 'REFERENCE_DATA',
        branches,
        substations: assets.filter(a => a.asset_type === 'SUBSTATION'),
        total_branches: branches.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch topology' });
    }
  });

  // 4. State Estimation & Power Flow
  router.get('/state', (req: Request, res: Response) => {
    if (TimeseriesLineageEngine.getScadaStatus().status !== 'CONNECTED') {
      return res.status(503).json({
        error: 'Live grid state is unavailable because no SCADA/EMS connector is configured',
        status: 'NOT_CONNECTED'
      });
    }
    try {
      const state = StateEstimationEngine.getLatestSnapshot();
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch network state' });
    }
  });

  // 5. Contingencies
  router.get('/contingencies', (req: Request, res: Response) => {
    if (TimeseriesLineageEngine.getScadaStatus().status !== 'CONNECTED') {
      return res.status(503).json({
        error: 'Contingency analysis is unavailable because no validated grid-state source is connected',
        status: 'NOT_CONNECTED'
      });
    }
    try {
      const results = ContingencyEngine.getContingencyResults();
      res.json({
        total_analyzed: results.length,
        critical_count: results.filter(c => c.severity === 'CRITICAL').length,
        high_count: results.filter(c => c.severity === 'HIGH').length,
        contingencies: results
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch contingencies' });
    }
  });

  // 6. Risks & Cascading
  router.get('/risks', (req: Request, res: Response) => {
    if (TimeseriesLineageEngine.getScadaStatus().status !== 'CONNECTED') {
      return res.status(503).json({
        error: 'Grid risk assessment is unavailable because no validated grid-state source is connected',
        status: 'NOT_CONNECTED'
      });
    }
    try {
      const riskData = GridRiskEngine.evaluateAllRisks();
      res.json(riskData);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch grid risks' });
    }
  });

  // 7. Predictive Health & DGA
  router.get('/predictive', (req: Request, res: Response) => {
    if (TimeseriesLineageEngine.getScadaStatus().status !== 'CONNECTED') {
      return res.status(503).json({
        error: 'Predictive asset health is unavailable because no validated telemetry source is connected',
        status: 'NOT_CONNECTED'
      });
    }
    try {
      const healthList = PredictiveAssetEngine.evaluateAllAssets();
      res.json({
        total_evaluated: healthList.length,
        assets: healthList
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch predictive health' });
    }
  });

  // 8. Knowledge Graph Multi-Tier Impact
  router.get('/impact/:assetId', (req: Request, res: Response) => {
    try {
      const impact = KnowledgeGraphEngine.analyzeMultiTierImpact(req.params.assetId);
      res.json(impact);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to calculate impact' });
    }
  });

  // 9. Automated Reconciliation
  router.get('/reconciliation', (req: Request, res: Response) => {
    try {
      const report = KnowledgeGraphEngine.runAutomatedReconciliation();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to run reconciliation' });
    }
  });

  // 10. Notifications
  router.get('/notifications', (req: Request, res: Response) => {
    try {
      const notifications = NotificationEngine.getAllNotifications();
      res.json({
        total: notifications.length,
        unread: notifications.filter(n => n.state === 'DELIVERED').length,
        notifications
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch notifications' });
    }
  });

  router.post('/notifications/:id/acknowledge', (req: Request, res: Response) => {
    try {
      const operatorId = req.body?.operator_id || 'operator@ketraco.co.ke';
      const updated = NotificationEngine.acknowledgeNotification(req.params.id, operatorId);
      if (!updated) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ status: 'ACKNOWLEDGED', notification: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to acknowledge notification' });
    }
  });

  // 11. Operator Advisories & Human-in-the-Loop Decisions
  router.get('/advisories', (req: Request, res: Response) => {
    try {
      const advisories = OperatorAdvisoryEngine.getAllAdvisories();
      res.json({
        total: advisories.length,
        pending: advisories.filter(a => a.status === 'PENDING_OPERATOR_REVIEW').length,
        advisories
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch advisories' });
    }
  });

  router.post('/advisories/:id/decision', (req: Request, res: Response) => {
    try {
      const { decision, operator_id, notes } = req.body || {};
      if (decision !== 'AUTHORIZED' && decision !== 'REJECTED') {
        return res.status(400).json({ error: 'Decision must be AUTHORIZED or REJECTED' });
      }

      const updated = OperatorAdvisoryEngine.processOperatorDecision(
        req.params.id,
        decision,
        operator_id || 'operator@ketraco.co.ke',
        notes
      );

      if (!updated) {
        return res.status(404).json({ error: 'Advisory not found' });
      }

      res.json({ status: 'PROCESSED', advisory: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to record decision' });
    }
  });

  // 12. Incidents & Outages
  router.get('/incidents', (req: Request, res: Response) => {
    try {
      const incidents = IncidentOutageEngine.getAllIncidents();
      res.json({
        total: incidents.length,
        incidents
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch incidents' });
    }
  });

  router.post('/incidents/:id/transition', (req: Request, res: Response) => {
    try {
      const { status, actor, note } = req.body || {};
      if (!status || !actor) {
        return res.status(400).json({ error: 'Status and actor are required' });
      }

      const updated = IncidentOutageEngine.transitionIncident(req.params.id, status, actor, note || '');
      if (!updated) {
        return res.status(404).json({ error: 'Incident not found' });
      }

      res.json({ status: 'TRANSITIONED', incident: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to transition incident' });
    }
  });

  router.get('/outages', (req: Request, res: Response) => {
    try {
      const outages = IncidentOutageEngine.getAllOutages();
      res.json({
        total: outages.length,
        outages
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch outages' });
    }
  });

  // 13. Lineage & Trust Score & SLO
  router.get('/lineage/:alertId', (req: Request, res: Response) => {
    try {
      const lineage = TimeseriesLineageEngine.getLineageTrace(req.params.alertId);
      if (!lineage) {
        return res.status(404).json({
          error: `No lineage trace is available for alert ${req.params.alertId}`,
          status: 'UNAVAILABLE'
        });
      }
      res.json(lineage);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch data lineage' });
    }
  });

  router.get('/trust-score', (req: Request, res: Response) => {
    try {
      const score = AccuracyTrustEngine.calculateTrustScore();
      res.json(score);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to calculate trust score' });
    }
  });

  router.get('/slo', (req: Request, res: Response) => {
    try {
      const slo = SloObservabilityEngine.getSloReport();
      res.json(slo);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch SLO report' });
    }
  });

  router.get('/scada-status', (req: Request, res: Response) => {
    try {
      const status = TimeseriesLineageEngine.getScadaStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch SCADA status' });
    }
  });

  // 14. Scenario execution is unavailable until a validated solver is connected.
  router.post('/scenarios/run', (req: Request, res: Response) => {
    res.status(503).json({
      error: 'SIMULATION ENGINE NOT CONNECTED',
      status: 'UNAVAILABLE'
    });
  });

  // 15. Server-Sent Events (SSE) Stream
  router.get('/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const onPulse = (data: any) => {
      res.write(`event: grid-pulse\ndata: ${JSON.stringify(data)}\n\n`);
    };

    twinService.on('grid-pulse', onPulse);

    // Initial message
    const initialOverview = twinService.getCommandCenterOverview();
    res.write(`event: initial-state\ndata: ${JSON.stringify(initialOverview)}\n\n`);

    req.on('close', () => {
      twinService.off('grid-pulse', onPulse);
      res.end();
    });
  });

  return router;
}
