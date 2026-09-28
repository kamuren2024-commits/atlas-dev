import React, { useState } from 'react';
import { SupplyReadinessItem } from './types';
import { Package, X, CheckCircle2, ShieldAlert, Truck } from 'lucide-react';

interface SupplyReadinessProps {
  materials: SupplyReadinessItem[];
  demandPercent?: number;
  availablePercent?: number;
  committedPercent?: number;
  forecastPercent?: number;
}

export const SupplyReadiness: React.FC<SupplyReadinessProps> = ({
  materials,
  demandPercent = 100,
  availablePercent = 82,
  committedPercent = 91,
  forecastPercent = 76
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState<SupplyReadinessItem | null>(null);

  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight">
            Supply Readiness
          </h3>
          <p className="text-[10px] text-slate-500 font-sans">
            Project Material Requirements
          </p>
        </div>
      </div>

      {/* Materials Table */}
      <div className="py-2 overflow-y-auto max-h-[160px] custom-scrollbar">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[9px] font-mono text-slate-500 uppercase border-b border-slate-800/60 pb-1">
              <th className="font-medium pb-1">Material</th>
              <th className="font-medium pb-1 text-center">Req.</th>
              <th className="font-medium pb-1 text-center">Avail.</th>
              <th className="font-medium pb-1 text-center">ETA</th>
              <th className="font-medium pb-1 text-right">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {materials.map(mat => {
              let dotColor = 'bg-emerald-400';
              if (mat.risk === 'CRITICAL') dotColor = 'bg-rose-400';
              else if (mat.risk === 'AT_RISK') dotColor = 'bg-amber-400';

              return (
                <tr
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat)}
                  className="text-[11px] text-slate-300 hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  <td className="py-1.5 font-medium truncate max-w-[90px] text-slate-200">
                    {mat.material}
                  </td>
                  <td className="py-1.5 text-center font-mono text-slate-400">
                    {mat.required}
                  </td>
                  <td className="py-1.5 text-center font-mono text-slate-200">
                    {mat.available}
                  </td>
                  <td className="py-1.5 text-center font-mono text-cyan-400">
                    {mat.eta}
                  </td>
                  <td className="py-1.5 text-right">
                    <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Supply Pressure Breakdown */}
      <div className="pt-2 border-t border-slate-800/60 space-y-1">
        <div className="text-[9px] font-mono text-slate-500 uppercase font-bold">
          Supply Pressure
        </div>
        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
          <div className="bg-slate-900/60 p-1 rounded border border-slate-800/60 text-center">
            <div className="text-slate-500 text-[9px]">Demand</div>
            <div className="text-white font-bold">{demandPercent}%</div>
          </div>
          <div className="bg-slate-900/60 p-1 rounded border border-slate-800/60 text-center">
            <div className="text-slate-500 text-[9px]">Available</div>
            <div className="text-cyan-400 font-bold">{availablePercent}%</div>
          </div>
          <div className="bg-slate-900/60 p-1 rounded border border-slate-800/60 text-center">
            <div className="text-slate-500 text-[9px]">Committed</div>
            <div className="text-emerald-400 font-bold">{committedPercent}%</div>
          </div>
          <div className="bg-slate-900/60 p-1 rounded border border-slate-800/60 text-center">
            <div className="text-slate-500 text-[9px]">Forecast</div>
            <div className="text-amber-400 font-bold">{forecastPercent}%</div>
          </div>
        </div>
      </div>

      {/* Material Inspection Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a0f18] border border-cyan-500/40 rounded-xl shadow-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-white text-xs">{selectedMaterial.material}</span>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Required Quantity</div>
                  <div className="text-white font-bold">{selectedMaterial.required} units</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Available Stock</div>
                  <div className="text-emerald-400 font-bold">{selectedMaterial.available} units</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Port of Entry / Depot:</span>
                  <span className="text-white font-bold">Mombasa Port Berth 4</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Expected Delivery:</span>
                  <span className="text-cyan-400 font-bold">{selectedMaterial.eta}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Risk Level:</span>
                  <span
                    className={`font-bold ${
                      selectedMaterial.risk === 'CRITICAL'
                        ? 'text-rose-400'
                        : selectedMaterial.risk === 'AT_RISK'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedMaterial.risk}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400">
                Quality Inspection: <span className="text-emerald-400 font-semibold">ISO 9001 Batch Certified</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedMaterial(null)}
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
