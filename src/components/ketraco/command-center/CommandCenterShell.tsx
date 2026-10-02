import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import GridHeader from './GridHeader';
import GridKpiStrip from './GridKpiStrip';
import GridMapCanvas, { type GridMapProviderStatus, MapProviderState } from './GridMapCanvas';
import GridGraphExplorer from './GridGraphExplorer';
import GridDataQualityPanel from './GridDataQualityPanel';
import GridIntelligencePanel from './GridIntelligencePanel';
import SubstationDetailsPanel from './SubstationDetailsPanel';
import GridEventFabric from './GridEventFabric';
import GridCommandPalette from './GridCommandPalette';
import GridSystemHealthModal from './GridSystemHealthModal';
import GridResilienceModal from './GridResilienceModal';
import { GridReconciliationEngine } from './canonical/reconciliation-engine';

// Phase 04 Intelligence Fabric & Scorecards
import { GridIntelligenceEngine } from './intelligence/intelligence-fabric';
import GridTopBarIntelligenceHUD from './intelligence/GridTopBarIntelligenceHUD';
import GridIntelligenceScorecard from './intelligence/GridIntelligenceScorecard';
import GridIntelligenceTimeline from './intelligence/GridIntelligenceTimeline';
import { CopilotQAResult } from './intelligence/types';

// Phase 05 Predictive Operations & Scenario Digital Twin
import NationalGridPlanningDashboard from './planning/NationalGridPlanningDashboard';
import NationalOutageWall from './planning/NationalOutageWall';
import GridMaintenanceCalendar from './planning/GridMaintenanceCalendar';
import NationalForecastWall from './intelligence/NationalForecastWall';
import ScenarioLab from './intelligence/ScenarioLab';
import ContingencyRankingView from './intelligence/ContingencyRankingView';
import PredictiveWatchlistView from './intelligence/PredictiveWatchlistView';
import WeatherImpactView from './intelligence/WeatherImpactView';
import ModelDriftView from './intelligence/ModelDriftView';
import DigitalTwinTimeMachine, { TemporalMode } from './intelligence/DigitalTwinTimeMachine';
import OperatorDecisionPanel from './intelligence/OperatorDecisionPanel';
import { GridScenarioEngine } from './intelligence/scenario-engine';

// Phase 06 Operational Decision Intelligence & National Operating Picture
import { GridStateEngine } from './decision/grid-state-engine';
import { GridPriorityEngine } from './decision/priority-engine';
import { CrossDomainCorrelationEngine } from './decision/cross-domain-correlation-engine';
import { GridIncidentLifecycleManager } from './decision/incident-lifecycle-manager';
import { GridLearningEngine } from './decision/learning-engine';
import NationalOperatingPictureHUD from './decision/NationalOperatingPictureHUD';
import OperatorActionQueue from './decision/OperatorActionQueue';
import EventCausalityGraph from './decision/EventCausalityGraph';
import CrossDomainCorrelationView from './decision/CrossDomainCorrelationView';
import DecisionAuditLedgerView from './decision/DecisionAuditLedgerView';
import ExecutiveIntelligenceView from './decision/ExecutiveIntelligenceView';
import MaintenanceOperationsFusion from './decision/MaintenanceOperationsFusion';
import ModelDataTrustPanel from './decision/ModelDataTrustPanel';
import OperatorDecisionBriefModal from './decision/OperatorDecisionBriefModal';
import Asset360Modal from './decision/Asset360Modal';
import Corridor360Modal from './decision/Corridor360Modal';
import NationalGridHealthScorecard from './decision/NationalGridHealthScorecard';
import GridStateDriversModal from './decision/GridStateDriversModal';
import { OperatorDecisionAction } from './decision/types';

// Loop Engineering Vertical Readability Enforcement Components
import { CommandCenterVerticalSystemStatus } from './CommandCenterVerticalSystemStatus';
import { CommandCenterVerticalIncidents } from './CommandCenterVerticalIncidents';
import { CommandCenterVerticalAssetIntelligence } from './CommandCenterVerticalAssetIntelligence';
import { CommandCenterVerticalAnalytics } from './CommandCenterVerticalAnalytics';
import { useAtlasContext } from '../../../context/AtlasContext';

// Phase 02 Additions: Tokens, Switcher, Primitives and Density Layers
import ModeSwitcher from './ModeSwitcher';
import { CommandModeKey } from './tokens';
import SystemOperationsLayer from './layers/SystemOperationsLayer';
import TransmissionPerformanceLayer from './layers/TransmissionPerformanceLayer';
import AssetIntelligenceLayer from './layers/AssetIntelligenceLayer';
import GridRiskIntelligenceLayer from './layers/GridRiskIntelligenceLayer';
import OutageAlarmFabricLayer from './layers/OutageAlarmFabricLayer';
import ForecastEnvironmentalLayer from './layers/ForecastEnvironmentalLayer';
import AiIntelligenceAnomalyLayer from './layers/AiIntelligenceAnomalyLayer';
import { motionController } from './motion-controller';

