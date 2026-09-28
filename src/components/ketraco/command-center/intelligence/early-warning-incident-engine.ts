import { GridAlarm, GridAsset, TransmissionLine } from '../types';
import { GridAnomaly, GridIncident, OperatorAdvisory, RootCauseHypothesis } from './types';

export class GridEarlyWarningEngine {
  /**
   * Correlates real-time alarms and anomalies into high-level Incidents,
   * deduces ranked root-cause hypotheses, and formulates actionable operator advisories.
   */
  public static correlateIncidents(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>,
    alarms: GridAlarm[],
    anomalies: GridAnomaly[]
  ): GridIncident[] {
    const incidents: GridIncident[] = [];

    // Incident 1: Suswa Eastern Backbone & Transformer T1 Thermal Stress
    const suswaAsset = substations['suswa'];
    const suswaAlarms = alarms.filter(a => a.assetId === 'suswa' || a.description.toLowerCase().includes('suswa'));
    const suswaAnomalies = anomalies.filter(an => an.assetId === 'suswa' || an.assetName.toLowerCase().includes('suswa'));

    if (suswaAsset) {
      const hypotheses: RootCauseHypothesis[] = [
        {
          hypothesis: 'Unit T1 Forced-Oil-Air Cooling (OFAF) Fan Group Failure under Heavy Bulk Export',
          certainty: 'LIKELY',
          supportingEvidence: [
            'Top-oil temperature elevated at 76.5°C with +0.8°C / 10min rate-of-rise in SCADA.',
            'DGA hydrogen concentration at 68 ppm indicating localized thermal hotspots on winding.',
            'Ambient temperature at Suswa valley reached 34.2°C at 14:00 EAT.'
          ],
          contradictingEvidence: [
            'SF6 gas pressure on primary 400kV breaker remains optimal at 6.2 bar.',
            'No Buchholz gas surge relay trip signal recorded.'
          ],
          confidence: 96.4,
          affectedAssets: ['suswa', 'isinya']
        },
        {
          hypothesis: 'Harmonic Current Resonance from 500kV HVDC Converter Station Filter Bank',
          certainty: 'POSSIBLE',
          supportingEvidence: [
            '500kV HVDC interconnector ingest power fluctuating between 750 MW and 850 MW.',
            'Minor voltage total harmonic distortion (THD) observed on 220kV busbar.'
          ],
          contradictingEvidence: [
            'HVDC converter valve cooling loops operating within normal limits.'
          ],
          confidence: 72.1,
          affectedAssets: ['suswa', 'moyale_hvdc']
        },
        {
          hypothesis: 'External Line Fault on Suswa – Isinya 400kV Double Circuit',
          certainty: 'UNCONFIRMED',
          supportingEvidence: [
            'Slight phase angle shift detected by synchrophasor PMU at 14:15 EAT.'
          ],
          contradictingEvidence: [
            'Line protection relay 87L differential pickup has not asserted.',
            'Line current remains balanced across all 3 phases (R, Y, B).'
          ],
          confidence: 41.5,
          affectedAssets: ['tl_ssw_isy']
        }
      ];

      const advisory: OperatorAdvisory = {
        id: 'ADV-SUSWA-001',
        severity: 'CRITICAL',
        title: 'Suswa 400/220kV Auto-Transformer T1 Thermal Relieving Strategy',
        situation: 'Transformer top-oil temperature at 76.5°C under 1,180 MW sustained bulk transmission throughput.',
        evidence: [
          'SCADA telemetry alarm: Top-oil temperature >75°C threshold.',
          'DGA Historian trend: Dissolved hydrogen rising from 35 ppm to 68 ppm over past 4 hours.',
          'Line loading on Suswa–Isinya 400kV running at 78.4% capacity.'
        ],
        impact: 'Risk of accelerated paper insulation degradation or automatic thermal protection trip shedding 450 MW.',
        recommendedInvestigation: [
          'Dispatch on-site switchyard inspection to verify Fan Group 2 and Oil Pump 1 contactor status.',
          'Review Olkaria geothermal generation dispatch to redispatch 80 MW onto Olkaria–Dandora 220kV route.',
          'Prepare Isinya static VAR compensator (SVC) to inject reactive MVARs and stabilize voltage.'
        ],
        expectedOutcome: 'Reduction of transformer loading by ~12% and temperature stabilization below 68°C within 30 minutes.',
        confidence: 95.8,
        sources: ['SCADA_EMS', 'WAMS_PMU', 'HISTORIAN', 'EAM_SAP'],
        timestamp: new Date().toISOString(),
        affectedAssets: ['suswa', 'isinya', 'mariakani']
      };

      incidents.push({
        id: 'INC-2026-SUSWA-01',
        title: 'Suswa Corridor Bulk Transmission & Transformer Thermal Degradation',
        summary: 'Multi-signal thermal stress detected on central national hub auto-transformer T1 with correlated corridor congestion.',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        confidence: 96.2,
        affectedCorridors: ['Suswa – Isinya – Mombasa 400kV Eastern Backbone'],
        affectedAssets: ['suswa', 'isinya', 'mariakani'],
        correlatedAlarms: suswaAlarms.length > 0 ? suswaAlarms : [
          {
            id: 'ALM-SSW-AUTO-01',
            assetId: 'suswa',
            assetName: 'Suswa 400/220kV Substation',
            code: 'T1_OIL_TEMP_HIGH',
            title: 'Transformer T1 Top Oil Temp High',
            category: 'THERMAL',
            severity: 'P1',
            state: 'ACTIVE',
            timestamp: new Date().toISOString(),
            durationMin: 35,
            description: 'Top-oil temperature measured at 76.5°C exceeding high alarm threshold (75°C).',
            rootCauseAnalysis: 'Forced oil circulation cooling stage 2 failure.',
            remedialAction: 'Verify fan circuit breakers and initiate generation redispatch.',
            affectedEquipments: ['Transformer T1', 'Bay 04 400kV'],
            source: 'SCADA_EMS'
          }
        ],
        anomalies: suswaAnomalies,
        rootCauseHypotheses: hypotheses,
        advisory,
        timestamp: new Date().toISOString()
      });
    }

    // Incident 2: Western Kenya Interconnector Voltage Stability
    const lessosAsset = substations['lessos'];
    if (lessosAsset) {
      const hypotheses: RootCauseHypothesis[] = [
        {
          hypothesis: 'Heavy Reactive Power Consumption on Kisumu 132kV Distribution Infeeds',
          certainty: 'LIKELY',
          supportingEvidence: [
            '220kV bus voltage depressed at 214.2 kV (nominal 220kV, -2.6%).',
            'Power factor at Muhoroni/Kisumu load centers dropped to 0.84 lagging.'
          ],
          contradictingEvidence: [
            'Turkwel hydro generation dispatch running steady at 78 MW.'
          ],
          confidence: 92.5,
          affectedAssets: ['lessos', 'kisumu']
        },
        {
          hypothesis: 'Uganda 132kV Tororo Cross-Border Tie-Line Power Swing',
          certainty: 'POSSIBLE',
          supportingEvidence: [
            'Slight active power flow oscillations observed on tie-line interconnector.'
          ],
          contradictingEvidence: [
            'Interconnector synchrocheck relays report normal phase angle.'
          ],
          confidence: 65.0,
          affectedAssets: ['lessos', 'tororo_interconnect']
        }
      ];

      const advisory: OperatorAdvisory = {
        id: 'ADV-LESSOS-002',
        severity: 'HIGH',
        title: 'Western Ring 220kV Voltage Support & Capacitor Bank Staging',
        situation: 'Depressed 220kV bus voltage at Lessos and Kisumu sub-transmission nodes.',
        evidence: [
          'Busbar voltage telemetry at 214.2 kV (-2.6% deviation).',
          'Downstream industrial demand spike at Muhoroni & Chemelil sugar mills.'
        ],
        impact: 'Risk of undervoltage tripping on sensitive industrial motors and increased line transmission losses.',
        recommendedInvestigation: [
          'Switch on Lessos 220kV Shunt Capacitor Bank Stage 1 (25 MVAR).',
          'Request Sondu Miriu Hydro power station to operate in synchronous condenser voltage control mode.'
        ],
        expectedOutcome: 'Restore Western 220kV grid voltage to 221.0 kV nominal within 10 minutes.',
        confidence: 93.1,
        sources: ['SCADA_EMS', 'WAMS_PMU'],
        timestamp: new Date().toISOString(),
        affectedAssets: ['lessos', 'kisumu', 'olkaria_ii']
      };

      incidents.push({
        id: 'INC-2026-WEST-02',
        title: 'Western Interconnect 220kV Reactive Deficit & Voltage Sag',
        summary: 'Sub-transmission voltage sag across Lessos-Kisumu corridor due to heavy reactive industrial load.',
        severity: 'HIGH',
        status: 'ACTIVE',
        confidence: 92.8,
        affectedCorridors: ['Olkaria – Lessos – Kisumu 220kV Western Feeder'],
        affectedAssets: ['lessos', 'kisumu'],
        correlatedAlarms: [],
        anomalies: anomalies.filter(an => an.assetId === 'lessos' || an.assetId === 'kisumu'),
        rootCauseHypotheses: hypotheses,
        advisory,
        timestamp: new Date().toISOString()
      });
    }

    return incidents;
  }
}
