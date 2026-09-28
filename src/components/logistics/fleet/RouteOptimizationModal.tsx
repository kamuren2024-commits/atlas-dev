/**
 * KETRACO Heavy Transport Route Calculation & Optimization Modal
 * Implements Section 06: Bridge Feasibility & Corridor Optimization
 */

import React, { useState } from 'react';
import {
  X, Navigation, ShieldAlert, CheckCircle2, AlertTriangle, Layers, Clock, TrendingUp, Cpu
} from 'lucide-react';
import type { VehicleOperationalState } from '../../../../backend/domains/logistics/providers/types';

interface RouteOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleOperationalState | null;
}

export const RouteOptimizationModal: React.FC<RouteOptimizationModalProps> = ({
  isOpen,
  onClose,
  vehicle
}) => {
  if (!isOpen) return null;

  const [origin, setOrigin] = useState('Embakasi Central Engineering Stores');
  const [destination, setDestination] = useState('Suswa 500kV HVDC Converter Station');
  const [cargoWeightKg, setCargoWeightKg] = useState(65000);
  const [avoidEscarpment, setAvoidEscarpment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<any | null>(null);

  const substations = [
    { name: 'Suswa 500kV HVDC Converter Station', lat: -1.0543, lng: 36.3512 },
    { name: 'Isinya 400/220kV Substation', lat: -1.6705, lng: 36.8520 },
    { name: 'Olkaria Geothermal Switching Yard', lat: -0.8872, lng: 36.3114 },
    { name: 'Lessos 400kV Grid Intertie Depot', lat: 0.2104, lng: 35.2974 },
    { name: 'Rabai 400kV Coastal Terminal', lat: -3.9248, lng: 39.5621 }
  ];

  const handleCalculateRoute = async () => {
    setLoading(true);
    setRouteResult(null);

    const destObj = substations.find(s => s.name === destination) || substations[0];

    try {
      const res = await fetch('/api/logistics/routes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: -1.3218,
          originLng: 36.8950,
          destLat: destObj.lat,
          destLng: destObj.lng,
          vehicleType: vehicle?.vehicleType || 'LOW_LOADER',
          cargoWeightKg,
          avoidEscarpment
        })
      });

      const json = await res.json();
      if (json.ok) {
        setRouteResult(json.data);
      }
    } catch (err) {
      console.error('Failed to calculate route:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0b1726] border border-cyan-500/40 rounded-2xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Navigation size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Corridor Clearance & Bridge Feasibility Calculator</h2>
              <p className="text-xs text-slate-400">KeNHA Axle-Load, Escarpment Descent & Escort Protocol Analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Origin Logistics Depot</label>
              <input
                type="text"
                disabled
                value={origin}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Destination Substation</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                {substations.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Payload Weight (kg)</label>
              <input
                type="number"
                value={cargoWeightKg}
                onChange={e => setCargoWeightKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="avoidEscarpment"
                checked={avoidEscarpment}
                onChange={e => setAvoidEscarpment(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
              />
              <label htmlFor="avoidEscarpment" className="text-slate-300 text-xs cursor-pointer">
                Avoid Rift Valley Escarpment Descent (Mai Mahiu)
              </label>
            </div>
          </div>

          {/* Results Display */}
          {routeResult && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Transit Distance</span>
                  <div className="font-mono text-xl font-bold text-cyan-400 mt-0.5">{routeResult.distanceKm} km</div>
                  <span className="text-[10px] text-slate-500">Class A/B Highway corridors</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Heavy Transit Time</span>
                  <div className="font-mono text-xl font-bold text-white mt-0.5">
                    {Math.floor(routeResult.durationHours)}h {Math.round((routeResult.durationHours % 1) * 60)}m
                  </div>
                  <span className="text-[10px] text-slate-500">Max 40-50 km/h loaded cap</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Escort Requirement</span>
                  <div className={`text-sm font-bold mt-1 ${routeResult.policeEscortRequired ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {routeResult.policeEscortRequired ? 'MANDATORY POLICE ESCORT' : 'Standard Transport'}
                  </div>
                  <span className="text-[10px] text-slate-500">KeNHA Permit clearance</span>
                </div>
              </div>

              {/* Waypoints & Bottlenecks */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Corridor Waypoint & Elevation Profile
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {routeResult.waypoints?.map((w: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">{idx + 1}.</span>
                        <span className="text-slate-200">{w.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px]">
                        <span>Alt: {w.elevationM}m</span>
                        <span>{w.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bridge Assessment List */}
              {routeResult.bottlenecks?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                    <ShieldAlert size={14} />
                    <span>Identified Bridges & Narrow Pass Restrictions Along Selected Route</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    {routeResult.bottlenecks.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between text-slate-300">
                        <span>{b.name} ({b.corridorName})</span>
                        <span className="font-mono text-amber-400">Max Weight: {b.maxWeightTons} Tons</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleCalculateRoute}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Navigation size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Evaluating Corridor...' : 'Calculate Route & Bridge Feasibility'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
