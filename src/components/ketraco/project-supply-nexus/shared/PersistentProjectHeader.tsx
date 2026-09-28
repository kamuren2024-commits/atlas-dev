import React from 'react';
import { ChevronDown, Zap, Calendar, DollarSign, Activity, HardHat, GitFork } from 'lucide-react';
import { MasterProjectSummary, ProjectViewMode } from '../types';
import { MASTER_PROJECTS } from '../adapters/fixtures';

interface PersistentProjectHeaderProps {
  currentProject: MasterProjectSummary;
  onSelectProject: (projectId: string) => void;
  activeView: ProjectViewMode;
  onNavigateView: (view: ProjectViewMode) => void;
}

export const PersistentProjectHeader: React.FC<PersistentProjectHeaderProps> = ({
  currentProject,
  onSelectProject,
  activeView,
  onNavigateView
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const relatedTabs: { id: ProjectViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'project-360', label: 'Project 360', icon: Activity },
    { id: 'work-packages', label: 'Work Packages', icon: HardHat },
    { id: 'milestones', label: 'Milestones', icon: Calendar },
    { id: 'dependencies', label: 'Dependencies', icon: GitFork },
    { id: 'schedule', label: 'Schedule Gantt', icon: Calendar },
    { id: 'cost', label: 'Cost CBS', icon: DollarSign },
    { id: 'resources', label: 'Resources', icon: HardHat },
    { id: 'progress', label: 'Progress EVM', icon: Activity },
    { id: 'critical-path', label: 'Critical Path', icon: Zap }
  ];

  const statusColor = 
    currentProject.status === 'HEALTHY' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    currentProject.status === 'AT_RISK' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="mb-4 bg-[#080d17]/90 border border-slate-800/80 rounded-lg p-3 backdrop-blur-md shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
        {/* Project Selector & Core Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-[#0d1524] hover:bg-[#131f36] border border-cyan-500/30 text-white px-3 py-1.5 rounded text-xs font-mono transition-all group shadow-sm"
              title="Switch Active Project Context"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-semibold">{currentProject.code}</span>
              <span className="text-slate-300 font-sans font-medium max-w-[240px] truncate">{currentProject.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-[#0c121e] border border-slate-700/80 rounded-md shadow-2xl z-50 py-1 text-xs max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  Select Transmission Grid Asset
                </div>
                {MASTER_PROJECTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/60 transition-colors ${
                      p.id === currentProject.id ? 'bg-cyan-950/40 text-cyan-300 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-[11px] text-cyan-400/90">{p.code} • {p.voltage}</div>
                      <div className="text-slate-200 truncate max-w-[200px]">{p.name}</div>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded uppercase border ${
                      p.status === 'HEALTHY' ? 'text-emerald-400 border-emerald-500/40' :
                      p.status === 'AT_RISK' ? 'text-amber-400 border-amber-500/40' : 'text-rose-400 border-rose-500/40'
                    }`}>
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="px-2 py-0.5 text-[10px] font-mono rounded uppercase border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            {currentProject.voltage}
          </span>

          <span className={`px-2 py-0.5 text-[10px] font-mono rounded uppercase border ${statusColor}`}>
            {currentProject.status} • {currentProject.stage}
          </span>

          <span className="text-xs text-slate-400 hidden lg:inline-block">
            EPC: <strong className="text-slate-200 font-medium">{currentProject.epcContractor}</strong>
          </span>
        </div>

        {/* Telemetry Summary Badges */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Physical Progress</span>
            <span className="text-white font-bold">{currentProject.progress}%</span>
          </div>

          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden self-center">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              style={{ width: `${currentProject.progress}%` }}
            />
          </div>

          <div className="text-right border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 block uppercase">Delivery Confidence</span>
            <span className={`font-bold ${currentProject.confidence >= 90 ? 'text-emerald-400' : currentProject.confidence >= 75 ? 'text-cyan-400' : 'text-amber-400'}`}>
              {currentProject.confidence}%
            </span>
          </div>

          <div className="text-right border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 block uppercase">Forecast COD</span>
            <span className="text-slate-200 font-semibold">{currentProject.forecastCompletion}</span>
            {currentProject.delayDays > 0 ? (
              <span className="text-[10px] text-rose-400 block font-mono">+{currentProject.delayDays}d variance</span>
            ) : (
              <span className="text-[10px] text-emerald-400 block font-mono">On Baseline</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Jump Navigation Tabs across Project Controls */}
      <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pt-1">
        <span className="text-[10px] uppercase font-mono text-slate-400 mr-2 flex-shrink-0">
          Domain Submodules:
        </span>
        {relatedTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigateView(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
              }`}
            >
              <Icon className="w-3 h-3 text-current" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
