import React, { useState } from 'react';
import { 
  Layers, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Calendar, 
  ArrowUpRight, 
  Users,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  FolderKanban,
  Zap,
  AlertTriangle,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PROGRAMS_DATA, MASTER_PROJECTS } from '../../adapters/fixtures';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface ProgramsPortfolioViewProps {
  onSelectProject: (projectId: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

export const ProgramsPortfolioView: React.FC<ProgramsPortfolioViewProps> = ({
  onSelectProject,
  onNavigateView
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(PROGRAMS_DATA[0].id);
  const [healthFilter, setHealthFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({
    [PROGRAMS_DATA[0].id]: true,
    [PROGRAMS_DATA[1].id]: true,
    [PROGRAMS_DATA[2].id]: true
  });
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedProgram = PROGRAMS_DATA.find((p) => p.id === selectedProgramId) || PROGRAMS_DATA[0];

  const filteredPrograms = PROGRAMS_DATA.filter((prog) => {
    if (healthFilter !== 'ALL' && prog.health !== healthFilter) return false;
    if (searchQuery && !prog.name.toLowerCase().includes(searchQuery.toLowerCase()) && !prog.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const toggleProgramExpand = (progId: string) => {
    setExpandedPrograms(prev => ({ ...prev, [progId]: !prev[progId] }));
  };

  const handleProgramClick = (prog: typeof PROGRAMS_DATA[0]) => {
    setSelectedProgramId(prog.id);
    setSelectedEntity({
      type: 'program',
      id: prog.id,
      title: prog.name,
      code: prog.code,
      status: prog.health,
      subtitle: `Strategic Corridor Framework • ${prog.childProjects.length} Projects Integrated`,
      metrics: [
        { label: 'Budget Position', value: prog.totalBudget, color: 'text-cyan-400' },
        { label: 'Combined Progress', value: `${prog.combinedProgress}%`, color: 'text-white' },
        { label: 'Total EAC', value: prog.totalEac, color: 'text-purple-300' }
      ],
      details: [
        { label: 'Strategic Corridors', value: prog.description },
        { label: 'Project Count', value: `${prog.childProjects.length} transmission lines` },
        { label: 'Delivery Confidence', value: prog.health === 'HEALTHY' ? '89.4%' : '76.8%' },
        { label: 'Risk Exposure', value: prog.consolidatedRiskExposure || `${prog.programRisksCount} active risks` }
      ],
      risks: [
        `Cross-border synchronization protocols pending regulatory harmonization.`,
        `Shared substation transformer bay allocation bottleneck.`
      ],
      recommendations: [
        `Prioritize joint route inspection with donor multilateral agencies.`,
        `Coordinate contractor plant pooling between adjacent packages.`
      ]
    });
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="Programs Command">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PROJECTS GROUP //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                PROGRAMS COMMAND
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Strategic Grid Corridors & Multi-Project Programs
            </h1>
            <p className="text-xs text-slate-400">
              Interconnection frameworks, geothermal evacuation corridors and regional transmission programs
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Portfolio Programs:</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/30">
              {PROGRAMS_DATA.length} Strategic Corridors
            </span>
          </div>
        </div>

        {/* Global Program Portfolio Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Total Program Value</span>
            <span className="text-cyan-300 font-bold text-base">KES 48.2 Billion</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Committed Multi-Donor</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Integrated Projects</span>
            <span className="text-white font-bold text-base">{MASTER_PROJECTS.length} Lines & Substations</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">8 Transmission Corridors</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Portfolio Physical Progress</span>
            <span className="text-white font-bold text-base">64.8% Weighted</span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: '64.8%' }} />
            </div>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Critical Program Risks</span>
            <span className="text-rose-400 font-bold text-base">4 Corridor Hotspots</span>
            <span className="text-[10px] text-amber-300 block mt-0.5">Wayleave & Transformer Slippage</span>
          </div>
        </div>

        {/* Filters and Search Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Health Filter:</span>
            {['ALL', 'HEALTHY', 'AT_RISK', 'CRITICAL'].map((h) => (
              <button
                key={h}
                onClick={() => setHealthFilter(h)}
                className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
                  healthFilter === h ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {h.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search program or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-60"
            />
          </div>
        </div>

        {/* Program Cards Selector Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredPrograms.map((prog) => {
            const isSelected = prog.id === selectedProgramId;

            return (
              <div
                key={prog.id}
                onClick={() => setSelectedProgramId(prog.id)}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0a1220] border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-[#080d17] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">{prog.code}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${
                    prog.health === 'HEALTHY' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                    prog.health === 'AT_RISK' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                    'text-rose-400 border-rose-500/30 bg-rose-500/10'
                  }`}>
                    {prog.health.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm leading-snug mb-1">
                  {prog.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                  {prog.description}
                </p>

                <div className="space-y-1 my-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Combined Progress</span>
                    <span className="text-white font-bold">{prog.combinedProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${prog.combinedProgress}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Program Budget:</span>
                    <span className="text-cyan-300 font-bold">{prog.totalBudget}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Risk Exposure:</span>
                    <span className="text-amber-400 font-bold">{prog.consolidatedRiskExposure || `${prog.programRisksCount} active risks`}</span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{prog.childProjects.length} Projects Integrated</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProgramClick(prog);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 03 — Program / Project Hierarchy Visualization */}
        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Program & Project Hierarchy Tree Visualization
            </h3>
            <span className="text-[10px] text-slate-400">
              Click arrow to expand • Click project to drill down to Project 360
            </span>
          </div>

          <div className="space-y-3">
            {PROGRAMS_DATA.map((prog) => {
              const isExpanded = !!expandedPrograms[prog.id];
              const childProjects = MASTER_PROJECTS.filter(
                (p) => p.programId === prog.id || prog.childProjects.some(cp => p.name.toLowerCase().includes(cp.toLowerCase()))
              );

              return (
                <div key={prog.id} className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
                  {/* Program Node */}
                  <div
                    onClick={() => toggleProgramExpand(prog.id)}
                    className="p-3 bg-slate-900/80 hover:bg-slate-800/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <Layers className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-xs font-bold text-slate-100">{prog.name}</span>
                        <span className="text-[10px] text-cyan-400 ml-2">[{prog.code}]</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">{childProjects.length} Projects</span>
                      <span className="text-cyan-300 font-bold">{prog.totalBudget}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                        prog.health === 'HEALTHY' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                        prog.health === 'AT_RISK' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                        'text-rose-400 border-rose-500/30 bg-rose-500/10'
                      }`}>
                        {prog.health}
                      </span>
                    </div>
                  </div>

                  {/* Child Projects Container */}
                  {isExpanded && (
                    <div className="p-3 space-y-2 bg-[#080d17]/50 border-t border-slate-800">
                      {childProjects.length === 0 ? (
                        <p className="text-[11px] text-slate-500 pl-6 italic">No active project sub-elements assigned.</p>
                      ) : (
                        childProjects.map((cp) => (
                          <div
                            key={cp.id}
                            className="p-2.5 ml-4 rounded bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 flex flex-wrap items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-xs font-bold text-slate-200">{cp.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({cp.code})</span>
                              <span className="text-[10px] text-cyan-300 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-500/20">
                                {cp.voltage} • {cp.lengthKm} km
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-[10px]">
                                <span className="text-slate-400">Progress: </span>
                                <strong className="text-white">{cp.progress}%</strong>
                              </div>

                              <div className="text-[10px]">
                                <span className="text-slate-400">Target COD: </span>
                                <strong className="text-slate-200">{cp.forecastCompletion}</strong>
                              </div>

                              <button
                                onClick={() => {
                                  onSelectProject(cp.id);
                                  onNavigateView('project-360');
                                }}
                                className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono flex items-center gap-1 transition-colors"
                              >
                                <span>Drill Down 360</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
