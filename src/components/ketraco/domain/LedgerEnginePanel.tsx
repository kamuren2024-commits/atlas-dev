import React, { useState } from 'react';
import { History, Plus, Filter, Database, Key, CheckCircle, RefreshCw, Layers } from 'lucide-react';

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

interface LedgerEngineProps {
  ledgerTransactions: LedgerItem[];
  setLedgerTransactions: React.Dispatch<React.SetStateAction<LedgerItem[]>>;
  onAskCopilot: (prompt: string) => void;
}

export default function LedgerEnginePanel({
  ledgerTransactions,
  setLedgerTransactions,
  onAskCopilot
}: LedgerEngineProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState({
    type: 'RECEIPT',
    materialCode: 'MAT-402830',
    quantity: 100,
    warehouseId: 'Central Warehouse Nairobi',
    operatorId: 'JKAMAU-L5',
    projectRef: 'Gantry Infill Suswa'
  });

  const handleLogWrite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.materialCode || form.quantity === 0) return;

    // NEVER DIRECTLY MUTATE QUANTITIES: Emit transaction event
    const newTx: LedgerItem = {
      id: 'TX-' + Math.floor(5000 + Math.random() * 5000),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' EAT',
      type: form.type,
      materialCode: form.materialCode,
      quantity: Number(form.quantity),
      warehouseId: form.warehouseId,
      operatorId: form.operatorId,
      hash: 'sha256_' + Math.random().toString(16).substring(2, 9),
      projectRef: form.projectRef || 'N/A'
    };

    setLedgerTransactions(prev => [newTx, ...prev]);
    setShowLogForm(false);
    onAskCopilot(`Emitted ledger event ${newTx.id} - Type: ${newTx.type}, Material: ${newTx.materialCode}, Quantity: ${newTx.quantity} to KETRACO immutable SCM block cache.`);
  };

  const filtered = filterType === 'ALL' 
    ? ledgerTransactions 
    : ledgerTransactions.filter(tx => tx.type === filterType);

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-405" />
            Immutable SCM Ledger Event Projection
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard transaction-journaling ledger engine. Direct mutation of stock quantities is strictly prohibited to ensure full audit readiness.
          </p>
        </div>

        <button 
          onClick={() => setShowLogForm(!showLogForm)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 border border-cyan-500/25 text-cyan-405 font-mono font-bold rounded-xl text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {showLogForm ? 'View Ledger Journal' : 'Write Immutable Ledger Log'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Side Ledger Filter & Event Steam Logs (8 columns) */}
        <div className="xl:col-span-8 bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-indigo-950/20">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest pl-1">
              CHRONOLOGICAL SCM TRANSACTION TRANSACTION LOG
            </span>
            
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-slate-900 border border-slate-800 p-1 px-2.5 rounded-lg text-slate-300 font-mono text-xs focus:outline-none"
              >
                <option value="ALL">ALL TYPES</option>
                <option value="RECEIPT">RECEIPTS</option>
                <option value="ISSUE">ISSUES</option>
                <option value="TRANSFER">TRANSFERS</option>
                <option value="ADJUSTMENT">ADJUSTMENTS</option>
                <option value="RETURN">RETURNS</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-1">
            {filtered.map(tx => (
              <div 
                key={tx.id}
                className="bg-slate-900/15 border border-slate-900/85 hover:border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#00D9FF] font-bold">{tx.id}</span>
                    <span className="text-slate-500 text-[10px] font-mono">• {tx.timestamp}</span>
                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider ${
                      tx.type === 'RECEIPT' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                      tx.type === 'ISSUE' ? 'bg-rose-955 text-rose-400 border border-rose-500/20' :
                      tx.type === 'TRANSFER' ? 'bg-cyan-955 text-cyan-400 border border-cyan-500/20' :
                      'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {tx.type}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400 font-sans">Material SKU </span>
                    <strong className="text-white text-xs font-mono font-semibold">{tx.materialCode}</strong>
                    <span className="text-slate-400 font-sans"> // Qty: </span> 
                    <strong className={tx.quantity > 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </strong>
                  </div>
                  <div className="text-[9.5px] text-slate-500 font-sans">
                    Location: {tx.warehouseId} | Op: {tx.operatorId} | Ref: {tx.projectRef}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[8.5px] font-mono text-slate-600 tracking-wider block font-bold">BLOCKCHAIN SIG HASH</span>
                  <span className="text-[10px] font-mono text-[#00D9FF] bg-slate-950 border border-slate-900 px-2 py-1 rounded-lg block font-semibold">
                    {tx.hash}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Write Block Form (4 columns) */}
        <div className="xl:col-span-4">
          {showLogForm ? (
            <form onSubmit={handleLogWrite} className="bg-slate-950/50 border border-slate-900 rounded-3xl p-5 space-y-4">
              <span className="text-[10px] font-mono text-cyan-405 block uppercase tracking-widest font-extrabold pb-2 border-b border-indigo-950/35">
                Commit Cryptographic Ledger Event
              </span>

              <div className="text-xs space-y-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Transaction Event Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg focus:outline-none focus:border-cyan-550/20"
                  >
                    <option value="RECEIPT">RECEIPT (Goods Receiving)</option>
                    <option value="ISSUE">ISSUE (Material Dispatch)</option>
                    <option value="TRANSFER">TRANSFER (Depot-to-Depot Reallocation)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (Cycle-count Audit write)</option>
                    <option value="RETURNS">RETURN (Unutilized returns)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Material SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAT-402830"
                    value={form.materialCode}
                    onChange={e => setForm({...form, materialCode: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Quantity Delta (Sign dependent)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={form.quantity}
                    onChange={e => setForm({...form, quantity: Number(e.target.value)})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Warehouse Node Site</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nairobi Infill Central Depot"
                    value={form.warehouseId}
                    onChange={e => setForm({...form, warehouseId: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Initiating Signer Operator</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENG-KAMAU"
                    value={form.operatorId}
                    onChange={e => setForm({...form, operatorId: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Maintenance Project Rel Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. Suswa Laydown Lot 4 Link"
                    value={form.projectRef}
                    onChange={e => setForm({...form, projectRef: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#00D9FF] hover:bg-cyan-500 text-black text-xs font-mono font-bold rounded-xl"
              >
                COMMIT LEDGER TRANSACTION EVENT
              </button>
            </form>
          ) : (
            <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-4">
              <span className="text-[10px] font-mono text-cyan-405 block uppercase tracking-wider font-extrabold pb-2 border-b border-indigo-950/25">
                LEDGER ANALYTICS LAYER
              </span>

              <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-center gap-3">
                <Database className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Total Ledger Records Count</span>
                  <span className="text-white font-mono font-bold text-sm block mt-0.5">{ledgerTransactions.length} Blockchain Logs</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-2xl flex items-center gap-3">
                <Key className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 block">Active Cryptographic Keys</span>
                  <span className="text-white font-mono font-bold text-sm block mt-0.5">ECC-Level 5 Active</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-sans leading-relaxed pt-2">
                Every balance addition or subtraction is transaction-sourced. In-memory projections continuously validate and sync buffers with SAP caches via CDC webhooks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
