import React, { useState, useEffect } from 'react';
import { ProcurementCase } from '../../types/evaluation';
import { Briefcase, AlertCircle, Clock, CheckCircle2, User, Search, Filter, Plus, ChevronRight, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CaseManagementSystem: React.FC = () => {
  const [cases, setCases] = useState<ProcurementCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<ProcurementCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v4/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedCase(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#080c18] rounded-2xl border border-slate-800/70 overflow-hidden shadow-2xl" id="case-system">
      {/* Case Sidebar List */}
      <div className="w-80 md:w-96 border-r border-slate-800/80 flex flex-col h-full bg-[#060913]">
        <div className="p-5 border-b border-slate-800/70 bg-[#090e1c]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-display">
              <Briefcase size={18} className="text-cyan-400" />
              Procurement Cases
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/20 text-cyan-300 font-bold">
              {filteredCases.length} ACTIVE
            </span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cases, tender IDs, officers..." 
              className="w-full pl-9 pr-3 py-2 bg-[#040711] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="p-4 space-y-3">
              <div className="h-16 bg-slate-800/40 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-800/30 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-800/20 rounded-xl animate-pulse" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-mono">
              No procurement cases match your query.
            </div>
          ) : (
            filteredCases.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedCase?.id === c.id 
                    ? 'bg-[#101828] border-cyan-500/40 shadow-[0_0_15px_rgba(0,217,255,0.08)]' 
                    : 'bg-[#090e1a]/60 border-slate-800/50 hover:border-slate-700/80 hover:bg-[#0c1322]'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    c.status === 'IN_INVESTIGATION' ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30' : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>
                  <span className={`text-[9.5px] font-mono font-bold shrink-0 ${
                    c.priority === 'URGENT' ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {c.priority}
                  </span>
                </div>
                <h3 className="font-bold text-slate-100 text-xs mb-1 line-clamp-2 leading-snug">{c.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/40">
                  <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-slate-400 truncate max-w-[70%]">
                    <User size={11} className="shrink-0 text-cyan-400" />
                    <span className="truncate">{c.assignedOfficer}</span>
                  </div>
                  <div className="text-[9.5px] font-mono text-slate-500 shrink-0">#{c.id}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Case Details View */}
      <div className="flex-1 flex flex-col h-full bg-[#090e1c] overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedCase ? (
            <motion.div
              key={selectedCase.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col h-full"
            >
              <div className="p-6 md:p-8 border-b border-slate-800/70 bg-[#0b1224]/80">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider">
                      {selectedCase.type}
                    </span>
                    <span className="text-slate-400 font-mono text-xs">ID: {selectedCase.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3.5 py-1.5 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer">
                      Transfer Case
                    </button>
                    <button className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer">
                      Resolve Case
                    </button>
                  </div>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-100 font-display leading-tight">{selectedCase.title}</h1>
                <p className="mt-2 text-slate-300 leading-relaxed text-xs md:text-sm max-w-4xl">{selectedCase.description}</p>
              </div>

              <div className="flex-1 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={14} />
                    Investigation Timeline
                  </h3>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {selectedCase.timeline?.map((event, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-6 top-1 w-5 h-5 bg-[#090e1c] border-2 border-cyan-500 rounded-full flex items-center justify-center z-10 shadow-[0_0_8px_rgba(0,217,255,0.4)]">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        </div>
                        <div className="bg-[#0e1628]/60 border border-slate-800/60 p-3 rounded-xl">
                          <div className="font-bold text-slate-200 text-xs">{event.event}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            {new Date(event.timestamp).toLocaleString()} • {event.officer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments & Entities */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FileText size={14} />
                      Linked Evidence ({selectedCase.evidence?.length || 0})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCase.evidence?.map((ev, i) => (
                        <div key={i} className="p-3.5 border border-slate-800/70 rounded-xl flex items-center gap-3 bg-[#0d1424]/70 hover:border-cyan-500/40 transition-colors cursor-pointer group">
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-rose-400 group-hover:text-rose-300">
                            <AlertCircle size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-200 truncate group-hover:text-cyan-300 transition-colors">{ev}</div>
                            <div className="text-[9.5px] font-mono text-slate-400 uppercase">Document Asset</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User size={14} />
                      Related Entities
                    </h3>
                    <div className="space-y-2">
                      {selectedCase.linkedEntities?.map((ent, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 border border-slate-800/60 rounded-xl bg-[#0d1424]/70 hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-cyan-400 shrink-0">
                              <User size={14} />
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-200 truncate">{ent}</span>
                          </div>
                          <ChevronRight size={14} className="text-slate-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-800 text-slate-500">
                <Briefcase size={28} />
              </div>
              <h2 className="text-lg font-bold text-slate-200 font-display">No Case Selected</h2>
              <p className="text-slate-400 mt-1 max-w-sm text-xs leading-relaxed">
                Select a procurement case from the left list to review complete investigation timeline, linked evidence artifacts, and connected entities.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CaseManagementSystem;
