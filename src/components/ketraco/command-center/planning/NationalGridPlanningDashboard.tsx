import React, { useMemo, useState } from 'react';
import { Layers3, Zap, CalendarRange, Map, Gauge, AlertTriangle, Clock, TrendingUp, FileText, Target } from 'lucide-react';

import { gridPlanningEngine } from '../../../../../backend/planning-engine';
import { gridOutageCoordinationEngine } from '../../../../../backend/planning-engine';
import { maintenanceOptimizationEngine } from '../../../../../backend/planning-engine';
import { projectIntelligenceEngine } from '../../../../../backend/planning-engine';
import { gridCapacityEngine } from '../../../../../backend/planning-engine';
import { scenarioPlanningEngine } from '../../../../../backend/planning-engine';
import { gridInvestmentEngine } from '../../../../../backend/planning-engine';
import { renewableIntegrationEngine } from '../../../../../backend/planning-engine';
import { futureGridDigitalTwin } from '../../../../../backend/planning-engine';
import { weatherMaintenanceEngine } from '../../../../../backend/planning-engine';

import type { PlanningHorizon, OutageEvent, MaintenanceWindow, Project } from '../../../../../backend/planning-engine/types';

import OutageWallUI from './OutageWallUI';
import MaintenanceCalendarUI from './MaintenanceCalendarUI';
import ProjectPortfolioMapUI from './ProjectPortfolioMapUI';
import CapacityForecastUI from './CapacityForecastUI';
import BottleneckMapUI from './BottleneckMapUI';
import InvestmentIntelligenceUI from './InvestmentIntelligenceUI';
import FutureGridTwinUI from './FutureGridTwinUI';
import ExecutivePlanningBriefUI from './ExecutivePlanningBriefUI';

const HORIZONS = ['NOW', '24H', '7D', '30D', '1Y', '5Y', '10Y'] as const;

type Horizon = typeof HORIZONS[number];

type PlanningSubView = 'OVERVIEW' | 'OUTAGES' | 'MAINTENANCE' | 'PROJECTS' | 'CAPACITY' | 'BOTTLENECKS' | 'INVESTMENT' | 'FUTURE_GRID' | 'SCENARIOS' | 'BRIEF';

const SUB_VIEW_TABS: Array<{ id: PlanningSubView; label: string; icon: typeof Zap }> = [
  { id: 'OVERVIEW', label: 'Overview', icon: Layers3 },
  { id: 'OUTAGES', label: 'Outage Wall', icon: AlertTriangle },
  { id: 'MAINTENANCE', label: 'Maintenance', icon: CalendarRange },
  { id: 'PROJECTS', label: 'Projects', icon: Map },
  { id: 'CAPACITY', label: 'Capacity', icon: Gauge },
  { id: 'BOTTLENECKS', label: 'Bottlenecks', icon: Target },
  { id: 'INVESTMENT', label: 'Investment', icon: TrendingUp },
  { id: 'FUTURE_GRID', label: 'Future Grid', icon: Clock },
  { id: 'SCENARIOS', label: 'Scenarios', icon: Layers3 },
  { id: 'BRIEF', label: 'Executive Brief', icon: FileText },
];

interface NationalGridPlanningDashboardProps {
  onSelectAsset?: (assetId: string) => void;
}

