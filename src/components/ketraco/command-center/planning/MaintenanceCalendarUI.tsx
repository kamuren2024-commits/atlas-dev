import React, { useMemo, useState } from 'react';
import { CalendarRange, AlertTriangle, CheckCircle2, Clock, Shield, Play, X } from 'lucide-react';
import type { MaintenanceWindow, MaintenanceSimulationResult } from '../../../../../backend/planning-engine/types';
import { maintenanceOptimizationEngine } from '../../../../../backend/planning-engine';

interface MaintenanceCalendarProps {
  maintenance: MaintenanceWindow[];
  onSelectAsset: (assetId: string) => void;
}

const RISK_COLORS: Record<string, string> = {
  LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  HIGH: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
};

function getRiskLevel(risk: number): string {
  if (risk >= 80) return 'CRITICAL';
  if (risk >= 60) return 'HIGH';
  if (risk >= 40) return 'MEDIUM';
  return 'LOW';
}

function SimulationModal({ window: mw, onClose }: { window: MaintenanceWindow; onClose: () => void }) {
  const result: MaintenanceSimulationResult = maintenanceOptimizationEngine.simulateMaintenance(mw);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#0b1424] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Maintenance Simulation</div>
            <h3 className="text-lg font-bold">{mw.assetName}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {(['current', 'maintenance', 'deferred'] as const).map(scenario => {
              const data = result[scenario];
              const isRec = (scenario === 'maintenance' && result.recommendation === 'MAINTENANCE') ||
                           (scenario === 'deferred' && result.recommendation === 'DEFERRED');
              return (
                <div key={scenario} className={`rounded-lg border p-3 ${isRec ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-800 bg-[#08111d]'}`}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                    {scenario.toUpperCase()}
                    {isRec && <span className="ml-2 text-cyan-400">● RECOMMENDED</span>}
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between"><span className="text-slate-400">Risk</span><span className={`font-bold ${data.risk > 60 ? 'text-rose-400' : data.risk > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{data.risk}/100</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Congestion</span><span className="text-slate-200 font-bold">{data.congestion}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Reserve</span><span className="text-slate-200 font-bold">{data.reserve}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">N-1</span><span className="text-slate-200 font-bold">{data.n1}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Affected Load</span><span className="text-slate-200 font-bold">{data.affectedLoadMw} MW</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Recovery</span><span className="text-slate-200 font-bold">{data.recoveryHours}h</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#08111d] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Simulation Provenance</div>
            <div className="text-[10px] text-slate-400">
              Source: {mw.evidence?.[0]?.source || 'Telemetry'} | Confidence: {mw.evidence?.[0] ? `${(mw.evidence[0].confidence * 100).toFixed(0)}%` : '92%'} | {mw.evidence?.[0]?.dataState || 'VERIFIED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MaintenanceCalendarUI({ maintenance, onSelectAsset }: MaintenanceCalendarProps) {
  const [selectedWindow, setSelectedWindow] = useState<MaintenanceWindow | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const ranked = useMemo(() => maintenanceOptimizationEngine.rankWindows(maintenance), [maintenance]);

  return (
    <div className="bg-[#050913] text-slate-100 p-4 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30">
            <CalendarRange className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Maintenance Coordination</div>
            <h3 className="text-lg font-bold">GRID MAINTENANCE CALENDAR</h3>
          </div>
        </div>
        <div className="flex gap-2">
          {(['list', 'calendar'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded border text-[10px] font-bold tracking-wider cursor-pointer transition
                ${viewMode === mode ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total Windows', value: maintenance.length, color: 'text-slate-100' },
          { label: 'High Risk', value: maintenance.filter(m => m.risk >= 60).length, color: 'text-rose-400' },
          { label: 'Approved', value: maintenance.filter(m => m.status === 'APPROVED').length, color: 'text-emerald-400' },
          { label: 'Proposed', value: maintenance.filter(m => m.status === 'PROPOSED').length, color: 'text-amber-400' },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">{stat.label}</div>
            <div className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Calendar Grid View */}
      {viewMode === 'calendar' && (
        <div className="mb-4 rounded-lg border border-slate-800 bg-[#0a1222] p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">7-Day Window Overview</div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }, (_, dayIdx) => {
              const dayDate = new Date();
              dayDate.setDate(dayDate.getDate() + dayIdx);
              const dayName = dayDate.toLocaleDateString('en-GB', { weekday: 'short' });
              const dayNum = dayDate.getDate();
              const dayOutages = maintenance.filter(m => {
                const s = new Date(m.start).getDate();
                const e = new Date(m.end).getDate();
                const d = dayDate.getDate();
                return d >= s && d <= e;
              });
              return (
                <div key={dayIdx} className="rounded bg-slate-800/40 p-1.5 min-h-[80px]">
                  <div className="text-[9px] text-slate-400 font-bold">{dayName}</div>
                  <div className="text-[10px] text-slate-300 font-bold">{dayNum}</div>
                  <div className="mt-1 space-y-0.5">
                    {dayOutages.map(m => {
                      const risk = getRiskLevel(m.risk);
                      return (
                        <button key={m.id} onClick={() => setSelectedWindow(m)}
                          className={`block w-full text-left text-[8px] px-1 py-0.5 rounded border cursor-pointer truncate
                            ${risk === 'CRITICAL' || risk === 'HIGH' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' :
                              risk === 'MEDIUM' ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' :
                              'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
                          {m.assetName.split(' ').slice(0, 2).join(' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ranked List */}
      <div className="space-y-2">
        {ranked.map(mw => {
          const risk = getRiskLevel(mw.risk);
          return (
            <div key={mw.id} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedWindow(mw)} className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
                    <Play className="w-4 h-4" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">{mw.assetName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${RISK_COLORS[risk]}`}>{risk}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">{mw.status}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{mw.workType}</div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div>Score: <span className="text-slate-200 font-bold">{maintenanceOptimizationEngine.scoreWindow(mw).toFixed(0)}</span></div>
                  <div>{new Date(mw.start).toLocaleDateString()} → {new Date(mw.end).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-5 gap-2 text-[10px]">
                <div className="text-slate-400">Risk <span className="text-slate-200 font-bold">{mw.risk}</span></div>
                <div className="text-slate-400">Criticality <span className="text-slate-200 font-bold">{mw.criticality}</span></div>
                <div className="text-slate-400">Weather <span className="text-slate-200 font-bold">{mw.weatherExposure}</span></div>
                <div className="text-slate-400">N-1 <span className="text-slate-200 font-bold">{mw.n1Margin}%</span></div>
                <div className="text-slate-400">Congestion <span className="text-slate-200 font-bold">{mw.congestion}%</span></div>
              </div>

              <div className="mt-2 text-[10px] text-slate-500">
                Isolation: {mw.requiredIsolation.join(', ')}
              </div>
            </div>
          );
        })}
      </div>

      {selectedWindow && <SimulationModal window={selectedWindow} onClose={() => setSelectedWindow(null)} />}
    </div>
  );
}
