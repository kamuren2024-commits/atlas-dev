import React, { useState } from 'react';
import { 
  HardHat, 
  Filter, 
  Search, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Layers,
  ArrowUpDown,
  LayoutGrid,
  List,
  Boxes,
  ArrowUpRight,
  ShieldAlert,
  Users,
  DollarSign
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { MASTER_WORK_PACKAGES } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface WorkPackagesBreakdownViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

type SortField = 'code' | 'progress' | 'endDate' | 'cost';

export const WorkPackagesBreakdownView: React.FC<WorkPackagesBreakdownViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyCritical, setOnlyCritical] = useState(false);
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const packages = MASTER_WORK_PACKAGES.filter((wp) => wp.projectId === currentProject.id);

  const filteredPackages = packages.filter((wp) => {
    if (filterStatus !== 'ALL' && wp.status !== filterStatus) return false;
    const isCrit = wp.isCritical || wp.criticalPath;
    if (onlyCritical && !isCrit) return false;
    const wpTitle = wp.title || wp.name || '';
    if (searchQuery && !wpTitle.toLowerCase().includes(searchQuery.toLowerCase()) && !wp.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'code') {
      comparison = a.code.localeCompare(b.code);
    } else if (sortField === 'progress') {
      comparison = a.progress - b.progress;
    } else if (sortField === 'endDate') {
      comparison = a.endDate.localeCompare(b.endDate);
    } else if (sortField === 'cost') {
      comparison = (a.cost || '').localeCompare(b.cost || '');
    }
    return sortAsc ? comparison : -comparison;
  });

  const criticalCount = packages.filter(p => p.isCritical || p.criticalPath).length;

  const handleOpenWp = (wp: typeof packages[0]) => {
    setSelectedEntity({
      type: 'work-package',
      id: wp.id,
      title: wp.title || wp.name || '',
      code: wp.code,
      status: wp.status,
      subtitle: `Project: ${currentProject.name} • Phase: ${currentProject.stage} • Responsible: ${wp.owner}`,
      metrics: [
        { label: 'Physical Progress', value: `${wp.progress}%`, color: 'text-cyan-400' },
        { label: 'Cost Commitment', value: wp.cost, color: 'text-white' },
        { label: 'Actual Incurred', value: wp.actualCost, color: 'text-purple-300' }
      ],
      details: [
        { label: 'Scope Description', value: wp.scope },
        { label: 'Responsible Lead', value: wp.owner },
        { label: 'EPC Contractor', value: wp.contractor },
        { label: 'Planned Start', value: wp.startDate },
        { label: 'Planned Finish', value: wp.endDate },
        { label: 'Forecast Finish', value: wp.endDate },
        { label: 'Critical Path Status', value: (wp.isCritical || wp.criticalPath) ? 'CRITICAL (Zero Float)' : 'Non-critical buffer' },
        { label: 'Allocated Equipment/Materials', value: wp.materials.join(', ') }
      ],
      breakdown: [
        { label: 'Design Submittals & Approvals', progress: 100, status: 'COMPLETED', note: 'Stamped by Lead Engineer' },
        { label: 'Procurement & Material Staging', progress: 85, status: 'IN_PROGRESS', note: 'Conductors delivered; insulators clearing customs' },
        { label: 'Civil Works & Tower Foundations', progress: 68, status: 'IN_PROGRESS', note: '280 of 412 tower plinths cast' },
        { label: 'Tower Erection & Cladding', progress: 42, status: 'IN_PROGRESS', note: 'Gangs active in Section 2' },
        { label: 'Conductor Stringing & Sagging', progress: 15, status: 'IN_PROGRESS', note: 'Tensioner rigged at Mariakani' }
      ],
      risks: wp.risks && wp.risks.length > 0 ? wp.risks : ['No unmitigated risks recorded.'],
      dependencies: wp.dependencies && wp.dependencies.length > 0 ? wp.dependencies : ['None'],
      recommendations: [
        'Maintain daily progress log in field mobile telemetry.',
        'Coordinate next joint foundation inspection before concrete pour.'
      ],
      relatedView: 'work-packages'
    });
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="WBS Work Packages">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="work-packages"
          onNavigateView={onNavigateView}
        />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PROJECT EXECUTION //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                WBS BREAKDOWN
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Work Breakdown Structure (WBS) Packages
            </h1>
            <p className="text-xs text-slate-400">
              Contractual work packages, schedule performance (SPI), cost index (CPI), and critical path status
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Critical Path WBS</span>
              <span className="text-rose-400 font-bold">{criticalCount} Packages Driving COD</span>
            </div>
          </div>
        </div>

        {/* Filter, Sort and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Status:</span>
            {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  filterStatus === st ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}

            <label className="flex items-center gap-1 cursor-pointer text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px] ml-2">
              <input
                type="checkbox"
                checked={onlyCritical}
                onChange={(e) => setOnlyCritical(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-rose-400">Critical Only</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Sorting */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px]">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="code" className="bg-slate-900">WBS Code</option>
                <option value="progress" className="bg-slate-900">Progress %</option>
                <option value="endDate" className="bg-slate-900">Finish Date</option>
                <option value="cost" className="bg-slate-900">Cost Value</option>
              </select>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="text-slate-400 hover:text-white ml-1"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1 rounded ${viewMode === 'TABLE' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-1 rounded ${viewMode === 'CARDS' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Search WBS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded pl-7 pr-2 py-0.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-36"
              />
            </div>
          </div>
        </div>

        {/* 04 — VIEW MODE: TABLE */}
        {viewMode === 'TABLE' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 overflow-hidden font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="p-3">WBS ID & Scope</th>
                    <th className="p-3">Responsible / Contractor</th>
                    <th className="p-3">Phase</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Schedule Dates</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPackages.map((wp) => {
                    const isCrit = wp.isCritical || wp.criticalPath;

                    return (
                      <tr
                        key={wp.id}
                        onClick={() => handleOpenWp(wp)}
                        className="hover:bg-slate-900/50 transition-colors cursor-pointer"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cyan-400">{wp.code}</span>
                            {isCrit && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-slate-100 text-xs mt-0.5">
                            {wp.title || wp.name}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {wp.scope}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="text-slate-200 font-medium">{wp.owner}</div>
                          <div className="text-[10px] text-slate-400">{wp.contractor}</div>
                        </td>

                        <td className="p-3">
                          <span className="text-purple-300 font-semibold">{currentProject.stage}</span>
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white w-8">{wp.progress}%</span>
                            <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${wp.progress}%` }} />
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-[10px]">
                          <div className="text-slate-300">Start: {wp.startDate}</div>
                          <div className="text-slate-400">Finish: {wp.endDate}</div>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                            wp.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                            wp.status === 'IN_PROGRESS' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                            wp.status === 'BLOCKED' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                            'text-slate-400 bg-slate-800 border-slate-700'
                          }`}>
                            {wp.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenWp(wp);
                            }}
                            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 04 — VIEW MODE: COMPACT CARDS */}
        {viewMode === 'CARDS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {filteredPackages.map((wp) => {
              const isCrit = wp.isCritical || wp.criticalPath;

              return (
                <div
                  key={wp.id}
                  onClick={() => handleOpenWp(wp)}
                  className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-cyan-400">{wp.code}</span>
                      {isCrit && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          CRITICAL
                        </span>
                      )}
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                      wp.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      wp.status === 'IN_PROGRESS' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                      'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    }`}>
                      {wp.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100 text-xs">{wp.title || wp.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{wp.scope}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-bold">{wp.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${wp.progress}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Responsible:</span>
                      <span className="text-slate-200 truncate block">{wp.owner}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Forecast Finish:</span>
                      <span className="text-cyan-300 block">{wp.endDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
