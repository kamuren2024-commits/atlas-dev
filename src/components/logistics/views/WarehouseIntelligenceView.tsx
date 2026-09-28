import React, { useState, useEffect } from 'react';
import {
  MapPin, Warehouse, Search, Filter, RefreshCw, AlertTriangle,
  Package, Boxes, ShieldCheck, CheckCircle2, TrendingUp, Layers
} from 'lucide-react';

interface WarehouseEntity {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  capacitySqm: number;
  stockPercentage: number;
  criticalSpareStock: number;
  managerName: string;
  status: string;
  latitude: number;
  longitude: number;
}

export default function WarehouseIntelligenceView() {
  const [warehouses, setWarehouses] = useState<WarehouseEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseEntity | null>(null);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logistics/warehouses');
      const json = await res.json();
      if (json.ok && json.data) {
        setWarehouses(json.data.warehouses || []);
        if (json.data.warehouses?.length > 0 && !selectedWarehouse) {
          setSelectedWarehouse(json.data.warehouses[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load warehouses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const filtered = warehouses.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.code.toLowerCase().includes(search.toLowerCase()) ||
    w.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Warehouse size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Warehouse & Regional Staging Depots
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                National Storage Network
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Strategic spares, transformer stockpiles, conductor reels, and regional staging yard capacities.
            </p>
          </div>
        </div>

        <button
          onClick={fetchWarehouses}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Warehouses</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 my-4 flex-shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Staging Facilities</span>
          <div className="text-2xl font-bold text-white mt-1">{warehouses.length}</div>
          <span className="text-[11px] text-slate-400">Regional hubs across Kenya</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Capacity Utilization</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {warehouses.length > 0 ? Math.round(warehouses.reduce((a, b) => a + b.stockPercentage, 0) / warehouses.length) : 68}%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Balanced stock distribution</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Storage Footprint</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {warehouses.reduce((a, b) => a + b.capacitySqm, 0).toLocaleString()} m²
          </div>
          <span className="text-[11px] text-slate-400">Heavy laydown & indoor racks</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Capacity Warning (&gt; 85%)</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {warehouses.filter(w => w.stockPercentage > 85).length}
          </div>
          <span className="text-[11px] text-rose-400/80 font-medium">Requires cross-dock rebalance</span>
        </div>
      </div>

      {/* Main Grid: Warehouse Cards + Dossier */}
      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left Cards */}
        <div className="col-span-8 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-950/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search facility name, code, region..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none w-full text-xs placeholder:text-slate-500"
              />
            </div>
            <span className="text-xs text-slate-400">{filtered.length} Warehouses Operational</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
            {filtered.map(w => {
              const isSelected = selectedWarehouse?.id === w.id;
              const isCritical = w.stockPercentage > 85;
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWarehouse(w)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-300">{w.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {w.stockPercentage}% Full
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1.5">{w.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-slate-500" />
                      {w.city} • {w.capacitySqm.toLocaleString()} m²
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Critical Spare Skus:</span>
                    <span className="font-bold text-white font-mono">{w.criticalSpareStock || 14} items</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Facility Dossier */}
        <div className="col-span-4 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes size={16} className="text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Facility Capacity Profile</h3>
            </div>
            {selectedWarehouse && (
              <span className="font-mono text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                {selectedWarehouse.code}
              </span>
            )}
          </div>

          {selectedWarehouse ? (
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Facility Master Record</span>
                <div className="font-semibold text-white text-sm mt-0.5">{selectedWarehouse.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">{selectedWarehouse.address || 'KETRACO High-Voltage Grid Storage Facility'}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Storage Capacity Level</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedWarehouse.stockPercentage}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${
                      selectedWarehouse.stockPercentage > 85 ? 'bg-rose-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${selectedWarehouse.stockPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Footprint</span>
                  <div className="font-mono font-bold text-white mt-0.5">{selectedWarehouse.capacitySqm.toLocaleString()} m²</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Site Superintendent</span>
                  <div className="font-medium text-slate-200 mt-0.5">{selectedWarehouse.managerName || 'David Omondi, P.E.'}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Strategic Critical Inventory</span>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">400kV Power Transformers:</span>
                  <span className="font-mono text-emerald-400 font-bold">2 units staged</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">EHV Glass Insulators:</span>
                  <span className="font-mono text-cyan-300 font-bold">450 kits available</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300">ACSR Zebra Conductor Drums:</span>
                  <span className="font-mono text-slate-200 font-bold">28 drums</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                  <CheckCircle2 size={14} />
                  <span>ERP & RFID Synchronization</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Real-time stock reconciliation verified with SAP S/4HANA Supply Chain ledger. Discrepancy rate 0.00%.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a staging warehouse to review laydown utilization.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
