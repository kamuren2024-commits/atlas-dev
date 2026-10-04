import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Gauge, MapPin, Search, ShieldCheck, Truck } from 'lucide-react';
import type { LogisticsTwin } from '../logistics-data-fabric';

interface FleetIntelligenceViewProps {
  twin: LogisticsTwin;
  loading: boolean;
  error: string | null;
}

export default function FleetIntelligenceView({ twin, loading, error }: FleetIntelligenceViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(twin.vehicles[0]?.id ?? null);

  useEffect(() => {
    if (!twin.vehicles.length) {
      setSelectedVehicleId(null);
      return;
    }

    setSelectedVehicleId((current) => {
      if (current && twin.vehicles.some((vehicle) => vehicle.id === current)) {
        return current;
      }
      return twin.vehicles[0].id;
    });
  }, [twin.vehicles]);

  const filteredFleet = useMemo(() => {
    return twin.vehicles.filter((vehicle) => {
      const haystack = `${vehicle.code} ${vehicle.name} ${vehicle.region} ${vehicle.vehicleType}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || vehicle.status === statusFilter;
      const matchesRegion = regionFilter === 'ALL' || vehicle.region === regionFilter;
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [twin.vehicles, search, statusFilter, regionFilter]);

  const selectedVehicle = filteredFleet.find((vehicle) => vehicle.id === selectedVehicleId)
    ?? twin.vehicles.find((vehicle) => vehicle.id === selectedVehicleId)
    ?? twin.vehicles[0]
    ?? null;

  const movingCount = twin.vehicles.filter((vehicle) => vehicle.status === 'IN_TRANSIT' || vehicle.status === 'MOVING').length;
  const availableCount = twin.vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length;
  const maintenanceCount = twin.vehicles.filter((vehicle) => vehicle.status === 'MAINTENANCE' || vehicle.status === 'BREAKDOWN').length;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="mb-3 animate-spin text-cyan-400">⟳</div>
          <p>Loading fleet data...</p>
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
            <Truck size={22} />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
              Fleet Telematics & Heavy Transport Registry
              <span className="rounded-full border border-cyan-500/40 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                KENYA TRANSMISSION GRID LIVE
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Fleet telemetry, lightweight asset health, and corridor operational awareness from the shared twin.
            </p>
          </div>
        </div>
      </div>

      <div className="my-4 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fleet</span>
          <div className="mt-1 text-2xl font-bold text-white">{twin.vehicles.length}</div>
          <span className="text-[11px] text-cyan-400">Active units</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Moving</span>
          <div className="mt-1 text-2xl font-bold text-cyan-400">{movingCount}</div>
          <span className="text-[11px] text-slate-400">On route</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400">{availableCount}</div>
          <span className="text-[11px] text-slate-400">Ready for dispatch</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maintenance</span>
          <div className="mt-1 text-2xl font-bold text-amber-400">{maintenanceCount}</div>
          <span className="text-[11px] text-amber-400">Requires attention</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by code, vehicle, or region..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-300 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        <select
          value={regionFilter}
          onChange={(event) => setRegionFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-300 outline-none"
        >
          <option value="ALL">All Regions</option>
          {Array.from(new Set(twin.vehicles.map((vehicle) => vehicle.region))).map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      <div className="grid flex-1 grid-cols-[350px_1fr] gap-4 overflow-hidden">
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40">
          <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-200">Fleet Units ({filteredFleet.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredFleet.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              return (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className={`w-full border-b border-slate-800/50 px-4 py-3 text-left text-sm transition-all ${
                    isSelected ? 'border-l-2 border-l-cyan-500 bg-cyan-950/40' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-slate-100">{vehicle.name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{vehicle.code}</div>
                    </div>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${vehicle.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300' : vehicle.status === 'IN_TRANSIT' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {vehicle.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          {selectedVehicle ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedVehicle.name}</h2>
                  <div className="text-xs text-slate-400">{selectedVehicle.code}</div>
                </div>
                <span className={`rounded px-2 py-1 text-[10px] font-bold ${selectedVehicle.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300' : selectedVehicle.status === 'IN_TRANSIT' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {selectedVehicle.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Region</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
                    <MapPin size={14} className="text-cyan-400" />
                    {selectedVehicle.region}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Vehicle type</div>
                  <div className="mt-2 text-sm text-slate-200">{selectedVehicle.vehicleType}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Speed</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
                    <Gauge size={14} className="text-cyan-400" />
                    {selectedVehicle.speedKph} km/h
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Fuel</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    {selectedVehicle.fuelLevelPct}%
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Operational summary</div>
                <div className="mt-2 text-sm text-slate-200">
                  {selectedVehicle.driverName ? `Driver: ${selectedVehicle.driverName}` : 'Driver assignment pending'}
                </div>
                <div className="mt-2 text-sm text-slate-200">
                  {selectedVehicle.assignment ? `Assignment: ${selectedVehicle.assignment}` : 'No active assignment'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No vehicle selected</div>
          )}
        </div>
      </div>
    </div>
  );
}