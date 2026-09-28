import React, { useState } from 'react';
import { CheckCircle, FileText, Activity, AlertTriangle, RefreshCw, Send, Layers } from 'lucide-react';

interface ReceivingContract {
  id: string;
  poReference: string;
  materialCode: string;
  expectedQty: number;
  receivedQty: number;
  inspectionPassed: boolean;
  varianceDetected: boolean;
  qualityStatus: string;
  approvalStatus: string;
  step: string;
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
}

interface ReceivingIntelPanelProps {
  receivingContracts: ReceivingContract[];
  setReceivingContracts: React.Dispatch<React.SetStateAction<ReceivingContract[]>>;
  materials: InventoryItem[];
  setLedgerTransactions: React.Dispatch<React.SetStateAction<LedgerItem[]>>;
  onAskCopilot: (prompt: string) => void;
}

export default function ReceivingIntelPanel({
  receivingContracts,
  setReceivingContracts,
  materials,
  setLedgerTransactions,
  onAskCopilot
}: ReceivingIntelPanelProps) {
  const [selectedPo, setSelectedPo] = useState<string>(receivingContracts[0]?.id || '');
  const activeContract = receivingContracts.find(c => c.id === selectedPo) || receivingContracts[0];

  const handleApplyWorkflowStep = (contractId: string, nextStep: string) => {
    setReceivingContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        let updated = { ...c, step: nextStep };
        if (nextStep === 'QUALITY_ACCEPTANCE') {
          updated.inspectionPassed = true;
          updated.qualityStatus = 'PASSED';
        } else if (nextStep === 'LEDGER_UPDATE') {
          updated.approvalStatus = 'APPROVED';
          
          // Emit immutable ledger log event automatically!
          const txId = 'TX-REC' + Math.floor(1000 + Math.random() * 9000);
          const newTx: LedgerItem = {
            id: txId,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' EAT',
            type: 'RECEIPT',
            materialCode: c.materialCode,
            quantity: c.receivedQty,
            warehouseId: 'Mombasa Port Depot',
            operatorId: 'JKAMAU-L5',
            hash: 'sha256_rec_' + Math.random().toString(16).substring(2, 8),
            projectRef: `ERP PO Ref: ${c.poReference}`
          };
          setLedgerTransactions(ledger => [newTx, ...ledger]);
          onAskCopilot(`Goods received under PO ${c.poReference} for ${c.receivedQty} units of ${c.materialCode}. Ledger updated with receipt entry.`);
        }
        return updated;
      }
      return c;
    }));
  };

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-cyan-405" />
          Intel-Driven Goods Receiving Workflow
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Structured Goods Receipt verification pipeline (ERP PO → Delivery → Inbound Inspection → Technical Certification → Immutable Ledger Append).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Side Inbound POs list (5 columns) */}
        <div className="xl:col-span-5 bg-slate-950/40 border border-slate-900 rounded-3xl p-4.5 space-y-4">
          <span className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold tracking-widest pl-1">
            PENDING ERP INBOUND DELIVERIES
          </span>

          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {receivingContracts.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedPo(c.id)}
                className={`w-full text-left p-4 rounded-2xl border flex flex-col gap-1.5 transition-all ${
                  selectedPo === c.id
                    ? 'bg-gradient-to-r from-indigo-950/30 to-slate-900 border-cyan-500/35 text-[#00D9FF]'
                    : 'bg-slate-900/15 border-slate-900 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start w-full font-mono text-[10px]">
                  <span className="font-bold">{c.poReference}</span>
                  <span className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold ${
                    c.step === 'LEDGER_UPDATE' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-slate-950 text-slate-400'
                  }`}>
                    {c.step}
                  </span>
                </div>
                <div className="text-xs leading-snug font-sans">
                  SKU: <strong className="font-mono text-xs">{c.materialCode}</strong> | Qty: {c.receivedQty}
                </div>
                <div className="flex justify-between items-baseline text-[9.5px] text-slate-550 pt-1">
                  <span>Inspector passed: {c.inspectionPassed ? 'YES' : 'PENDING'}</span>
                  <span className={c.varianceDetected ? 'text-rose-400' : 'text-slate-500'}>
                    {c.varianceDetected ? '⚠ Variance Detected' : 'No Variance'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Step-by-Step Delivery Inspection Detail (7 columns) */}
        <div className="xl:col-span-7">
          {activeContract ? (
            <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-start border-b border-indigo-950/30 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-405 block uppercase font-bold">
                    INBOUND DETAIL VIEW // PO-{activeContract.poReference}
                  </span>
                  <p className="text-xs text-white font-bold mt-1.5 font-sans leading-relaxed">
                    Expected Materials: {activeContract.expectedQty} Units of {activeContract.materialCode}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-900 rounded-2xl">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">STAGE STATE</span>
                  <span className="font-mono text-[#00D9FF] font-bold text-xs block truncate mt-0.5">
                    {activeContract.step}
                  </span>
                </div>
              </div>

              {/* Graphical Visual Timeline Pipeline */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] p-3 bg-slate-900/10 border border-slate-900 rounded-2xl font-mono">
                <div className="p-2 bg-slate-950 rounded-xl border border-cyan-500/20 text-[#00D9FF]">
                  <span>1. ERP PO</span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  activeContract.step !== 'TECHNICAL_INSPECTION' ? 'bg-slate-950 border-cyan-500/20 text-[#00D9FF]' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <span>2. INSPECTION</span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  activeContract.step === 'QUALITY_ACCEPTANCE' || activeContract.step === 'LEDGER_UPDATE' ? 'bg-slate-950 border-cyan-500/20 text-[#00D9FF]' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <span>3. QUALITY</span>
                </div>
                <div className={`p-2 rounded-xl border ${
                  activeContract.step === 'LEDGER_UPDATE' ? 'bg-slate-950 border-cyan-500/20 text-[#00D9FF]' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <span>4. COMMITTED</span>
                </div>
              </div>

              {/* Context checklist */}
              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2 text-xs">
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Inbound Technical Inspections</span>
                <div className="flex justify-between items-baseline pb-1.5 border-b border-indigo-950/20">
                  <span className="text-slate-350">Material dimension matching & tolerance checklist</span>
                  <span className="font-bold text-emerald-400 font-mono">✓ Passed</span>
                </div>
                <div className="flex justify-between items-baseline pb-1.5 border-b border-indigo-950/20">
                  <span className="text-slate-350">Galvanization thickness testing insulation values</span>
                  <span className="font-bold text-emerald-400 font-mono">✓ Passed</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-350">Physical quantity variance count match against PO line</span>
                  <span className={`font-bold font-mono ${activeContract.varianceDetected ? 'text-amber-500' : 'text-emerald-400'}`}>
                    {activeContract.varianceDetected ? '⚠ Discrepancy (-20 units)' : '✓ Matched'}
                  </span>
                </div>
              </div>

              {/* Technical Action Gateway */}
              <div className="pt-2 border-t border-indigo-950/20 space-y-3">
                <span className="text-[10px] font-mono text-cyan-405 block uppercase font-bold">DECISION GATE ACTIONS</span>
                <div className="flex gap-2.5">
                  {activeContract.step === 'TECHNICAL_INSPECTION' && (
                    <button
                      onClick={() => handleApplyWorkflowStep(activeContract.id, 'QUALITY_ACCEPTANCE')}
                      className="flex-1 py-2.5 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:bg-slate-900 text-cyan-300 border border-cyan-500/20 rounded-xl text-xs font-mono font-bold cursor-pointer"
                    >
                      PASS TECHNICAL INSPECTION
                    </button>
                  )}
                  {activeContract.step === 'QUALITY_ACCEPTANCE' && (
                    <button
                      onClick={() => handleApplyWorkflowStep(activeContract.id, 'LEDGER_UPDATE')}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-mono font-bold cursor-pointer"
                    >
                      APPROVE DELIVERY & AUTOPUSH LEDGER
                    </button>
                  )}
                  {activeContract.step === 'LEDGER_UPDATE' && (
                    <div className="w-full text-center p-3 bg-emerald-950/20 border border-emerald-500/25 rounded-2xl text-emerald-400 font-mono text-xs uppercase animate-pulse">
                      ✓ Material Receipt finalized. Immutable ledger logs created.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Select an inbound PO delivery record from the left list to inspect technical checklist steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