export default function NationalGridPlanningDashboard({ onSelectAsset }: NationalGridPlanningDashboardProps) {
  const [activeHorizon, setActiveHorizon] = useState<Horizon>('7D');
  const [activeSubView, setActiveSubView] = useState<PlanningSubView>('OVERVIEW');
  const handleSelectAsset = onSelectAsset || (() => {});

  // Initialize all engines with baseline data
  const baselineAssets = useMemo(() => gridPlanningEngine.getBaselineAssetStates(), []);
  const outages = useMemo(() => gridOutageCoordinationEngine.getBaselineOutages(), []);
  const maintenance = useMemo(() => maintenanceOptimizationEngine.getBaselineMaintenance(), []);
  const projects = useMemo(() => projectIntelligenceEngine.getBaselineProjects(), []);
  const forecast = useMemo(() => gridPlanningEngine.buildForecast(activeHorizon), [activeHorizon]);
  const capacity = useMemo(() => gridCapacityEngine.calculateCapacity(baselineAssets), [baselineAssets]);
  const bottlenecks = useMemo(() => gridCapacityEngine.detectBottlenecks(baselineAssets), [baselineAssets]);
  const conflicts = useMemo(() => gridOutageCoordinationEngine.detectConflicts(outages), [outages]);
  const losses = useMemo(() => gridPlanningEngine.computeLossIntelligence(baselineAssets), [baselineAssets]);
  const investment = useMemo(() => gridInvestmentEngine.rankInvestments(projects), [projects]);
  const renewable = useMemo(() => renewableIntegrationEngine.analyzeIntegration(), []);
  const weatherMaint = useMemo(() => weatherMaintenanceEngine.analyze(), []);
  const scenarios = useMemo(() => scenarioPlanningEngine.buildScenarios(), []);

  const outageCategories = useMemo(() => gridOutageCoordinationEngine.categorizeByState(outages), [outages]);

  // Summary stats
  const summary = useMemo(() => {
    const scores = {
      NOW: { reserve: 18, congestion: 41, headroom: 14, risk: 42 },
      '24H': { reserve: 17, congestion: 48, headroom: 12, risk: 47 },
      '7D': { reserve: 16, congestion: 54, headroom: 11, risk: 56 },
      '30D': { reserve: 15, congestion: 60, headroom: 9, risk: 63 },
      '1Y': { reserve: 13, congestion: 71, headroom: 7, risk: 72 },
      '5Y': { reserve: 11, congestion: 77, headroom: 5, risk: 79 },
      '10Y': { reserve: 9, congestion: 82, headroom: 4, risk: 86 },
    }[activeHorizon];
    return {
      ...scores,
      outageLoad: outages.reduce((sum, o) => sum + o.affectedLoadMw, 0),
      projectGain: projects.reduce((sum, p) => sum + p.capacityGainMw, 0),
      maintExposure: Math.round(maintenance.reduce((sum, m) => sum + m.risk, 0) / maintenance.length),
      activeOutages: outageCategories.ACTIVE.length + outageCategories.HIGH_RISK.length,
      renewableShare: renewable.renewableSharePct,
      totalLoss: losses.nationalLossMw,
    };
  }, [activeHorizon, outages, projects, maintenance, outageCategories, renewable, losses]);

  if (activeSubView !== 'OVERVIEW') {
    return (
      <div className="bg-[#050913] border-b border-slate-800">
        {/* Back Navigation */}
        <div className="px-4 pt-3 flex items-center gap-2">
          <button onClick={() => setActiveSubView('OVERVIEW')}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1">
            ← Back to Planning Overview
          </button>
          <span className="text-[10px] text-slate-500">|</span>
          <span className="text-[10px] text-slate-400">Horizon: {activeHorizon}</span>
        </div>

        {/* Sub-view tabs */}
        <div className="px-4 pt-2 flex gap-1 overflow-x-auto">
          {SUB_VIEW_TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeSubView === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveSubView(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-bold tracking-wider whitespace-nowrap transition cursor-pointer
                  ${active ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-view Content */}
        <div className="mt-2">
          {activeSubView === 'OUTAGES' && <OutageWallUI outages={outages} conflicts={conflicts} onSelectAsset={handleSelectAsset} />}
          {activeSubView === 'MAINTENANCE' && <MaintenanceCalendarUI maintenance={maintenance} onSelectAsset={handleSelectAsset} />}
          {activeSubView === 'PROJECTS' && <ProjectPortfolioMapUI projects={projects} onSelectAsset={handleSelectAsset} />}
          {activeSubView === 'CAPACITY' && <CapacityForecastUI capacity={capacity} bottlenecks={bottlenecks} />}
          {activeSubView === 'BOTTLENECKS' && <BottleneckMapUI bottlenecks={bottlenecks} onSelectAsset={handleSelectAsset} />}
          {activeSubView === 'INVESTMENT' && <InvestmentIntelligenceUI projects={projects} />}
          {activeSubView === 'FUTURE_GRID' && <FutureGridTwinUI onSelectYear={() => {}} />}
          {activeSubView === 'SCENARIOS' && (
            <div className="p-4 space-y-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400 mb-2">Planning Scenarios</div>
              {scenarios.map(scenario => (
                <div key={scenario.id} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
                  <div className="text-sm font-bold text-slate-100">{scenario.name}</div>
                  <div className="mt-1 text-[10px] text-slate-400">{scenario.assumptions.join(' · ')}</div>
                  <div className="mt-2 grid grid-cols-6 gap-2 text-[10px]">
                    <div className="text-slate-400">Reserve <span className={`font-bold ${scenario.results.reserveMargin < 14 ? 'text-rose-400' : 'text-emerald-400'}`}>{scenario.results.reserveMargin}%</span></div>
                    <div className="text-slate-400">Congestion <span className={`font-bold ${scenario.results.congestion > 60 ? 'text-rose-400' : 'text-amber-400'}`}>{scenario.results.congestion}%</span></div>
                    <div className="text-slate-400">N-1 <span className={`font-bold ${scenario.results.n1Margin < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{scenario.results.n1Margin}%</span></div>
                    <div className="text-slate-400">Curtailment <span className="font-bold text-amber-400">{scenario.results.curtailmentRisk}%</span></div>
                    <div className="text-slate-400">Investment <span className="font-bold text-cyan-400">{scenario.results.investmentNeedMw} MW</span></div>
                    <div className="text-slate-400">Risk <span className={`font-bold ${scenario.results.riskScore > 60 ? 'text-rose-400' : 'text-amber-400'}`}>{scenario.results.riskScore}/100</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeSubView === 'BRIEF' && <ExecutivePlanningBriefUI horizon={activeHorizon} />}
        </div>
      </div>
    );
  }

  // OVERVIEW MODE
  return (
    <div className="w-full bg-[#050913] text-slate-100 p-4 font-sans border-b border-slate-800">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Layers3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Phase 09 — Unified Grid Planning</div>
              <h3 className="text-xl font-bold text-slate-100">NATIONAL GRID PLANNING ENGINE</h3>
            </div>
          </div>

          {/* Horizon Selector */}
          <div className="flex flex-wrap gap-2">
            {HORIZONS.map((horizon) => {
              const active = horizon === activeHorizon;
              return (
                <button key={horizon} onClick={() => setActiveHorizon(horizon)}
                  className={`px-3 py-1.5 rounded border text-[11px] font-bold tracking-wider transition cursor-pointer
                    ${active ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                  {horizon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {[
            { label: 'Reserve', value: `${summary.reserve}%`, color: summary.reserve < 14 ? 'text-rose-400' : 'text-emerald-400', icon: Gauge },
            { label: 'Congestion', value: `${summary.congestion}%`, color: summary.congestion > 60 ? 'text-rose-400' : 'text-amber-400', icon: TrendingUp },
            { label: 'Headroom', value: `${summary.headroom}%`, color: summary.headroom < 8 ? 'text-rose-400' : 'text-cyan-400', icon: Zap },
            { label: 'Risk', value: `${summary.risk}/100`, color: summary.risk > 70 ? 'text-rose-400' : 'text-amber-400', icon: AlertTriangle },
            { label: 'Outage Load', value: `${summary.outageLoad} MW`, color: 'text-slate-200', icon: AlertTriangle },
            { label: 'Project Gain', value: `${summary.projectGain} MW`, color: 'text-emerald-400', icon: Map },
            { label: 'Renewable', value: `${summary.renewableShare}%`, color: 'text-cyan-400', icon: TrendingUp },
          ].map(kpi => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-xl border border-slate-800 bg-[#0a1222] p-3">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.22em] text-slate-400">
                  <span>{kpi.label}</span>
                  <Icon className={`w-3 h-3 ${kpi.color}`} />
                </div>
                <div className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Access Panels Row */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr_0.8fr] gap-4">
          {/* Outage Quick View */}
          <div className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                OUTAGE COMMAND
              </div>
              <button onClick={() => setActiveSubView('OUTAGES')} className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer">View All →</button>
            </div>
            <div className="space-y-2">
              {outages.slice(0, 4).map(o => (
                <div key={o.id} className="flex items-center justify-between p-2 rounded border border-slate-800 bg-[#08111d] text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${o.state === 'ACTIVE' ? 'bg-red-500' : o.state === 'RESTORING' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                    <span className="font-bold text-slate-200">{o.id}</span>
                    <span className="text-slate-400 truncate max-w-[180px]">{(o.gridImpact || '').split('—')[0]}</span>
                  </div>
                  <span className={`font-bold ${o.risk >= 70 ? 'text-rose-400' : o.risk >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{o.risk}</span>
                </div>
              ))}
            </div>
            {conflicts.length > 0 && (
              <div className="mt-2 p-2 rounded border border-rose-500/30 bg-rose-500/5 text-[10px] text-rose-400">
                {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} detected
              </div>
            )}
          </div>

          {/* Maintenance Quick View */}
          <div className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
                <CalendarRange className="w-4 h-4 text-cyan-400" />
                MAINTENANCE EXPOSURE
              </div>
              <button onClick={() => setActiveSubView('MAINTENANCE')} className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer">View All →</button>
            </div>
            <div className="space-y-2">
              {maintenance.slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded border border-slate-800 bg-[#08111d] text-[10px]">
                  <div>
                    <span className="font-bold text-slate-200">{m.assetName}</span>
                    <span className="ml-2 text-slate-400">{m.workType.split(' ').slice(0, 3).join(' ')}</span>
                  </div>
                  <span className={`font-bold ${m.risk >= 70 ? 'text-rose-400' : m.risk >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{m.status}</span>
                </div>
              ))}
            </div>
            {weatherMaint.overallWeatherRisk !== 'LOW' && (
              <div className="mt-2 p-2 rounded border border-amber-500/30 bg-amber-500/5 text-[10px] text-amber-400">
                Weather risk: {weatherMaint.overallWeatherRisk} · {weatherMaint.highRiskAssets} high-risk assets
              </div>
            )}
          </div>

          {/* Project Portfolio Quick View */}
          <div className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
                <Map className="w-4 h-4 text-violet-400" />
                PROJECT PORTFOLIO
              </div>
              <button onClick={() => setActiveSubView('PROJECTS')} className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer">View All →</button>
            </div>
            <div className="space-y-2">
              {projects.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded border border-slate-800 bg-[#08111d] text-[10px]">
                  <div>
                    <span className="font-bold text-slate-200">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-violet-400">{p.status}</span>
                    <span className="font-bold text-emerald-400">+{p.capacityGainMw} MW</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-View Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {SUB_VIEW_TABS.filter(t => t.id !== 'OVERVIEW').map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveSubView(tab.id)}
                className="rounded-lg border border-slate-800 bg-[#0a1222] p-3 hover:border-cyan-500/30 transition text-left cursor-pointer group">
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition" />
                <div className="mt-1 text-[11px] font-bold text-slate-300 group-hover:text-slate-100">{tab.label}</div>
              </button>
            );
          })}
        </div>

        {/* Capacity & Loss Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
                <Gauge className="w-4 h-4 text-emerald-400" />
                CAPACITY POSITION
              </div>
              <button onClick={() => setActiveSubView('CAPACITY')} className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer">Details →</button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[10px]">
              <div><span className="text-slate-400 block">Installed</span><span className="text-slate-200 font-bold text-lg">{(capacity.national.installed / 1000).toFixed(1)} GW</span></div>
              <div><span className="text-slate-400 block">Transfer</span><span className="text-cyan-400 font-bold text-lg">{(capacity.national.transfer / 1000).toFixed(1)} GW</span></div>
              <div><span className="text-slate-400 block">Available</span><span className="text-emerald-400 font-bold text-lg">{(capacity.national.available / 1000).toFixed(1)} GW</span></div>
            </div>
            <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500/60 to-cyan-500/60 rounded-full"
                style={{ width: `${Math.round((capacity.national.available / capacity.national.transfer) * 100)}%` }} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                LOSS INTELLIGENCE
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[10px]">
              <div><span className="text-slate-400 block">National</span><span className="text-slate-200 font-bold text-lg">{losses.nationalLossMw} MW</span></div>
              <div><span className="text-slate-400 block">Loss %</span><span className="text-amber-400 font-bold text-lg">{losses.nationalLossPct}%</span></div>
              <div><span className="text-slate-400 block">Anomalies</span><span className={`font-bold text-lg ${losses.anomalyCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{losses.anomalyCount}</span></div>
            </div>
            <div className="mt-2 space-y-1">
              {losses.regionalLosses.filter(r => r.abnormalDeviation).map(r => (
                <div key={r.region} className="text-[10px] text-rose-400">
                  Abnormal: {r.region} ({r.lossPct}%, trend {r.trend > 0 ? '+' : ''}{r.trend})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Renewable Integration Summary */}
        <div className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
          <div className="flex items-center gap-2 text-sm font-bold tracking-wider mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            RENEWABLE INTEGRATION
          </div>
          <div className="grid grid-cols-6 gap-3 text-[10px]">
            <div><span className="text-slate-400 block">Capacity</span><span className="text-cyan-400 font-bold">{renewable.totalRenewableCapacityMw} MW</span></div>
            <div><span className="text-slate-400 block">Output</span><span className="text-emerald-400 font-bold">{renewable.currentRenewableOutputMw} MW</span></div>
            <div><span className="text-slate-400 block">Share</span><span className="text-cyan-400 font-bold">{renewable.renewableSharePct}%</span></div>
            <div><span className="text-slate-400 block">Inertia</span><span className={`font-bold ${renewable.inertiaEstimateGws < 22 ? 'text-amber-400' : 'text-slate-200'}`}>{renewable.inertiaEstimateGws} GWs</span></div>
            <div><span className="text-slate-400 block">Freq Impact</span><span className="text-slate-200 font-bold">{renewable.frequencyImpactHz} Hz</span></div>
            <div><span className="text-slate-400 block">Curtailment</span><span className={`font-bold ${renewable.curtailmentRiskPct > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>{renewable.curtailmentRiskPct}%</span></div>
          </div>
        </div>

        {/* Grid Outlook for Horizon */}
        <div className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold tracking-wider">
              <Layers3 className="w-4 h-4 text-emerald-400" />
              GRID OUTLOOK — {activeHorizon}
            </div>
            <button onClick={() => setActiveSubView('BRIEF')} className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer">Full Brief →</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-[11px] text-slate-300">
            <div className="rounded-lg border border-slate-800 bg-[#08111d] p-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-2">Capacity position</div>
              National capacity remains adequate near-term but corridor headroom narrows materially by 1Y–5Y.
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#08111d] p-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-2">Top constraints</div>
              Nairobi–Naivasha congestion, aging transformers, weather-exposed maintenance windows.
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#08111d] p-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-2">Priority investments</div>
              Reinforce critical corridors, sequence substation upgrades, preserve deferred maintenance review gates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
