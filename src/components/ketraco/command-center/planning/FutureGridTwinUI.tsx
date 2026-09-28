import React, { useState, useMemo } from 'react';
import { Clock, TrendingUp, TrendingDown, Activity, Zap, Layers } from 'lucide-react';
import type { FutureGridYear, FutureGridState, FutureGridScenario } from '../../../../../backend/planning-engine/types';
import { futureGridDigitalTwin } from '../../../../../backend/planning-engine';

interface FutureGridTwinProps {
  onSelectYear: (year: FutureGridYear) => void;
}

const YEARS: FutureGridYear[] = ['2026', '2027', '2028', '2029', '2030', '2035'];

export default function FutureGridTwinUI({ onSelectYear }: FutureGridTwinProps) {
  const [selectedYear, setSelectedYear] = useState<FutureGridYear>('2030');
  const [activeScenarioId, setActiveScenarioId] = useState('base-case');

  const scenarios = useMemo(() => futureGridDigitalTwin.getAllScenarios(), []);
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const currentState = useMemo(() => futureGridDigitalTwin.getStateForYear(selectedYear, activeScenarioId), [selectedYear, activeScenarioId]);

  const comparisonStates = useMemo(() => futureGridDigitalTwin.compareYearStates(selectedYear), [selectedYear]);

  return (
    <div className="bg-[#050913] text-slate-100 p-4 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-violet-500/10 border border-violet-500/30">
            <Clock className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400">Future Grid Digital Twin</div>
            <h3 className="text-lg font-bold">TEMPORAL GRID STATES</h3>
          </div>
        </div>
      </div>

      {/* Year Selector */}
      <div className="flex gap-2 mb-4">
        {YEARS.map(year => (
          <button key={year} onClick={() => { setSelectedYear(year); onSelectYear(year); }}
            className={`px-4 py-2 rounded border text-sm font-bold transition cursor-pointer
              ${selectedYear === year ? 'bg-violet-500/15 border-violet-500/40 text-violet-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
            {year}
          </button>
        ))}
      </div>

      {/* Scenario Selector */}
      <div className="flex gap-2 mb-4">
        {scenarios.map(scenario => (
          <button key={scenario.id} onClick={() => setActiveScenarioId(scenario.id)}
            className={`px-3 py-1.5 rounded border text-[10px] font-bold tracking-wider transition cursor-pointer
              ${activeScenarioId === scenario.id ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
            {scenario.name}
          </button>
        ))}
      </div>

      {/* Active State KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Demand Forecast', value: `${(currentState.demandForecastMw / 1000).toFixed(1)} GW`, icon: Activity },
          { label: 'Generation Capacity', value: `${(currentState.generationCapacityMw / 1000).toFixed(1)} GW`, icon: Zap },
          { label: 'Renewable Share', value: `${currentState.renewableSharePct}%`, icon: TrendingUp },
          { label: 'Reserve Margin', value: `${currentState.reserveMarginPct}%`, icon: Layers },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
              <div className="flex items-center justify-between">
                <div className="text-[9px] uppercase tracking-wider text-slate-400">{kpi.label}</div>
                <Icon className="w-3 h-3 text-violet-400" />
              </div>
              <div className="mt-1 text-xl font-bold text-slate-100">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Congestion Index', value: `${currentState.congestionIndexPct}%`, color: currentState.congestionIndexPct > 60 ? 'text-rose-400' : 'text-amber-400' },
          { label: 'N-1 Compliance', value: `${currentState.n1CompliancePct}%`, color: currentState.n1CompliancePct < 50 ? 'text-rose-400' : 'text-emerald-400' },
          { label: 'Transmission Loss', value: `${currentState.transmissionLossPct}%`, color: 'text-slate-200' },
          { label: 'Inertia', value: `${currentState.inertiaEstimateGws} GWs`, color: currentState.inertiaEstimateGws < 22 ? 'text-amber-400' : 'text-slate-200' },
          { label: 'Curtailment Risk', value: `${currentState.curtailmentRiskPct}%`, color: currentState.curtailmentRiskPct > 20 ? 'text-rose-400' : 'text-slate-200' },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">{kpi.label}</div>
            <div className={`mt-1 text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Grid Infrastructure */}
      <div className="rounded-lg border border-slate-800 bg-[#0a1222] p-3 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">Grid Infrastructure — {selectedYear}</div>
        <div className="grid grid-cols-5 gap-3 text-[10px]">
          <div className="text-slate-400">Substations <span className="text-slate-200 font-bold">{currentState.installedSubstations}</span></div>
          <div className="text-slate-400">New <span className="text-emerald-400 font-bold">{currentState.newSubstations}</span></div>
          <div className="text-slate-400">Retired <span className="text-rose-400 font-bold">{currentState.retiredAssets}</span></div>
          <div className="text-slate-400">HVDC <span className="text-cyan-400 font-bold">{currentState.hvdcCapacityMw} MW</span></div>
          <div className="text-slate-400">Projects <span className="text-violet-400 font-bold">{currentState.projectsCompleted} done / {currentState.projectsInProgress} active</span></div>
        </div>
      </div>

      {/* Cross-Scenario Comparison for Selected Year */}
      <div className="rounded-lg border border-slate-800 bg-[#0a1222] p-3 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-3">Scenario Comparison — {selectedYear}</div>
        <div className="grid grid-cols-3 gap-3">
          {comparisonStates.map(comp => (
            <div key={comp.scenarioId} className={`rounded border p-3
              ${comp.scenarioId === activeScenarioId ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/50'}`}>
              <div className="text-[10px] font-bold text-slate-200 mb-2">{comp.scenarioName}</div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-400">Demand</span><span className="text-slate-200">{(comp.state.demandForecastMw / 1000).toFixed(1)} GW</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Reserve</span><span className={comp.state.reserveMarginPct < 14 ? 'text-rose-400' : 'text-emerald-400'}>{comp.state.reserveMarginPct}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Congestion</span><span className={comp.state.congestionIndexPct > 60 ? 'text-rose-400' : 'text-amber-400'}>{comp.state.congestionIndexPct}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">N-1</span><span className={comp.state.n1CompliancePct < 50 ? 'text-rose-400' : 'text-emerald-400'}>{comp.state.n1CompliancePct}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Renewable</span><span className="text-cyan-400">{comp.state.renewableSharePct}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions */}
      <div className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Assumptions</div>
        <div className="space-y-0.5 text-[10px] text-slate-400">
          {activeScenario.assumptions.map((a, i) => (
            <div key={i}>· {a}</div>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-slate-500">
          Confidence: {currentState.evidence?.[0] ? `${(currentState.evidence[0].confidence * 100).toFixed(0)}%` : '94%'} | {currentState.evidence?.[0]?.dataState || 'PROJECTED'}
        </div>
      </div>
    </div>
  );
}
