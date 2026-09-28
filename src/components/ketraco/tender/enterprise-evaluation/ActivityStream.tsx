import React from 'react';
import { History, FileText, Cpu, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { ProcurementEvent } from '../../../../types/evaluation';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityStreamProps {
  activity: ProcurementEvent[];
}

export function ActivityStream({ activity }: ActivityStreamProps) {
  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0d0f1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <History className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Unified Activity Stream</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">Live Integrity Audit Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-md border border-white/5">
          <span className="text-[9px] font-mono text-white/40 uppercase">Filter: ALL EVENTS</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px]">
        <div className="relative space-y-6">
          {/* Vertical Line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-white/5" />

          <AnimatePresence initial={false}>
            {activity.map((event, idx) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative pl-10 group"
              >
                {/* Node Dot */}
                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border bg-[#0a0c14] flex items-center justify-center z-10 transition-colors ${
                  idx === 0 ? 'border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'border-white/10'
                }`}>
                  {event.type === 'DOCUMENT_UPLOAD' && <FileText className="w-3 h-3 text-indigo-400" />}
                  {event.type === 'AGENT_COMPLETION' && <Cpu className="w-3 h-3 text-emerald-400" />}
                  {event.type === 'OFFICER_ACTION' && <Clock className="w-3 h-3 text-amber-400" />}
                  {event.type === 'MILESTONE' && <CheckCircle2 className="w-3 h-3 text-white/60" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold tracking-tight uppercase ${idx === 0 ? 'text-white' : 'text-white/40'}`}>
                      {event.title}
                    </span>
                    <span className="text-[9px] text-white/20">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className={`leading-relaxed ${idx === 0 ? 'text-white/70' : 'text-white/30'}`}>
                    {event.description}
                  </p>
                  
                  {event.metadata && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(event.metadata).map(([key, val]) => (
                        <div key={key} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-white/40">
                          <span className="opacity-50">{key.toUpperCase()}:</span> {String(val)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