const GridDigitalTwin3D = React.lazy(() => import('./GridDigitalTwin3D'));

import { 
  CANONICAL_SUBSTATIONS, 
  CANONICAL_LINES, 
  CANONICAL_KPIS, 
  CANONICAL_EVENTS, 
  CANONICAL_ALARMS, 
  CANONICAL_AI_INSIGHTS 
} from './grid-canonical-data';

import { 
  GridAsset, 
  TransmissionLine, 
  KpiFamily, 
  GridAlarm, 
  GridEvent, 
  MapLayerKey, 
  OperationalViewMode, 
  ViewCameraPreset, 
  DataFreshness 
} from './types';

export default function CommandCenterShell() {
  const { closeInspector } = useAtlasContext();
  // Live Data State
  const [substations, setSubstations] = useState<Record<string, GridAsset>>(CANONICAL_SUBSTATIONS);
  const [lines, setLines] = useState<Record<string, TransmissionLine>>(CANONICAL_LINES);
  const [kpis, setKpis] = useState<KpiFamily[]>(CANONICAL_KPIS);
  const [events, setEvents] = useState<GridEvent[]>(CANONICAL_EVENTS);
  const [alarms, setAlarms] = useState<GridAlarm[]>(CANONICAL_ALARMS);
  
  // Selection and Views
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedKpiId, setSelectedKpiId] = useState<string | undefined>(undefined);
  const [operationalMode, setOperationalMode] = useState<OperationalViewMode>('NORMAL');
  const [activeCommandMode, setActiveCommandMode] = useState<CommandModeKey>('OPERATIONS');
  const [activeDensityLevel, setActiveDensityLevel] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<ViewCameraPreset>('NATIONAL');
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [dataFreshness, setDataFreshness] = useState<DataFreshness>('OPERATIONAL_SIMULATION');
  const [mapProviderStatus, setMapProviderStatus] = useState<GridMapProviderStatus>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ? MapProviderState.LOADING : MapProviderState.ERROR_KEY_MISSING
  );
  const [temporalMode, setTemporalMode] = useState<TemporalMode>('SIMULATED');
  const [labScenarioId, setLabScenarioId] = useState<string | null>('SCEN_SUSWA_T1_TRIP');
  const [selectedOpsLayer, setSelectedOpsLayer] = useState<'SYSTEM_OPS' | 'TRANSMISSION' | 'ASSET_HEALTH' | 'RISK' | 'OUTAGES' | 'FORECAST' | 'AI_ANOMALY' | 'TIMELINE'>('SYSTEM_OPS');

  // AI Copilot QA History
  const [copilotQAHistory, setCopilotQAHistory] = useState<CopilotQAResult[]>([]);
  const telemetryTickRef = useRef(0);

  const handleLaunchScenarioInLab = (scenId: string) => {
    setLabScenarioId(scenId);
    setActiveCommandMode('SCENARIO_LAB');
  };

  // Phase 06 Operational Decision Intelligence States
  const [isDecisionBriefModalOpen, setIsDecisionBriefModalOpen] = useState(false);
  const [activeBriefIncidentId, setActiveBriefIncidentId] = useState<string>('INC-2026-08-SSW-01');
  const [isAsset360ModalOpen, setIsAsset360ModalOpen] = useState(false);
  const [activeAsset360Id, setActiveAsset360Id] = useState<string>('suswa');
  const [isCorridor360ModalOpen, setIsCorridor360ModalOpen] = useState(false);
  const [activeCorridor360Id, setActiveCorridor360Id] = useState<string>('tl_ssw_isy');
  const [isSystemHealthModalOpen, setIsSystemHealthModalOpen] = useState(false);
  const [isResilienceModalOpen, setIsResilienceModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHealthScorecardModalOpen, setIsHealthScorecardModalOpen] = useState(false);
  const [isGridStateDriversModalOpen, setIsGridStateDriversModalOpen] = useState(false);

  // Phase 06 Engines Real-time Computations
  const gridStateAssessment = useMemo(() => {
    return GridStateEngine.evaluateState(substations, lines, alarms);
  }, [substations, lines, alarms]);

  const priorityQueue = useMemo(() => {
    return GridPriorityEngine.computePriorityQueue(substations, lines, alarms, events);
  }, [substations, lines, alarms, events]);

  const correlations = useMemo(() => {
    return CrossDomainCorrelationEngine.computeCorrelations(substations, lines, alarms, events);
  }, [substations, lines, alarms, events]);

  const gridHealthScore = useMemo(() => {
    return GridStateEngine.computeHealthScore(substations, lines, alarms);
  }, [substations, lines, alarms]);

  const incidents = GridIncidentLifecycleManager.getIncidents();
  const decisionLedger = GridIncidentLifecycleManager.getDecisionLedger();
  const learningHistory = GridLearningEngine.getLearningHistory();
  const maintenanceRiskList = GridIncidentLifecycleManager.getMaintenanceOperationsRiskList();
  const causalityGraphData = GridIncidentLifecycleManager.generateCausalityGraph(activeBriefIncidentId);

  const activeBrief = useMemo(() => {
    return GridIncidentLifecycleManager.generateDecisionBrief(activeBriefIncidentId);
  }, [activeBriefIncidentId]);

  const activeAsset360Profile = useMemo(() => {
    const targetAsset = substations[activeAsset360Id] || substations['suswa'] || Object.values(substations)[0];
    return GridIncidentLifecycleManager.generateAsset360(targetAsset);
  }, [substations, activeAsset360Id]);

  const activeCorridor360Profile = useMemo(() => {
    const targetLine = lines[activeCorridor360Id] || lines['tl_ssw_isy'] || Object.values(lines)[0];
    return GridIncidentLifecycleManager.generateCorridor360(targetLine);
  }, [lines, activeCorridor360Id]);

  const handleOpenDecisionBrief = (incidentId: string) => {
    setActiveBriefIncidentId(incidentId);
    setIsDecisionBriefModalOpen(true);
  };

  const handleAuthorizeBrief = (action: OperatorDecisionAction, notes: string, optionId?: string) => {
    const ledgerEntry = GridIncidentLifecycleManager.recordOperatorAuthorization(
      activeBrief,
      'OP-NCC-8841',
      'Eng. David Kiprono (Lead Grid Controller)',
      action,
      notes
    );

    if (action === 'AUTHORIZED') {
      GridLearningEngine.logVerifiedOutcome(ledgerEntry, 76.4, 76.2);
    }
  };

  const handleOpenAsset360 = (assetId: string) => {
    setActiveAsset360Id(assetId);
    setIsAsset360ModalOpen(true);
  };

  const handleOpenCorridor360 = (corridorId: string) => {
    setActiveCorridor360Id(corridorId);
    setIsCorridor360ModalOpen(true);
  };

  // Active Map Layers
  const [activeLayers, setActiveLayers] = useState<Record<MapLayerKey, boolean>>({
    TRANSMISSION: true,
    SUBSTATIONS: true,
    LINES: true,
    TRANSFORMERS: true,
    OUTAGES: true,
    ALARMS: true,
    RISK: true,
    ASSET_HEALTH: true,
    PROJECTS: false,
    WEATHER: false,
    VOLTAGE: true,
    CONGESTION: true
  });

  // Deterministic telemetry stream; no random data is used for operational state.
  useEffect(() => {
    const interval = setInterval(() => {
      telemetryTickRef.current += 1;
      const tick = telemetryTickRef.current;
      const newFreq = 50.01 + 0.015 * Math.sin(tick / 2.75);
      const loadDelta = Math.round(3 * Math.sin(tick / 3.2));

      setKpis(prevKpis =>
        prevKpis.map(kpi => {
          if (kpi.id === '03_FREQUENCY') {
            const newSparkline = [...kpi.sparkline.slice(1), newFreq];
            return { ...kpi, value: newFreq, sparkline: newSparkline };
          }
          if (kpi.id === '01_SYSTEM_DEMAND') {
            const curVal = Number(kpi.value);
            const updatedVal = curVal + loadDelta;
            const newSparkline = [...kpi.sparkline.slice(1), updatedVal];
            return { ...kpi, value: updatedVal, sparkline: newSparkline };
          }
          return kpi;
        })
      );

      setSubstations(prevSubs => {
        const next = { ...prevSubs };
        const keys = Object.keys(next);
        const deterministicKey = keys[tick % keys.length];
        if (next[deterministicKey]) {
          const currentLoad = next[deterministicKey].currentLoadMW;
          const delta = Math.round(2 * Math.sin(tick / 2.7));
          next[deterministicKey] = {
            ...next[deterministicKey],
            currentLoadMW: Math.max(10, currentLoad + delta)
          };
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Compute Phase 04 Real-Time Grid Intelligence Engine State
  const intelligenceState = useMemo(() => {
    return GridIntelligenceEngine.evaluateGrid(substations, lines, alarms, events);
  }, [substations, lines, alarms, events]);

  // Compute Grid Data Quality Reconciliation Audit from Canonical Reconciliation Engine
  const reconciliationAudit = useMemo(() => {
    return GridReconciliationEngine.auditGrid(substations, lines);
  }, [substations, lines]);

  // Handlers
  const handleToggleLayer = (layer: MapLayerKey) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    closeInspector();
  };

  const handleAcknowledgeAlarm = (alarmId: string) => {
    setAlarms(prev => 
      prev.map(a => a.id === alarmId ? { ...a, acknowledged: true } : a)
    );
  };

  const handleToggleSimulation = () => {
    setDataFreshness(prev => {
      if (prev === 'OPERATIONAL_SIMULATION') return 'VERIFIED_PUBLIC';
      if (prev === 'VERIFIED_PUBLIC') return 'INTEGRATION_PENDING';
      if (prev === 'INTEGRATION_PENDING') return 'VERIFIED_LIVE';
      if (prev === 'VERIFIED_LIVE') return 'OPERATIONAL_SIMULATION';
      return 'OPERATIONAL_SIMULATION';
    });
  };

  const handleAskCopilot = (prompt: string) => {
    const qaResult = GridIntelligenceEngine.askCopilot(
      prompt,
      intelligenceState,
      substations,
      lines,
      selectedAssetId
    );
    setCopilotQAHistory(prev => [...prev, qaResult]);
  };

  const handleModeChange = (mode: CommandModeKey) => {
    setActiveCommandMode(mode);
    if (mode === 'DIGITAL_TWIN') {
      setOperationalMode('3D_TWIN');
      const el = document.getElementById('level-0-stage');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (mode === 'GRAPH') {
      setOperationalMode('GRAPH_TOPOLOGY');
      const el = document.getElementById('level-0-stage');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (mode === 'DATA_QUALITY') {
      setOperationalMode('DATA_QUALITY');
      const el = document.getElementById('level-0-stage');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (mode === 'RESILIENCE') {
      setActiveCommandMode('RESILIENCE');
    } else if (mode === 'RISK') {
      setActiveCommandMode('RISK');
    } else if (mode === 'CONGESTION') {
      setActiveCommandMode('CONGESTION');
    } else if (mode === 'ASSET_HEALTH') {
      setActiveCommandMode('ASSET_HEALTH');
    } else if ((mode as string) === 'OUTAGE' || (mode as string) === 'ALARMS') {
      setSelectedOpsLayer('OUTAGES');
      setActiveCommandMode('OPERATIONS');
    } else if (mode === 'WEATHER') {
      setActiveCommandMode('WEATHER');
    } else if (mode === 'OPERATIONS') {
      setOperationalMode('NORMAL');
      setActiveCommandMode('OPERATIONS');
    } else if ((mode as string) === 'PLANNING' || (mode as string) === 'INVESTMENT' || (mode as string) === 'FUTURE_GRID') {
      setOperationalMode('NORMAL');
      setActiveCommandMode(mode);
    }
  };

  const handleTraceCorridor = (corridorCode: string) => {
    const lineList = Object.values(lines) as TransmissionLine[];
    const line = lineList.find(l => l.id === corridorCode || l.name.toLowerCase().includes(corridorCode.toLowerCase()));
    if (line) {
      setHighlightedPath([line.fromSubstationId, line.toSubstationId]);
      setSelectedAssetId(line.fromSubstationId);
      const el = document.getElementById('level-0-stage');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectedAsset = selectedAssetId
    ? substations[selectedAssetId] || (Object.values(substations) as GridAsset[]).find(asset => asset.id === selectedAssetId) || null
    : null;

  // Derive header values from canonical state
  const systemLoadKpi = kpis.find(k => k.id === '01_SYSTEM_DEMAND')?.value || 2984;
  const generationKpi = kpis.find(k => k.id === '02_GENERATION_AVAILABILITY')?.value || 3120;
  const frequencyKpi = kpis.find(k => k.id === '03_FREQUENCY')?.value || '50.01';
  const spinningReserveVal = kpis.find(k => k.id === '02_GENERATION_AVAILABILITY')?.secondaryMetric?.value || 380;
  const transmissionAvailVal = kpis.find(k => k.id === '04_TRANSMISSION_AVAILABILITY')?.value || 99.4;
  const onlineSubstationsVal = kpis.find(k => k.id === '05_SUBSTATION_AVAILABILITY')?.value || '48/49';
  const activeAlarmsCount = alarms.filter(a => !a.acknowledged && (a.severity === 'CRITICAL' || a.severity === 'HIGH' || a.severity === 'P1')).length;

  return (
    <div className="w-full h-full min-w-0 min-h-0 flex flex-col bg-[#050913] text-slate-100 overflow-y-auto font-sans relative select-text">
      
      {/* Secondary controls remain available without competing with the operating picture. */}
      <details open className="atlas-secondary-detail shrink-0 border-b border-slate-800/70 bg-[#070c16]/80 group">
        <summary className="cursor-pointer select-none px-5 py-2 text-[10px] font-mono font-bold uppercase tracking-[.12em] text-slate-400 hover:text-cyan-300">
          Grid controls, diagnostics &amp; time context
        </summary>
        <div className="border-t border-slate-800/70">
      <GridHeader
        systemLoadMW={Number(systemLoadKpi)}
        generationMW={Number(generationKpi)}
        frequencyHz={frequencyKpi}
        spinningReserveMW={Number(spinningReserveVal)}
        transmissionAvailPct={transmissionAvailVal}
        onlineSubstationsCount={String(onlineSubstationsVal)}
        activeOutagesCount={1}
        criticalAlarmsCount={activeAlarmsCount}
        dataFreshness={dataFreshness}
        onOpenSystemHealth={() => setIsSystemHealthModalOpen(true)}
        onOpenResilienceModal={() => setIsResilienceModalOpen(true)}
        onToggleSimulation={handleToggleSimulation}
        onTriggerCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* 1.5. Phase 06 Permanent National Grid Situational Awareness & Operating Picture */}
      <NationalOperatingPictureHUD
        assessment={gridStateAssessment}
        onOpenStateDrivers={() => setIsGridStateDriversModalOpen(true)}
        onOpenHealthScorecard={() => setIsHealthScorecardModalOpen(true)}
        onOpenActionQueue={() => setActiveCommandMode('DECISION_QUEUE')}
      />

      {/* 2. Phase 04 Top Bar Grid Intelligence HUD */}
      <GridTopBarIntelligenceHUD
        intelligence={intelligenceState}
        onSelectAsset={handleSelectAsset}
        onOpenCopilotWithPrompt={handleAskCopilot}
        onSwitchMode={(mode) => handleModeChange(mode as any)}
      />

      {/* 3. Operational Mode Switcher Bar */}
      <ModeSwitcher
        currentMode={activeCommandMode}
        onSelectMode={handleModeChange}
        activeLevel={activeDensityLevel}
        onScrollToLevel={setActiveDensityLevel}
      />

      {/* 3.5. Phase 05 Digital Twin Time Machine (LIVE / HISTORICAL / SIMULATED / FORECAST) */}
      <DigitalTwinTimeMachine
        currentMode={temporalMode}
        onModeChange={(newMode) => {
          setTemporalMode(newMode);
          if (newMode === 'FORECAST') setActiveCommandMode('FORECAST_WALL');
          if (newMode === 'SIMULATED') setActiveCommandMode('SCENARIO_LAB');
          if (newMode === 'LIVE') setActiveCommandMode('OPERATIONS');
        }}
      />
        </div>
      </details>

      <section className="order-first shrink-0 border-b border-slate-800/80 bg-[radial-gradient(900px_220px_at_10%_0%,rgba(0,217,255,.10),transparent_66%)] px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[.16em] text-cyan-300">Enterprise Operations</p>
            <h1 className="mt-1 text-2xl font-display font-semibold tracking-[-.011em] text-white md:text-3xl">A clearer view of the national grid</h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-400">Grid health, delivery exposure, and priority decisions—unified in one operational picture.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="min-w-28 rounded-lg border border-rose-500/25 bg-rose-950/20 px-3 py-2"><span className="block text-[9px] font-mono uppercase tracking-wider text-rose-300">Critical events</span><strong className="mt-0.5 block font-mono text-lg text-white">{activeAlarmsCount}</strong></div>
            <div className="min-w-28 rounded-lg border border-amber-500/25 bg-amber-950/20 px-3 py-2"><span className="block text-[9px] font-mono uppercase tracking-wider text-amber-300">Action required</span><strong className="mt-0.5 block font-mono text-lg text-white">{priorityQueue.length}</strong></div>
            <div className="min-w-28 rounded-lg border border-emerald-500/25 bg-emerald-950/20 px-3 py-2"><span className="block text-[9px] font-mono uppercase tracking-wider text-emerald-300">System health</span><strong className="mt-0.5 block font-mono text-lg text-white">{gridHealthScore.overallHealthScore}%</strong></div>
          </div>
        </div>
      </section>

      {/* Phase 05 & Phase 06 Dedicated View Modules when chosen in Mode Switcher */}
      {activeCommandMode === 'DECISION_QUEUE' ? (
        <div className="p-4 bg-[#050913]">
          <OperatorActionQueue
            items={priorityQueue}
            onOpenAsset360={handleOpenAsset360}
            onOpenCorridor360={handleOpenCorridor360}
            onOpenDecisionBrief={handleOpenDecisionBrief}
          />
        </div>
      ) : activeCommandMode === 'INCIDENT_ROOM' ? (
        <div className="p-4 bg-[#050913] space-y-4">
          <EventCausalityGraph
            graphData={causalityGraphData}
            onOpenAsset360={handleOpenAsset360}
            onOpenDecisionBrief={handleOpenDecisionBrief}
          />
          <MaintenanceOperationsFusion
            items={maintenanceRiskList}
            onOpenAsset360={handleOpenAsset360}
            onOpenDecisionBrief={handleOpenDecisionBrief}
          />
        </div>
      ) : activeCommandMode === 'CORRELATION' ? (
        <div className="p-4 bg-[#050913]">
          <CrossDomainCorrelationView
            correlations={correlations}
            onOpenAsset360={handleOpenAsset360}
            onOpenCorridor360={handleOpenCorridor360}
            onOpenDecisionBrief={handleOpenDecisionBrief}
          />
        </div>
      ) : activeCommandMode === 'DECISION_AUDIT' ? (
        <div className="p-4 bg-[#050913] space-y-4">
          <DecisionAuditLedgerView
            entries={decisionLedger}
            onOpenDecisionBrief={handleOpenDecisionBrief}
          />
          <ModelDataTrustPanel
            learningHistory={learningHistory}
          />
        </div>
      ) : activeCommandMode === 'EXECUTIVE' ? (
        <div className="p-4 bg-[#050913]">
          <ExecutiveIntelligenceView
            assessment={gridStateAssessment}
            healthScore={gridHealthScore}
            onOpenDecisionBrief={handleOpenDecisionBrief}
            onOpenActionQueue={() => setActiveCommandMode('DECISION_QUEUE')}
          />
        </div>
      ) : activeCommandMode === 'FORECAST_WALL' ? (
        <NationalForecastWall
          substations={substations}
          lines={lines}
          onSelectAsset={handleSelectAsset}
          onLaunchScenario={handleLaunchScenarioInLab}
        />
      ) : activeCommandMode === 'SCENARIO_LAB' ? (
        <ScenarioLab
          substations={substations}
          lines={lines}
          onSelectAsset={handleSelectAsset}
          preselectedScenarioId={labScenarioId}
        />
      ) : activeCommandMode === 'CONTINGENCY_RANK' || activeCommandMode === 'RESILIENCE' ? (
        <ContingencyRankingView
          substations={substations}
          lines={lines}
          onSelectScenarioForLab={handleLaunchScenarioInLab}
        />
      ) : activeCommandMode === 'PREDICTIVE_WATCH' ? (
        <PredictiveWatchlistView
          substations={substations}
          onSelectAsset={handleSelectAsset}
          onSimulateOutage={handleLaunchScenarioInLab}
        />
      ) : activeCommandMode === 'WEATHER' ? (
        <WeatherImpactView lines={lines} />
      ) : activeCommandMode === 'MODEL_DRIFT' ? (
        <ModelDriftView />
      ) : activeCommandMode === 'RISK' ? (
        <div className="p-4 bg-[#050913]">
          <GridRiskIntelligenceLayer
            substations={substations}
            lines={lines}
            selectedAssetId={selectedAssetId}
            onSelectAsset={handleSelectAsset}
            onTraceCorridor={handleTraceCorridor}
          />
        </div>
      ) : activeCommandMode === 'CONGESTION' ? (
        <div className="p-4 bg-[#050913]">
          <TransmissionPerformanceLayer
            onSelectCorridor={(corridor) => handleTraceCorridor(corridor)}
          />
        </div>
      ) : activeCommandMode === 'ASSET_HEALTH' ? (
        <div className="p-4 bg-[#050913]">
          <AssetIntelligenceLayer />
        </div>
      ) : activeCommandMode === 'PLANNING' || activeCommandMode === 'INVESTMENT' || activeCommandMode === 'FUTURE_GRID' ? (
        <div className="p-4 bg-[#050913]">
          <NationalGridPlanningDashboard onSelectAsset={handleSelectAsset} />
        </div>
      ) : (
        /* The Canonical Vertical Command Center Experience */
        <div className="p-4 space-y-6 bg-[#050913]">
          
          {/* Priority 1: GRID / DIGITAL TWIN OPERATIONAL CANVAS */}
          <div className="bg-[#080e1b] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  PRIMARY OPERATIONAL STAGE
                </span>
                <h2 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
                  National Grid Spatial Intelligence & Digital Twin
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Full 500kV HVDC, 400kV EHV, 220kV, and 132kV synchronous topology with live SCADA line loadings
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOperationalMode('NORMAL');
                    const el = document.getElementById('level-0-stage');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    operationalMode === 'NORMAL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  GIS Spatial Map
                </button>
                <button
                  onClick={() => {
                    setOperationalMode('3D_TWIN');
                    const el = document.getElementById('level-0-stage');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    operationalMode === '3D_TWIN' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  3D Switchyard Twin
                </button>
                <button
                  onClick={() => {
                    setOperationalMode('GRAPH_TOPOLOGY');
                    const el = document.getElementById('level-0-stage');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    operationalMode === 'GRAPH_TOPOLOGY' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Topology Graph
                </button>
              </div>
            </div>

            <div id="level-0-stage" className="w-full h-[640px] rounded-lg overflow-hidden flex border border-slate-800 relative">
              {/* Main Center Canvas according to Operational Mode */}
              {operationalMode === 'DATA_QUALITY' ? (
                <GridDataQualityPanel
                  summary={reconciliationAudit.summary}
                  reports={reconciliationAudit.reports}
                  conflicts={reconciliationAudit.conflicts}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={handleSelectAsset}
                  onClose={() => setOperationalMode('NORMAL')}
                />
              ) : operationalMode === '3D_TWIN' ? (
                <Suspense fallback={<div className="flex flex-1 items-center justify-center text-xs font-mono text-cyan-300" role="status">Loading 3D twin...</div>}>
                  <GridDigitalTwin3D
                    selectedAsset={selectedAsset || substations['suswa']}
                    onClose={() => setOperationalMode('NORMAL')}
                  />
                </Suspense>
              ) : operationalMode === 'GRAPH_TOPOLOGY' ? (
                <GridGraphExplorer
                  substations={substations}
                  lines={lines}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={handleSelectAsset}
                  onHighlightPath={(path) => setHighlightedPath(path)}
                />
              ) : (
                <GridMapCanvas
                  substations={substations}
                  lines={lines}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={handleSelectAsset}
                  activeLayers={activeLayers}
                  onToggleLayer={handleToggleLayer}
                  operationalMode={operationalMode}
                  onSetOperationalMode={setOperationalMode}
                  cameraPreset={cameraPreset}
                  onSetCameraPreset={setCameraPreset}
                  highlightedPath={highlightedPath}
                  onMapProviderStatusChange={setMapProviderStatus}
                />
              )}

              {/* Right Intelligence Panel (AI Copilot, Anomaly Feed, Incidents) */}
              {selectedAsset ? (
                <SubstationDetailsPanel
                  substation={selectedAsset}
                  substations={substations}
                  lines={lines}
                  alarms={alarms}
                  events={events}
                  onClose={() => setSelectedAssetId(null)}
                />
              ) : (
                <GridIntelligencePanel
                  selectedAsset={null}
                  onClearSelection={() => setSelectedAssetId(null)}
                  alarms={alarms}
                  events={events}
                  aiInsights={CANONICAL_AI_INSIGHTS}
                  onAskCopilot={handleAskCopilot}
                  intelligenceState={intelligenceState}
                  copilotQAHistory={copilotQAHistory}
                  onSelectAsset={handleSelectAsset}
                />
              )}
            </div>
          </div>

          {/* Priority 2: operational conditions become supporting context after the canvas. */}
          <div className="atlas-secondary-detail">
            <CommandCenterVerticalSystemStatus
              systemLoadMW={Number(systemLoadKpi)}
              generationMW={Number(generationKpi)}
              frequencyHz={frequencyKpi}
              spinningReserveMW={Number(spinningReserveVal)}
              transmissionAvailPct={transmissionAvailVal}
              gridAssessment={gridStateAssessment}
              onOpenDecisionBrief={handleOpenDecisionBrief}
              onLaunchScenario={() => setActiveCommandMode('SCENARIO_LAB')}
            />
          </div>

          {/* Priority 3: CRITICAL INCIDENTS */}
          <CommandCenterVerticalIncidents
            incidents={incidents}
            onOpenDecisionBrief={handleOpenDecisionBrief}
            onOpenAsset360={handleOpenAsset360}
            onOpenCorridor360={handleOpenCorridor360}
            onSelectAsset={handleSelectAsset}
          />

          {/* Section 4: ASSET INTELLIGENCE (Substations, Transmission Lines, Transformers, Corridors) */}
          <CommandCenterVerticalAssetIntelligence
            substations={Object.values(substations)}
            lines={Object.values(lines)}
            onSelectAsset={handleSelectAsset}
            onOpenAsset360={handleOpenAsset360}
            onOpenCorridor360={handleOpenCorridor360}
          />

          {/* Section 5: NETWORK ANALYTICS */}
          <CommandCenterVerticalAnalytics />

        </div>
      )}

      {/* 7. Bottom Real-Time Event & Alarm Fabric Strip */}
      <GridEventFabric
        events={events}
        alarms={alarms}
        onSelectAsset={handleSelectAsset}
        onAcknowledgeAlarm={handleAcknowledgeAlarm}
      />

      {/* 8. Operational Telemetry & Analytics Deep Dive Section */}
      <div className="border-t border-slate-800/80 bg-[#060b17] p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                OPERATIONAL TELEMETRY & ANALYTICS LAYERS
              </span>
            </div>
            <h3 className="text-base font-display font-bold text-white tracking-tight mt-0.5">
              National Grid Layer Inspection (L1 - L7)
            </h3>
          </div>

          {/* Layer switcher tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'SYSTEM_OPS', label: 'L1: System Operations' },
              { id: 'TRANSMISSION', label: 'L2: Corridors & Congestion' },
              { id: 'ASSET_HEALTH', label: 'L3: Asset Fleet Health' },
              { id: 'RISK', label: 'L4: Risk Intelligence & Matrices' },
              { id: 'OUTAGES', label: 'L5: Outage & Alarm Fabric' },
              { id: 'FORECAST', label: 'L6: Forecast & Weather' },
              { id: 'AI_ANOMALY', label: 'L7: AI Intelligence & Remedial' },
              { id: 'TIMELINE', label: 'Multi-Horizon Timeline' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedOpsLayer(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedOpsLayer === tab.id
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-semibold'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Render only the selected deep dive layer */}
        <div className="transition-opacity duration-200">
          {selectedOpsLayer === 'SYSTEM_OPS' && <SystemOperationsLayer />}
          {selectedOpsLayer === 'TRANSMISSION' && (
            <TransmissionPerformanceLayer
              onSelectCorridor={(corridor) => handleTraceCorridor(corridor)}
            />
          )}
          {selectedOpsLayer === 'ASSET_HEALTH' && <AssetIntelligenceLayer />}
          {selectedOpsLayer === 'RISK' && (
            <GridRiskIntelligenceLayer
              substations={substations}
              lines={lines}
              selectedAssetId={selectedAssetId}
              onSelectAsset={handleSelectAsset}
              onTraceCorridor={handleTraceCorridor}
            />
          )}
          {selectedOpsLayer === 'OUTAGES' && (
            <OutageAlarmFabricLayer
              alarms={alarms}
              events={events}
              onSelectAsset={handleSelectAsset}
              onAcknowledgeAlarm={handleAcknowledgeAlarm}
            />
          )}
          {selectedOpsLayer === 'FORECAST' && <ForecastEnvironmentalLayer />}
          {selectedOpsLayer === 'AI_ANOMALY' && (
            <AiIntelligenceAnomalyLayer
              insights={CANONICAL_AI_INSIGHTS}
              onSelectAsset={handleSelectAsset}
              onExecuteRemedialAction={() => setIsResilienceModalOpen(true)}
            />
          )}
          {selectedOpsLayer === 'TIMELINE' && (
            <div className="bg-[#050913] p-2 rounded-lg border border-slate-800/80">
              <GridIntelligenceTimeline
                timeline={intelligenceState.timeline}
                onSelectAsset={handleSelectAsset}
                selectedAssetId={selectedAssetId}
              />
            </div>
          )}
        </div>
      </div>

      {/* 16. Ctrl+K Global Command Palette */}
      <GridCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        substations={substations}
        lines={lines}
        onSelectAsset={handleSelectAsset}
        onSetOperationalMode={setOperationalMode}
        onOpenResilienceModal={() => setIsResilienceModalOpen(true)}
        onOpenSystemHealth={() => setIsSystemHealthModalOpen(true)}
        onToggleSimulation={handleToggleSimulation}
      />

      {/* 17. System Health Subsystem Diagnostics Modal */}
      <GridSystemHealthModal
        isOpen={isSystemHealthModalOpen}
        onClose={() => setIsSystemHealthModalOpen(false)}
        googleMapsStatus={mapProviderStatus}
      />

      {/* 18. N-1 Resilience & Contingency Simulation Modal */}
      <GridResilienceModal
        isOpen={isResilienceModalOpen}
        onClose={() => setIsResilienceModalOpen(false)}
      />

      {/* 19. Phase 06 Operator 9-Part Structured Decision Brief Modal */}
      <OperatorDecisionBriefModal
        brief={activeBrief}
        isOpen={isDecisionBriefModalOpen}
        onClose={() => setIsDecisionBriefModalOpen(false)}
        onAuthorizeAction={handleAuthorizeBrief}
        onOpenAsset360={handleOpenAsset360}
        onOpenCorridor360={handleOpenCorridor360}
      />

      {/* 20. Phase 06 Asset 360 Operational Profile Modal */}
      <Asset360Modal
        profile={activeAsset360Profile}
        isOpen={isAsset360ModalOpen}
        onClose={() => setIsAsset360ModalOpen(false)}
        onOpenDecisionBrief={handleOpenDecisionBrief}
      />

      {/* 21. Phase 06 Corridor 360 Operational Profile Modal */}
      <Corridor360Modal
        profile={activeCorridor360Profile}
        isOpen={isCorridor360ModalOpen}
        onClose={() => setIsCorridor360ModalOpen(false)}
        onOpenDecisionBrief={handleOpenDecisionBrief}
      />

      {/* 22. Phase 06 National Grid Health Scorecard Modal */}
      <NationalGridHealthScorecard
        healthScore={gridHealthScore}
        isOpen={isHealthScorecardModalOpen}
        onClose={() => setIsHealthScorecardModalOpen(false)}
        onOpenDecisionBrief={handleOpenDecisionBrief}
      />

      {/* 23. Phase 06 Grid State Engine Drivers & Decomposition Modal */}
      <GridStateDriversModal
        assessment={gridStateAssessment}
        isOpen={isGridStateDriversModalOpen}
        onClose={() => setIsGridStateDriversModalOpen(false)}
        onOpenDecisionBrief={handleOpenDecisionBrief}
      />
    </div>
  );
}
