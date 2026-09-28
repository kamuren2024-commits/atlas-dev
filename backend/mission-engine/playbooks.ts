/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Grid Operational Playbooks
 * 
 * 9 predefined operational templates for common grid scenarios
 */

import { Recommendation } from './types';

export interface Playbook {
  id: string;
  name: string;
  description: string;
  scenario: string;
  steps: PlaybookStep[];
  prerequisites: string[];
  expectedOutcome: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedDuration: number; // minutes
  successCriteria: string[];
  rollbackProcedure: string;
}

export interface PlaybookStep {
  sequence: number;
  action: string;
  owner: string; // Role required to execute
  verificationPoint: string;
  dependencies: number[]; // Step sequence numbers this depends on
  estimatedDuration: number; // seconds
  automatable: boolean;
  rollbackAction?: string;
}

/**
 * Grid Playbooks Library
 */
export class GridPlaybooksLibrary {
  private static instance: GridPlaybooksLibrary | null = null;
  private playbooks: Map<string, Playbook> = new Map();

  private constructor() {
    this.initializePlaybooks();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): GridPlaybooksLibrary {
    if (!GridPlaybooksLibrary.instance) {
      GridPlaybooksLibrary.instance = new GridPlaybooksLibrary();
    }
    return GridPlaybooksLibrary.instance;
  }

