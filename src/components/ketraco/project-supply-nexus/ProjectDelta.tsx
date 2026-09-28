import React, { useState } from 'react';
import { ExternalLink, Clock, X, Info, CheckCircle2 } from 'lucide-react';
import { ProjectDeltaEvent } from './types';

interface ProjectDeltaProps {
  events: ProjectDeltaEvent[];
  onViewAll?: () => void;
}

export const ProjectDelta: React.FC<ProjectDeltaProps> = ({ events, onViewAll }) => {
  const [filter, setFilter] = useState<'ALL' | 'ANOMALY' | 'DECISION' | 'PROGRESS'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<ProjectDeltaEvent | null>(null);

  const filteredEvents = events.filter(ev => {
    if (filter === 'ALL') return true;
    if (filter === 'ANOMALY') return ev.badgeColor === 'amber' || ev.badgeColor === 'purple';
    if (filter === 'DECISION') return ev.badgeColor === 'blue' || ev.title.toLowerCase().includes('decision');
    if (filter === 'PROGRESS') return ev.badgeColor === 'cyan' || ev.badgeColor === 'emerald';
    return true;
  });

  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight">
            Project Delta
          </h3>
          <p className="text-[10px] text-slate-500 font-sans">
            Real-time change intelligence
          </p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${
              filter === 'ALL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('ANOMALY')}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${
              filter === 'ANOMALY' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Anomalies
          </button>
          <button
            onClick={() => setFilter('PROGRESS')}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${
              filter === 'PROGRESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Progress
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-1.5 py-2 overflow-y-auto max-h-[220px] custom-scrollbar">
        {filteredEvents.map(ev => {
          let badgeStyle = 'bg-slate-800 text-slate-300';
          if (ev.badgeColor === 'purple') {
            badgeStyle = 'bg-purple-950/60 border border-purple-500/40 text-purple-300';
          } else if (ev.badgeColor === 'cyan') {
            badgeStyle = 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300';
          } else if (ev.badgeColor === 'emerald') {
            badgeStyle = 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300';
          } else if (ev.badgeColor === 'amber') {
            badgeStyle = 'bg-amber-950/60 border border-amber-500/40 text-amber-300';
          } else if (ev.badgeColor === 'blue') {
            badgeStyle = 'bg-blue-950/60 border border-blue-500/40 text-blue-300';
          }

          return (
            <div
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-slate-900/60 border border-transparent hover:border-slate-800 cursor-pointer transition-colors"
            >
              {/* Timestamp */}
              <span className="text-[10px] font-mono text-slate-500 shrink-0 w-10 mt-0.5">
                {ev.time}
              </span>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="text-slate-200 font-medium text-[11px] leading-tight">
                  {ev.title}
                </div>
                <div className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1.5">
                  {ev.badge ? (
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${badgeStyle}`}>
                      {ev.badge}
                    </span>
                  ) : (
                    <span>{ev.description}</span>
                  )}
                  <span className="text-[9px] text-slate-500 font-mono">click to inspect</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0f18] border border-cyan-500/40 rounded-xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-white text-xs">Event Details • {selectedEvent.time}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-100">
                {selectedEvent.title}
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed">
                {selectedEvent.description || 'Continuous telemetry sensor stream recorded significant delta against scheduled milestone baseline.'}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>Provenance: Atlas PDS Kafka Bus</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Logged & Validated
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
