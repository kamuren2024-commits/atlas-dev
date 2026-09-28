// MaintenanceOperationsFusion - KETRACO Phase 06 SAP EAM x Grid Operational Risk Fusion

import React, { useState } from 'react';
import { 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Calendar, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles,
  Search
} from 'lucide-react';
import { MaintenanceRiskFusionItem } from './types';

interface MaintenanceOperationsFusionProps {
  items: MaintenanceRiskFusionItem[];
  onOpenAsset360?: (assetId: string) => void;
  onOpenDecisionBrief?: (incidentId: string) => void;
}

export default function MaintenanceOperationsFusion({
  items,
  onOpenAsset360,
  onOpenDecisionBrief
}: MaintenanceOperationsFusionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => 
    item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.eamWorkOrder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyBadge = (urgency: MaintenanceRiskFusionItem['maintenanceUrgency']) => {
    switch (urgency) {
      case 'IMMEDIATE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            IMMEDIATE (P1)
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
            HIGH URGENCY
          </span>
        );
      case 'PLANNED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40">
            PLANNED WINDOW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-700 text-slate-300">
            ROUTINE
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#080e1a] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      
      {/* Header */}
      <div className="p-3 bg-[#0a1222] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-500/30">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              MAINTENANCE x OPERATIONS RISK FUSION (SAP EAM)
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              Cross-Domain Asset Degradation, Overdue Work Orders & Real-time Grid Exposure
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search work orders / assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Grid Risk Matrix & Table */}
      <div className="p-3 space-y-2 max-h-[580px] overflow-y-auto">
        {filteredItems.map(item => (
          <div
            key={item.assetId}
            className="p-3 rounded-lg bg-[#0a1222]/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 font-mono text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-[13px]">{item.assetName}</span>
                <span className="text-[10px] text-slate-400">({item.voltageKV} kV • {item.substationRegion})</span>
                <span className="text-[10px] text-cyan-400">WO: {item.eamWorkOrder}</span>
              </div>
              <div className="flex items-center gap-2">
                {getUrgencyBadge(item.maintenanceUrgency)}
                <span className="text-[11px] font-bold text-rose-400">
                  Risk Score: {item.combinedPriorityScore}/100
                </span>
              </div>
            </div>

            {/* 4 Multi-Factor Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded bg-slate-950/60 border border-slate-800/80 text-center text-[10px]">
              <div>
                <span className="text-slate-400">CRITICALITY:</span>{' '}
                <strong className="text-cyan-300">{item.criticalityScore} / 10</strong>
              </div>
              <div>
                <span className="text-slate-400">OVERDUE BY:</span>{' '}
                <strong className={item.daysOverdue > 20 ? 'text-rose-400' : 'text-amber-400'}>
                  {item.daysOverdue} days
                </strong>
              </div>
              <div>
                <span className="text-slate-400">OP EXPOSURE:</span>{' '}
                <strong className="text-amber-300">{item.operationalExposure}%</strong>
              </div>
              <div>
                <span className="text-slate-400">FAIL PROB:</span>{' '}
                <strong className="text-rose-400">{item.failureProbabilityPct}%</strong>
              </div>
            </div>

            {/* Grid Impact Narrative */}
            <div className="text-[11.5px] text-slate-300">
              <span className="text-slate-400 font-bold">GRID IMPACT IF FAILED:</span> {item.gridImpactIfFailed}
            </div>

            {/* Recommended Action & Window */}
            <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11.5px] text-cyan-200">
                <span className="font-bold text-cyan-400">OPTIMAL MAINTENANCE ACTION:</span> {item.recommendedAction}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAsset360?.(item.assetId)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  ASSET 360
                </button>
                <button
                  onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  ESCALATE WORK ORDER
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