  /**
   * Initialize playbooks
   */
  private initializePlaybooks(): void {
    // 1. HVDC Line Loss
    this.playbooks.set('hvdc-loss', {
      id: 'hvdc-loss',
      name: 'HVDC Transmission Line Loss',
      description: 'Handle loss of HVDC link and rebalance AC system',
      scenario: 'HVDC link tripped due to fault or control failure',
      steps: [
        {
          sequence: 1,
          action: 'Confirm HVDC line fault via telemetry and operator report',
          owner: 'DISPATCHER',
          verificationPoint: 'HVDC status = TRIPPED',
          dependencies: [],
          estimatedDuration: 30,
          automatable: false,
        },
        {
          sequence: 2,
          action: 'Isolate HVDC line at both ends to prevent auto-reclose',
          owner: 'SENIOR_DISPATCHER',
          verificationPoint: 'Breaker status = OPEN, DC voltage = 0',
          dependencies: [1],
          estimatedDuration: 15,
          automatable: true,
        },
        {
          sequence: 3,
          action: 'Redispatch AC generation to compensate for lost HVDC power',
          owner: 'DISPATCHER',
          verificationPoint: 'AC loading within limits',
          dependencies: [2],
          estimatedDuration: 120,
          automatable: true,
        },
        {
          sequence: 4,
          action: 'Monitor frequency and voltage for stability',
          owner: 'SYSTEM_OPERATOR',
          verificationPoint: 'Frequency > 59.5 Hz, Voltage 0.95-1.05 pu',
          dependencies: [3],
          estimatedDuration: 300,
          automatable: true,
        },
        {
          sequence: 5,
          action: 'Dispatch field crew for fault inspection',
          owner: 'GRID_MANAGER',
          verificationPoint: 'Crew en route, ETA confirmed',
          dependencies: [2],
          estimatedDuration: 30,
          automatable: false,
        },
      ],
      prerequisites: [
        'HVDC control system online',
        'AC generation dispatch available',
        'Field crew on standby',
      ],
      expectedOutcome:
        'HVDC line isolated, AC system balanced, grid stable with degraded transfer capacity',
      riskLevel: 'HIGH',
      estimatedDuration: 300,
      successCriteria: ['Frequency stable > 59.5 Hz', 'No cascading failures', 'Line safely isolated'],
      rollbackProcedure:
        'HVDC line inspection and repair; restore HVDC settings and reclose breakers when fault cleared',
    });

    // 2. Transformer Failure
    this.playbooks.set('transformer-failure', {
      id: 'transformer-failure',
      name: 'Power Transformer Failure',
      description: 'Manage critical power transformer outage',
      scenario: 'Power transformer shows overtemperature, high impedance, or differential relay trip',
      steps: [
        {
          sequence: 1,
          action: 'Immediately isolate transformer via backup protection',
          owner: 'CONTROL_CENTER_OPERATOR',
          verificationPoint: 'Transformer breaker open, no through-flow',
          dependencies: [],
          estimatedDuration: 5,
          automatable: true,
        },
        {
          sequence: 2,
          action: 'Route load through alternate transformers or paths',
          owner: 'DISPATCHER',
          verificationPoint: 'Load distribution restored, secondary line loadings < 100%',
          dependencies: [1],
          estimatedDuration: 60,
          automatable: false,
        },
        {
          sequence: 3,
          action: 'Notify operations that spare transformer needed',
          owner: 'GRID_MANAGER',
          verificationPoint: 'Spare availability confirmed, transportation arranged',
          dependencies: [1],
          estimatedDuration: 30,
          automatable: false,
        },
        {
          sequence: 4,
          action: 'Execute oil sample and coolant analysis',
          owner: 'MAINTENANCE_CREW',
          verificationPoint: 'Samples collected, lab analysis initiated',
          dependencies: [1],
          estimatedDuration: 120,
          automatable: false,
        },
        {
          sequence: 5,
          action: 'Permit replacement when spare ready and weather acceptable',
          owner: 'SENIOR_DISPATCHER',
          verificationPoint: 'Replacement window approved, crew on site',
          dependencies: [3, 4],
          estimatedDuration: 30,
          automatable: false,
        },
      ],
      prerequisites: [
        'Spare transformer available',
        'Alternate routing paths available',
        'Maintenance crew on call',
        'Weather suitable for work',
      ],
      expectedOutcome:
        'Failed transformer safely isolated; load redistributed via alternate routes; spare positioned for replacement',
      riskLevel: 'CRITICAL',
      estimatedDuration: 240,
      successCriteria: [
        'Transformer fully isolated',
        'System stable on alternate routes',
        'Load within acceptable limits',
      ],
      rollbackProcedure: 'Install replacement transformer; restore to normal configuration',
    });

    // 3. Generator Loss
    this.playbooks.set('generator-loss', {
      id: 'generator-loss',
      name: 'Synchronous Generator Loss',
      description: 'Handle unexpected generator trip and restore generation capacity',
      scenario: 'Large generator unexpectedly trips offline due to fault',
      steps: [
        {
          sequence: 1,
          action: 'Confirm generator status = offline via SCADA',
          owner: 'SYSTEM_OPERATOR',
          verificationPoint: 'Generator output = 0 MW, frequency trending',
          dependencies: [],
          estimatedDuration: 10,
          automatable: false,
        },
        {
          sequence: 2,
          action: 'Assess frequency deviation and activate load shedding if needed',
          owner: 'DISPATCHER',
          verificationPoint: 'Frequency stabilizing, no cascade',
          dependencies: [1],
          estimatedDuration: 30,
          automatable: true,
        },
        {
          sequence: 3,
          action: 'Redispatch available generation to compensate',
          owner: 'DISPATCHER',
          verificationPoint: 'Generation ramp rate acceptable, all units within limits',
          dependencies: [2],
          estimatedDuration: 120,
          automatable: true,
        },
        {
          sequence: 4,
          action: 'Monitor for secondary faults or cascading failures',
          owner: 'SYSTEM_OPERATOR',
          verificationPoint: 'No additional trips, system stabilizing',
          dependencies: [3],
          estimatedDuration: 300,
          automatable: true,
        },
        {
          sequence: 5,
          action: 'Coordinate with generator owner for restart',
          owner: 'GRID_MANAGER',
          verificationPoint: 'Restart sequence initiated, synchronization confirmed',
          dependencies: [4],
          estimatedDuration: 60,
          automatable: false,
        },
      ],
      prerequisites: [
        'Alternative generation sources available',
        'Load shedding programs operational',
        'Generator owner responsive',
      ],
      expectedOutcome:
        'Generator safely offline; system rebalanced; reserve margin reduced until restart',
      riskLevel: 'HIGH',
      estimatedDuration: 180,
      successCriteria: ['System stable', 'Frequency recovered', 'No cascades'],
      rollbackProcedure: 'Coordinate generator restart with generator owner',
    });

    // 4. Cascading Instability
    this.playbooks.set('cascade-instability', {
      id: 'cascade-instability',
      name: 'Cascading Instability Response',
      description: 'Aggressive action plan for arresting cascade',
      scenario:
        'Frequency or voltage oscillations detected; coherency metrics deteriorating; cascade imminent',
      steps: [
        {
          sequence: 1,
          action: 'Confirm unstable conditions via PMU recordings and oscillation metrics',
          owner: 'SYSTEM_OPERATOR',
          verificationPoint: 'Damping ratio < 0.05, oscillation frequency 0.5-2 Hz',
          dependencies: [],
          estimatedDuration: 15,
          automatable: true,
        },
        {
          sequence: 2,
          action: 'Issue load shedding command (automatic or manual) to reduce demand',
          owner: 'SENIOR_DISPATCHER',
          verificationPoint: 'Target load shed: 10-15% of system total',
          dependencies: [1],
          estimatedDuration: 30,
          automatable: true,
          rollbackAction: 'Restore load on manual demand',
        },
        {
          sequence: 3,
          action: 'Deploy FACTS devices (SVC/STATCOM) for reactive support',
          owner: 'DISPATCHER',
          verificationPoint: 'Reactive power output ramping, voltage support confirmed',
          dependencies: [1],
          estimatedDuration: 10,
          automatable: true,
        },
        {
          sequence: 4,
          action: 'Dispatch emergency generation or quick-start units',
          owner: 'GRID_MANAGER',
          verificationPoint: 'Generation starting, ramp-rate acceptable',
          dependencies: [2],
          estimatedDuration: 60,
          automatable: false,
        },
        {
          sequence: 5,
          action: 'Monitor oscillations for damping improvement',
          owner: 'SYSTEM_OPERATOR',
          verificationPoint: 'Damping ratio recovering to > 0.10',
          dependencies: [2, 3, 4],
          estimatedDuration: 300,
          automatable: true,
        },
      ],
      prerequisites: [
        'Automatic load shedding relays armed',
        'FACTS devices operational',
        'Emergency generation available',
      ],
      expectedOutcome: 'Cascading oscillations arrested; system restabilized with reduced load',
      riskLevel: 'CRITICAL',
      estimatedDuration: 60,
      successCriteria: [
        'Frequency recovered',
        'Damping ratio > 0.10',
        'No additional tripping',
      ],
      rollbackProcedure: 'Restore load gradually; restart disconnected generation',
    });

    // 5. Voltage Collapse Prevention
    this.playbooks.set('voltage-collapse', {
      id: 'voltage-collapse',
      name: 'Voltage Collapse Prevention',
      description: 'Rapid action to prevent voltage collapse',
      scenario: 'Voltage dropping below 0.90 pu in critical areas despite reactive support',
      steps: [
        {
          sequence: 1,
          action: 'Confirm low-voltage condition via real-time telemetry',
          owner: 'SYSTEM_OPERATOR',
          verificationPoint: 'Voltage < 0.90 pu in one or more areas',
          dependencies: [],
          estimatedDuration: 10,
          automatable: true,
        },
        {
          sequence: 2,
          action: 'Maximize reactive power from all available sources (generators, FACTS)',
          owner: 'DISPATCHER',
          verificationPoint: 'Reactive output at maximum, voltage responding',
          dependencies: [1],
          estimatedDuration: 30,
          automatable: true,
        },
        {
          sequence: 3,
          action: 'Shed non-critical loads to reduce reactive demand',
          owner: 'DISPATCHER',
          verificationPoint: 'Industrial/flexible loads reduced',
          dependencies: [2],
          estimatedDuration: 30,
          automatable: true,
        },
        {
          sequence: 4,
          action: 'Energize capacitor banks and shunt reactors as needed',
          owner: 'CONTROL_CENTER_OPERATOR',
          verificationPoint: 'Capacitor status = online, reactive injection confirmed',
          dependencies: [1],
          estimatedDuration: 15,
          automatable: true,
        },
        {
          sequence: 5,
          action: 'Monitor voltage recovery and relay operation',
          owner: 'SYSTEM_OPERATOR',
          verificationPoint: 'Voltage > 0.92 pu and stabilizing',
          dependencies: [2, 3, 4],
          estimatedDuration: 300,
          automatable: true,
        },
      ],
      prerequisites: [
        'Reactive power sources (capacitors, generators) available',
        'Load shedding capability',
        'Voltage monitoring in place',
      ],
      expectedOutcome: 'Voltage restored to safe levels; voltage collapse prevented',
      riskLevel: 'CRITICAL',
      estimatedDuration: 60,
      successCriteria: ['Voltage > 0.92 pu', 'Stable reactive power', 'No cascades'],
      rollbackProcedure: 'Restore loads gradually; reduce reactive injection',
    });

    // 6-9: Additional playbooks
    this.playbooks.set('congestion-relief', {
      id: 'congestion-relief',
      name: 'Transmission Congestion Relief',
      description: 'Alleviate transmission line congestion',
      scenario: 'Line loading > 100% for sustained period',
      steps: [
        {
          sequence: 1,
          action: 'Identify and confirm congested line',
          owner: 'DISPATCHER',
          verificationPoint: 'Real-time loading confirmed > 100%',
          dependencies: [],
          estimatedDuration: 5,
          automatable: true,
        },
        {
          sequence: 2,
          action: 'Redispatch generation to reduce line flow',
          owner: 'DISPATCHER',
          verificationPoint: 'Redispatch submitted and executing',
          dependencies: [1],
          estimatedDuration: 300,
          automatable: true,
        },
      ],
      prerequisites: ['Generation redispatch authority'],
      expectedOutcome: 'Line loading relieved below 100%',
      riskLevel: 'MEDIUM',
      estimatedDuration: 10,
      successCriteria: ['Loading < 90%'],
      rollbackProcedure: 'Restore generation dispatch',
    });

    this.playbooks.set('island-isolation', {
      id: 'island-isolation',
      name: 'Island System Isolation',
      description: 'Intentionally island portion of grid to prevent cascade',
      scenario: 'Cascade risk so high that controlled isolation is necessary',
      steps: [
        {
          sequence: 1,
          action: 'Decision to island system - this is a controlled blackout',
          owner: 'CHIEF_OPERATOR',
          verificationPoint: 'Approval documented',
          dependencies: [],
          estimatedDuration: 10,
          automatable: false,
        },
        {
          sequence: 2,
          action: 'Open designated tie lines per islanding scheme',
          owner: 'DISPATCHER',
          verificationPoint: 'Tie lines opened, island isolated',
          dependencies: [1],
          estimatedDuration: 30,
          automatable: true,
        },
      ],
      prerequisites: ['Islanding plan pre-established', 'Chief operator authorization'],
      expectedOutcome: 'Island isolated, cascade stopped, partial system lost',
      riskLevel: 'CRITICAL',
      estimatedDuration: 5,
      successCriteria: ['Island electrically isolated'],
      rollbackProcedure: 'Synchronize islanded area back to main system',
    });

    this.playbooks.set('black-start', {
      id: 'black-start',
      name: 'Black Start Recovery',
      description: 'Restore system from total blackout',
      scenario: 'Total system collapse; all generation offline',
      steps: [
        {
          sequence: 1,
          action: 'Activate black start procedures - start designated generators',
          owner: 'GRID_MANAGER',
          verificationPoint: 'Black start generators starting',
          dependencies: [],
          estimatedDuration: 120,
          automatable: false,
        },
        {
          sequence: 2,
          action: 'Build up voltage and frequency on bootstrap buses',
          owner: 'DISPATCHER',
          verificationPoint: 'Voltage > 0.80 pu, frequency rising',
          dependencies: [1],
          estimatedDuration: 300,
          automatable: false,
        },
        {
          sequence: 3,
          action: 'Energize transmission network and load pickup incrementally',
          owner: 'DISPATCHER',
          verificationPoint: 'Transmission voltage established, loads connecting',
          dependencies: [2],
          estimatedDuration: 600,
          automatable: false,
        },
      ],
      prerequisites: ['Black start generators available', 'Load pickup plan'],
      expectedOutcome: 'System restored from blackout to normal operation',
      riskLevel: 'CRITICAL',
      estimatedDuration: 1020,
      successCriteria: ['System frequency and voltage normalized'],
      rollbackProcedure: 'Continue restoration process',
    });
  }

