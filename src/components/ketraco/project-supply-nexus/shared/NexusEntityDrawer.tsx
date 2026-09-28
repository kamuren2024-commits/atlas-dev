import React from 'react';
import {
  X,
  Layers,
  FolderKanban,
  Boxes,
  Calendar,
  Compass,
  Clock,
  Coins,
  Users2,
  Workflow,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  MapPin,
  HardHat,
  ArrowRight,
  FileText
} from 'lucide-react';
import { ProjectViewMode } from '../types';

export type EntityDrawerType =
  | 'project'
  | 'program'
  | 'work-package'
  | 'milestone'
  | 'activity'
  | 'dependency'
  | 'resource'
  | 'cost-item';

export interface EntityDrawerData {
  type: EntityDrawerType;
  id: string;
  title: string;
  code?: string;
  status?: string;
  subtitle?: string;
  tags?: string[];
  metrics?: { label: string; value: string; color?: string }[];
  details?: { label: string; value: string | React.ReactNode }[];
  breakdown?: { label: string; progress?: number; status?: string; note?: string }[];
  risks?: string[];
  dependencies?: string[];
  recommendations?: string[];
  relatedView?: ProjectViewMode;
}

interface NexusEntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entity: EntityDrawerData | null;
  onNavigateView?: (view: ProjectViewMode) => void;
  onSelectProject?: (id: string) => void;
}

export const NexusEntityDrawer: React.FC<NexusEntityDrawerProps> = ({
  isOpen,
  onClose,
  entity,
  onNavigateView,
  onSelectProject
}) => {
  if (!isOpen || !entity) return null;

  const getIcon = () => {
    switch (entity.type) {
      case 'project':
        return <FolderKanban className="w-5 h-5 text-cyan-400" />;
      case 'program':
        return <Layers className="w-5 h-5 text-purple-400" />;
      case 'work-package':
        return <Boxes className="w-5 h-5 text-cyan-400" />;
      case 'milestone':
        return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'activity':
        return <Clock className="w-5 h-5 text-emerald-400" />;
      case 'dependency':
        return <Compass className="w-5 h-5 text-rose-400" />;
      case 'resource':
        return <Users2 className="w-5 h-5 text-indigo-400" />;
      case 'cost-item':
        return <Coins className="w-5 h-5 text-yellow-400" />;
      default:
        return <FolderKanban className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (entity.type) {
      case 'project': return 'PROJECT ASSET 360';
      case 'program': return 'CORRIDOR PROGRAM';
      case 'work-package': return 'WBS WORK PACKAGE';
      case 'milestone': return 'CONTRACTUAL MILESTONE';
      case 'activity': return 'SCHEDULE ACTIVITY';
      case 'dependency': return 'NETWORK DEPENDENCY';
      case 'resource': return 'PROJECT RESOURCE';
      case 'cost-item': return 'CBS COST ELEMENT';
      default: return 'ENTITY INSPECTION';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-[2px] transition-opacity">
      <div 
        className="w-full max-w-xl h-full bg-[#080d17] border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        id="nexus-entity-drawer"
      >
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-slate-900 border border-slate-800 mt-0.5">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                  {getTypeLabel()} //
                </span>
                {entity.code && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800">
                    {entity.code}
                  </span>
                )}
                {entity.status && (
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase border ${
                    entity.status.includes('HEALTHY') || entity.status.includes('COMPLETED') || entity.status.includes('ON_TRACK')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : entity.status.includes('AT_RISK') || entity.status.includes('IN_PROGRESS') || entity.status.includes('WATCH')
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {entity.status.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-100 mt-1 leading-snug">
                {entity.title}
              </h2>
              {entity.subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {entity.subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
          {/* Key Metrics Strip */}
          {entity.metrics && entity.metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {entity.metrics.map((m, i) => (
                <div key={i} className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">{m.label}</span>
                  <span className={`text-sm font-bold font-mono mt-0.5 block ${m.color || 'text-slate-100'}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Details Table */}
          {entity.details && entity.details.length > 0 && (
            <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-3 space-y-2">
              <h3 className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                Specification & Operational Parameters
              </h3>
              <div className="divide-y divide-slate-800/60">
                {entity.details.map((d, i) => (
                  <div key={i} className="py-1.5 flex items-start justify-between gap-3">
                    <span className="text-slate-400 font-mono text-[11px] shrink-0">{d.label}:</span>
                    <span className="text-slate-200 font-mono text-[11px] text-right break-words">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown/Progress */}
          {entity.breakdown && entity.breakdown.length > 0 && (
            <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-3 space-y-2">
              <h3 className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                Sub-element Activity Status
              </h3>
              <div className="space-y-2">
                {entity.breakdown.map((item, i) => (
                  <div key={i} className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                      <span className="text-slate-200 font-semibold">{item.label}</span>
                      {item.progress !== undefined && (
                        <span className="text-cyan-300 font-bold">{item.progress}%</span>
                      )}
                    </div>
                    {item.progress !== undefined && (
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-cyan-400 h-full rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                    {item.note && (
                      <p className="text-[10px] text-slate-400 font-mono">{item.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks & Exceptions */}
          {entity.risks && entity.risks.length > 0 && (
            <div className="rounded-lg bg-rose-950/20 border border-rose-500/30 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px] font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Identified Active Risks & Exceptions</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-300 font-mono text-[11px]">
                {entity.risks.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Dependencies / Upstream-Downstream */}
          {entity.dependencies && entity.dependencies.length > 0 && (
            <div className="rounded-lg bg-purple-950/20 border border-purple-500/30 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-purple-400 font-mono text-[11px] font-semibold">
                <Workflow className="w-3.5 h-3.5" />
                <span>Interlocked Predecessors & Successors</span>
              </div>
              <div className="space-y-1.5">
                {entity.dependencies.map((dep, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                    <span className="text-purple-400">➔</span>
                    <span>{dep}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations / Next Actions */}
          {entity.recommendations && entity.recommendations.length > 0 && (
            <div className="rounded-lg bg-cyan-950/20 border border-cyan-500/30 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prescribed Controls Mitigation</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-slate-300 font-mono text-[11px]">
                {entity.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {entity.relatedView && onNavigateView && (
              <button
                onClick={() => {
                  onNavigateView(entity.relatedView!);
                  onClose();
                }}
                className="px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>Open in {entity.relatedView.toUpperCase()}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            {entity.type === 'project' && onSelectProject && (
              <button
                onClick={() => {
                  onSelectProject(entity.id);
                  if (onNavigateView) onNavigateView('project-360');
                  onClose();
                }}
                className="px-3 py-1.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>Select as Active Project</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
