/**
 * KETRACO TRANSMISSION DIGITAL TWIN - MASTER ORCHESTRATION SERVICE
 * Core Gateway coordinating all 15 operational grid intelligence engines
 */

import { EventEmitter } from 'events';
import { CanonicalGridModel } from './canonical-model';
import { TelemetryQualityEngine } from './telemetry-quality-engine';
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

export class DigitalTwinService extends EventEmitter {
  private static instance: DigitalTwinService | null = null;
  private initialized = false;
  private loopInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
  }

  public static getInstance(): DigitalTwinService {
    if (!DigitalTwinService.instance) {
      DigitalTwinService.instance = new DigitalTwinService();
    }
    return DigitalTwinService.instance;
  }

  public initialize(): void {
    if (this.initialized) return;

    console.log('[DIGITAL-TWIN-SERVICE] Bootstrapping KETRACO Transmission Digital Twin nervous system...');
    CanonicalGridModel.initialize();
    KnowledgeGraphEngine.initialize();
    NotificationEngine.initialize();
    OperatorAdvisoryEngine.initialize();
    IncidentOutageEngine.initialize();

    // Start live digital twin background cycle (every 5 seconds)
    this.startOperationalCycle();

    this.initialized = true;
    console.log('[DIGITAL-TWIN-SERVICE] Transmission Digital Twin nervous system operational.');
  }

  private startOperationalCycle(): void {
    if (this.loopInterval) return;

    this.loopInterval = setInterval(() => {
      try {
        if (TimeseriesLineageEngine.getScadaStatus().status !== 'CONNECTED') return;

        // 1. Solve live state estimation
        const state = StateEstimationEngine.estimateNetworkState();

        // 2. Evaluate risks
        const risks = GridRiskEngine.evaluateAllRisks();

        // 3. Emit live telemetry event to SSE listeners
        this.emit('grid-pulse', {
          timestamp: new Date().toISOString(),
          frequency: state.system_frequency_hz,
          total_load_mw: state.total_load_mw,
          total_gen_mw: state.total_gen_mw,
          total_losses_mw: state.total_losses_mw,
          composite_risk_index: risks.composite_risk_index,
          trust_score: AccuracyTrustEngine.calculateTrustScore().composite_trust_score
        });
      } catch (err) {
        console.error('[DIGITAL-TWIN-SERVICE] Error in operational cycle:', err);
      }
    }, 5000);
  }

  // --- COMPREHENSIVE OVERVIEW FOR COMMAND CENTER ---

  public getCommandCenterOverview() {
    this.initialize();
    const assets = CanonicalGridModel.getAllAssets();
    const branches = CanonicalGridModel.getBranches();
    const slo = SloObservabilityEngine.getSloReport();
    const scadaStatus = TimeseriesLineageEngine.getScadaStatus();

    if (scadaStatus.status !== 'CONNECTED') {
      return {
        status: 'DISCONNECTED' as const,
        scada_status: scadaStatus,
        operational_state: {
          status: 'UNKNOWN' as const,
          reason: 'No SCADA/EMS telemetry connector is configured'
        },
        data_source_status: {
          telemetry: 'NOT_CONNECTED' as const,
          topology: 'REFERENCE_DATA' as const,
          simulation_engine: 'NOT_CONNECTED' as const
        },
        system_frequency_hz: null,
        grid_load_mw: null,
        generation_mw: null,
        transmission_losses_mw: null,
        observability_pct: null,
        composite_risk_index: null,
        trust_score: null,
        slo_compliance: slo,
        counts: {
          total_assets: assets.length,
          substations: assets.filter(a => a.asset_type === 'SUBSTATION').length,
          transmission_lines: branches.filter(b => b.branch_type === 'LINE').length,
          transformers: assets.filter(a => a.asset_type === 'POWER_TRANSFORMER').length,
          breakers: assets.filter(a => a.asset_type === 'CIRCUIT_BREAKER').length,
          active_contingencies: null,
          active_risks: null,
          pending_advisories: null,
          open_incidents: null,
          unread_notifications: null
        },
        top_contingencies: [],
        top_risks: [],
        top_advisories: [],
        active_incidents: [],
        timestamp: new Date().toISOString()
      };
    }

    const state = StateEstimationEngine.getLatestSnapshot();
    const contingencies = ContingencyEngine.getContingencyResults();
    const risks = GridRiskEngine.evaluateAllRisks();
    const advisories = OperatorAdvisoryEngine.getAllAdvisories();
    const notifications = NotificationEngine.getAllNotifications();
    const incidents = IncidentOutageEngine.getAllIncidents();
    const trustScore = AccuracyTrustEngine.calculateTrustScore();

    return {
      status: 'NOMINAL' as const,
      scada_status: scadaStatus,
      system_frequency_hz: state.system_frequency_hz,
      grid_load_mw: state.total_load_mw,
      generation_mw: state.total_gen_mw,
      transmission_losses_mw: state.total_losses_mw,
      observability_pct: state.observability_pct,
      composite_risk_index: risks.composite_risk_index,
      trust_score: trustScore,
      slo_compliance: slo,
      counts: {
        total_assets: assets.length,
        substations: assets.filter(a => a.asset_type === 'SUBSTATION').length,
        transmission_lines: branches.filter(b => b.branch_type === 'LINE').length,
        transformers: assets.filter(a => a.asset_type === 'POWER_TRANSFORMER').length,
        breakers: assets.filter(a => a.asset_type === 'CIRCUIT_BREAKER').length,
        active_contingencies: contingencies.filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL').length,
        active_risks: risks.decomposed_risks.filter(r => r.status === 'ACTIVE').length,
        pending_advisories: advisories.filter(a => a.status === 'PENDING_OPERATOR_REVIEW').length,
        open_incidents: incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length,
        unread_notifications: notifications.filter(n => n.state === 'DELIVERED').length
      },
      top_contingencies: contingencies.slice(0, 3),
      top_risks: risks.decomposed_risks.slice(0, 4),
      top_advisories: advisories.slice(0, 2),
      active_incidents: incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED'),
      timestamp: new Date().toISOString()
    };
  }
}