  /**
   * Get playbook by ID
   */
  public getPlaybook(playbookId: string): Playbook | null {
    return this.playbooks.get(playbookId) || null;
  }

  /**
   * List all playbooks
   */
  public listPlaybooks(): Playbook[] {
    return Array.from(this.playbooks.values());
  }

  /**
   * Find playbooks by scenario keywords
   */
  public findPlaybooksByScenario(keyword: string): Playbook[] {
    const results: Playbook[] = [];

    this.playbooks.forEach((playbook) => {
      if (
        playbook.scenario.toLowerCase().includes(keyword.toLowerCase()) ||
        playbook.name.toLowerCase().includes(keyword.toLowerCase())
      ) {
        results.push(playbook);
      }
    });

    return results;
  }

  /**
   * Get playbook recommendation
   */
  public recommendPlaybook(missionType: string): Playbook | null {
    const mapping: Record<string, string> = {
      CRITICAL_OUTAGE: 'transformer-failure',
      CASCADE_RISK: 'cascade-instability',
      CONGESTION: 'congestion-relief',
      FREQUENCY_EVENT: 'generator-loss',
      VOLTAGE_INSTABILITY: 'voltage-collapse',
    };

    const playbookId = mapping[missionType];
    return playbookId ? this.getPlaybook(playbookId) : null;
  }
}

export default GridPlaybooksLibrary;
