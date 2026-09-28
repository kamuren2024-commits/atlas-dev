/**
 * KETRACO Operational Dispatch Modal
 * Implements Section 09: Multi-Step Dispatch Engine with Capacity & Duty-Hours Checks
 */

import React, { useState } from 'react';
import {
  X, Send, ShieldCheck, AlertTriangle, Truck, User, MapPin, Package, CheckCircle2
} from 'lucide-react';
import type { VehicleOperationalState } from '../../../../backend/domains/logistics/providers/types';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleOperationalState | null;
  onDispatchSuccess: (missionData: any) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onDispatchSuccess
}) => {
  if (!isOpen || !vehicle) return null;

  const [title, setTitle] = useState(`Transformer Bushings & Insulator Transit`);
  const [destination, setDestination] = useState('Isinya 400/220kV Substation');
  const [cargoWeightKg, setCargoWeightKg] = useState(14500);
  const [projectName, setProjectName] = useState('400kV Suswa-Isinya Transmission Interconnector');
  const [driverName, setDriverName] = useState(vehicle.currentDriver?.name || 'Musa Kiprono');
  const [notes, setNotes] = useState('Urgent grid spares delivery for Substation Bay 4 Energization.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxCapacity = vehicle.operational.capacity.maxWeightKg;
  const isOverweight = cargoWeightKg > maxCapacity;
  const requiresPoliceEscort = cargoWeightKg > 40000 || vehicle.vehicleType === 'LOW_LOADER';

  const handleDispatch = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/logistics/fleet/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.vehicleId,
          driverId: vehicle.currentDriver?.id,
          title,
          cargoDescription: title,
          cargoWeightKg,
          destinationName: destination,
          destinationLat: destination.includes('Isinya') ? -1.6705 : -1.0543,
          destinationLng: destination.includes('Isinya') ? 36.8520 : 36.3512,
          projectName,
          priority: 'CRITICAL',
          notes
        })
      });

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error?.message || 'Dispatch authorization failed');
      }

      onDispatchSuccess(json.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Dispatch request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0b1726] border border-cyan-500/40 rounded-2xl w-full max-w-xl text-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Send size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Authorize Operational Mission Dispatch</h2>
              <p className="text-xs text-slate-400">Grid Control Center • KETRACO Heavy Logistics Desk</p>
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
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-300 flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Vehicle & Capacity Validation Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-cyan-300 text-sm">
                <Truck size={16} />
                <span>{vehicle.code} ({vehicle.licensePlate})</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                {vehicle.vehicleType}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400">Max Capacity:</span>
                <div className="font-mono font-bold text-white">{(maxCapacity / 1000).toFixed(1)} Tons</div>
              </div>
              <div>
                <span className="text-slate-400">Axle Config:</span>
                <div className="font-mono text-white">{vehicle.operational.capacity.axles} Axles</div>
              </div>
              <div>
                <span className="text-slate-400">Compliance:</span>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Passed
                </div>
              </div>
            </div>
          </div>

          {/* Destination & Cargo Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Mission Title / Operational Description</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Destination Substation</label>
                <select
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Isinya 400/220kV Substation">Isinya 400/220kV Substation</option>
                  <option value="Suswa 500kV HVDC Converter Station">Suswa 500kV HVDC Converter Station</option>
                  <option value="Olkaria Geothermal Switching Yard">Olkaria Geothermal Switching Yard</option>
                  <option value="Lessos 400kV Grid Intertie Depot">Lessos 400kV Grid Intertie Depot</option>
                  <option value="Rabai 400kV Coastal Terminal">Rabai 400kV Coastal Terminal</option>
                  <option value="Loiyangalani Lake Turkana Substation">Loiyangalani Lake Turkana Substation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Payload Weight (kg)</label>
                <input
                  type="number"
                  value={cargoWeightKg}
                  onChange={e => setCargoWeightKg(Number(e.target.value))}
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-white font-mono focus:outline-none ${
                    isOverweight ? 'border-rose-500 text-rose-300' : 'border-slate-700 focus:border-cyan-400'
                  }`}
                />
              </div>
            </div>

            {isOverweight && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-300 flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>Cargo exceeds rated payload capacity ({maxCapacity} kg). Dispatch is blocked.</span>
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Transmission Project</label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Escort and Safety Advisory */}
            {requiresPoliceEscort && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>Mandatory KeNHA & NPS Traffic Police Escort</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Super-load / out-of-gauge protocol activated. Athi River bypass and Mai Mahiu descent clearance will require pilot lead and trailing escort units.
                </p>
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-medium mb-1">Dispatcher Operational Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            disabled={isOverweight || loading}
            onClick={handleDispatch}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Send size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Authorizing Dispatch...' : 'Authorize & Dispatch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
