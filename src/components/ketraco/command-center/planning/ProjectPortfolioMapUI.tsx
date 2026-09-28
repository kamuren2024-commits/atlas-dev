import React, { useMemo, useState } from 'react';
import { Map, Circle, Triangle, Square, ArrowRight, ChevronRight } from 'lucide-react';
import type { Project, ProjectPortfolioEntry } from '../../../../../backend/planning-engine/types';
import { projectIntelligenceEngine } from '../../../../../backend/planning-engine';

interface ProjectPortfolioMapProps {
  projects: Project[];
  onSelectAsset: (assetId: string) => void;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  EXISTING: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '●' },
  UNDER_CONSTRUCTION: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: '◐' },
  PLANNED: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: '○' },
  PROPOSED: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: '◦' },
};

const TYPE_ICONS: Record<string, string> = {
  SUBSTATION_EXPANSION: '⊞', TRANSMISSION_LINE: '―', TRANSFORMER: '⏈',
  BAY: '⊟', COMPENSATION: '⊕', HVDC: '⚡',
};

export default function ProjectPortfolioMapUI({ projects, onSelectAsset }: ProjectPortfolioMapProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const portfolio = useMemo(() => projectIntelligenceEngine.buildPortfolio(projects), [projects]);

  const filtered = filterStatus === 'ALL' ? portfolio : portfolio.filter(p => p.mapStatus === filterStatus);

  const stats = useMemo(() => ({
    total: projects.length,
    construction: projects.filter(p => p.status === 'CONSTRUCTION').length,
    procurement: projects.filter(p => p.status === 'PROCUREMENT').length,
    planned: projects.filter(p => p.status === 'PLANNED').length,
    totalGain: projects.reduce((sum, p) => sum + p.capacityGainMw, 0),
  }), [projects]);

  return (
    <div className="bg-[#050913] text-slate-100 p-4 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-violet-500/10 border border-violet-500/30">
            <Map className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400">Project Intelligence</div>
            <h3 className="text-lg font-bold">PROJECT PORTFOLIO MAP</h3>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Total Projects', value: stats.total, color: 'text-slate-100' },
          { label: 'Under Construction', value: stats.construction, color: 'text-amber-400' },
          { label: 'Procurement', value: stats.procurement, color: 'text-cyan-400' },
          { label: 'Planned', value: stats.planned, color: 'text-violet-400' },
          { label: 'Total Capacity Gain', value: `${stats.totalGain} MW`, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['ALL', 'EXISTING', 'UNDER_CONSTRUCTION', 'PLANNED', 'PROPOSED'].map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 rounded border text-[10px] font-bold tracking-wider cursor-pointer transition
              ${filterStatus === f ? 'bg-violet-500/15 border-violet-500/40 text-violet-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* National Map Visualization */}
      <div className="rounded-lg border border-slate-800 bg-[#0a1222] p-4 mb-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-3">National Project Distribution</div>
        <div className="relative h-[280px] bg-slate-900/50 rounded-lg overflow-hidden">
          {/* Simplified Kenya outline */}
          <svg viewBox="0 0 400 350" className="w-full h-full" style={{ opacity: 0.15 }}>
            <path d="M200,20 L300,60 L350,150 L320,250 L280,320 L200,340 L120,320 L80,250 L50,150 L100,60 Z" fill="none" stroke="#06B6D4" strokeWidth="1" />
          </svg>
          {/* Project markers */}
          <div className="absolute inset-0">
            {filtered.map(entry => {
              const positions: Record<string, { left: string; top: string }> = {
                'NAIROBI': { left: '58%', top: '52%' },
                'RIFT_VALLEY': { left: '42%', top: '40%' },
                'WESTERN': { left: '22%', top: '45%' },
                'COASTAL': { left: '72%', top: '72%' },
                'CENTRAL': { left: '55%', top: '40%' },
                'NORTH_EASTERN': { left: '60%', top: '18%' },
              };
              const pos = positions[entry.project.region] || { left: '50%', top: '50%' };
              const config = STATUS_CONFIG[entry.mapStatus];
              const size = Math.max(24, Math.min(48, entry.project.capacityGainMw / 15));
              return (
                <button key={entry.project.id} onClick={() => setSelectedProject(entry.project)}
                  className={`absolute ${config.color} cursor-pointer transition-transform hover:scale-150 z-10`}
                  style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
                  title={`${entry.project.name} — ${entry.project.capacityGainMw} MW`}>
                  <div className={`w-${Math.round(size / 4)} h-${Math.round(size / 4)} rounded-full ${config.bg} border ${config.border} flex items-center justify-center`}
                    style={{ width: size, height: size }}>
                    <span className="text-[8px] font-bold">{TYPE_ICONS[entry.project.type]}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex gap-3 text-[9px]">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <span key={key} className={`flex items-center gap-1 ${config.color}`}>
                <span>{config.icon}</span> {key.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(entry => {
          const config = STATUS_CONFIG[entry.mapStatus];
          const impact = entry.gridImpact;
          return (
            <div key={entry.project.id} className={`rounded-lg border ${config.border} ${config.bg} p-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{entry.project.name}</span>
                    <span className="text-[9px]">{TYPE_ICONS[entry.project.type]}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{entry.project.region} · {entry.mapStatus.replace('_', ' ')}</div>
                </div>
                <span className="text-lg font-bold text-emerald-400">+{entry.project.capacityGainMw} MW</span>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-[10px]">
                <div className="text-slate-400">Congestion <span className="text-slate-200 font-bold">{impact.after.congestion}%</span></div>
                <div className="text-slate-400">N-1 <span className="text-slate-200 font-bold">{impact.after.n1}%</span></div>
                <div className="text-slate-400">Resilience <span className="text-slate-200 font-bold">{impact.after.resilience}</span></div>
                <div className="text-slate-400">Risk <span className="text-slate-200 font-bold">{impact.after.risk}</span></div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[10px]">
                <span className="text-slate-500">BEFORE</span>
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500/60 rounded-full" style={{ width: `${impact.before.congestion}%` }} />
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${impact.after.congestion}%` }} />
                </div>
                <span className="text-slate-500">AFTER</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
