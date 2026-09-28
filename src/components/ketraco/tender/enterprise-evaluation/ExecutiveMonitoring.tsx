import React from 'react';
import { Activity, LayoutDashboard, Clock, ShieldCheck, Users, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

export function ExecutiveMonitoring() {
  const metrics = [
    { label: 'Running Evaluations', value: '14', icon: Activity, color: 'text-indigo-400', trend: '+2 this hour' },
    { label: 'Avg processing Time', value: '2.4s', icon: Clock, color: 'text-emerald-400', trend: '-150ms improvement' },
    { label: 'AI Confidence avg', value: '94.2%', icon: ShieldCheck, color: 'text-cyan-400', trend: 'STABLE' },
    { label: 'Officer queue', value: '8', icon: Users, color: 'text-amber-400', trend: '3 high priority' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#0a0c14] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono text-white/20 font-bold uppercase tracking-widest">{m.trend}</span>
            </div>
            <h4 className="text-2xl font-bold text-white tracking-tight">{m.value}</h4>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0a0c14] border border-white/5 rounded-2xl p-6 h-80 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Evaluation throughput</h3>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-2 pb-2">
            {[40, 65, 45, 90, 85, 60, 75, 50, 45, 80, 70, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-indigo-500/10 rounded-t-sm relative group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="absolute bottom-0 left-0 right-0 bg-indigo-500/40 rounded-t-sm group-hover:bg-indigo-400 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0c14] border border-white/5 rounded-2xl p-6 h-80 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Risk Distribution</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <RiskMetric label="Critical Risk" value={12} color="bg-red-500" />
            <RiskMetric label="High Risk" value={28} color="bg-orange-500" />
            <RiskMetric label="Medium Risk" value={45} color="bg-amber-500" />
            <RiskMetric label="Low Risk" value={15} color="bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskMetric({ label, value, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-white/40 uppercase">{label}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
