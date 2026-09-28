import type { Express } from 'express';
import {
  gridPlanningEngine,
  gridOutageCoordinationEngine,
  maintenanceOptimizationEngine,
  projectIntelligenceEngine,
  gridCapacityEngine,
  scenarioPlanningEngine,
  gridInvestmentEngine,
  renewableIntegrationEngine,
  temporalGridModel,
  futureGridDigitalTwin,
  weatherMaintenanceEngine,
  conflictDetectionEngine,
  lossIntelligenceEngine,
  planningDecisionEngine,
} from './index';

export function setupPlanningApiRoutes(app: Express) {
  // National Grid Planning Engine
  app.get('/api/planning/forecast/:horizon', (req, res) => {
    const { horizon } = req.params as { horizon: any };
    const forecast = gridPlanningEngine.buildForecast(horizon, 'national-plan');
    res.json({ success: true, data: forecast });
  });

  app.get('/api/planning/dashboard/:horizon', (req, res) => {
    const { horizon } = req.params as { horizon: any };
    const dashboard = gridPlanningEngine.createPlanningDashboard(
      horizon,
      'FORECAST',
      'MODELLED',
      [],
      [],
      [],
      [],
    );
    res.json({ success: true, data: dashboard });
  });

  // Outage Coordination
  app.post('/api/planning/outages/unify', (req, res) => {
    const { outages } = req.body as { outages: any[] };
    const unified = gridOutageCoordinationEngine.unifyOutages(outages);
    res.json({ success: true, data: unified });
  });

  app.post('/api/planning/outages/assess-impact', (req, res) => {
    const { outage } = req.body as { outage: any };
    const impact = gridOutageCoordinationEngine.assessOutageImpact(outage);
    res.json({ success: true, data: impact });
  });

  app.post('/api/planning/outages/detect-conflicts', (req, res) => {
    const { outages } = req.body as { outages: any[] };
    const conflicts = gridOutageCoordinationEngine.detectConflicts(outages);
    res.json({ success: true, data: conflicts });
  });

  // Maintenance Optimization
  app.post('/api/planning/maintenance/score-window', (req, res) => {
    const { window } = req.body as { window: any };
    const score = maintenanceOptimizationEngine.scoreWindow(window);
    res.json({ success: true, data: { score } });
  });

  app.post('/api/planning/maintenance/generate-windows', (req, res) => {
    const { maintenance } = req.body as { maintenance: any[] };
    const windows = maintenanceOptimizationEngine.generateCandidateWindows(maintenance);
    res.json({ success: true, data: windows });
  });

  app.post('/api/planning/maintenance/simulate', (req, res) => {
    const { window, affectedLoadMw } = req.body as { window: any; affectedLoadMw: number };
    const result = maintenanceOptimizationEngine.simulateMaintenance(window, affectedLoadMw);
    res.json({ success: true, data: result });
  });

  // Project Intelligence
  app.post('/api/planning/projects/track', (req, res) => {
    const { project } = req.body as { project: any };
    const tracked = projectIntelligenceEngine.trackProject(project);
    res.json({ success: true, data: tracked });
  });

  app.post('/api/planning/projects/compute-impact', (req, res) => {
    const { project } = req.body as { project: any };
    const impact = projectIntelligenceEngine.computeProjectImpact(project);
    res.json({ success: true, data: impact });
  });

  // Capacity Intelligence
  app.post('/api/planning/capacity/calculate', (req, res) => {
    const { assets } = req.body as { assets: any[] };
    const capacity = gridCapacityEngine.calculateCapacity(assets);
    res.json({ success: true, data: capacity });
  });

  app.post('/api/planning/capacity/detect-bottlenecks', (req, res) => {
    const { assets } = req.body as { assets: any[] };
    const bottlenecks = gridCapacityEngine.detectBottlenecks(assets);
    res.json({ success: true, data: bottlenecks });
  });

  app.post('/api/planning/capacity/loss-metrics', (req, res) => {
    const { assets } = req.body as { assets: any[] };
    const losses = gridCapacityEngine.calculateLossMetrics(assets);
    res.json({ success: true, data: losses });
  });

  // Scenario Planning
  app.get('/api/planning/scenarios/build', (req, res) => {
    const scenarios = scenarioPlanningEngine.buildScenarios();
    res.json({ success: true, data: scenarios });
  });

  app.post('/api/planning/scenarios/compare', (req, res) => {
    const { scenarios } = req.body as { scenarios: any[] };
    const comparison = scenarioPlanningEngine.compareScenarios(scenarios);
    res.json({ success: true, data: comparison });
  });

  // Investment Intelligence
  app.post('/api/planning/investment/estimate', (req, res) => {
    const { project } = req.body as { project: any };
    const estimate = gridInvestmentEngine.estimateProject(project);
    res.json({ success: true, data: estimate });
  });

  // Renewable Integration
  app.post('/api/planning/renewables/assess', (req, res) => {
    const { mix } = req.body as { mix: any };
    const assessment = renewableIntegrationEngine.assessRenewables(mix);
    res.json({ success: true, data: assessment });
  });

  // Temporal Grid Model
  app.get('/api/planning/temporal/future-states', (req, res) => {
    const states = temporalGridModel.getFutureGridStates();
    res.json({ success: true, data: states });
  });

  // Future Grid Digital Twin
  app.get('/api/planning/future-twin/scenarios', (req, res) => {
    const scenarios = futureGridDigitalTwin.getAllScenarios();
    res.json({ success: true, data: scenarios });
  });

  app.get('/api/planning/future-twin/base-case', (req, res) => {
    const scenario = futureGridDigitalTwin.getBaseCaseScenario();
    res.json({ success: true, data: scenario });
  });

  // Weather × Maintenance
  app.get('/api/planning/weather-maintenance/analyze', (req, res) => {
    const analysis = weatherMaintenanceEngine.analyze();
    res.json({ success: true, data: analysis });
  });

  // Conflict Detection
  app.post('/api/planning/conflicts/outage', (req, res) => {
    const { outages } = req.body as { outages: any[] };
    const conflicts = conflictDetectionEngine.detectOutageConflicts(outages);
    res.json({ success: true, data: conflicts });
  });

  app.post('/api/planning/conflicts/maintenance', (req, res) => {
    const { maintenance, outages } = req.body as { maintenance: any[]; outages: any[] };
    const conflicts = conflictDetectionEngine.detectMaintenanceConflicts(maintenance, outages);
    res.json({ success: true, data: conflicts });
  });

  // Loss Intelligence
  app.get('/api/planning/loss/calculate', (req, res) => {
    const report = lossIntelligenceEngine.calculateLosses();
    res.json({ success: true, data: report });
  });

  // Planning Decision Support
  app.post('/api/planning/decision/build-support', (req, res) => {
    const { maintenance } = req.body as { maintenance: any };
    const support = planningDecisionEngine.buildDecisionSupport(maintenance);
    res.json({ success: true, data: support });
  });

  // Planning Brief
  app.post('/api/planning/brief/generate', (req, res) => {
    const { horizon, outages, exposure, projects, risks, investments } = req.body as {
      horizon: string;
      outages: string[];
      exposure: string[];
      projects: string[];
      risks: string[];
      investments: string[];
    };
    const brief = gridPlanningEngine.generatePlanningBrief(horizon as any, outages, exposure, projects, risks, investments);
    res.json({ success: true, data: brief });
  });

  console.log('[PLANNING-API] Planning engine API routes initialized');
}
