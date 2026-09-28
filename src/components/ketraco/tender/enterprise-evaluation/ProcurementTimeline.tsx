import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Calendar, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';

export function ProcurementTimeline() {
  const events = [
    { title: 'Tender Opened', date: '2026-06-01', status: 'COMPLETED', type: 'MILESTONE' },
    { title: 'Bid Submission Deadline', date: '2026-06-15', status: 'COMPLETED', type: 'MILESTONE' },
    { title: 'Technical Evaluation Start', date: '2026-06-16', status: 'COMPLETED', type: 'PROCESS' },
    { title: 'Agentic Document Audit', date: '2026-06-17', status: 'RUNNING', type: 'AI_AGENT' },
    { title: 'Financial Evaluation', date: '2026-06-25', status: 'PENDING', type: 'PROCESS' },
    { title: 'Award Notification', date: '2026-07-01', status: 'PENDING', type: 'MILESTONE' },
  ];

  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl p-8 h-full">
      <div className="max-w-2xl mx-auto py-10">
        <div className="relative space-y-12">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-white/5 to-white/5" />

          {events.map((event, idx) => (
            <div key={idx} className="relative pl-16 group">
              {/* Dot */}
              <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-2 bg-[#0a0c14] z-10 transition-all ${
                event.status === 'COMPLETED' ? 'border-emerald-500' :
                event.status === 'RUNNING' ? 'border-indigo-500 animate-pulse scale-125' :
                'border-white/10'
              }`} />

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono font-bold uppercase ${
                    event.status === 'COMPLETED' ? 'text-emerald-400' :
                    event.status === 'RUNNING' ? 'text-indigo-400' :
                    'text-white/20'
                  }`}>
                    {event.date}
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <h4 className={`text-sm font-bold tracking-tight ${
                  event.status === 'PENDING' ? 'text-white/30' : 'text-white'
                }`}>
                  {event.title}
                </h4>
                <p className="text-[11px] text-white/30 mt-1 uppercase tracking-widest font-mono">
                  Type: {event.type} • Status: {event.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
