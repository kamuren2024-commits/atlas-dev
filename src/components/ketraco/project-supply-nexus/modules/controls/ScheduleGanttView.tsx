import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Zap, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  AlertTriangle, 
  Layers,
  ArrowUpRight,
  TrendingDown,
  AlertOctagon,
  ArrowRight,
  Sliders,
  FileText
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { SCHEDULE_GANTT_ACTIVITIES } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface ScheduleGanttViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

type ScheduleTab = 'TIMELINE' | 'VARIANCE' | 'EXCEPTIONS';

export const ScheduleGanttView: React.FC<ScheduleGanttViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [activeTab, setActiveTab] = useState<ScheduleTab>('TIMELINE');
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [timeScale, setTimeScale] = useState<'MONTH' | 'QUARTER'>('MONTH');
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activities = SCHEDULE_GANTT_ACTIVITIES.map((act, i) => {
    const startM = (act as any).startMonth || act.startDate || '2026-01-15';
    const endM = (act as any).endMonth || act.endDate || '2026-03-01';
    const startMonthIndex = parseInt(startM.split('-')[1] || '1', 10);
    const endMonthIndex = parseInt(endM.split('-')[1] || '3', 10);

    return {
      ...act,
      startMonth: startM,
      endMonth: endM,
      startCol: Math.max(1, Math.min(startMonthIndex, 8)),
      endCol: Math.min(8, Math.max(startMonthIndex + 1, endMonthIndex)),
      varianceDays: (act as any).varianceDays !== undefined 
        ? (act as any).varianceDays 
        : (act.isCritical ? -14 : 0)
    };
  });

  const filteredActivities = activities.filter((act) => {
    if (onlyCritical && !act.isCritical) return false;
    return true;
  });

  const delayedActivities = activities.filter(a => a.varianceDays < 0);
  const criticalActivities = activities.filter(a => a.isCritical);

  const handleOpenActivity = (act: typeof activities[0]) => {
    setSelectedEntity({
      type: 'activity',
      id: act.id,
      title: act.name,
      code: act.code,
      status: act.progress === 100 ? 'COMPLETED' : act.isCritical ? 'CRITICAL_DRIVING' : 'IN_PROGRESS',
      subtitle: `Project: ${currentProject.name} • Total Float: ${act.isCritical ? '0 Days (Driving Path)' : '18 Days Float'}`,
      metrics: [
        { label: 'Physical Progress', value: `${act.progress}%`, color: 'text-cyan-400' },
        { label: 'Duration', value: `${act.durationDays} Days`, color: 'text-white' },
        { label: 'Variance Days', value: `${act.varianceDays}d`, color: act.varianceDays < 0 ? 'text-rose-400' : 'text-emerald-400' }
      ],
      details: [
        { label: 'Baseline Start', value: act.startMonth },
        { label: 'Baseline Finish', value: act.endMonth },
        { label: 'Early Start / Late Finish', value: `${act.startMonth} - ${act.endMonth}` },
        { label: 'Critical Path Status', value: act.isCritical ? 'CRITICAL (Zero Total Float)' : 'Positive Float Available' },
        { label: 'Predecessor Interlock', value: 'Foundations Civils & NLC Gazettement' },
        { label: 'Successor Dependent', value: '400kV Conductor Stringing & Commissioning' }
      ],
      risks: act.isCritical ? [
        'Any additional slip on this activity propagates directly into Commercial Operation Date (COD).',
        'Contingency float has been completely eroded.'
      ] : [
        'Activity has 14 days of secondary free float buffer.'
      ],
      recommendations: [
        'Monitor daily contractor muster roll and plant hours.',
        'Enforce weekly milestone progress signoff.'
      ],
      relatedView: 'schedule'
    });
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="Schedule Gantt Controls">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="schedule"
          onNavigateView={onNavigateView}
        />

        {/* Schedule Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PROJECT CONTROLS //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                INTEGRATED MASTER SCHEDULE (IMS)
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Integrated Master Schedule (IMS) & Float Analysis
            </h1>
            <p className="text-xs text-slate-400">
              Activity durations, early/late start-finish intervals, float analysis and contractual commissioning dates
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Schedule Health:</span>
            <span className={`px-2.5 py-1 rounded font-bold border ${
              currentProject.delayDays > 0 ? 'text-amber-400 bg-amber-950/40 border-amber-500/30' : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
            }`}>
              {currentProject.delayDays > 0 ? `+${currentProject.delayDays}d Schedule Slip` : 'On Baseline Plan'}
            </span>
          </div>
        </div>

        {/* 07 — Schedule Health Golden Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Baseline Completion</span>
            <span className="text-white font-bold text-base">{currentProject.baselineCompletion}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Contractual Gate Date</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Current Forecast COD</span>
            <span className="text-cyan-300 font-bold text-base">{currentProject.forecastCompletion}</span>
            <span className={`text-[10px] block mt-0.5 ${currentProject.delayDays > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {currentProject.delayDays > 0 ? `+${currentProject.delayDays}d Variance` : 'Zero Variance'}
            </span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Critical Driving Path</span>
            <span className="text-rose-400 font-bold text-base">{criticalActivities.length} Activities</span>
            <span className="text-[10px] text-rose-300 block mt-0.5">Zero Total Float</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Slipped Activities</span>
            <span className="text-amber-400 font-bold text-base">{delayedActivities.length} Tasks Delayed</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Float Recovery Active</span>
          </div>
        </div>

        {/* Navigation Tabs & Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'TIMELINE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Schedule Timeline (Gantt)
            </button>
            <button
              onClick={() => setActiveTab('VARIANCE')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'VARIANCE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Schedule Variance Register
            </button>
            <button
              onClick={() => setActiveTab('EXCEPTIONS')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'EXCEPTIONS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Schedule Exceptions ({delayedActivities.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
              <button
                onClick={() => setTimeScale('MONTH')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  timeScale === 'MONTH' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeScale('QUARTER')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  timeScale === 'QUARTER' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Quarterly
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px]">
              <input
                type="checkbox"
                checked={onlyCritical}
                onChange={(e) => setOnlyCritical(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-rose-400 font-bold">Critical Path Only</span>
            </label>
          </div>
        </div>

        {/* TAB 1: SCHEDULE TIMELINE (GANTT) */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 p-4 overflow-x-auto space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-sm bg-cyan-500 inline-block" /> Completed / In-Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-sm bg-rose-500 inline-block" /> Critical Path
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-sm bg-slate-700 inline-block" /> Baseline Planned
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Click activity bar to open detail drawer</span>
            </div>

            {/* Gantt Matrix */}
            <div className="min-w-[750px] space-y-3">
              {/* Header Months Ruler */}
              <div className="grid grid-cols-12 gap-1 text-[10px] text-slate-400 uppercase text-center pb-2 border-b border-slate-800/60 font-bold">
                <div className="col-span-4 text-left pl-2">Activity & Duration</div>
                <div className="col-span-1">Jan</div>
                <div className="col-span-1">Feb</div>
                <div className="col-span-1">Mar</div>
                <div className="col-span-1">Apr</div>
                <div className="col-span-1">May</div>
                <div className="col-span-1">Jun</div>
                <div className="col-span-1">Jul</div>
                <div className="col-span-1">Aug</div>
              </div>

              {/* Activity Rows */}
              {filteredActivities.map((act) => {
                const isCrit = act.isCritical;

                return (
                  <div
                    key={act.id}
                    onClick={() => handleOpenActivity(act)}
                    className="grid grid-cols-12 gap-1 items-center hover:bg-slate-900/50 p-2 rounded cursor-pointer transition-colors border border-transparent hover:border-slate-800"
                  >
                    <div className="col-span-4 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-cyan-400 text-[11px]">{act.code}</span>
                        {isCrit && (
                          <span className="px-1 py-0.2 rounded text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            CPM
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-200 text-xs truncate">{act.name}</div>
                      <div className="text-[10px] text-slate-400">{act.durationDays}d • {act.progress}% completed</div>
                    </div>

                    {/* Timeline Bar Space (Cols 5-12) */}
                    <div className="col-span-8 relative h-6 flex items-center">
                      {/* Full Track */}
                      <div className="w-full bg-slate-900/80 h-3 rounded border border-slate-800 relative overflow-hidden">
                        {/* Planned Baseline Shadow Bar */}
                        <div
                          className="absolute top-0 bottom-0 bg-slate-700/50"
                          style={{
                            left: `${(act.startCol - 1) * 12.5}%`,
                            width: `${(act.endCol - act.startCol + 1) * 12.5}%`
                          }}
                        />

                        {/* Actual Progress Fill */}
                        <div
                          className={`absolute top-0 bottom-0 ${isCrit ? 'bg-rose-500' : 'bg-cyan-500'} transition-all`}
                          style={{
                            left: `${(act.startCol - 1) * 12.5}%`,
                            width: `${((act.endCol - act.startCol + 1) * 12.5) * (act.progress / 100)}%`
                          }}
                        />
                      </div>

                      {/* Milestone Flag Marker at the end if applicable */}
                      {act.progress === 100 && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute right-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE VARIANCE REGISTER */}
        {activeTab === 'VARIANCE' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 overflow-hidden font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="p-3">WBS Activity</th>
                    <th className="p-3">Baseline Plan</th>
                    <th className="p-3">Current Plan</th>
                    <th className="p-3">Forecast Date</th>
                    <th className="p-3">Variance</th>
                    <th className="p-3">Variance Driver</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activities.map((act) => {
                    const isDelayed = act.varianceDays < 0;

                    return (
                      <tr
                        key={act.id}
                        onClick={() => handleOpenActivity(act)}
                        className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                      >
                        <td className="p-3">
                          <span className="font-bold text-cyan-400">{act.code}</span>
                          <div className="font-semibold text-slate-100">{act.name}</div>
                        </td>
                        <td className="p-3 text-slate-400">{act.startMonth}</td>
                        <td className="p-3 text-slate-300">{act.endMonth}</td>
                        <td className="p-3 text-white">{act.endMonth}</td>
                        <td className="p-3">
                          <span className={`font-bold ${isDelayed ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {act.varianceDays ? `${act.varianceDays}d` : '0d'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {isDelayed ? 'Factory QC reinspection at source drydock' : 'Normal scheduled execution'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                            act.progress === 100 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                            isDelayed ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                            'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                          }`}>
                            {act.progress === 100 ? 'COMPLETED' : isDelayed ? 'DELAYED' : 'ON TRACK'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULE EXCEPTIONS REGISTER */}
        {activeTab === 'EXCEPTIONS' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-rose-950/20 p-3.5 rounded-lg border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-300 text-sm">Active Schedule Exceptions & Negative Float Warnings</h4>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Critical path float has been eroded on Transformer T-204 Rigging, putting Commercial Operation Date at direct risk. The following exceptions require steering committee intervention.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">ACT-TR-01: 400kV Transformer Rigging</span>
                  <span className="text-rose-400 font-bold">-14d Float Erosion</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Delay at Mumbai port dry dock pushes heavy equipment low-loader transit past the rainy season cutoff.
                </p>
                <div className="text-[10px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Recovery: Prioritize heavy transport escort through KeNHA corridor.
                </div>
              </div>

              <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">MS-GATE-03: Section 107 Wayleave Gazettement</span>
                  <span className="text-amber-400 font-bold">-8d Pending Escrow</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  National Land Commission escrow release awaiting exchequer authorization.
                </p>
                <div className="text-[10px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Recovery: Executive escalation to Ministry of Energy liaison desk.
                </div>
              </div>
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
