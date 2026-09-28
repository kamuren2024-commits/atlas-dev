import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Filter, 
  Search, 
  Flag,
  ArrowRight,
  TrendingDown,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Layers
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { MASTER_MILESTONES, MASTER_DEPENDENCIES } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface MilestonesRoadmapViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

type MilestoneTab = 'TIMELINE' | 'UPCOMING' | 'DELAYED' | 'VARIANCE' | 'DEPENDENCY_IMPACT';

export const MilestonesRoadmapView: React.FC<MilestonesRoadmapViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MilestoneTab>('TIMELINE');
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const milestones = MASTER_MILESTONES.filter((m) => m.projectId === currentProject.id || m.projectId === 'mombasa');

  const filteredMilestones = milestones.filter((m) => {
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const delayedMilestones = milestones.filter(m => m.status === 'DELAYED' || m.varianceDays < 0);
  const upcomingMilestones = milestones.filter(m => m.status === 'ON_TRACK' || m.status === 'UPCOMING');

  const handleOpenMilestone = (m: typeof milestones[0]) => {
    const depCount = MASTER_DEPENDENCIES.filter(d => d.projectId === currentProject.id && (d.predecessorName.includes(m.code) || d.successorName.includes(m.code))).length || 2;

    setSelectedEntity({
      type: 'milestone',
      id: m.id,
      title: m.name,
      code: m.code,
      status: m.status,
      subtitle: `Project: ${currentProject.name} • Owner: ${m.owner} • Dependency Count: ${depCount}`,
      metrics: [
        { label: 'Variance Days', value: `${m.varianceDays}d`, color: m.varianceDays < 0 ? 'text-rose-400' : 'text-emerald-400' },
        { label: 'Delivery Confidence', value: `${m.confidence}%`, color: 'text-cyan-400' },
        { label: 'Critical Path', value: m.isCritical ? 'CRITICAL' : 'FLOAT OK', color: m.isCritical ? 'text-rose-400' : 'text-slate-400' }
      ],
      details: [
        { label: 'Baseline Date', value: m.baseline },
        { label: 'Planned Date', value: m.planned },
        { label: 'Current Forecast Date', value: m.forecast },
        { label: 'Actual Certified Date', value: m.status === 'COMPLETED' ? m.forecast : 'In Progress' },
        { label: 'Statutory Owner', value: m.owner },
        { label: 'Predecessor Interlock', value: m.predecessor },
        { label: 'Successor Gateway', value: m.successor },
        { label: 'Total Preceding Dependencies', value: `${depCount} activities` }
      ],
      risks: m.varianceDays < 0 ? [
        `Schedule slip of ${Math.abs(m.varianceDays)} days directly affects downstream commissioning intertie.`,
        `Liquidated damages exposure window starts if unmitigated after 30 days.`
      ] : [
        `Routine weather and access contingency required during long rains.`
      ],
      recommendations: [
        'Issue bi-weekly milestone compliance notice to EPC lead.',
        'Validate physical deliverable evidence prior to certification signoff.'
      ],
      relatedView: 'milestones'
    });
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="Milestones Roadmap">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="milestones"
          onNavigateView={onNavigateView}
        />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PROJECT GOVERNANCE //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                CONTRACTUAL MILESTONES
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Contractual Milestones & Statutory Delivery Roadmap
            </h1>
            <p className="text-xs text-slate-400">
              Contractual completion dates, baseline variance, verification evidence and milestone signoffs
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Delayed Gates</span>
              <span className="text-rose-400 font-bold">{delayedMilestones.length} Gates Behind</span>
            </div>
            <div className="px-3 py-1.5 bg-cyan-950/40 rounded border border-cyan-500/30 text-cyan-300">
              {milestones.length} Key Milestones
            </div>
          </div>
        </div>

        {/* Milestone Sections Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'TIMELINE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Milestone Timeline
            </button>
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'UPCOMING' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Upcoming Milestones ({upcomingMilestones.length})
            </button>
            <button
              onClick={() => setActiveTab('DELAYED')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'DELAYED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Delayed Milestones ({delayedMilestones.length})
            </button>
            <button
              onClick={() => setActiveTab('VARIANCE')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'VARIANCE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Milestone Variance Table
            </button>
            <button
              onClick={() => setActiveTab('DEPENDENCY_IMPACT')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'DEPENDENCY_IMPACT' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dependency Impact
            </button>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Filter milestones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded pl-7 pr-2 py-0.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-44"
            />
          </div>
        </div>

        {/* TAB 1: MILESTONE TIMELINE */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Chronological Gateway Progression
              </h3>
              <span className="text-[10px] text-slate-400">Click milestone card to inspect parameters</span>
            </div>

            <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-2">
              {filteredMilestones.map((m) => {
                const isDelayed = m.varianceDays < 0;

                return (
                  <div key={m.id} className="relative">
                    {/* Timeline Node Bullet */}
                    <div className={`absolute -left-[31px] top-2 w-3.5 h-3.5 rounded-full ring-4 ring-[#080d17] flex items-center justify-center ${
                      m.status === 'COMPLETED' ? 'bg-emerald-400' :
                      isDelayed ? 'bg-rose-500' :
                      m.status === 'ON_TRACK' ? 'bg-cyan-400' : 'bg-slate-600'
                    }`} />

                    <div
                      onClick={() => handleOpenMilestone(m)}
                      className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-400">{m.code}</span>
                          <span className="font-semibold text-slate-100 text-xs">{m.name}</span>
                          {m.isCritical && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              CRITICAL
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                            m.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                            m.status === 'ON_TRACK' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                            m.status === 'DELAYED' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                            'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          }`}>
                            {m.status.replace('_', ' ')}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <div>Baseline: <span className="text-slate-200">{m.baseline}</span></div>
                        <div>Forecast: <span className={isDelayed ? 'text-rose-400 font-bold' : 'text-slate-200'}>{m.forecast}</span></div>
                        <div>Owner: <span className="text-slate-200">{m.owner}</span></div>
                        <div>
                          Variance: <span className={isDelayed ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{m.varianceDays < 0 ? `${m.varianceDays}d` : '0d'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: UPCOMING MILESTONES */}
        {activeTab === 'UPCOMING' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {upcomingMilestones.map((m) => (
              <div
                key={m.id}
                onClick={() => handleOpenMilestone(m)}
                className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer space-y-2 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">{m.code}</span>
                  <span className="text-cyan-300 font-bold text-[10px]">Confidence: {m.confidence}%</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-xs">{m.name}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Forecast Date: <strong className="text-white">{m.forecast}</strong></span>
                  <span>Owner: <strong className="text-slate-200">{m.owner}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DELAYED MILESTONES */}
        {activeTab === 'DELAYED' && (
          <div className="space-y-3 font-mono text-xs">
            {delayedMilestones.map((m) => (
              <div
                key={m.id}
                onClick={() => handleOpenMilestone(m)}
                className="p-3.5 bg-rose-950/15 rounded-lg border border-rose-500/30 hover:border-rose-500/50 cursor-pointer space-y-2 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-rose-300">{m.code} — {m.name}</span>
                  </div>
                  <span className="text-rose-400 font-bold">{m.varianceDays} Days Slipped</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Baseline date was <strong>{m.baseline}</strong>, now forecasted for <strong>{m.forecast}</strong>. Primary cause linked to equipment manufacturing reinspection and port clearance window.
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-rose-500/20">
                  <span>Predecessor: {m.predecessor}</span>
                  <span className="text-cyan-400 hover:underline">Click to view recovery options ➔</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: MILESTONE VARIANCE TABLE */}
        {activeTab === 'VARIANCE' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 overflow-hidden font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="p-3">Milestone Code & Name</th>
                    <th className="p-3">Baseline</th>
                    <th className="p-3">Planned</th>
                    <th className="p-3">Forecast</th>
                    <th className="p-3">Variance</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {milestones.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => handleOpenMilestone(m)}
                      className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <span className="font-bold text-cyan-400">{m.code}</span>
                        <div className="text-slate-200 font-semibold">{m.name}</div>
                      </td>
                      <td className="p-3 text-slate-400">{m.baseline}</td>
                      <td className="p-3 text-slate-300">{m.planned}</td>
                      <td className="p-3 text-white font-medium">{m.forecast}</td>
                      <td className="p-3">
                        <span className={`font-bold ${m.varianceDays < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {m.varianceDays < 0 ? `${m.varianceDays}d` : '0d'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{m.owner}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                          m.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                          m.status === 'ON_TRACK' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                          'text-rose-400 bg-rose-500/10 border-rose-500/30'
                        }`}>
                          {m.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DEPENDENCY IMPACT */}
        {activeTab === 'DEPENDENCY_IMPACT' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              Precedence & Downstream Gateway Ripple Effect
            </h3>
            <p className="text-slate-400 text-xs">
              Every contractual milestone acts as a critical gating lock for subsequent EPC claims and statutory commissioning approvals.
            </p>

            <div className="space-y-2 pt-2">
              {milestones.map((m) => (
                <div key={m.id} className="p-3 bg-slate-900/60 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-cyan-400 font-bold">{m.code}: {m.name}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Predecessor: <strong className="text-slate-300">{m.predecessor}</strong> ➔ Successor: <strong className="text-purple-300">{m.successor}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenMilestone(m)}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] flex items-center gap-1"
                  >
                    <span>Inspect Impact</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
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
