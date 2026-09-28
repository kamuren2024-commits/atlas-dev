import React, { useState } from 'react';
import { 
  Users, 
  Truck, 
  Wrench, 
  HardHat, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search,
  ArrowUpRight,
  TrendingUp,
  AlertOctagon,
  Layers,
  Briefcase
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { RESOURCES_ALLOCATION_DATA } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface ResourcesWorkforceViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

type ResourceTab = 'ALLOCATION' | 'CAPACITY' | 'CONFLICTS';

export const ResourcesWorkforceView: React.FC<ResourcesWorkforceViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [activeTab, setActiveTab] = useState<ResourceTab>('ALLOCATION');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [onlyConflicts, setOnlyConflicts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const categories = [
    'ALL',
    'Riggers',
    'Equipment',
    'Engineers',
    'Arbitrators',
    'Specialist'
  ];

  const rawResources = RESOURCES_ALLOCATION_DATA.map((res: any) => ({
    id: res.id,
    name: res.name || res.roleOrEquipment || 'Operational Resource',
    type: res.type || 'HUMAN',
    role: res.role || res.roleOrEquipment || 'Transmission Engineering',
    workPackage: res.workPackage || res.location || 'Section 2 Transmission',
    allocatedPercent: res.allocatedPercent !== undefined ? res.allocatedPercent : (res.utilizationPercent || 95),
    status: res.status || (res.utilizationPercent > 120 ? 'OVERALLOCATED' : 'OPTIMAL'),
    hoursPerWeek: res.hoursPerWeek || (res.plannedCount ? `${res.actualCount}/${res.plannedCount} Units` : '40 hrs/week'),
    conflictDetails: res.conflictDetails || res.bottleneckAlert || null
  }));

  const filteredResources = rawResources.filter((res) => {
    if (filterCategory !== 'ALL' && !res.name.toLowerCase().includes(filterCategory.toLowerCase()) && !res.role.toLowerCase().includes(filterCategory.toLowerCase())) return false;
    if (onlyConflicts && res.status !== 'CONFLICT' && res.status !== 'OVERALLOCATED') return false;
    if (searchQuery && !res.name.toLowerCase().includes(searchQuery.toLowerCase()) && !res.role.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const conflictsCount = rawResources.filter(r => r.status === 'CONFLICT' || r.status === 'OVERALLOCATED').length;

  const handleOpenResource = (res: typeof rawResources[0]) => {
    setSelectedEntity({
      type: 'resource',
      id: res.id,
      title: res.name,
      code: res.type,
      status: res.status,
      subtitle: `Project: ${currentProject.name} • Utilization: ${res.allocatedPercent}%`,
      metrics: [
        { label: 'Utilization', value: `${res.allocatedPercent}%`, color: res.allocatedPercent > 100 ? 'text-rose-400' : 'text-emerald-400' },
        { label: 'Work Package', value: res.workPackage, color: 'text-cyan-400' },
        { label: 'Weekly Capacity', value: res.hoursPerWeek, color: 'text-white' }
      ],
      details: [
        { label: 'Resource Category', value: res.type },
        { label: 'Assigned Role / Craft', value: res.role },
        { label: 'Workfront Assignment', value: res.workPackage },
        { label: 'Operational Status', value: res.status },
        { label: 'Conflict / Bottleneck Notes', value: res.conflictDetails || 'No cross-project conflicts identified' }
      ],
      risks: res.status === 'CONFLICT' || res.status === 'OVERALLOCATED' ? [
        'Overallocation exceeds 120% safe operational limit, driving fatigue and HSE incident probability.',
        'Simultaneous demand from Olkaria-Lessos expansion will cause site idle time if not deconflicted.'
      ] : [
        'Operating within standard capacity envelope.'
      ],
      recommendations: [
        'Mobilize secondary subcontractor crew for night shifts.',
        'Request corporate resource loan approval through Project Director.'
      ],
      relatedView: 'resources'
    });
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="Resources & Workforce">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="resources"
          onNavigateView={onNavigateView}
        />

        {/* Resources Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PROJECT CONTROLS //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                WORKFORCE & HEAVY PLANT ALLOCATION
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Resource Allocation, Workforce Mobilization & Conflicts
            </h1>
            <p className="text-xs text-slate-400">
              Contractor gangs, certified linesmen, heavy piling cranes, and testing engineers
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Resource Conflicts:</span>
            <span className={`px-2.5 py-1 rounded font-bold border ${
              conflictsCount > 0 ? 'text-rose-400 bg-rose-950/40 border-rose-500/30' : 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
            }`}>
              {conflictsCount} Active Bottlenecks
            </span>
          </div>
        </div>

        {/* Top Resource Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Total Headcount</span>
            <span className="text-white font-bold text-base">428 Personnel</span>
            <span className="text-[10px] text-cyan-400 block mt-0.5">380 Field / 48 Supervisory</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Heavy Plant Mobilized</span>
            <span className="text-amber-400 font-bold text-base">34 Units</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Piling Rigs, Cranes, Pullers</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Average Utilization</span>
            <span className="text-cyan-300 font-bold text-base">108.4%</span>
            <span className="text-[10px] text-amber-400 block mt-0.5">Operating Above Nominal</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Overallocation Incidents</span>
            <span className="text-rose-400 font-bold text-base">{conflictsCount} Disciplines</span>
            <span className="text-[10px] text-rose-300 block mt-0.5">Requires Deconfliction</span>
          </div>
        </div>

        {/* Navigation Tabs & Search/Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('ALLOCATION')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'ALLOCATION' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resource Allocation Grid
            </button>
            <button
              onClick={() => setActiveTab('CAPACITY')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'CAPACITY' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Capacity by Discipline
            </button>
            <button
              onClick={() => setActiveTab('CONFLICTS')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'CONFLICTS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resource Bottlenecks ({conflictsCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px]">
              <input
                type="checkbox"
                checked={onlyConflicts}
                onChange={(e) => setOnlyConflicts(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-rose-400 font-bold">Show Overallocated Only</span>
            </label>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="Search resource or gang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded pl-7 pr-3 py-1 text-slate-200 placeholder-slate-500 text-[11px] focus:outline-none focus:border-cyan-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-[#080d17] p-2 rounded-lg border border-slate-800 font-mono text-xs">
          <span className="text-slate-400 text-[10px] uppercase pl-1 mr-1">Discipline:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                filterCategory === cat ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TAB 1: ALLOCATION GRID */}
        {activeTab === 'ALLOCATION' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {filteredResources.map((res) => {
              const isOver = res.status === 'OVERALLOCATED' || res.status === 'CONFLICT';

              return (
                <div
                  key={res.id}
                  onClick={() => handleOpenResource(res)}
                  className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer space-y-2.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {res.type === 'HUMAN' ? (
                        <Users className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Truck className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="font-bold text-slate-100">{res.name}</span>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                      isOver ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                      {res.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <div>Discipline: <span className="text-slate-200">{res.role}</span></div>
                    <div>Assignment: <span className="text-cyan-300">{res.workPackage}</span></div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Utilization</span>
                      <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-white'}`}>{res.allocatedPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-cyan-400'}`}
                        style={{ width: `${Math.min(res.allocatedPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80 text-slate-400">
                    <span>{res.hoursPerWeek}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenResource(res);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                    >
                      <span>Profile</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: CAPACITY BY DISCIPLINE */}
        {activeTab === 'CAPACITY' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Discipline Headcount vs Planned Capacity
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Transmission Linesmen (Certified Riggers)', actual: 160, planned: 140, pct: 114, status: 'OVERALLOCATED' },
                { name: 'Civil & Foundation Gangs (Likoni Piling)', actual: 95, planned: 95, pct: 100, status: 'OPTIMAL' },
                { name: 'Substation Protection & SCADA Engineers', actual: 24, planned: 18, pct: 133, status: 'OVERALLOCATED' },
                { name: 'Land Surveyors & Wayleave Arbitrators', actual: 32, planned: 30, pct: 106, status: 'OPTIMAL' },
                { name: 'HSE Safety Inspectors & Environmental Monitors', actual: 18, planned: 18, pct: 100, status: 'OPTIMAL' }
              ].map((disc, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{disc.name}</span>
                    <span className={`font-bold ${disc.pct > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {disc.actual} / {disc.planned} Heads ({disc.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${disc.pct > 100 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                      style={{ width: `${Math.min(disc.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RESOURCE CONFLICTS REGISTER */}
        {activeTab === 'CONFLICTS' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-rose-950/20 p-3.5 rounded-lg border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-300 text-sm">Active Resource Bottlenecks & Critical Allocation Conflicts</h4>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Specialized heavy machinery and senior protection engineers are currently contested across parallel packages. Resolution is required to prevent simultaneous work stoppages.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">Bored Piling Rig (250-Tonne Crane)</span>
                  <span className="text-rose-400 font-bold">160% Contested</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Overlapping demand at South Coast Diani Intertie. Single unit operating dual shift.
                </p>
                <div className="text-[10px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Resolution: Authorize second rig mobilization from Nairobi dry port.
                </div>
              </div>

              <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">Senior Protection Engineer Sarah Ochieng</span>
                  <span className="text-rose-400 font-bold">145% Utilization</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Lead engineer Sarah Ochieng also allocated to Nairobi Ring trial energization.
                </p>
                <div className="text-[10px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Resolution: Delegate secondary injection signoffs to Western Grid standby engineer.
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
