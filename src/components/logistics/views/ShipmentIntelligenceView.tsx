import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Package, Search } from 'lucide-react';
import type { LogisticsTwin } from '../logistics-data-fabric';

interface ShipmentIntelligenceViewProps {
  twin: LogisticsTwin;
  loading: boolean;
  error: string | null;
}

export default function ShipmentIntelligenceView({ twin, loading, error }: ShipmentIntelligenceViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(twin.shipments[0]?.id ?? null);

  useEffect(() => {
    if (!twin.shipments.length) {
      setSelectedShipmentId(null);
      return;
    }

    setSelectedShipmentId((current) => {
      if (current && twin.shipments.some((shipment) => shipment.id === current)) {
        return current;
      }
      return twin.shipments[0].id;
    });
  }, [twin.shipments]);

  const filteredShipments = useMemo(() => {
    return twin.shipments.filter((shipment) => {
      const haystack = `${shipment.code} ${shipment.description} ${shipment.destination} ${shipment.origin}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || shipment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [twin.shipments, search, statusFilter]);

  const selectedShipment = filteredShipments.find((shipment) => shipment.id === selectedShipmentId)
    ?? twin.shipments.find((shipment) => shipment.id === selectedShipmentId)
    ?? twin.shipments[0]
    ?? null;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="mb-3 animate-spin text-cyan-400">⟳</div>
          <p>Loading shipment data from KETRACO...</p>
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
    <div className="flex h-full flex-col overflow-hidden bg-[#020b14] p-6 text-slate-100">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-cyan-400">
            <Package size={22} />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              Shipment Intelligence & Manifest Registry
              <span className="rounded-full border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                Live Data Fabric
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Multi-modal cargo manifests, substation delivery tracking, and bill-of-lading reconciliation.
            </p>
          </div>
        </div>
      </div>

      <div className="my-4 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Active Manifests</span>
          <div className="mt-1 text-2xl font-bold text-white">{twin.shipments.length}</div>
          <span className="text-[11px] text-emerald-400">Verified telemetry</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Transit</span>
          <div className="mt-1 text-2xl font-bold text-cyan-400">{twin.shipments.filter((shipment) => shipment.status === 'IN_TRANSIT').length}</div>
          <span className="text-[11px] text-slate-400">Active movements</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Critical Alerts</span>
          <div className="mt-1 text-2xl font-bold text-amber-400">{twin.shipments.filter((shipment) => shipment.priority === 'CRITICAL').length}</div>
          <span className="text-[11px] text-red-400">Require attention</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery %</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            {twin.shipments.length > 0
              ? Math.round((twin.shipments.filter((shipment) => shipment.status === 'DELIVERED').length / twin.shipments.length) * 100)
              : 0}
            %
          </div>
          <span className="text-[11px] text-emerald-400">Manifest fulfillment</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by code, description, or destination..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-300 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PLANNED">Planned</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      <div className="grid flex-1 grid-cols-[350px_1fr] gap-4 overflow-hidden">
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
          <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-200">Manifests ({filteredShipments.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredShipments.map((shipment) => {
              const isSelected = selectedShipment?.id === shipment.id;
              return (
                <button
                  key={shipment.id}
                  onClick={() => setSelectedShipmentId(shipment.id)}
                  className={`w-full border-b border-slate-800/50 px-4 py-2.5 text-left text-sm transition-all ${
                    isSelected ? 'border-l-2 border-l-cyan-500 bg-cyan-950/40' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="font-medium text-slate-100">{shipment.code}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{shipment.cargoType}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        shipment.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : shipment.status === 'IN_TRANSIT'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      {shipment.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          {selectedShipment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{selectedShipment.code}</h2>
                <span
                  className={`rounded px-2 py-1 text-[10px] font-bold ${
                    selectedShipment.status === 'DELIVERED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : selectedShipment.status === 'IN_TRANSIT'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-700/50 text-slate-200'
                  }`}
                >
                  {selectedShipment.status}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Cargo</div>
                <div className="mt-2 text-base font-semibold text-white">{selectedShipment.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Origin</div>
                  <div className="mt-2 text-sm text-slate-200">{selectedShipment.origin}</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Destination</div>
                  <div className="mt-2 text-sm text-slate-200">{selectedShipment.destination}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Priority</div>
                  <div className="mt-2 text-sm text-slate-200">{selectedShipment.priority}</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Cargo Type</div>
                  <div className="mt-2 text-sm text-slate-200">{selectedShipment.cargoType}</div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Material profile</div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-200">
                  <span>Units</span>
                  <span className="font-mono text-cyan-300">{selectedShipment.quantity}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-200">
                  <span>Weight</span>
                  <span className="font-mono text-cyan-300">{selectedShipment.weightKg} kg</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No shipment selected</div>
          )}
        </div>
      </div>
    </div>
  );
}