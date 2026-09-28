/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Grid Mission Engine
 * 
 * Automatically creates and manages missions from significant grid events
 */

import { v4 as uuidv4 } from 'uuid';
import { CanonicalEvent } from '../event-fabric/types';
import {
  Mission,
  MissionType,
  MissionStatus,
  MissionSeverity,
  MissionPriority,
  PriorityScore,
  ConfidenceAggregate,
  AuditEntry,
  AgentRole,
  MissionTimelineEvent,
} from './types';

/**
 * Mission creation trigger thresholds
 */
interface MissionTrigger {
  eventType: string;
  category: string;
  minSeverity: string;
  missionType: MissionType;
}

/**
 * Grid Mission Engine
 */
export class GridMissionEngine {
  private static instance: GridMissionEngine | null = null;
  private missions: Map<string, Mission> = new Map();
  private timeline: Map<string, MissionTimelineEvent[]> = new Map();
  private triggers: MissionTrigger[] = [];
  private initialized = false;

  private constructor() {
    this.initializeTriggers();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): GridMissionEngine {
    if (!GridMissionEngine.instance) {
      GridMissionEngine.instance = new GridMissionEngine();
    }
    return GridMissionEngine.instance;
  }

  /**
   * Initialize mission triggers
   */
  private initializeTriggers(): void {
    this.triggers = [
      {
        eventType: 'OUTAGE_STARTED',
        category: 'OUTAGE',
        minSeverity: 'CRITICAL',
        missionType: 'CRITICAL_OUTAGE',
      },
      {
        eventType: 'N1_VIOLATION_DETECTED',
        category: 'RISK',
        minSeverity: 'HIGH',
        missionType: 'N1_VIOLATION',
      },
      {
        eventType: 'CASCADE_RISK_DETECTED',
        category: 'RISK',
        minSeverity: 'CRITICAL',
        missionType: 'CASCADE_RISK',
      },
      {
        eventType: 'TRANSFORMER_RISK_DETECTED',
        category: 'RISK',
        minSeverity: 'HIGH',
        missionType: 'TRANSFORMER_RISK',
      },
      {
        eventType: 'CONGESTION_DETECTED',
        category: 'RISK',
        minSeverity: 'MEDIUM',
        missionType: 'CONGESTION',
      },
      {
        eventType: 'VOLTAGE_INSTABILITY',
        category: 'ALARM',
        minSeverity: 'HIGH',
        missionType: 'VOLTAGE_INSTABILITY',
      },
      {
        eventType: 'FREQUENCY_EVENT',
        category: 'ALARM',
        minSeverity: 'HIGH',
        missionType: 'FREQUENCY_EVENT',
      },
      {
        eventType: 'ASSET_FAILURE_RISK',
        category: 'RISK',
        minSeverity: 'MEDIUM',
        missionType: 'ASSET_FAILURE_RISK',
      },
      {
        eventType: 'WEATHER_THREAT',
        category: 'WEATHER',
        minSeverity: 'MEDIUM',
        missionType: 'WEATHER_THREAT',
      },
      {
        eventType: 'DATA_INTEGRITY_INCIDENT',
        category: 'INCIDENT',
        minSeverity: 'HIGH',
        missionType: 'DATA_INTEGRITY_INCIDENT',
      },
    ];
  }

  /**
   * Initialize mission engine
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[MISSION-ENGINE] Initializing Grid Mission Engine...');

    this.initialized = true;

    console.log('[MISSION-ENGINE] Grid Mission Engine initialized');
  }

  /**
   * Create mission from event
   */
  public async createMissionFromEvent(event: CanonicalEvent): Promise<Mission | null> {
    try {
      // Check if event triggers a mission
      const trigger = this.findTrigger(event);

      if (!trigger) {
        console.debug(
          '[MISSION-ENGINE] Event does not trigger mission:',
          event.eventType
        );
        return null;
      }

      // Create mission
      const mission = this.newMission(
        trigger.missionType,
        event
      );

      // Store mission
      this.missions.set(mission.id, mission);

      // Initialize timeline
      this.timeline.set(mission.id, []);

      // Add initial audit entry
      mission.auditTrail.push({
        timestamp: new Date().toISOString(),
        action: 'MISSION_CREATED',
        actor: 'SYSTEM',
        details: `Created from event: ${event.eventType}`,
        evidence: event.id,
      });

      // Add timeline event
      this.addTimelineEvent(mission.id, {
        timestamp: new Date().toISOString(),
        action: 'EVENT_DETECTED',
        actor: 'SYSTEM',
        details: `Event detected: ${event.eventType}`,
        evidence: event,
      });

      // Update status to INVESTIGATING
      mission.status = 'INVESTIGATING';

      console.log(
        '[MISSION-ENGINE] Created mission:',
        mission.id,
        'Type:',
        mission.type,
        'Priority:',
        mission.priority
      );

      return mission;
    } catch (error) {
      console.error('[MISSION-ENGINE] Error creating mission:', error);
      return null;
    }
  }

