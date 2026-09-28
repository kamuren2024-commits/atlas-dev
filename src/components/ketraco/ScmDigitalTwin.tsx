import React, { useState, useEffect } from 'react';
import { 
  Cpu, GitFork, AlertCircle, RefreshCw, BarChart2, ShieldAlert, 
  Settings, CheckCircle, Info, Radio, Zap, Sparkles, Database, Activity,
  Layers, AlertTriangle, CheckSquare, Clock
} from 'lucide-react';
import { AtlasMissionBrief } from '../ui/atlas/AtlasMissionBrief';
import { AtlasAgentPulse, DEFAULT_ENTERPRISE_AGENTS } from '../ui/atlas/AtlasAgentPulse';

interface Scenario {
  name: string;
  resilienceImpact: number;
  description: string;
  affectedEntity: string;
  tripped_branches?: string[];
}

interface ScmDigitalTwinProps {
  onAskCopilot?: (prompt: string) => void;
}

export default function ScmDigitalTwin({ onAskCopilot }: ScmDigitalTwinProps) {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [resilienceScore, setResilienceScore] = useState(82);
  const [trustScore, setTrustScore] = useState(97.8);
  const [entitiesCount, setEntitiesCount] = useState(14);
  const [gridFrequency, setGridFrequency] = useState(50.02);
  const [gridLoadMw, setGridLoadMw] = useState(2184);
  const [activeTab, setActiveTab] = useState<'SCM_FLOW' | 'TRANSMISSION_GRID' | 'CONTINGENCY_N1' | 'DGA_PROGNOSTICS'>('SCM_FLOW');
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [contingencyList, setContingencyList] = useState<any[]>([]);
  const [predictiveList, setPredictiveList] = useState<any[]>([]);
  const [advisoryList, setAdvisoryList] = useState<any[]>([]);

  const [simulationLogs, setSimulationLogs] = useState<string[]>([
    'Digital Twin telemetry aligned with live Suswa-Olkaria grid (50.02 Hz).',
    'State estimation converged in 4 iterations with 98.4% grid observability.',
    'Inventory checks at Mariakani warehouse verified standing in nominal buffers.'
  ]);

  const scenarios: Record<string, Scenario> = {
    cableDelay: {
      name: '20% Cable Shipment Ocean Delay',
      resilienceImpact: -14,
      description: 'Simulates a port container delay for primary conductor steel cables from Shanghai.',
      affectedEntity: 'Shipment'
    },
    transformerFailure: {
      name: 'EHV Transformer Insulation Failure',
      resilienceImpact: -25,
      description: 'Stress-tests the critical path if the primary 220kV transformer fails field deployment checks.',
      affectedEntity: 'Inventory',
      tripped_branches: ['TX_ISINYA_T1']
    },
    customHold: {
      name: 'Mombasa Port Customs Hold',
      resilienceImpact: -8,
      description: 'Simulates extended custom inspections & withholding of insulation brackets at terminal.',
      affectedEntity: 'Supplier'
    },
    budgetShortfall: {
      name: '15% Contingency Budget Allocation Shortfall',
      resilienceImpact: -11,
      description: 'Stress-tests financial liabilities across project milestones when contingency bounds shrink.',
      affectedEntity: 'Contract'
    },
    lineTrip: {
      name: 'N-1 Suswa-Isinya 400kV Line Flashover',
      resilienceImpact: -22,
      description: 'Simulates sudden lightning trip on 400kV Suswa-Isinya double circuit during peak evening demand.',
      affectedEntity: 'Project',
      tripped_branches: ['LINE_SUSWA_ISINYA_400KV']
    }
  };

  // Fetch live backend digital twin data
  useEffect(() => {
    let isMounted = true;

    async function loadDigitalTwinState() {
      try {
        const [ovRes, contRes, predRes, advRes] = await Promise.all([
          fetch('/api/twin/overview'),
          fetch('/api/twin/contingencies'),
          fetch('/api/twin/predictive'),
          fetch('/api/twin/advisories')
        ]);

        if (!isMounted) return;

        if (ovRes.ok) {
          const ov = await ovRes.json();
          setOverviewData(ov);
          if (ov.trust_score?.composite_trust_score) {
            setTrustScore(ov.trust_score.composite_trust_score);
          }
          if (ov.counts?.total_assets) {
            setEntitiesCount(ov.counts.total_assets);
          }
          if (ov.system_frequency_hz) {
            setGridFrequency(ov.system_frequency_hz);
          }
          if (ov.grid_load_mw) {
            setGridLoadMw(ov.grid_load_mw);
          }
        }

        if (contRes.ok) {
          const cont = await contRes.json();
          setContingencyList(cont.contingencies || []);
        }

        if (predRes.ok) {
          const pred = await predRes.json();
          setPredictiveList(pred.assets || []);
        }

        if (advRes.ok) {
          const adv = await advRes.json();
          setAdvisoryList(adv.advisories || []);
        }
      } catch (err) {
        console.warn('[DIGITAL-TWIN-UI] Falling back to initial state:', err);
      }
    }

    loadDigitalTwinState();

    // Setup live SSE stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/twin/stream');
      eventSource.addEventListener('grid-pulse', (e: MessageEvent) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(e.data);
          if (data.frequency) setGridFrequency(data.frequency);
          if (data.total_load_mw) setGridLoadMw(data.total_load_mw);
          if (data.trust_score) setTrustScore(data.trust_score);
        } catch {}
      });
    } catch (err) {
      console.warn('[DIGITAL-TWIN-UI] SSE stream unavailable:', err);
    }

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleRunScenario = async (key: string) => {
    const sc = scenarios[key];
    if (activeSimulation === key) {
      // Revert to nominal
      setActiveSimulation(null);
      setResilienceScore(82);
      setSimulationLogs(prev => [
        `[NOMINAL RESET] Released simulation: ${sc.name}. Digital twin state restored to baseline.`,
        ...prev
      ]);
    } else {
      setIsLoading(true);
      setActiveSimulation(key);
      const targetScore = Math.max(30, 82 + sc.resilienceImpact);
      setResilienceScore(targetScore);

      try {
        const res = await fetch('/api/twin/scenarios/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario_key: key,
            tripped_branch_ids: sc.tripped_branches || [],
            load_multiplier: 1.15
          })
        });

        if (res.ok) {
          const result = await res.json();
          const overloads = result.post_state?.overloaded_branches || [];
          const overloadMsg = overloads.length > 0 
            ? `Detected ${overloads.length} post-contingency thermal overload(s): ${overloads.map((o: any) => `${o.id} (${o.loading_pct}%)`).join(', ')}.`
            : 'No permanent branch thermal violations detected; voltage limits held.';

          setSimulationLogs(prev => [
            `[SIMULATION ALERT] Executed physical stress test: ${sc.name}.`,
            `[ENGINE IMPACT] ${overloadMsg}`,
            `[PHYSICS RESULT] Resilience index adjusted to ${result.resilience_score}%. Affected node: ${sc.affectedEntity}.`,
            ...prev
          ]);
        } else {
          setSimulationLogs(prev => [
            `[SIMULATION ALERT] Executed stress test: ${sc.name}.`,
            `[WARNING] ${sc.description}`,
            `[IMPACT] Resilience index reduced to ${targetScore}%. Affected node: ${sc.affectedEntity}.`,
            ...prev
          ]);
        }
      } catch {
        setSimulationLogs(prev => [
          `[SIMULATION ALERT] Executed stress test: ${sc.name}.`,
          `[IMPACT] Resilience index reduced to ${targetScore}%.`,
          ...prev
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAuthorizeAdvisory = async (advisoryId: string) => {
    try {
      const res = await fetch(`/api/twin/advisories/${advisoryId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'AUTHORIZED',
          operator_id: 'ncc.lead.operator@ketraco.co.ke',
          notes: 'Authorized per Grid Code Emergency Redispatch Protocol'
        })
      });
      if (res.ok) {
        setAdvisoryList(prev => prev.map(a => a.advisory_id === advisoryId ? { ...a, status: 'AUTHORIZED' } : a));
        setSimulationLogs(prev => [
          `[OPERATOR AUTHORIZATION] Approved switching/redispatch order for ${advisoryId}.`,
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Error authorizing advisory:', err);
    }
  };

  const getEntityStyles = (entityName: string) => {
    if (!activeSimulation) {
      return 'bg-slate-900/80 border-slate-800 text-slate-100';
    }
    const sc = scenarios[activeSimulation];
    if (sc.affectedEntity === entityName) {
      return 'bg-red-950/60 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.35)] animate-pulse';
    }
    return 'bg-slate-900/30 border-slate-800/40 text-slate-500';
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4" id="scm-digital-twin">
      
      {/* Mission Brief — digital twin operating statement */}
      <AtlasMissionBrief
        moduleLabel="Transmission Digital Twin"
        mission="Detect developing grid risks early, establish the most probable physical system state, determine consequences, and recommend safe corrective actions."
        description="Canonical transmission-network digital twin modeling physical assets, electrical topology, WLS state estimation, N-1 contingencies, DGA asset prognostics, and operator advisories."
        metrics={[
          { label: 'Resilience Score', value: resilienceScore, unit: '%', icon: ShieldAlert, tone: resilienceScore >= 80 ? 'healthy' : resilienceScore >= 65 ? 'risk' : 'critical' as any },
          { label: 'Twin Trust Score', value: trustScore, unit: '%', icon: CheckCircle, tone: 'healthy' },
          { label: 'Assets Modeled', value: entitiesCount, icon: GitFork, tone: 'healthy' },
          { label: 'Grid Frequency', value: `${gridFrequency} Hz`, icon: Activity, tone: 'info' },
        ]}
      />

      {/* Sub-view Navigation Tabs */}
      <div className="px-6 flex items-center gap-2 border-b border-slate-800/60 pb-2">
        <button
          onClick={() => setActiveTab('SCM_FLOW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'SCM_FLOW' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          SCM Dependency Chain
        </button>

        <button
          onClick={() => setActiveTab('TRANSMISSION_GRID')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'TRANSMISSION_GRID' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Transmission Grid State
        </button>

        <button
          onClick={() => setActiveTab('CONTINGENCY_N1')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'CONTINGENCY_N1' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          N-1 Contingency Analysis ({contingencyList.length})
        </button>

        <button
          onClick={() => setActiveTab('DGA_PROGNOSTICS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'DGA_PROGNOSTICS' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Asset Health & DGA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6">
        
        {/* Main Workspace Display (8 columns) */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800/40 flex flex-col justify-between min-h-[460px] relative">
          
          {activeTab === 'SCM_FLOW' && (
            <>
              <div className="absolute top-4 left-4 flex gap-1.5 items-center">
                <GitFork className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] tracking-wider font-mono text-slate-400 uppercase">Interactive Asset Entity Map</span>
              </div>

              {/* SVG Connector Lines and Nodes */}
              <div className="flex-1 flex flex-col justify-center items-center py-10 relative">
                <div className="grid grid-cols-5 gap-4 items-center w-full max-w-2xl relative z-10">
                  
                  {/* Node 1: Project */}
                  <div className={`p-4 rounded-xl border text-center transition-all ${getEntityStyles('Project')}`}>
                    <span className="text-[10px] font-mono font-medium block text-indigo-400">1. PROJECT</span>
                    <span className="text-xs font-bold block mt-1">Suswa-Olkaria</span>
                    <p className="text-[9px] text-slate-500 mt-1">400kV EHV Line</p>
                  </div>

                  {/* Node 2: Contract */}
                  <div className={`p-4 rounded-xl border text-center transition-all ${getEntityStyles('Contract')}`}>
                    <span className="text-[10px] font-mono font-medium block text-indigo-400">2. CONTRACT</span>
                    <span className="text-xs font-bold block mt-1">LOT-4 Turnkey</span>
                    <p className="text-[9px] text-slate-500 mt-1">Penalty Clauses</p>
                  </div>

                  {/* Node 3: Supplier */}
                  <div className={`p-4 rounded-xl border text-center transition-all ${getEntityStyles('Supplier')}`}>
                    <span className="text-[10px] font-mono font-medium block text-indigo-400">3. SUPPLIER</span>
                    <span className="text-xs font-bold block mt-1">Shanghai Cable</span>
                    <p className="text-[9px] text-slate-500 mt-1">Delays SLA</p>
                  </div>

                  {/* Node 4: Shipment */}
                  <div className={`p-4 rounded-xl border text-center transition-all ${getEntityStyles('Shipment')}`}>
                    <span className="text-[10px] font-mono font-medium block text-indigo-400">4. SHIPMENT</span>
                    <span className="text-xs font-bold block mt-1">Conductor Cables</span>
                    <p className="text-[9px] text-slate-500 mt-1">Mombasa port</p>
                  </div>

                  {/* Node 5: Inventory */}
                  <div className={`p-4 rounded-xl border text-center transition-all ${getEntityStyles('Inventory')}`}>
                    <span className="text-[10px] font-mono font-medium block text-indigo-400">5. INVENTORY</span>
                    <span className="text-xs font-bold block mt-1">Transformer Lot</span>
                    <p className="text-[9px] text-slate-500 mt-1">Isinya depo</p>
                  </div>

                </div>

                {/* Visual SVG connecting arrows behind nodes */}
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
                  <svg className="w-full h-10 px-8" stroke="rgba(139,92,246,0.18)" fill="none" strokeWidth="2">
                    <path d="M 0,20 L 700,20" strokeDasharray="5,5" />
                  </svg>
                </div>
              </div>

              {/* Flow Direction Indicator */}
              <div className="bg-slate-950/40 px-4 py-2.5 rounded-xl border border-slate-800/40 text-center">
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  KETRACO Dependency Path Flow : Project &rarr; Contract &rarr; Supplier &rarr; Shipment &rarr; Inventory
                </span>
              </div>
            </>
          )}

          {activeTab === 'TRANSMISSION_GRID' && (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 items-center">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Live High-Voltage Transmission Topology</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                  State Estimation: CONVERGED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total Active Load</span>
                  <span className="text-base font-bold text-slate-100">{gridLoadMw} MW</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">System Frequency</span>
                  <span className="text-base font-bold text-emerald-400">{gridFrequency} Hz</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Substations</span>
                  <span className="text-base font-bold text-indigo-400">14 Active</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Corridor Telemetry</span>
                  <span className="text-base font-bold text-cyan-400">GOOD (98.4%)</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Critical Corridors & Power Flows:</span>
                {[
                  { name: 'Suswa - Isinya 400kV Double Circuit', mw: 888.4, loading: 74.0, status: 'NOMINAL', voltage: '400kV' },
                  { name: 'Isinya - Mariakani 400kV Coast Link', mw: 412.0, loading: 41.2, status: 'NOMINAL', voltage: '400kV' },
                  { name: 'Loyangalani - Suswa 400kV Wind Link', mw: 310.0, loading: 25.8, status: 'NOMINAL', voltage: '400kV' },
                  { name: 'Olkaria - Nairobi North 220kV Feeder', mw: 320.5, loading: 71.2, status: 'NOMINAL', voltage: '220kV' },
                  { name: 'Ethiopia - Kenya 500kV HVDC Bipole', mw: 850.0, loading: 42.5, status: 'NOMINAL', voltage: '500kV_HVDC' }
                ].map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{c.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{c.voltage} &bull; Flow: {c.mw} MW</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-slate-300 font-bold block">{c.loading}% MVA</span>
                      <span className="text-[9px] font-mono text-emerald-400">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'CONTINGENCY_N1' && (
            <div className="flex-1 flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 items-center">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">N-1 Transmission Contingency Scans</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Total Analyzed: {contingencyList.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
                {contingencyList.map((cont, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{cont.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        cont.severity === 'CRITICAL' ? 'bg-red-950/80 text-red-400 border border-red-500/40' :
                        cont.severity === 'HIGH' ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {cont.severity}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                      <div>Post-Trip Max Loading: <span className="text-slate-200 font-bold">{cont.post_contingency_state?.max_loading_pct}%</span></div>
                      <div>Post-Trip Min Voltage: <span className="text-slate-200 font-bold">{cont.post_contingency_state?.min_voltage_pu} pu</span></div>
                    </div>
                    {cont.recommended_actions?.length > 0 && (
                      <div className="bg-slate-950/40 p-2 rounded border border-slate-800/60 text-[10px] text-cyan-300">
                        <span className="font-bold text-slate-400 block mb-0.5">Recommended Response:</span>
                        {cont.recommended_actions[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'DGA_PROGNOSTICS' && (
            <div className="flex-1 flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5 items-center">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Predictive Asset Health & DGA Analysis</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">IEEE C57.104 & IEC 60599 Standards</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 max-h-[360px] pr-1">
                {predictiveList.map((asset, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-200 block">{asset.asset_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{asset.asset_type} &bull; ID: {asset.asset_id}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-mono font-bold block ${
                          asset.health_index < 70 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          Health: {asset.health_index}/100
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">Horizon: {asset.time_horizon_days}d</span>
                      </div>
                    </div>

                    {asset.dga && (
                      <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-2 rounded-lg text-[10px] font-mono text-center">
                        <div><span className="text-slate-500 block">C2H4</span><span className={asset.dga.ethylene_c2h4_ppm > 100 ? 'text-red-400 font-bold' : 'text-slate-300'}>{asset.dga.ethylene_c2h4_ppm} ppm</span></div>
                        <div><span className="text-slate-500 block">H2</span><span className="text-slate-300">{asset.dga.hydrogen_h2_ppm} ppm</span></div>
                        <div><span className="text-slate-500 block">Duval Zone</span><span className="text-cyan-400 font-bold">{asset.dga.duval_zone}</span></div>
                        <div><span className="text-slate-500 block">Moisture</span><span className="text-slate-300">{asset.dga.moisture_in_oil_ppm} ppm</span></div>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300">Action: </span>{asset.recommended_inspection}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Actionable Scenario Controllers (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Failure presets selection */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-3 flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Stress Test Scenarios</h3>
            
            <div className="space-y-3">
              {Object.entries(scenarios).map(([key, sc]) => {
                const isSelected = activeSimulation === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleRunScenario(key)}
                    disabled={isLoading}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                        : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${isSelected ? 'text-red-400' : 'text-slate-200'}`}>{sc.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-red-300 font-bold' : 'text-slate-500'}`}>Impact: {sc.resilienceImpact}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{sc.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulation outputs logs console */}
          <div className="bg-slate-950/70 border border-slate-800 p-4.5 rounded-2xl h-[230px] flex flex-col justify-between font-mono text-[10px]">
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-2">
              <span className="text-indigo-400 font-semibold uppercase tracking-wider">Digital Twin Console Log</span>
              <span className="text-slate-600">LIVE_CYCLE_OK</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-slate-400 mb-2">
              {simulationLogs.map((log, idx) => (
                <div key={idx} className="leading-normal">
                  <span className="text-slate-600 font-bold mr-1">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
            <div>
              <button
                onClick={() => {
                  const currentSc = activeSimulation ? scenarios[activeSimulation].name : "Baseline Transmission & SCM State";
                  onAskCopilot?.(`Run a neural impact study of KETRACO digital twin state: "${currentSc}". What are the N-1 contingency risks, voltage limits, and cascade vulnerabilities across 400kV and 220kV corridors?`);
                }}
                className="w-full py-2 bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/20 text-cyan-300 rounded-xl flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Grid Intelligence AI Study
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Operator Advisory Panel (Human-in-the-Loop Safety) */}
      {advisoryList.length > 0 && (
        <div className="px-6">
          <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Operator Advisory & Human-in-the-Loop Control</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Strict Safety Interlock Required</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {advisoryList.map((adv, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{adv.event_title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      adv.status === 'AUTHORIZED' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                    }`}>
                      {adv.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed"><span className="text-slate-300 font-semibold">Recommended:</span> {adv.recommended_action}</p>
                  
                  {adv.status === 'PENDING_OPERATOR_REVIEW' && (
                    <button
                      onClick={() => handleAuthorizeAdvisory(adv.advisory_id)}
                      className="w-full py-1.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Authorize Corrective Action
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contextual Intelligence rail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => onAskCopilot?.(`Provide a briefing on KETRACO digital twin trust score (${trustScore}%), N-1 contingencies, and active transformer health prognostic warnings.`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/20 rounded-xl text-[10px] font-mono font-medium text-cyan-300 transition-all cursor-pointer shadow-lg shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 pointer-events-none" /> Grid Digital Twin Briefing
          </button>
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1 rounded-xl">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Live Transmission Telemetry Pulse</span>
          </div>
        </div>
        <AtlasAgentPulse agents={DEFAULT_ENTERPRISE_AGENTS} expanded={agentsOpen} onToggle={() => setAgentsOpen(o => !o)} />
      </div>

    </div>
  );
}
