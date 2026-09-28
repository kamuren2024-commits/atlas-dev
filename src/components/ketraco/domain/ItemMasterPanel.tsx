import React, { useState } from 'react';
import { Layers, Plus, Search, FileText, CheckCircle, ShieldAlert, Sparkles, Sliders } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'Conductors' | 'Insulators' | 'Transformers' | 'Circuit Breakers' | 'Gantry Steel' | 'Earthing Kits';
  materialGroup: string;
  criticality: 'CRITICAL_SPARE' | 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  warehouse: string;
  currentQty: number;
  reservedQty: number;
  availableQty: number;
  safetyStock: number;
  reorderPoint: number;
  unit: string;
  leadTime: number;
  supplier: string;
}

interface ItemMasterProps {
  materials: InventoryItem[];
  setMaterials: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  viewingSkuCode: string;
  setViewingSkuCode: (code: string) => void;
  onAskCopilot: (prompt: string) => void;
}

export default function ItemMasterPanel({
  materials,
  setMaterials,
  viewingSkuCode,
  setViewingSkuCode,
  onAskCopilot
}: ItemMasterProps) {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    id: '',
    name: '',
    category: 'Conductors' as any,
    materialGroup: 'SG-ACTIVE',
    criticality: 'MEDIUM' as any,
    location: 'BAY-A1',
    warehouse: 'Central Warehouse Nairobi',
    qty: 100,
    safetyStock: 150,
    unit: 'Units',
    leadTime: 30,
    supplier: ''
  });

  const activeItem = materials.find(m => m.id === viewingSkuCode || m.name.includes(viewingSkuCode)) || materials[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.name) return;

    const newItem: InventoryItem = {
      id: form.id,
      name: form.name,
      category: form.category,
      materialGroup: form.materialGroup,
      criticality: form.criticality,
      location: form.location,
      warehouse: form.warehouse,
      currentQty: form.qty,
      reservedQty: 0,
      availableQty: form.qty,
      safetyStock: form.safetyStock,
      reorderPoint: form.safetyStock,
      unit: form.unit,
      leadTime: form.leadTime,
      supplier: form.supplier || 'Pre-qualified Distributor'
    };

    setMaterials(prev => [...prev, newItem]);
    setViewingSkuCode(newItem.id);
    setShowAddForm(false);
    onAskCopilot(`Added material master entry ${newItem.id} (${newItem.name}) under Category ${newItem.category} to physical inventory register.`);
  };

  const filtered = materials.filter(m => 
    m.id.toLowerCase().includes(search.toLowerCase()) || 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-405" />
            Material & SKU Intelligence Master
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Production-grade Item Master catalog fully federated with KETRACO national grid spares inventory.
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 text-cyan-300 border border-cyan-500/20 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Close Editor' : 'Catalog New SKU'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pointer-events-auto">
        {/* Left Side: SKU Search & List (6 columns) */}
        <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search item code, category or standard design spec..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-550/40"
            />
          </div>

          <div className="space-y-2 h-96 overflow-y-auto scrollbar-thin">
            {filtered.map(m => (
              <button
                key={m.id}
                onClick={() => setViewingSkuCode(m.id)}
                className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                  viewingSkuCode === m.id
                    ? 'bg-indigo-950/30 border-cyan-500/30 text-[#00D9FF]'
                    : 'bg-slate-900/15 border-slate-900 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-mono text-[10.5px] font-bold tracking-wider">{m.id}</span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                    m.criticality === 'CRITICAL_SPARE' 
                      ? 'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                      : m.criticality === 'HIGH'
                        ? 'bg-amber-955 text-amber-500 border border-amber-500/20'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {m.criticality}
                  </span>
                </div>
                <span className="text-xs font-bold truncate leading-snug">{m.name}</span>
                <div className="flex justify-between items-baseline text-[9.5px] text-slate-500">
                  <span>Category: {m.category}</span>
                  <span className="font-mono text-slate-350">{m.currentQty} {m.unit}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Detailed Details Card Or Add Form (7 columns) */}
        <div className="lg:col-span-7">
          {showAddForm ? (
            <form onSubmit={handleCreate} className="bg-slate-950/60 border border-slate-900 rounded-3xl p-5 space-y-4">
              <span className="text-[10px] font-mono text-cyan-405 block uppercase tracking-widest font-extrabold pb-2 border-b border-indigo-950/30">
                ERP Material Catalog Entry Form
              </span>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Material ID Code (SKU)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAT-102932"
                    value={form.id}
                    onChange={e => setForm({...form, id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Criticality Level</label>
                  <select
                    value={form.criticality}
                    onChange={e => setForm({...form, criticality: e.target.value as any})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg focus:outline-none"
                  >
                    <option value="CRITICAL_SPARE">CRITICAL SPARE (Level 5)</option>
                    <option value="HIGH">HIGH SEVERITY (Level 4)</option>
                    <option value="MEDIUM">MEDIUM SEVERITY</option>
                    <option value="LOW">LOW SEVERITY</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Extended Commodity Standard Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cross-Linked Polyethylene High Tension Cable Insulated"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Category Group</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value as any})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg focus:outline-none"
                  >
                    <option value="Conductors">Conductors</option>
                    <option value="Transformers">Transformers</option>
                    <option value="Insulators">Insulators</option>
                    <option value="Circuit Breakers">Circuit Breakers</option>
                    <option value="Gantry Steel">Gantry Steel</option>
                    <option value="Earthing Kits">Earthing Kits</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Default Unit of Measure (UOM)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meters, Units, Kits"
                    value={form.unit}
                    onChange={e => setForm({...form, unit: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Safety Buffer (Min-Threshold)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={form.safetyStock}
                    onChange={e => setForm({...form, safetyStock: Number(e.target.value)})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Import Lead-Time (Days)</label>
                  <input
                    type="number"
                    required
                    placeholder="45"
                    value={form.leadTime}
                    onChange={e => setForm({...form, leadTime: Number(e.target.value)})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Pre-Qualified Manufacturer Partner</label>
                  <input
                    type="text"
                    placeholder="ABB Power Systems, Shanghai Metal Grid Corp etc."
                    value={form.supplier}
                    onChange={e => setForm({...form, supplier: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 p-2 text-white rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00D9FF] hover:bg-cyan-500 text-black rounded-xl text-xs font-mono font-bold"
                >
                  INITIALIZE SKU DATABASE WRITE
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
                >
                  Discard
                </button>
              </div>
            </form>
          ) : activeItem ? (
            <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-5 space-y-5">
              <div className="flex justify-between items-start border-b border-indigo-950/25 pb-4">
                <div>
                  <span className="font-mono text-xs text-[#00D9FF] uppercase tracking-wider block font-bold">
                    SALIENCE ARCHIVE SPEC SHEET // {activeItem.id}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1.5 leading-snug">{activeItem.name}</h3>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-2xl block text-center">
                  <span className="text-[9px] font-mono text-slate-500 block tracking-wider uppercase">SAFETY LEVEL</span>
                  <span className="font-mono text-[#00D9FF] font-bold text-sm block mt-0.5">{activeItem.safetyStock}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4.5 text-xs">
                <div className="p-3.5 bg-slate-950/40 border border-slate-900/50 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">MATERIAL GROUP</span>
                  <span className="text-slate-200 font-bold">{activeItem.materialGroup}</span>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-900/50 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">STANDARD STORAGE CO</span>
                  <span className="text-slate-200 font-bold">{activeItem.location}</span>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-900/50 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">DEPOT DESIGNATION</span>
                  <span className="text-slate-200 font-bold truncate block">{activeItem.warehouse}</span>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-900/50 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">LEAD TIME ON ORDER</span>
                  <span className="text-slate-200 font-mono font-bold text-amber-500">{activeItem.leadTime} Days</span>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-900/50 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">UOM BASE UNIT</span>
                  <span className="text-slate-200 font-bold">{activeItem.unit}</span>
                </div>
                <div className="p-3.5 bg-slate-950/40 border border-slate-900/50 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 block">MAPPED MANUFACTURER</span>
                  <span className="text-slate-205 font-bold truncate block" title={activeItem.supplier}>{activeItem.supplier}</span>
                </div>
              </div>

              <div className="border border-indigo-950/30 rounded-2xl p-4 bg-slate-900/10 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-mono text-[#00D9FF] font-bold">FEDERATED INTEGRATION RELATIONSHIPS</span>
                  <span className="text-[9.5px] font-mono text-slate-500">REL_MAPPED = 5</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                    <span className="text-[8.5px] text-slate-500 block">SUPPLIER</span>
                    <span className="text-[10px] font-mono text-slate-300 font-semibold block mt-1">APPROVED</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                    <span className="text-[8.5px] text-slate-500 block">POSITION LOC</span>
                    <span className="text-[10px] font-mono text-slate-300 font-semibold block mt-1">{activeItem.location}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                    <span className="text-[8.5px] text-slate-500 block">COMPLIANCE</span>
                    <span className="text-[10px] font-mono text-[#00D9FF] font-semibold block mt-1">PPADA OK</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                    <span className="text-[8.5px] text-slate-500 block">ASSET ID</span>
                    <span className="text-[10px] font-mono text-slate-300 font-semibold block mt-1">KETR-GRID-S</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 text-xs font-mono">
                <button 
                  onClick={() => onAskCopilot(`Perform comprehensive commodity security assessment, supplier performance factors, and depletion forecast for SKU code: ${activeItem.id}`)}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:bg-slate-900 text-[#00D9FF] border border-cyan-500/20 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#00D9FF]" />
                  EXPLAIN SKU WITH AI
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Select an item code from the Item master registry list on the left to inspect specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
