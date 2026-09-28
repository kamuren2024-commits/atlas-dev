import { GridRecoveryPlan, RestorationStep } from './types';

export class GridRecoveryEngine {
  /**
   * Generates step-by-step restoration intelligence and timeline
   * for simulated or active outage scenarios.
   */
  public static generateRecoveryPlan(scenarioId: string): GridRecoveryPlan {
    const defaultSteps: RestorationStep[] = [
      {
        stepNumber: 1,
        timeOffsetMinutes: 0,
        title: 'Contingency Isolation & Fault Clearance Verification',
        action: 'Open circuit breakers 52-T1A and 52-T1B at Suswa 400kV and 220kV bays. Lockout 86T relay.',
        responsibleUnit: 'Suswa Regional Control Centre (RCC)',
        preconditions: ['Distance protection trip confirmed', 'SF6 gas pressure normal'],
        restoredMW: 0,
        cumulativeMW: 0,
        status: 'COMPLETED'
      },
      {
        stepNumber: 2,
        timeOffsetMinutes: 8,
        title: 'Auxiliary Power & Substation DC Battery Verification',
        action: 'Verify station service diesel generator (SSDG) start and 110V DC battery bank status.',
        responsibleUnit: 'Substation Senior Technician',
        preconditions: ['110V DC bus voltage >= 118V', 'SCADA RTU link verified'],
        restoredMW: 0,
        cumulativeMW: 0,
        status: 'COMPLETED'
      },
      {
        stepNumber: 3,
        timeOffsetMinutes: 18,
        title: 'Load Transfer & Parallel Auto-Transformer Absorption',
        action: 'Adjust OLTC on Suswa T2 and Isinya T1 to absorb 180 MW transferred step-down demand.',
        responsibleUnit: 'National Control Centre (NCC) Dispatcher',
        preconditions: ['T2 winding temperature < 75°C', 'No secondary alarms present'],
        restoredMW: 140,
        cumulativeMW: 140,
        status: 'IN_PROGRESS'
      },
      {
        stepNumber: 4,
        timeOffsetMinutes: 35,
        title: 'Backbone Energization & Voltage Balancing',
        action: 'Close Suswa-Isinya 400kV line 2 breaker and engage 100 MVAr shunt capacitor bank.',
        responsibleUnit: 'NCC Dispatch & System Protection Engineer',
        preconditions: ['Synchrocheck angle <= 10°', 'Voltage delta <= 4 kV'],
        restoredMW: 60,
        cumulativeMW: 200,
        status: 'PENDING'
      },
      {
        stepNumber: 5,
        timeOffsetMinutes: 55,
        title: 'Subsystem Synchronization & Full Customer Restoral',
        action: 'Re-synchronize isolated 132kV feeders in Nairobi South and Western grid. Restore all UFLS stages.',
        responsibleUnit: 'Distribution Control Centre (KPLC NCC) & KETRACO NCC',
        preconditions: ['System frequency >= 49.95 Hz', 'Spinning reserve >= 250 MW'],
        restoredMW: 40,
        cumulativeMW: 240,
        status: 'PENDING'
      }
    ];

    return {
      scenarioId: scenarioId || 'SCEN_SUSWA_T1_TRIP',
      title: 'Emergency Restoration & Power Flow Recovery Plan: Suswa T1 Outage',
      affectedAssets: ['Suswa 400/220kV Hub', 'Nairobi South 132kV Ring', 'Olkaria Western Feeder'],
      estimatedTotalRestorationMinutes: 55,
      steps: defaultSteps,
      criticalPreconditions: [
        'Lockout relay 86T must be manually inspected prior to reclosing any 400kV breaker',
        'Station service DC battery voltage must remain above 110V DC throughout restoration',
        'Synchrocheck phase angle differential between Suswa and Isinya must not exceed 12 degrees'
      ],
      alternativeSupplyPath: 'Olkaria IV – Nairobi North 400kV Double Circuit + Isinya 400/220kV Step-Down',
      confidence: 95.2
    };
  }
}
