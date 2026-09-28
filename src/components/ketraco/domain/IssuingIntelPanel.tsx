import React, { useState } from 'react';
import { Send, FileText, CheckCircle, Sliders, RefreshCw, Layers } from 'lucide-react';

interface IssuingRequest {
  id: string;
  requestId: string;
  materialCode: string;
  requestedQty: number;
  projectRef: string;
  purpose: string;
  step: string;
  status: string;
  authorizedSigner?: string;
}

interface LedgerItem {
  id: string;
  timestamp: string;
  type: string;
  materialCode: string;
  quantity: number;
  warehouseId: string;
  operatorId: string;
  hash: string;
  projectRef: string;
}

interface InventoryItem {
  id: string;
  name: string;
  currentQty: number;
}

interface IssuingIntelPanelProps {
  issuingRequests: IssuingRequest[];
  setIssuingRequests: React.Dispatch<React.SetStateAction<IssuingRequest[]>>;
  materials: InventoryItem[];
  setMaterials: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setLedgerTransactions: React.Dispatch<React.SetStateAction<LedgerItem[]>>;
  onAskCopilot: (prompt: string) => void;
}

export default function IssuingIntelPanel({
  issuingRequests,
  setIssuingRequests,
  materials,
  setMaterials,
  setLedgerTransactions,
  onAskCopilot
}: IssuingIntelPanelProps) {
  const [selectedRequest, setSelectedRequest] = useState<string>(issuingRequests[0]?.id || '');
  const activeRequest = issuingRequests.find(r => r.id === selectedRequest) || issuingRequests[0];

  const handleApplyDispatch = (requestId: string) => {
    setIssuingRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        // Dedect from materials count on dispatching
        setMaterials(prevMaterials => prevMaterials.map(m => {
          if (m.id === r.materialCode) {
            return {
              ...m,
              currentQty: Math.max(0, m.currentQty - r.requestedQty)
            };
          }
          return m;
        }));

        // Append to immutable SCM ledger
        const newTx: LedgerItem = {
          id: 'TX-ISS' + Math.floor(1000 + Math.random() * 9000),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' EAT',
          type: 'ISSUE',
          materialCode: r.materialCode,
          quantity: -r.requestedQty,
          warehouseId: 'Central Warehouse Nairobi',
          operatorId: 'JKAMAU-L5',
          hash: 'sha256_iss_' + Math.random().toString(16).substring(2, 8),
          projectRef: r.projectRef
        };
        setLedgerTransactions(prevLedger => [newTx, ...prevLedger]);
        onAskCopilot(`Material dispatch finalized for ${r.requestedQty} units of ${r.materialCode} issued to ${r.projectRef}. Stock debited successfully.`);

        return {
          ...r,
          step: 'LEDGER_UPDATE',
          status: 'Completed',
          authorizedSigner: 'Eng. J. Kamau'
        };
      }
      return r;
    }));
  };

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-405" />
          Material Dispatching & Consumption Hub
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Authorized material dispatch pipelines for active grid development substations, layout maintenance, and project laydowns.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Side Dispatch request lists (5 columns) */}
        <div className="xl:col-span-12 lg:xl:col-span-5 bg-slate-950/40 border border-slate-900 rounded-3xl p-4.5 space-y-4">
          <span className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold tracking-widest pl-1">
            ACTIVE CONSUMPTION CONFLICT WORKORDERS
          </span>

          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {issuingRequests.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRequest(r.id)}
                className={`w-full text-left p-4 rounded-2xl border flex flex-col gap-1.5 transition-all ${
                  selectedRequest === r.id
                    ? 'bg-gradient-to-r from-indigo-950/30 to-slate-900 border-cyan-500/35 text-[#00D9FF]'
                    : 'bg-slate-900/15 border-slate-900 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start w-full font-mono text-[10px]">
                  <span className="font-bold">{r.requestId}</span>
                  <span className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold ${
                    r.status === 'Completed' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-slate-950 text-slate-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-xs leading-snug font-sans truncate block w-full">
                  Substation: <strong className="text-white font-mono">{r.projectRef}</strong>
                </div>
                <div className="flex justify-between items-baseline text-[9.5px] text-slate-500 pt-1">
                  <span>SKU: {r.materialCode}</span>
                  <span className="font-mono">{r.requestedQty} Units</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Step-by-Step Picking and Issue Gate (7 columns) */}
        <div className="xl:col-span-12 lg:xl:col-span-7">
          {activeRequest ? (
            <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-start border-b border-indigo-950/30 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-405 block uppercase font-bold">
                    CONSUMPTION DISPATCH GATE // {activeRequest.requestId}
                  </span>
                  <h3 className="text-xs text-white font-bold mt-1.5 leading-relaxed font-sans">
                    Project Destination: {activeRequest.projectRef}
                  </h3>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-900 rounded-2xl">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">STAGE STATE</span>
                  <span className="font-mono text-[#00D9FF] font-bold text-xs block truncate mt-0.5">
                    {activeRequest.step}
                  </span>
                </div>
              </div>

              {/* Form Layout Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">MATERIALS SKU REQUEST</span>
                  <span className="text-slate-205 font-mono font-bold">{activeRequest.materialCode}</span>
                </div>
                <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">TOTAL VOLUME DISPATCH</span>
                  <span className="text-slate-205 font-mono font-bold text-[#00D9FF]">{activeRequest.requestedQty} Units</span>
                </div>
                <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">WORK ORDER INTENT</span>
                  <span className="text-slate-205 font-bold">{activeRequest.purpose}</span>
                </div>
                <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">LEVEL AUTHORIZATION</span>
                  <span className="text-slate-205 font-bold text-[#00D9FF]">Signed Admin L5</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2 text-xs">
                <span className="text-[9.5px] font-mono text-[#00D9FF] block uppercase font-bold">Authorized Dispatch Safe Gate Audit</span>
                <div className="flex justify-between items-baseline pb-1.5 border-b border-indigo-950/20">
                  <span className="text-slate-350 font-sans">Authorized technical layout designs validation</span>
                  <span className="font-bold text-emerald-400 font-mono">✓ Passed</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-350 font-sans">Sufficient material quantity balance on hand</span>
                  <span className="font-bold text-emerald-400 font-mono">✓ Verified</span>
                </div>
              </div>

              {/* Technical Action Gateway */}
              <div className="pt-2 border-t border-indigo-950/20 space-y-3">
                <span className="text-[10px] font-mono text-cyan-405 block uppercase font-bold">DISPATCH CARGO HANDOFF GATE</span>
                <div className="flex gap-2.5">
                  {activeRequest.status !== 'Completed' ? (
                    <button
                      onClick={() => handleApplyDispatch(activeRequest.id)}
                      className="flex-1 py-3 bg-gradient-to-r from-red-950/80 to-indigo-950/80 hover:from-red-900 hover:to-indigo-900 text-rose-300 border border-red-500/35 rounded-xl text-xs font-mono font-bold cursor-pointer"
                    >
                      COMMIT DISPATCH CARGO & UPDATE LEDGER
                    </button>
                  ) : (
                    <div className="w-full text-center p-3 bg-emerald-950/20 border border-emerald-500/25 rounded-2xl text-emerald-450 font-mono text-xs uppercase animate-pulse">
                      ✓ Material Dispatched. Immutable SCM ledger updated.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Select an active consumption work order from the left list to inspect technical laydowns & dispatch gates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
