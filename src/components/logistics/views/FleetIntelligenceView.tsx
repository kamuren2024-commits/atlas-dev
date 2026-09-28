/**
 * KETRACO Logistics Intelligence - Fleet Telematics & Heavy Transport Registry
 * Fully operationalized per Master Enactment 02 directives.
 * Deeply connected to backend telemetry pipeline, route optimization, and GIS providers.
 */

import React, { useState, useEffect } from 'react';
import {
  Truck, Search, Filter, RefreshCw, AlertTriangle, ShieldCheck,
  BatteryCharging, Wrench, Fuel, MapPin, Activity, CheckCircle2,
  Clock, ArrowRight, Gauge, Radio, Send, Navigation, Layers, Cpu, Compass
} from 'lucide-react';
import type { VehicleOperationalState } from '../../../../backend/domains/logistics/providers/types';
import { FleetMap } from '../fleet/FleetMap';
import { DispatchModal } from '../fleet/DispatchModal';
import { TelemetrySimulatorModal } from '../fleet/TelemetrySimulatorModal';
import { RouteOptimizationModal } from '../fleet/RouteOptimizationModal';

export default function FleetIntelligenceView() {
  const [fleetStates, setFleetStates] = useState<VehicleOperationalState[]>([]);
  const [substations, setSubstations] = useState<any[]>([]);
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);
  const [providerMetadata, setProviderMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOperationalState | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  // Modals state
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isTelemetrySimOpen, setIsTelemetrySimOpen] = useState(false);
  const [isRouteCalcOpen, setIsRouteCalcOpen] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  const fetchOperationalData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Fleet Operational States
      const statesRes = await fetch('/api/logistics/fleet/states');
      const statesJson = await statesRes.json();
      if (statesJson.ok && statesJson.data?.states) {
        setFleetStates(statesJson.data.states);
        if (statesJson.data.states.length > 0 && !selectedVehicle) {
          setSelectedVehicle(statesJson.data.states[0]);
        }
      }

      // 2. Fetch Substations
      const substationsRes = await fetch('/api/logistics/substations');
      const substationsJson = await substationsRes.json();
      if (substationsJson.ok && substationsJson.data) {
        setSubstations(substationsJson.data.substations || []);
      }

      // 3. Fetch Corridor Bottlenecks
      const bottlenecksRes = await fetch('/api/logistics/corridors/bottlenecks');
      const bottlenecksJson = await bottlenecksRes.json();
      if (bottlenecksJson.ok && bottlenecksJson.data) {
        setBottlenecks(bottlenecksJson.data.bottlenecks || []);
      }

      // 4. Fetch Provider Status
      const providerRes = await fetch('/api/logistics/providers/status');
      const providerJson = await providerRes.json();
      if (providerJson.ok && providerJson.data) {
        setProviderMetadata(providerJson.data.googleMaps);
      }
    } catch (e) {
      console.error('Failed to load operational fleet data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationalData();
    // Auto-refresh telemetry states every 30 seconds
    const interval = setInterval(fetchOperationalData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatchSuccess = (missionData: any) => {
    setLastNotification(`Mission ${missionData.missionCode} authorized! Vehicle assigned and dispatched.`);
    fetchOperationalData();
    setTimeout(() => setLastNotification(null), 6000);
  };

  const handleTelemetryIngested = (result: any) => {
    setLastNotification(`Telemetry packet ingested: ${result.vehicleId} updated on ${result.locationName || 'highway corridor'}.`);
    fetchOperationalData();
    setTimeout(() => setLastNotification(null), 6000);
  };

  const filteredFleet = fleetStates.filter(v => {
    const matchesSearch =
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesRegion = regionFilter === 'ALL' || v.region === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const movingCount = fleetStates.filter(v => v.status === 'MOVING' || v.status === 'IN_TRANSIT').length;
  const availableCount = fleetStates.filter(v => v.status === 'AVAILABLE').length;
  const maintenanceCount = fleetStates.filter(v => v.status === 'MAINTENANCE' || v.status === 'BREAKDOWN').length;

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-hidden">
      {/* Top Notification Toast */}
      {lastNotification && (
        <div className="mb-3 p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 flex items-center justify-between text-xs animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-cyan-400" />
            <span>{lastNotification}</span>
          </div>
          <button onClick={() => setLastNotification(null)} className="text-cyan-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Truck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Fleet Telematics & Heavy Transport Registry
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                KENYA TRANSMISSION GRID LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              CalAmp/Teltonika telemetry pipeline, corridor bridge weight enforcement, and certified heavy-lift mission dispatch.
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'LIST' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Registry & Telematics
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'MAP' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              National Grid Map
            </button>
          </div>

          <button
            onClick={() => setIsRouteCalcOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700/60 transition-all cursor-pointer"
          >
            <Navigation size={14} />
            <span>Corridor Feasibility</span>
          </button>

          <button
            onClick={() => setIsTelemetrySimOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 border border-slate-700/60 transition-all cursor-pointer"
          >
            <Radio size={14} />
            <span>Telemetry Pipeline</span>
          </button>

          <button
            onClick={fetchOperationalData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-4 gap-4 my-4 flex-shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fleet Assets</span>
          <div className="text-2xl font-bold text-white mt-1">{fleetStates.length}</div>
          <span className="text-[11px] text-slate-400">Low-loaders, cranes, cable-pullers & rigs</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active In Transit</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{movingCount}</div>
          <span className="text-[11px] text-emerald-400 font-medium">Real-time GPS broadcast active</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available / Staged</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{availableCount}</div>
          <span className="text-[11px] text-slate-400">Ready for substation mission dispatch</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Maintenance / Outage</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{maintenanceCount}</div>
          <span className="text-[11px] text-rose-400/80 font-medium">Workshop overhaul priority</span>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'MAP' ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <FleetMap
            vehicles={filteredFleet}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={v => {
              setSelectedVehicle(v);
              setViewMode('LIST');
            }}
            substations={substations}
            bottlenecks={bottlenecks}
            providerMetadata={providerMetadata}
          />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
          {/* Left Fleet Registry Table */}
          <div className="col-span-8 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/80">
              <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-950/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search unit code, plate, model, vehicle type..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none w-full text-xs placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400">Region:</span>
                  <select
                    value={regionFilter}
                    onChange={e => setRegionFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Regions</option>
                    <option value="NAIROBI">Nairobi</option>
                    <option value="RIFT_VALLEY">Rift Valley</option>
                    <option value="WESTERN">Western</option>
                    <option value="COAST">Coast</option>
                    <option value="MOUNT_KENYA">Mount Kenya</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="MOVING">Moving</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Registry Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/60 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Unit Code</th>
                    <th className="p-3 font-semibold">Vehicle Specifications</th>
                    <th className="p-3 font-semibold">License Plate</th>
                    <th className="p-3 font-semibold">Freshness</th>
                    <th className="p-3 font-semibold">Speed & Bearing</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredFleet.map(v => {
                    const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
                    const freshness = v.telemetry.freshness;
                    return (
                      <tr
                        key={v.vehicleId}
                        onClick={() => setSelectedVehicle(v)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-cyan-300">
                          {v.code}
                          <div className="text-[10px] text-slate-500 font-sans font-normal">{v.region}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-200">
                          <div>{v.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {v.vehicleType} • {(v.operational.capacity.maxWeightKg / 1000).toFixed(0)}T Cap
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{v.licensePlate}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            freshness === 'LIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                            freshness === 'STALE' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {freshness}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          {v.telemetry.speedKmh > 0 ? (
                            <span className="text-cyan-300">
                              {v.telemetry.speedKmh.toFixed(0)} km/h • {v.telemetry.heading}°
                            </span>
                          ) : (
                            <span className="text-slate-500">Parked / 0 km/h</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.status === 'MOVING' || v.status === 'IN_TRANSIT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                            v.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            v.status === 'MAINTENANCE' || v.status === 'BREAKDOWN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Detailed Telematics & Dispatch Console */}
          <div className="col-span-4 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Telematics Diagnostic Console</h3>
              </div>
              {selectedVehicle && (
                <span className="font-mono text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                  {selectedVehicle.code}
                </span>
              )}
            </div>

            {selectedVehicle ? (
              <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Description & Specs Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Unit Identification</span>
                    <span className="font-mono text-cyan-300 font-bold">{selectedVehicle.licensePlate}</span>
                  </div>
                  <div className="font-semibold text-white text-sm mt-0.5">{selectedVehicle.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Class: {selectedVehicle.vehicleType}</span>
                    <span>Region: {selectedVehicle.region}</span>
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Gauge size={12} /> Odometer
                    </span>
                    <div className="font-mono font-bold text-white text-sm mt-0.5">
                      {selectedVehicle.telemetry.odometerKm?.toLocaleString()} km
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> Engine Hours
                    </span>
                    <div className="font-mono font-bold text-white text-sm mt-0.5">
                      {selectedVehicle.telemetry.engineHours || 450} hrs
                    </div>
                  </div>
                </div>

                {/* Fuel & Freshness */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                      <Fuel size={12} /> Fuel Tank Level
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {Math.round(selectedVehicle.telemetry.fuelLevelPct)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedVehicle.telemetry.fuelLevelPct < 25
                          ? 'bg-rose-500'
                          : selectedVehicle.telemetry.fuelLevelPct < 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedVehicle.telemetry.fuelLevelPct}%` }}
                    />
                  </div>
                </div>

                {/* Geolocation & Corridor Matching */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <MapPin size={12} /> Real-Time Geolocation & Corridor
                  </span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="font-mono text-slate-200">
                      {selectedVehicle.telemetry.latitude?.toFixed(4)}, {selectedVehicle.telemetry.longitude?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Highway Corridor:</span>
                    <span className="text-cyan-300 font-medium">
                      {selectedVehicle.telemetry.locationName || 'A109 / A104 National Trunk'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Telemetry Freshness:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {selectedVehicle.telemetry.freshness} ({new Date(selectedVehicle.telemetry.lastTelemetryAt).toLocaleTimeString()})
                    </span>
                  </div>
                </div>

                {/* Assigned Mission & Driver */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Assigned Mission & Certified Operator
                  </span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Active Mission:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {selectedVehicle.mission?.code || selectedVehicle.assignedMissionId || 'Standby Staged'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Certified Driver:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedVehicle.currentDriver?.name || 'Assigned Transport Crew'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">NTSA Duty Hours:</span>
                    <span className="font-mono text-slate-300">
                      {selectedVehicle.currentDriver?.dutyHoursToday || 4.5} hrs today (Max 10)
                    </span>
                  </div>
                </div>

                {/* Operational Action Buttons */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsDispatchOpen(true)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Authorize Dispatch</span>
                  </button>

                  <button
                    onClick={() => setIsTelemetrySimOpen(true)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-all cursor-pointer"
                  >
                    <Radio size={14} className="text-cyan-400" />
                    <span>Inject Telemetry</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Select a transport unit to inspect diagnostic ECU telemetry.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      <DispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        vehicle={selectedVehicle}
        onDispatchSuccess={handleDispatchSuccess}
      />

      {/* Telemetry Ingestion Simulator Modal */}
      <TelemetrySimulatorModal
        isOpen={isTelemetrySimOpen}
        onClose={() => setIsTelemetrySimOpen(false)}
        vehicle={selectedVehicle}
        onTelemetryIngested={handleTelemetryIngested}
      />

      {/* Route & Bridge Optimization Modal */}
      <RouteOptimizationModal
        isOpen={isRouteCalcOpen}
        onClose={() => setIsRouteCalcOpen(false)}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
