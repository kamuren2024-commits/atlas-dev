import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Boxes, MapPin, RefreshCw, Search, Warehouse } from 'lucide-react';
import type { LogisticsTwin } from '../logistics-data-fabric';

interface WarehouseIntelligenceViewProps {
  twin: LogisticsTwin;
  loading: boolean;
  error: string | null;
}

export default function WarehouseIntelligenceView({ twin, loading, error }: WarehouseIntelligenceViewProps) {
  const [search, setSearch] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(twin.warehouses[0]?.id ?? null);

  useEffect(() => {
    if (!twin.warehouses.length) {
      setSelectedWarehouseId(null);
      return;
    }

    setSelectedWarehouseId((current) => {
      if (current && twin.warehouses.some((warehouse) => warehouse.id === current)) {
        return current;
      }
      return twin.warehouses[0].id;
    });
  }, [twin.warehouses]);

  const filteredWarehouses = useMemo(() => {
    const query = search.toLowerCase();
    return twin.warehouses.filter((warehouse) => {
      const haystack = `${warehouse.code} ${warehouse.name} ${warehouse.city} ${warehouse.status}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [search, twin.warehouses]);

  const selectedWarehouse =
    filteredWarehouses.find((warehouse) => warehouse.id === selectedWarehouseId) ??
    twin.warehouses.find((warehouse) => warehouse.id === selectedWarehouseId) ??
    twin.warehouses[0] ??
    null;

  const totalFootprint = twin.warehouses.reduce((sum, warehouse) => sum + warehouse.capacitySqm, 0);
  const averageUtilization =
    twin.warehouses.length > 0
      ? Math.round(twin.warehouses.reduce((sum, warehouse) => sum + warehouse.stockPercentage, 0) / twin.warehouses.length)
      : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="mb-3 animate-spin text-cyan-400">⟳</div>
          <p>Loading warehouse network data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-400">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-3 text-yellow-400" />
          <p className="mb-2 font-bold">Data Source Warning</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="logistics-workspace flex h-full flex-col overflow-hidden bg-[#020b14] p-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-cyan-400">
            <Warehouse size={22} />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              Warehouse & Regional Staging Depots
              <span className="rounded-full border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                National Storage Network
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Strategic spares, transformer stockpiles, conductor reels, and regional staging yard capacities.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 transition-all hover:bg-slate-700"
          onClick={() => undefined}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Warehouses</span>
        </button>
      </div>

      <div className="my-4 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Staging Facilities</span>
          <div className="mt-1 text-2xl font-bold text-white">{twin.warehouses.length}</div>
          <span className="text-[11px] text-slate-400">Regional hubs across Kenya</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Capacity Utilization</span>
          <div className="mt-1 text-2xl font-bold text-cyan-400">{averageUtilization}%</div>
          <span className="text-[11px] text-slate-400 font-medium">Across {twin.warehouses.length} reported facilities</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Storage Footprint</span>
          <div className="mt-1 text-2xl font-bold text-amber-400">{totalFootprint.toLocaleString()} m²</div>
          <span className="text-[11px] text-slate-400">Heavy laydown & indoor racks</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">High Capacity Warning (&gt; 85%)</span>
          <div className="mt-1 text-2xl font-bold text-rose-400">
            {twin.warehouses.filter((warehouse) => warehouse.stockPercentage > 85).length}
          </div>
          <span className="text-[11px] text-rose-400/80 font-medium">Requires cross-dock rebalance</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-12 gap-5 overflow-hidden">
        <div className="col-span-8 flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 p-3">
            <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-950/80 px-3 py-1.5 text-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search facility name, code, region..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full border-none bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400">{filteredWarehouses.length} facilities reported</span>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-4">
            {filteredWarehouses.map((warehouse) => {
              const isSelected = selectedWarehouse?.id === warehouse.id;
              const isCritical = warehouse.stockPercentage > 85;

              return (
                <div
                  key={warehouse.id}
                  onClick={() => setSelectedWarehouseId(warehouse.id)}
                  className={`flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-cyan-500/80 bg-cyan-950/40 shadow-lg shadow-cyan-950/50'
                      : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-300">{warehouse.code}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          isCritical
                            ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {warehouse.stockPercentage}% Full
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-sm font-bold text-white">{warehouse.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} className="text-slate-500" />
                      {warehouse.city} • {warehouse.capacitySqm.toLocaleString()} m²
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3 text-[11px]">
                    <span className="text-slate-400">Critical Spare Skus:</span>
                    <span className="font-mono font-bold text-white">{warehouse.itemsCount} items</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-4 flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 p-4">
            <div className="flex items-center gap-2">
              <Boxes size={16} className="text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Facility Capacity Profile</h3>
            </div>
            {selectedWarehouse && (
              <span className="rounded border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 font-mono text-xs text-cyan-300">
                {selectedWarehouse.code}
              </span>
            )}
          </div>

          {selectedWarehouse ? (
            <div className="flex-1 space-y-4 overflow-y-auto p-4 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-500">Facility Master Record</span>
                <div className="mt-0.5 text-sm font-semibold text-white">{selectedWarehouse.name}</div>
                <div className="mt-1 text-[11px] text-slate-400">{selectedWarehouse.city}</div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Storage Capacity Level</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedWarehouse.stockPercentage}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full ${selectedWarehouse.stockPercentage > 85 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                    style={{ width: `${selectedWarehouse.stockPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Footprint</span>
                  <div className="mt-0.5 font-mono font-bold text-white">{selectedWarehouse.capacitySqm.toLocaleString()} m²</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Inventory Items</span>
                  <div className="mt-0.5 font-medium text-slate-200">{selectedWarehouse.itemsCount}</div>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-500">Reported Facility State</span>
                <div className="font-semibold text-white">{selectedWarehouse.status.replace(/_/g, ' ')}</div>
                <div className="text-[11px] text-slate-400">
                  Alert status: {selectedWarehouse.alert ? 'High activity / watchlist' : 'Stable operations'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">Select a staging warehouse to review laydown utilization.</div>
          )}
        </div>
      </div>
    </div>
  );
}
