import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Filter, 
  Zap, 
  Layers, 
  Network,
  Workflow,
  ShieldAlert,
  ArrowUpRight,
  Compass,
  Sliders,
  AlertOctagon
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { MASTER_DEPENDENCIES } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface DependenciesGraphViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

export const DependenciesGraphView: React.FC<DependenciesGraphViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedDepId, setSelectedDepId] = useState<string>(MASTER_DEPENDENCIES[0].id);
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dependencies = MASTER_DEPENDENCIES.filter((d) => d.projectId === currentProject.id || d.projectId === 'mombasa');

  const filteredDependencies = dependencies.filter((d) => {
    if (filterCriticality !== 'ALL' && d.criticality !== filterCriticality) return false;
    if (filterType !== 'ALL' && d.type !== filterType) return false;
    return true;
  });

  const selectedDependency = dependencies.find(d => d.id === selectedDepId) || dependencies[0];

  const handleOpenDep = (d: typeof dependencies[0]) => {
    setSelectedEntity({
      type: 'dependency',
      id: d.id,
      title: `${d.predecessorName} ➔ ${d.successorName}`,
      code: `DEP-${d.id}`,
      status: d.status,
      subtitle: `Precedence Type: [${d.type}] • Lag: ${d.lagDays} days • Criticality: ${d.criticality}`,
      metrics: [
        { label: 'Relationship', value: `${d.type} (+${d.lagDays}d)`, color: 'text-cyan-400' },
        { label: 'Criticality', value: d.criticality, color: d.criticality === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400' },
        { label: 'Resolution', value: d.status, color: d.status === 'RESOLVED' ? 'text-emerald-400' : 'text-rose-400' }
      ],
      details: [
        { label: 'Project Context', value: currentProject.name },
        { label: 'Driving Predecessor', value: d.predecessorName },
        { label: 'Dependent Successor', value: d.successorName },
        { label: 'Dependency Logic', value: d.type === 'FS' ? 'Finish-to-Start (FS)' : d.type === 'SS' ? 'Start-to-Start (SS)' : d.type === 'FF' ? 'Finish-to-Finish (FF)' : 'Start-to-Finish (SF)' },
        { label: 'Buffer / Lag Days', value: `${d.lagDays} working days` },
        { label: 'Affected Milestone', value: 'Commercial Operation Date (COD)' },
        { label: 'Detailed Description', value: d.description }
      ],
      risks: [
        `If ${d.predecessorName} slips by >5 days, float on ${d.successorName} is completely wiped out.`,
        `Direct contractor claims trigger under clause 8.4 if site access handover is delayed.`
      ],
      recommendations: [
        'Engage resident engineer for preliminary partial-handover certification.',
        'Authorize weekend overtime rigging crew to compress buffer gap.'
      ],
      relatedView: 'dependencies'
    });
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="Dependencies Graph">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="dependencies"
          onNavigateView={onNavigateView}
        />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">NETWORK LOGIC //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                CRITICAL PATH PRECEDENCE
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Task Precedence & Dependency Interlock Graph
            </h1>
            <p className="text-xs text-slate-400">
              Contractual FS/SS finish-to-start relationships, lead/lag buffers and inter-package blockers
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Critical Interlocks</span>
              <span className="text-rose-400 font-bold">
                {dependencies.filter(d => d.criticality === 'CRITICAL').length} High-Risk Links
              </span>
            </div>
          </div>
        </div>

        {/* Hierarchy Chain Pipeline: Project -> Work Package -> Activity -> Milestone -> Commissioning */}
        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Multi-Tier Transmission Network Hierarchy:
            </span>
            <span className="text-[10px] text-cyan-400">Project ➔ WBS ➔ Activity ➔ Milestone</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 text-xs">
            {[
              { tier: 'TIER 1', name: 'Project Scope', code: currentProject.code, status: 'IN_PROGRESS' },
              { tier: 'TIER 2', name: 'WBS-03 Civils', code: 'WP-CIV-01', status: 'IN_PROGRESS' },
              { tier: 'TIER 3', name: 'Tower Rigging', code: 'ACT-TW-402', status: 'IN_PROGRESS' },
              { tier: 'TIER 4', name: 'Stringing Precedence', code: 'ACT-STR-01', status: 'PENDING' },
              { tier: 'TIER 5', name: 'Substation Intertie', code: 'MS-BAY-04', status: 'PENDING' },
              { tier: 'GATE', name: 'COD Energization', code: 'GATE-04', status: 'PENDING' }
            ].map((node, i, arr) => (
              <React.Fragment key={i}>
                <div className={`px-3 py-2 rounded border flex-shrink-0 min-w-[135px] ${
                  node.status === 'IN_PROGRESS' ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200' :
                  'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}>
                  <div className="text-[9px] text-slate-400 flex items-center justify-between">
                    <span>{node.tier}</span>
                    <span className="text-[8px] text-cyan-400">{node.code}</span>
                  </div>
                  <div className="font-semibold text-xs mt-0.5">{node.name}</div>
                </div>

                {i < arr.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-cyan-500/60 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Criticality:</span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((crit) => (
                <button
                  key={crit}
                  onClick={() => setFilterCriticality(crit)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    filterCriticality === crit ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {crit}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Relationship Type:</span>
              {['ALL', 'FS', 'SS', 'FF'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                    filterType === t ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'ALL' ? 'ALL TYPES' : t}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[10px] text-slate-400">
            Showing {filteredDependencies.length} Network Precedence Links
          </span>
        </div>

        {/* Main Interactive Dependency Workspace: Graph List + Impact Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
          {/* Left Column: Interactive Precedence Links List */}
          <div className="lg:col-span-2 space-y-2.5">
            {filteredDependencies.map((d) => {
              const isSelected = d.id === selectedDepId;

              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDepId(d.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-[#0a1322] border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/40'
                      : 'bg-[#080d17] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        {d.type} (+{d.lagDays}d)
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {d.predecessorName}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-purple-300">
                        {d.successorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
                        d.criticality === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30' : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {d.criticality}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                        d.status === 'RESOLVED' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                        d.status === 'BLOCKED' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' :
                        'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {d.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80 text-slate-400">
                    <span>Predecessor Impact: High Criticality Buffer</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDep(d);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Inspect Chain</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Impact & Recovery Analysis for Selected Link */}
          <div className="space-y-3">
            {/* UPSTREAM IMPACT */}
            <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5" />
                Upstream Driving Factors
              </h3>
              <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-300 font-semibold">{selectedDependency.predecessorName}</div>
                <p className="text-slate-400 text-[10px]">
                  Requires complete clearance certificate and physical inspection signoff before successor initiation.
                </p>
                <div className="text-[10px] text-cyan-300">Lead Time Buffer: {selectedDependency.lagDays} days float.</div>
              </div>
            </div>

            {/* DOWNSTREAM IMPACT */}
            <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Downstream Ripple & Milestone Impact
              </h3>
              <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-300 font-semibold">{selectedDependency.successorName}</div>
                <p className="text-slate-400 text-[10px]">
                  Direct gateway dependency for Substation Cold Commissioning and Commercial Operation Date (COD).
                </p>
                <div className="text-[10px] text-rose-400 font-bold">Float Sensitivity: ZERO FLOAT (Driving Path)</div>
              </div>
            </div>

            {/* BLOCKED ITEMS */}
            <div className="p-3.5 bg-[#080d17] rounded-lg border border-rose-500/30 bg-rose-950/10 space-y-2">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                Blocked Items Register
              </h3>
              <div className="text-[11px] text-slate-300 space-y-1.5">
                <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-white font-semibold">T-204 Substation Rigging</span>
                  <p className="text-[10px] text-rose-300">Awaiting Mumbai shipping container customs release.</p>
                </div>
                <div className="p-1.5 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-white font-semibold">Mariakani Section 107 Gazettement</span>
                  <p className="text-[10px] text-amber-300">Awaiting NLC compensation escrow release.</p>
                </div>
              </div>
            </div>

            {/* RECOVERY OPTIONS (UI FIXTURES) */}
            <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Prescribed Schedule Recovery Maneuvers
              </h3>
              <div className="space-y-1.5 text-[10px]">
                <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                  <strong className="text-emerald-300 block">1. Fast-Track Rigging Clearance:</strong>
                  <span className="text-slate-400">Request 24/7 port gate escort with Kenya Ports Authority to save 5 days.</span>
                </div>
                <div className="p-2 rounded bg-slate-900/70 border border-slate-800">
                  <strong className="text-cyan-300 block">2. Double-Shift Tower Gangs:</strong>
                  <span className="text-slate-400">Deploy second erection crew in Section 2 Mazeras to recover 8 days of float.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
