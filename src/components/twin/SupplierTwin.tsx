import React, { useState } from 'react';
import { DigitalTwin } from '../../types/evaluation';
import { Shield, Building2, Users, FileText, AlertTriangle, TrendingUp, History, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupplierTwinProps {
  twin: DigitalTwin;
  onNavigateTender?: (tenderId: string) => void;
}

const SupplierTwin: React.FC<SupplierTwinProps> = ({ twin, onNavigateTender }) => {
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [selectedTenderDetail, setSelectedTenderDetail] = useState<any | null>(null);

  const supplierNode = twin.nodes.find(n => n.id === twin.id);
  const directors = twin.nodes.filter(n => n.type === 'DIRECTOR');
  const tenders = twin.nodes.filter(n => n.type === 'TENDER');
  const risks = twin.edges.filter(e => e.type === 'SHARED_DIRECTOR' || e.type === 'SHARED_ADDRESS');

  return (
    <div className="space-y-6" id="supplier-twin">
      {/* Executive Summary Card */}
      <div className="bg-[#05070D] rounded-2xl p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <div className="flex flex-col items-end">
            <div className={`text-4xl font-bold ${twin.riskScore > 50 ? 'text-rose-600' : 'text-emerald-500'}`}>
              {twin.riskScore}%
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Risk Profile
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
            <Building2 size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{supplierNode?.label}</h1>
            <div className="flex items-center gap-3 mt-2 text-slate-400 text-sm">
              <span className="flex items-center gap-1"><Shield size={14} className="text-emerald-500" /> Compliance: {twin.complianceStatus}</span>
              <span className="w-1 h-1 bg-slate-600 rounded-full" />
              <span>PIN: {supplierNode?.properties.pin}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="p-4 bg-white/5 rounded-xl border border-slate-800">
            <div className="text-slate-400 mb-1 flex items-center gap-2">
              <Users size={14} />
              <span className="text-xs font-bold uppercase">Ownership</span>
            </div>
            <div className="text-xl font-bold text-slate-200">{directors.length} Directors</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-slate-800">
            <div className="text-slate-400 mb-1 flex items-center gap-2">
              <FileText size={14} />
              <span className="text-xs font-bold uppercase">Tenders</span>
            </div>
            <div className="text-xl font-bold text-slate-200">{tenders.length} Active Bids</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-slate-800">
            <div className="text-slate-400 mb-1 flex items-center gap-2">
              <History size={14} />
              <span className="text-xs font-bold uppercase">History</span>
            </div>
            <div className="text-xl font-bold text-slate-200">5 Awards</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-slate-800">
            <div className="text-slate-400 mb-1 flex items-center gap-2">
              <AlertTriangle size={14} />
              <span className="text-xs font-bold uppercase">Risk Signals</span>
            </div>
            <div className="text-xl font-bold text-slate-200">{risks.length} Flags</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Ownership Structure */}
        <div className="col-span-2 bg-[#05070D] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-white/5 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Users size={18} className="text-blue-500" />
              Ownership & Management
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {directors.map(dir => (
                <div key={dir.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#05070D] rounded-full flex items-center justify-center border border-slate-800 text-slate-400">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">{dir.label}</div>
                      <div className="text-xs text-slate-400">{dir.properties.nationality} Nationalist</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-200">
                      {twin.edges.find(e => e.source === dir.id && e.target === twin.id)?.properties.shares || 500} Shares
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Equity Stake</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="bg-[#05070D] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-white/5 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-500" />
              Intelligence Findings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {risks.length === 0 ? (
              <div className="text-center py-8">
                <Shield size={40} className="mx-auto text-emerald-400 mb-3" />
                <p className="text-slate-400 text-sm">No suspicious relationships detected</p>
              </div>
            ) : (
              risks.map(risk => (
                <div key={risk.id} className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase mb-1">
                    <AlertTriangle size={14} />
                    {risk.type.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-slate-300">
                    Shared {risk.type === 'SHARED_DIRECTOR' ? 'ownership' : 'infrastructure'} with another bidder in Tender 2026-08.
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-400">CONFIDENCE: {((risk.confidence || 1) * 100).toFixed(0)}%</div>
                    <button 
                      onClick={() => setSelectedRisk(risk)}
                      className="text-[10px] font-bold text-cyan-400 hover:underline uppercase cursor-pointer"
                    >
                      View Connection
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Historical Performance */}
      <div className="bg-[#05070D] rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-white/5 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            Performance & Historical Tenders
          </h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Tender Ref</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Stage</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tenders.map(tender => (
                <tr key={tender.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-cyan-400">{tender.label}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{tender.properties.title || 'Supply of Goods'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-[10px] font-bold uppercase">
                      {tender.properties.status || 'EVALUATION'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                      <span className="text-sm text-slate-400">Pending</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedTenderDetail(tender)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-xs uppercase cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connection Detail Modal */}
      <AnimatePresence>
        {selectedRisk && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1220] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Cross-Entity Connection Detail</h3>
                <button onClick={() => setSelectedRisk(null)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
              </div>

              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-rose-400 uppercase">{selectedRisk.type}</div>
                <div className="text-slate-300">
                  Directorship overlap detected between <span className="font-bold text-white">Shanghai Grid Metal Corp</span> and <span className="font-bold text-white">Siemens Energy Ltd Nairobi</span>.
                </div>
                <div className="text-slate-400 font-mono">Confidence Level: {((selectedRisk.confidence || 1) * 100).toFixed(0)}%</div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedRisk(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tender Detail Modal */}
      <AnimatePresence>
        {selectedTenderDetail && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1220] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Tender Participation Summary</h3>
                <button onClick={() => setSelectedTenderDetail(null)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-mono text-cyan-400 font-bold">{selectedTenderDetail.label}</div>
                <div className="text-slate-200 text-sm font-semibold">{selectedTenderDetail.properties?.title || 'Tender Object'}</div>
                <div className="p-3 bg-white/5 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400"><span>Status:</span><span className="text-slate-200 font-bold uppercase">{selectedTenderDetail.properties?.status || 'EVALUATION'}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Tenant:</span><span className="text-slate-200 font-bold uppercase">{selectedTenderDetail.properties?.tenantId || 'ketraco'}</span></div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedTenderDetail(null)}
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

export default SupplierTwin;
