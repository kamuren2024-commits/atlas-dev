import React, { useState } from 'react';
import { 
  GitCommit, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Sliders, 
  Activity, 
  TrendingDown,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Compass,
  FileText
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { CRITICAL_PATH_ACTIVITIES } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface CriticalPathAnalysisViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

type CPMTab = 'CRITICAL_CHAIN' | 'NEAR_CRITICAL' | 'FLOAT_DISTRIBUTION' | 'RISK_CONCENTRATION';

export const CriticalPathAnalysisView: React.FC<CriticalPathAnalysisViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [activeTab, setActiveTab] = useState<CPMTab>('CRITICAL_CHAIN');
  const [floatThreshold, setFloatThreshold] = useState<number>(5);
  const [cpmMode, setCpmMode] = useState<'CURRENT' | 'BASELINE'>('CURRENT');
  const [scenarioActivityId, setScenarioActivityId] = useState<string>('cpm-3');
  const [scenarioDelayDays, setScenarioDelayDays] = useState<number>(10);
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activities = CRITICAL_PATH_ACTIVITIES;

  // Near critical paths based on float threshold
  const nearCriticalActivities = activities.filter(a => a.totalFloat <= floatThreshold && a.totalFloat > 0);
  const zeroFloatActivities = activities.filter(a => a.totalFloat === 0);

  const handleOpenActivity = (act: typeof activities[0]) => {
    setSelectedEntity({
      type: 'activity',
      id: act.id,
      title: act.name,
      code: act.code,
      status: act.totalFloat === 0 ? 'ZERO_FLOAT_CRITICAL' : 'NEAR_CRITICAL',
      subtitle: `Critical Path Node • Total Float: ${act.totalFloat}d • Free Float: ${act.freeFloat}d`,
      metrics: [
        { label: 'Total Float', value: `${act.totalFloat} Days`, color: act.totalFloat === 0 ? 'text-rose-400' : 'text-amber-400' },
        { label: 'Duration', value: `${act.durationDays} Days`, color: 'text-white' },
        { label: 'Driving Chain', value: act.isDriving ? 'DRIVING' : 'SECONDARY', color: 'text-cyan-400' }
      ],
      details: [
        { label: 'Activity Code', value: act.code },
        { label: 'Activity Name', value: act.name },
        { label: 'Early Start / Early Finish', value: `${act.earlyStart} ➔ ${act.earlyFinish}` },
        { label: 'Late Start / Late Finish', value: `${act.lateStart} ➔ ${act.lateFinish}` },
        { label: 'Predecessor Interlock', value: act.predecessor },
        { label: 'Successor Gateway', value: act.successor },
        { label: 'Schedule Risk Rating', value: act.riskScore > 75 ? 'HIGH RISK' : 'MODERATE RISK' }
      ],
      risks: [
        `Zero total float implies that any delay directly shifts the Commercial Operation Date (COD).`,
        `Liquidated damages exposure increases linearly with each lost day.`
      ],
      recommendations: [
        'Deploy additional rigging gang to convert to 2-shift schedule.',
        'Pre-rig foundations before crane mobilization.'
      ],
      relatedView: 'critical-path'
    });
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="Critical Path CPM">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="critical-path"
          onNavigateView={onNavigateView}
        />

        {/* Critical Path Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">NETWORK CPM //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                ZERO FLOAT DRIVING PATH
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Critical Path Method (CPM) & Float Consumption Analysis
            </h1>
            <p className="text-xs text-slate-400">
              Contractual zero-float driving path, near-critical path vulnerability, and what-if schedule slip simulation
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Critical Float</span>
              <span className="text-rose-400 font-bold">0 Days (Driving COD)</span>
            </div>
          </div>
        </div>

        {/* 11 — Critical Path Golden Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Zero-Float Activities</span>
            <span className="text-rose-400 font-bold text-base">{zeroFloatActivities.length} Driving Tasks</span>
            <span className="text-[10px] text-rose-300 block">Immediate COD Impact</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Near-Critical Paths</span>
            <span className="text-amber-400 font-bold text-base">{nearCriticalActivities.length} Secondary Paths</span>
            <span className="text-[10px] text-slate-400 block">Float &le; {floatThreshold} Days</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Float Consumption</span>
            <span className="text-white font-bold text-base">78% Consumed</span>
            <span className="text-[10px] text-amber-400 block">Buffer dangerously eroded</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Driving Milestone</span>
            <span className="text-cyan-300 font-bold text-base">COD Energization</span>
            <span className="text-[10px] text-cyan-400 block">31-Aug-2025 Target</span>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('CRITICAL_CHAIN')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'CRITICAL_CHAIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical Chain ({zeroFloatActivities.length})
            </button>
            <button
              onClick={() => setActiveTab('NEAR_CRITICAL')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'NEAR_CRITICAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Near-Critical Paths ({nearCriticalActivities.length})
            </button>
            <button
              onClick={() => setActiveTab('FLOAT_DISTRIBUTION')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'FLOAT_DISTRIBUTION' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Float Consumption Matrix
            </button>
            <button
              onClick={() => setActiveTab('RISK_CONCENTRATION')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'RISK_CONCENTRATION' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Risk Concentration
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Float Threshold Slider */}
            <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px]">
              <span className="text-slate-400">Near-Critical Float:</span>
              <input
                type="range"
                min="1"
                max="30"
                value={floatThreshold}
                onChange={(e) => setFloatThreshold(parseInt(e.target.value))}
                className="w-16 accent-cyan-400 cursor-pointer"
              />
              <span className="text-cyan-300 font-bold w-6">{floatThreshold}d</span>
            </div>

            {/* Baseline vs Current Toggle */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
              <button
                onClick={() => setCpmMode('CURRENT')}
                className={`px-2 py-0.5 rounded ${cpmMode === 'CURRENT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400'}`}
              >
                Current CPM
              </button>
              <button
                onClick={() => setCpmMode('BASELINE')}
                className={`px-2 py-0.5 rounded ${cpmMode === 'BASELINE' ? 'bg-slate-700 text-slate-200' : 'text-slate-400'}`}
              >
                Baseline CPM
              </button>
            </div>
          </div>
        </div>

        {/* What-If Scenario Analysis Simulator Strip */}
        <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-500/30 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              What-If Schedule Slip Simulation:
            </span>
            <span className="text-[10px] text-slate-400">Dynamic CPM Propagation Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="text-slate-400">If activity:</span>
            <select
              value={scenarioActivityId}
              onChange={(e) => setScenarioActivityId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
            >
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.code}: {act.name} (Float: {act.totalFloat}d)
                </option>
              ))}
            </select>

            <span className="text-slate-400">slips by:</span>
            <div className="flex items-center gap-1">
              {[5, 10, 20].map((days) => (
                <button
                  key={days}
                  onClick={() => setScenarioDelayDays(days)}
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    scenarioDelayDays === days ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  +{days} Days
                </button>
              ))}
            </div>

            <div className="text-slate-300 pl-2 border-l border-slate-800">
              ➔ Direct COD Shift: <strong className="text-rose-400">+{scenarioDelayDays} Days (New COD: 20-Sep-2025)</strong>
            </div>
          </div>
        </div>

        {/* TAB 1: CRITICAL CHAIN */}
        {activeTab === 'CRITICAL_CHAIN' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-rose-400" />
                Zero-Float Driving Critical Chain
              </h3>
              <span className="text-[10px] text-slate-400">Click node to inspect precedence logic</span>
            </div>

            <div className="space-y-2">
              {zeroFloatActivities.map((act, index) => (
                <div
                  key={act.id}
                  onClick={() => handleOpenActivity(act)}
                  className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded border border-rose-500/30 hover:border-rose-500/60 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold text-[10px]">
                        {index + 1}
                      </span>
                      <span className="font-bold text-rose-400">{act.code}</span>
                      <span className="font-semibold text-slate-100">{act.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-rose-400 font-bold text-[10px]">ZERO FLOAT</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <div>Duration: <span className="text-white font-semibold">{act.durationDays}d</span></div>
                    <div>Early Start: <span className="text-slate-200">{act.earlyStart}</span></div>
                    <div>Early Finish: <span className="text-slate-200">{act.earlyFinish}</span></div>
                    <div>Risk Score: <span className={act.riskScore > 75 ? 'text-rose-400 font-bold' : 'text-amber-400'}>{act.riskScore}/100</span></div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>Predecessor: <strong className="text-slate-300">{act.predecessor}</strong></span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span>Successor: <strong className="text-cyan-300">{act.successor}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: NEAR-CRITICAL PATHS */}
        {activeTab === 'NEAR_CRITICAL' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Near-Critical Paths (Total Float &le; {floatThreshold} Days)
            </h3>
            <p className="text-slate-400 text-xs">
              Activities with small float buffers that could become critical if minor operational disruptions occur.
            </p>

            <div className="space-y-2 pt-1">
              {nearCriticalActivities.length === 0 ? (
                <div className="p-4 rounded bg-slate-900 text-center text-slate-400">
                  No near-critical activities found within {floatThreshold} days float threshold.
                </div>
              ) : (
                nearCriticalActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => handleOpenActivity(act)}
                    className="p-3 bg-amber-950/15 hover:bg-amber-950/30 rounded border border-amber-500/30 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">{act.code}</span>
                        <span className="font-semibold text-slate-100">{act.name}</span>
                      </div>
                      <span className="text-amber-400 font-bold">{act.totalFloat} Days Float</span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Early Finish: {act.earlyFinish} • Late Finish: {act.lateFinish}</span>
                      <span className="text-cyan-400">Inspect ➔</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FLOAT DISTRIBUTION */}
        {activeTab === 'FLOAT_DISTRIBUTION' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 overflow-hidden font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="p-3">WBS Activity</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Early Dates</th>
                    <th className="p-3">Late Dates</th>
                    <th className="p-3">Total Float</th>
                    <th className="p-3">Free Float</th>
                    <th className="p-3">Critical Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activities.map((act) => (
                    <tr
                      key={act.id}
                      onClick={() => handleOpenActivity(act)}
                      className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <span className="font-bold text-cyan-400">{act.code}</span>
                        <div className="font-semibold text-slate-200">{act.name}</div>
                      </td>
                      <td className="p-3 text-slate-300">{act.durationDays}d</td>
                      <td className="p-3 text-[10px] text-slate-400">{act.earlyStart} - {act.earlyFinish}</td>
                      <td className="p-3 text-[10px] text-slate-400">{act.lateStart} - {act.lateFinish}</td>
                      <td className="p-3">
                        <span className={`font-bold ${act.totalFloat === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {act.totalFloat}d
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{act.freeFloat}d</td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${
                          act.totalFloat === 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400'
                        }`}>
                          {act.totalFloat === 0 ? 'CRITICAL' : 'BUFFER'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RISK CONCENTRATION */}
        {activeTab === 'RISK_CONCENTRATION' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-purple-950/20 rounded-lg border border-purple-500/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-purple-300 text-sm">Critical Path Risk Concentration Nodes</h4>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Over 70% of project risk points cluster along three critical activities: substation transformer haulage, foundation stub casting, and wayleave clearance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activities.filter(a => a.riskScore > 65).map((act) => (
                <div key={act.id} className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">{act.code}</span>
                    <span className="text-rose-400 font-bold">Risk {act.riskScore}/100</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-xs">{act.name}</h4>
                  <p className="text-[10px] text-slate-400">Driving successor: {act.successor}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shared Entity Drawer */}
      <NexusEntityDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entity={selectedEntity}
        onNavigateView={onNavigateView}
        onSelectProject={onSelectProject}
      />
    </UIStateContainer>
  );
};