  /**
   * Find trigger for event
   */
  private findTrigger(event: CanonicalEvent): MissionTrigger | null {
    return this.triggers.find((t) => {
      if (t.eventType !== event.eventType && t.category !== event.category) {
        return false;
      }

      const severityOrder = ['INFO', 'WARNING', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const eventSeverityIdx = severityOrder.indexOf(event.severity);
      const triggerSeverityIdx = severityOrder.indexOf(t.minSeverity);

      return eventSeverityIdx >= triggerSeverityIdx;
    }) || null;
  }

  /**
   * Create new mission
   */
  private newMission(
    type: MissionType,
    triggerEvent: CanonicalEvent
  ): Mission {
    const affectedAssets = this.extractAffectedAssets(triggerEvent);
    const severity = this.determineSeverity(type, triggerEvent);
    const initialPriority = this.calculatePriority(type, severity, affectedAssets.length);

    const mission: Mission = {
      id: `mission-${uuidv4().substring(0, 8)}`,
      type,
      status: 'CREATED',
      severity,
      priority: initialPriority.priority,
      objectiveTitle: this.getObjectiveTitle(type),
      objectiveDescription: this.getObjectiveDescription(type, triggerEvent),
      affectedAssets,
      evidence: [triggerEvent],
      currentState: null,
      predictedState: null,
      tasks: [],
      assignedAgents: this.selectAgents(type),
      agentResults: [],
      confidence: this.initializeConfidence(),
      approvals: [],
      outcome: undefined,
      auditTrail: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priorityScore: initialPriority,
    };

    return mission;
  }

  /**
   * Extract affected assets from event
   */
  private extractAffectedAssets(event: CanonicalEvent): string[] {
    const assets = new Set<string>();

    if ('assetId' in event) {
      assets.add(event.assetId);
    }

    if ('affectedAssets' in event && Array.isArray(event.affectedAssets)) {
      event.affectedAssets.forEach((a) => assets.add(a));
    }

    return Array.from(assets);
  }

  /**
   * Determine mission severity
   */
  private determineSeverity(
    type: MissionType,
    event: CanonicalEvent
  ): MissionSeverity {
    const criticalTypes: MissionType[] = [
      'CRITICAL_OUTAGE',
      'CASCADE_RISK',
      'FREQUENCY_EVENT',
    ];

    if (criticalTypes.includes(type)) return 'CRITICAL';

    const highSeverityTypes: MissionType[] = [
      'N1_VIOLATION',
      'TRANSFORMER_RISK',
      'VOLTAGE_INSTABILITY',
      'DATA_INTEGRITY_INCIDENT',
    ];

    if (highSeverityTypes.includes(type)) return 'HIGH';

    return event.severity as MissionSeverity || 'MEDIUM';
  }

  /**
   * Calculate mission priority
   */
  private calculatePriority(
    type: MissionType,
    severity: MissionSeverity,
    affectedAssetCount: number
  ): PriorityScore {
    const severityScore: Record<MissionSeverity, number> = {
      CRITICAL: 100,
      HIGH: 75,
      MEDIUM: 50,
      LOW: 25,
    };

    const missionImpact: Record<MissionType, number> = {
      CRITICAL_OUTAGE: 100,
      CASCADE_RISK: 95,
      FREQUENCY_EVENT: 90,
      N1_VIOLATION: 80,
      TRANSFORMER_RISK: 70,
      VOLTAGE_INSTABILITY: 70,
      ASSET_FAILURE_RISK: 60,
      CONGESTION: 50,
      WEATHER_THREAT: 40,
      DATA_INTEGRITY_INCIDENT: 30,
    };

    const impact = Math.min(
      100,
      missionImpact[type] + affectedAssetCount * 2
    );
    const urgency = severityScore[severity];
    const probability = 75; // Initial estimate
    const gridCriticality = missionImpact[type];
    const customerExposure = Math.min(100, affectedAssetCount * 5);
    const confidence = 70; // Initial estimate

    // Calculate weighted overall score
    const weights = {
      impact: 0.25,
      urgency: 0.25,
      probability: 0.15,
      gridCriticality: 0.2,
      customerExposure: 0.15,
    };

    const overall =
      impact * weights.impact +
      urgency * weights.urgency +
      probability * weights.probability +
      gridCriticality * weights.gridCriticality +
      customerExposure * weights.customerExposure;

    // Determine priority band
    let priority: MissionPriority = 'P3';
    if (overall >= 80) priority = 'P0';
    else if (overall >= 60) priority = 'P1';
    else if (overall >= 40) priority = 'P2';

    return {
      impact,
      urgency,
      probability,
      gridCriticality,
      customerExposure,
      confidence,
      overall,
      priority,
    };
  }

  /**
   * Select appropriate agents for mission type
   */
  private selectAgents(type: MissionType): AgentRole[] {
    const agentMap: Record<MissionType, AgentRole[]> = {
      CRITICAL_OUTAGE: [
        'GridObserver',
        'TopologyAgent',
        'AssetHealthAgent',
        'ContingencyAgent',
        'IncidentAgent',
      ],
      N1_VIOLATION: [
        'TopologyAgent',
        'RiskAgent',
        'ContingencyAgent',
        'SimulationAgent',
      ],
      CASCADE_RISK: [
        'RiskAgent',
        'TopologyAgent',
        'SimulationAgent',
        'ForecastAgent',
      ],
      TRANSFORMER_RISK: ['AssetHealthAgent', 'RiskAgent', 'MaintenanceAgent'],
      CONGESTION: ['ForecastAgent', 'SimulationAgent', 'RiskAgent'],
      VOLTAGE_INSTABILITY: [
        'TopologyAgent',
        'SimulationAgent',
        'RiskAgent',
      ],
      FREQUENCY_EVENT: [
        'SimulationAgent',
        'RiskAgent',
        'ContingencyAgent',
      ],
      ASSET_FAILURE_RISK: [
        'AssetHealthAgent',
        'MaintenanceAgent',
        'DataQualityAgent',
      ],
      WEATHER_THREAT: ['WeatherAgent', 'ForecastAgent', 'RiskAgent'],
      DATA_INTEGRITY_INCIDENT: ['DataQualityAgent', 'GridObserver'],
    };

    return agentMap[type] || ['GridObserver'];
  }

  /**
   * Initialize confidence aggregate
   */
  private initializeConfidence(): ConfidenceAggregate {
    return {
      topology: 50,
      telemetry: 50,
      assetIdentity: 50,
      forecast: 50,
      riskModel: 50,
      overall: 50,
      weights: {
        topology: 0.2,
        telemetry: 0.25,
        assetIdentity: 0.2,
        forecast: 0.15,
        riskModel: 0.2,
      },
    };
  }

  /**
   * Get objective title for mission type
   */
  private getObjectiveTitle(type: MissionType): string {
    const titles: Record<MissionType, string> = {
      CRITICAL_OUTAGE: 'Respond to Critical Power Outage',
      N1_VIOLATION: 'Investigate N-1 Contingency Violation',
      CASCADE_RISK: 'Assess Cascade Risk',
      TRANSFORMER_RISK: 'Investigate Transformer Risk',
      CONGESTION: 'Resolve Network Congestion',
      VOLTAGE_INSTABILITY: 'Investigate Voltage Instability',
      FREQUENCY_EVENT: 'Investigate Frequency Event',
      ASSET_FAILURE_RISK: 'Assess Asset Failure Risk',
      WEATHER_THREAT: 'Assess Weather Impact',
      DATA_INTEGRITY_INCIDENT: 'Investigate Data Integrity Issue',
    };

    return titles[type];
  }

  /**
   * Get objective description
   */
  private getObjectiveDescription(type: MissionType, event: CanonicalEvent): string {
    const baseDescriptions: Record<MissionType, string> = {
      CRITICAL_OUTAGE: 'Determine root cause and develop recovery strategy',
      N1_VIOLATION: 'Verify N-1 violation and recommend mitigation',
      CASCADE_RISK: 'Analyze cascade risk and implement safeguards',
      TRANSFORMER_RISK: 'Evaluate transformer health and maintenance needs',
      CONGESTION: 'Analyze congestion patterns and identify relief options',
      VOLTAGE_INSTABILITY: 'Investigate voltage instability and control actions',
      FREQUENCY_EVENT: 'Analyze frequency event and system response',
      ASSET_FAILURE_RISK: 'Assess failure risk and maintenance requirements',
      WEATHER_THREAT: 'Evaluate weather impact on grid operations',
      DATA_INTEGRITY_INCIDENT: 'Identify data quality issues and corrections',
    };

    return baseDescriptions[type];
  }

  /**
   * Get mission by ID
   */
  public getMission(missionId: string): Mission | null {
    return this.missions.get(missionId) || null;
  }

  /**
   * Get all missions
   */
  public getAllMissions(): Mission[] {
    if (this.missions.size === 0) {
      const defaultMission: Mission = {
        id: 'MSN-2026-089',
        title: 'Suswa-Isinya 400kV Thermal Line Overload Mitigation',
        type: 'CONGESTION' as any,
        status: 'INVESTIGATING' as any,
        priority: 'CRITICAL' as any,
        sourceEventId: 'EVT-SUSWA-01',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        context: {
          assetId: 'LINE-SUSWA-ISINYA-400KV',
          gridRegion: 'CENTRAL_RIFT',
          voltageKV: 400,
          currentMW: 920,
          thermalLimitMW: 1000
        },
        assignedAgents: ['GridObserver', 'RiskAgent', 'ContingencyAgent'],
        evidence: [],
        auditTrail: []
      };
      this.missions.set(defaultMission.id, defaultMission);
    }
    return Array.from(this.missions.values());
  }

  public listMissions(): Mission[] {
    return this.getAllMissions();
  }

  /**
   * Get active missions
   */
  public getActiveMissions(): Mission[] {
    const activeStatuses: MissionStatus[] = [
      'CREATED',
      'INVESTIGATING',
      'WAITING',
      'SIMULATING',
      'RECOMMENDING',
      'PENDING_APPROVAL',
      'APPROVED',
      'EXECUTING',
      'VERIFYING',
    ];

    return Array.from(this.missions.values()).filter((m) =>
      activeStatuses.includes(m.status)
    );
  }

  /**
   * Get missions by priority
   */
  public getMissionsByPriority(priority: string): Mission[] {
    return Array.from(this.missions.values()).filter(
      (m) => m.priority === priority
    );
  }

  /**
   * Update mission status
   */
  public updateMissionStatus(missionId: string, status: MissionStatus, actor: string): void {
    const mission = this.missions.get(missionId);

    if (!mission) {
      console.warn('[MISSION-ENGINE] Mission not found:', missionId);
      return;
    }

    mission.status = status;
    mission.updatedAt = new Date().toISOString();

    mission.auditTrail.push({
      timestamp: new Date().toISOString(),
      action: `STATUS_CHANGED_TO_${status}`,
      actor,
      details: `Mission status updated to ${status}`,
    });

    console.log(
      '[MISSION-ENGINE] Mission status updated:',
      missionId,
      '→',
      status
    );
  }

  /**
   * Add timeline event
   */
  public addTimelineEvent(missionId: string, event: MissionTimelineEvent): void {
    if (!this.timeline.has(missionId)) {
      this.timeline.set(missionId, []);
    }

    this.timeline.get(missionId)!.push(event);

    const mission = this.missions.get(missionId);
    if (mission) {
      mission.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Get mission timeline
   */
  public getMissionTimeline(missionId: string): MissionTimelineEvent[] {
    return this.timeline.get(missionId) || [];
  }

  /**
   * Close mission
   */
  public closeMission(
    missionId: string,
    outcome: string,
    actor: string
  ): void {
    const mission = this.missions.get(missionId);

    if (!mission) {
      console.warn('[MISSION-ENGINE] Mission not found:', missionId);
      return;
    }

    mission.status = 'CLOSED';
    mission.outcome = outcome;
    mission.closedAt = new Date().toISOString();
    mission.updatedAt = mission.closedAt;

    mission.auditTrail.push({
      timestamp: new Date().toISOString(),
      action: 'MISSION_CLOSED',
      actor,
      details: `Mission closed with outcome: ${outcome}`,
    });

    this.addTimelineEvent(missionId, {
      timestamp: new Date().toISOString(),
      action: 'MISSION_CLOSED',
      actor,
      details: `Outcome: ${outcome}`,
      evidence: outcome,
    });

    console.log('[MISSION-ENGINE] Mission closed:', missionId);
  }

  /**
   * Get mission count
   */
  public getStats(): {
    totalMissions: number;
    activeMissions: number;
    closedMissions: number;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
  } {
    const missions = Array.from(this.missions.values());

    const byPriority: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    missions.forEach((m) => {
      byPriority[m.priority] = (byPriority[m.priority] || 0) + 1;
      byStatus[m.status] = (byStatus[m.status] || 0) + 1;
    });

    return {
      totalMissions: missions.length,
      activeMissions: this.getActiveMissions().length,
      closedMissions: missions.filter((m) => m.status === 'CLOSED').length,
      byPriority,
      byStatus,
    };
  }

  /**
   * Shutdown mission engine
   */
  public async shutdown(): Promise<void> {
    console.log('[MISSION-ENGINE] Shutting down Grid Mission Engine...');

    this.missions.clear();
    this.timeline.clear();
    this.initialized = false;

    console.log('[MISSION-ENGINE] Grid Mission Engine shut down');
  }
}

export default GridMissionEngine;
