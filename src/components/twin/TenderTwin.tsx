import React, { useState } from 'react';
import { DigitalTwin } from '../../types/evaluation';
import { LayoutDashboard, Clock, Users, FileCheck, CheckCircle2, AlertCircle, Calendar, ArrowRight, ShieldCheck, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TenderTwinProps {
  twin: DigitalTwin;
}

const TenderTwin: React.FC<TenderTwinProps> = ({ twin }) => {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedBidder, setSelectedBidder] = useState<any | null>(null);
  const [selectedRule, setSelectedRule] = useState<any | null>(null);

  const tenderNode = twin.nodes.find(n => n.id === twin.id);
  const bidders = twin.nodes.filter(n => n.type === 'SUPPLIER');
  const rules = twin.nodes.filter(n => n.type === 'RULE');

  const timeline = [
    { stage: 'Publication', date: '2026-05-10', status: 'Completed', icon: Calendar },
    { stage: 'Opening', date: '2026-06-15', status: 'Completed', icon: Clock },
    { stage: 'Evaluation', date: '2026-07-01', status: 'In Progress', icon: Users },
    { stage: 'Award', date: 'TBD', status: 'Pending', icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-6" id="tender-twin">
      {/* Header */}
      <div className="bg-[#05070D] rounded-2xl p-8 border border-slate-800 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
            {tenderNode?.properties.status || 'EVALUATION'}
          </div>
          <div className="text-slate-400 text-xs font-mono">Updated: {new Date(twin.lastUpdated).toLocaleString()}</div>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-slate-100">{tenderNode?.label}</h1>
        <p className="text-slate-400 max-w-2xl text-sm">{tenderNode?.properties.title || 'Enterprise SCM Procurement Object'}</p>

        <div className="grid grid-cols-4 gap-8 mt-10">
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Participants</div>
            <div className="text-2xl font-bold text-slate-100">{bidders.length} Bidders</div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Rules Applied</div>
            <div className="text-2xl font-bold text-slate-100">{rules.length} Mandatory</div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Committee</div>
            <div className="text-2xl font-bold text-slate-100">5 Members</div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Budget</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">KES 450M</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="bg-[#05070D] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-white/5 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
              <Clock size={18} className="text-blue-500" />
              Tender Timeline
            </h3>
          </div>
          <div className="p-6 relative">
            <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-slate-800" />
            <div className="space-y-8">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                    item.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    item.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse border border-cyan-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    <item.icon size={12} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{item.stage}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</div>
                    <div className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded inline-block ${
                      item.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-white/5 text-slate-400'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bidders & Compliance */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#05070D] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-white/5 flex items-center justify-between">
              <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                <Users size={18} className="text-blue-500" />
                Submitted Bidders
              </h3>
              <button 
                onClick={() => setShowCompareModal(true)}
                className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:underline cursor-pointer"
              >
                Compare All
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Bidder Name</th>
                    <th className="px-6 py-4">Compliance</th>
                    <th className="px-6 py-4">Risk</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bidders.map(bidder => (
                    <tr key={bidder.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-200 text-sm">{bidder.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">PIN: {bidder.properties.pin}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-20">
                            <div className="h-full bg-emerald-500 w-[95%]" />
                          </div>
                          <span className="text-xs font-bold text-emerald-400">95%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle size={14} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Low</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedBidder(bidder)}
                          className="p-2 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Rule Linkages */}
          <div className="bg-[#05070D] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-white/5">
              <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
                <FileCheck size={18} className="text-amber-500" />
                Legal Knowledge Graph
              </h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {rules.map(rule => (
                <div key={rule.id} className="p-4 bg-white/5 rounded-xl border border-slate-800 border-l-4 border-l-amber-500">
                  <div className="font-bold text-slate-100 text-sm mb-1">{rule.label}</div>
                  <div className="text-xs text-slate-400 mb-3">{rule.properties.description}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">MANDATORY</span>
                    <button 
                      onClick={() => setSelectedRule(rule)}
                      className="text-[10px] font-bold text-cyan-400 hover:underline uppercase cursor-pointer"
                    >
                      View Rule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compare All Modal */}
      <AnimatePresence>
        {showCompareModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1220] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Users size={18} className="text-cyan-400" />
                  Cross-Bidder Comparative Intelligence
                </h3>
                <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
              </div>

              <div className="space-y-3">
                {bidders.map((b, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{b.label}</div>
                      <div className="text-slate-400 font-mono">IP: {b.properties?.ipAddress || '192.168.1.50'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold">95% Compliance</div>
                      <div className="text-slate-400 font-mono">Pin: {b.properties?.pin}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bidder Detail Modal */}
      <AnimatePresence>
        {selectedBidder && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1220] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Bidder Profile</h3>
                <button onClick={() => setSelectedBidder(null)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-lg font-bold text-slate-100">{selectedBidder.label}</div>
                <div className="p-3 bg-white/5 rounded-xl border border-slate-800 space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400"><span>Tax PIN:</span><span className="text-slate-200 font-bold">{selectedBidder.properties?.pin}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Submission IP:</span><span className="text-slate-200 font-bold">{selectedBidder.properties?.ipAddress}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Tenant Isolation:</span><span className="text-slate-200 font-bold">{selectedBidder.properties?.tenantId || 'ketraco'}</span></div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedBidder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rule Detail Modal */}
      <AnimatePresence>
        {selectedRule && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1220] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Scale size={18} className="text-amber-400" />
                  Statutory Rule Specification
                </h3>
                <button onClick={() => setSelectedRule(null)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-base font-bold text-slate-100">{selectedRule.label}</div>
                <p className="text-slate-300 leading-relaxed">{selectedRule.properties?.description}</p>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 font-mono">
                  Enforcement Level: MANDATORY PPADA 2015 STATUTORY REQUIREMENT
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedRule(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenderTwin;
