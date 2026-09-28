/**
 * KETRACO GPS Telemetry Pipeline Ingestion Console
 * Implements Section 05: Live Packet Ingestion & Pipeline Inspection
 */

import React, { useState } from 'react';
import {
  X, Radio, CheckCircle2, AlertTriangle, ArrowRight, Gauge, Cpu, Zap, Activity
} from 'lucide-react';
import type { VehicleOperationalState } from '../../../../backend/domains/logistics/providers/types';

interface TelemetrySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleOperationalState | null;
  onTelemetryIngested: (result: any) => void;
}

export const TelemetrySimulatorModal: React.FC<TelemetrySimulatorModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onTelemetryIngested
}) => {
  if (!isOpen || !vehicle) return null;

  const [lat, setLat] = useState(vehicle.telemetry.latitude || -1.4552);
  const [lng, setLng] = useState(vehicle.telemetry.longitude || 36.9821);
  const [speed, setSpeed] = useState(68);
  const [heading, setHeading] = useState(145);
  const [fuel, setFuel] = useState(vehicle.telemetry.fuelLevelPct || 82);
  const [ignition, setIgnition] = useState(true);
  const [odometer, setOdometer] = useState(vehicle.telemetry.odometerKm || 45200);
  const [engineHours, setEngineHours] = useState(vehicle.telemetry.engineHours || 1420);
  const [loading, setLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<any | null>(null);

  const presets = [
    { name: 'Athi River Super-Bridge (A109)', lat: -1.4552, lng: 36.9821, speed: 65, heading: 145 },
    { name: 'Mai Mahiu Escarpment Descent', lat: -1.0125, lng: 36.5780, speed: 42, heading: 290 },
    { name: 'Suswa 500kV HVDC Converter Base', lat: -1.0543, lng: 36.3512, speed: 20, heading: 320 },
    { name: 'Gilgil Weighbridge Station (A104)', lat: -0.4912, lng: 36.2845, speed: 15, heading: 340 },
    { name: 'Timboroa Mountain Pass (High Alt)', lat: 0.0631, lng: 35.5390, speed: 52, heading: 310 }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setLat(p.lat);
    setLng(p.lng);
    setSpeed(p.speed);
    setHeading(p.heading);
  };

  const handleIngest = async () => {
    setLoading(true);
    setPipelineResult(null);

    try {
      const res = await fetch('/api/logistics/fleet/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.vehicleId,
          latitude: Number(lat),
          longitude: Number(lng),
          speed: Number(speed),
          heading: Number(heading),
          fuelLevel: Number(fuel),
          ignition: Boolean(ignition),
          odometer: Number(odometer) + 2,
          engineHours: Number(engineHours) + 0.1,
          source: 'CALAMP_LMU_ECU_GATEWAY',
          timestamp: new Date().toISOString()
        })
      });

      const json = await res.json();
      if (json.ok) {
        setPipelineResult(json.data);
        onTelemetryIngested(json.data);
      }
    } catch (err) {
      console.error('Failed to ingest telemetry:', err);
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
              <Radio size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Live GPS Telemetry Ingestion Console</h2>
              <p className="text-xs text-slate-400">ECU / CalAmp & Teltonika Gateway Stream Simulator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pipeline Architecture Indicator */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-cyan-400/90 overflow-x-auto whitespace-nowrap gap-2">
          <span>GPS_DEVICE</span>
          <ArrowRight size={10} className="text-slate-600 flex-shrink-0" />
          <span>INGESTION</span>
          <ArrowRight size={10} className="text-slate-600 flex-shrink-0" />
          <span>VALIDATION</span>
          <ArrowRight size={10} className="text-slate-600 flex-shrink-0" />
          <span>ROAD_MATCHING</span>
          <ArrowRight size={10} className="text-slate-600 flex-shrink-0" />
          <span>EVENT_ENGINE</span>
          <ArrowRight size={10} className="text-slate-600 flex-shrink-0" />
          <span>GRAPH</span>
          <ArrowRight size={10} className="text-slate-600 flex-shrink-0" />
          <span className="text-emerald-400 font-bold">UI LIVE</span>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Presets */}
          <div>
            <span className="block text-slate-400 font-medium mb-1.5">Kenyan Transmission Highway Corridor Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700/60 transition-colors cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Latitude (Kenya Bounds)</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={e => setLat(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Longitude (Kenya Bounds)</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={e => setLng(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Current Speed (km/h)</label>
              <input
                type="number"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Compass Heading (0-360°)</label>
              <input
                type="number"
                value={heading}
                onChange={e => setHeading(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Fuel Tank Level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={fuel}
                onChange={e => setFuel(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Ignition Status</label>
              <select
                value={ignition ? '1' : '0'}
                onChange={e => setIgnition(e.target.value === '1')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="1">Ignition ON (Engine Running)</option>
                <option value="0">Ignition OFF (Parked / Idle)</option>
              </select>
            </div>
          </div>

          {/* Pipeline Result Panel */}
          {pipelineResult && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Telemetry Ingestion Accepted
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  STATUS: LIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-500">Road Snapping:</span>{' '}
                  <span className="text-cyan-300">{pipelineResult.roadMatched ? 'Matched to Highway Corridor' : 'Raw GPS'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Corridor Speed Limit:</span>{' '}
                  <span className="font-mono text-white">{pipelineResult.speedLimitKmh} km/h</span>
                </div>
                <div>
                  <span className="text-slate-500">Speeding Violation:</span>{' '}
                  <span className={pipelineResult.speedingDetected ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {pipelineResult.speedingDetected ? 'Speeding Detected (> NTSA Limit)' : 'Normal Compliance'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Route Deviation:</span>{' '}
                  <span className={pipelineResult.routeDeviationDetected ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                    {pipelineResult.routeDeviationDetected ? `Deviated by ${pipelineResult.deviationDistanceKm} km` : 'On Corridor Vector'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Events Emitted: {pipelineResult.eventsEmitted?.join(', ')}
              </div>
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
            onClick={handleIngest}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Radio size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Processing Pipeline...' : 'Inject Telemetry Packet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
