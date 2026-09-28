import React, { useState } from 'react';
import { DigitalTwin } from '../../types/evaluation';
import { LayoutDashboard, Users, FileText, Activity, ShieldCheck, Briefcase, Landmark, PieChart, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrganizationTwinProps {
  twin: DigitalTwin;
}

const OrganizationTwin: React.FC<OrganizationTwinProps> = ({ twin }) => {
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const orgNode = twin.nodes.find(n => n.id === twin.id);
  const tenders = twin.nodes.filter(n => n.type === 'TENDER');

  const stats = [
    { label: 'Active Tenders', value: tenders.length, icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Registered Suppliers', value: 1240, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Evaluation Workload', value: 'High', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Compliance Score', value: '98%', icon: ShieldCheck, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' }
  ];

  return (
    <div className="space-y-6" id="organization-twin">
      {/* Header */}
      <div className="bg-[#05070D] rounded-2xl p-8 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center text-white border border-slate-800">
            <Landmark size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{orgNode?.label}</h1>
            <p className="text-slate-400 mt-1 text-sm">Enterprise Procuring Entity Digital Twin</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                {twin.complianceStatus}
              </span>
              <span className="text-xs text-slate-400 font-mono">Last Knowledge Refresh: {new Date(twin.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#05070D] p-6 rounded-2xl border border-slate-800 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} border rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Departmental Coverage */}
        <div className="col-span-1 bg-[#05070D] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-white/5">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
              <Briefcase size={18} className="text-blue-500" />
              Departments & Units
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {['Transmission', 'Substations', 'Finance', 'Supply Chain', 'Legal'].map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-slate-800 text-xs">
                <span className="font-semibold text-slate-300">{dept}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-400">{3 + idx} Tenders</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Procurement Lifecycle Overview */}
        <div className="col-span-2 bg-[#05070D] rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-white/5 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
              <PieChart size={18} className="text-purple-500" />
              Historical Procurement Trends
            </h3>
            <button 
              onClick={() => setShowAnalyticsModal(true)}
              className="text-[10px] font-bold text-cyan-400 uppercase cursor-pointer hover:underline"
            >
              View All Analytics
            </button>
          </div>
          <div className="p-6">
             <div className="h-64 bg-white/5 rounded-xl border border-dashed border-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <Activity size={32} className="mx-auto text-cyan-400 mb-2" />
                  <p className="text-slate-300 font-semibold text-sm">Interactive Procurement Cycle & Saving Trends</p>
                  <p className="text-slate-500 text-xs mt-1">Real-time throughput metrics synthesized from canonical graph state</p>
                </div>
             </div>
             
             <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-white/5 rounded-xl border border-slate-800">
                   <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg. Cycle Time</div>
                   <div className="text-xl font-bold text-slate-200 font-mono">42 Days</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-slate-800">
                   <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Savings Rate</div>
                   <div className="text-xl font-bold text-emerald-400 font-mono">12.5%</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-slate-800">
                   <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Contract Variations</div>
                   <div className="text-xl font-bold text-rose-400 font-mono">2.1%</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1220] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 size={18} className="text-purple-400" />
                  Enterprise Procurement Performance Analytics
                </h3>
                <button onClick={() => setShowAnalyticsModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-white/5 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Total Portfolio Value:</span>
                    <span className="text-slate-100 font-mono font-bold">KES 4.25 Billion</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Audited Price Variance:</span>
                    <span className="text-emerald-400 font-mono font-bold">1.8% (Within PPRA 10% ceiling)</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Statutory SoD Compliance:</span>
                    <span className="text-cyan-400 font-mono font-bold">100% Verified</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
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

export default OrganizationTwin;
