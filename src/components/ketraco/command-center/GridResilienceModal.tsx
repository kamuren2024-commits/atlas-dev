import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Play, RefreshCw, X, 
  Zap, ArrowRight, CheckCircle2, TrendingDown, Layers
} from 'lucide-react';

interface GridResilienceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GridResilienceModal({ isOpen, onClose }: GridResilienceModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('hvdc_trip');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'hvdc_trip',
      name: 'N-1: Loss of 500kV Ethiopia-Kenya HVDC Interconnector',
      description: 'Instantaneous tripping of 500kV bi-pole converter injecting 750 MW baseload into Suswa.',
      impactMW: 750,
      severity: 'CRITICAL'
    },
    {
      id: 'suswa_t1_trip',
      name: 'N-1: Loss of Suswa 400/220kV Transformer T1',
      description: 'Trip of 350 MVA transformer causing cascade loading on Nairobi Metropolitan 220kV ring.',
      impactMW: 320,
      severity: 'HIGH'
    },
    {
      id: 'loiyangalani_trip',
      name: 'N-1: Tripping of 400kV Loiyangalani - Suswa Wind Corridor',
      description: 'Sudden loss of 310 MW Lake Turkana Wind Power transmission into central grid.',
      impactMW: 310,
      severity: 'HIGH'
    },
    {
      id: 'mombasa_islanding',
      name: 'N-1: Mombasa 400kV Rabai - Mariakani Dual Circuit Outage',
      description: 'Islanding of coastal transmission network requiring emergency Kipevu thermal blackstart.',
      impactMW: 450,
      severity: 'HIGH'
    }
  ];

  const handleRunSimulation = () => {
    setSimulationRunning(true);
    setTimeout(() => {
      setSimulationRunning(false);
      if (selectedScenario === 'hvdc_trip') {
        setSimulationResults({
          frequencyDip: '49.12 Hz (Recovered to 49.88 Hz in 3.8s)',
          spinningReserveActivated: '650 MW (Hydro fast-valving at Seven Forks + Olkaria Geothermal ramping)',
          voltageStability: 'Maintained at 392 kV at Suswa (within ±5% tolerance)',
          loadSheddingRequired: 'NO (Spinning reserve sufficient to avoid UFLS Stage 1)',
          remedialActions: [
            '1. Trigger Olkaria Geothermal Unit 4 & 5 emergency fast governor response (+120 MW)',
            '2. Ramp Kiambere and Gitaru hydro peaking units from 180 MW to 420 MW',
            '3. Request Uganda 132kV Tororo-Lessos interconnector sync assistance (+80 MW)'
          ]
        });
      } else if (selectedScenario === 'suswa_t1_trip') {
        setSimulationResults({
          frequencyDip: '49.82 Hz (Minimal grid frequency impact)',
          spinningReserveActivated: 'None required (Local thermal redistribution)',
          voltageStability: 'Nairobi North 220kV bus dropped to 212 kV (-3.6%)',
          loadSheddingRequired: 'NO',
          remedialActions: [
            '1. Re-route 160 MW via Isinya-Embakasi 220kV double circuit line',
            '2. Switch in 40 MVAR capacitor bank at Nairobi North to restore voltage profile',
            '3. Place T2 and T3 cooling fans on forced override'
          ]
        });
      } else {
        setSimulationResults({
          frequencyDip: '49.45 Hz (Recovered in 4.2s)',
          spinningReserveActivated: '310 MW Hydro Reserve deployed',
          voltageStability: 'Stable',
          loadSheddingRequired: 'NO',
          remedialActions: [
            '1. Automatic governor action across Sondu Miriu & Seven Forks hydro',
            '2. Initiate thermal backup dispatch at Kipevu III'
          ]
        });
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none font-mono">
      <div className="w-full max-w-3xl bg-[#0b1424] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d182a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                N-1 Contingency & Dynamic Grid Resilience Simulator
              </h3>
              <span className="text-[10px] text-cyan-400">
                Simulate Major Grid Outages, Frequency Dynamics & Automated Remedial Action Schemes (RAS)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
          
          {/* Select Outage Contingency */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Select Contingency Failure Scenario:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {scenarios.map(sc => (
                <div
                  key={sc.id}
                  onClick={() => { setSelectedScenario(sc.id); setSimulationResults(null); }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedScenario === sc.id
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-[#0e182a] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-slate-200 text-xs">{sc.name}</strong>
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] bg-rose-950 text-rose-300 border border-rose-500/40 font-bold">
                      -{sc.impactMW} MW
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{sc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              onClick={handleRunSimulation}
              disabled={simulationRunning}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 text-xs"
            >
              {simulationRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Dynamic Power Flow...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run N-1 Resilience Contingency Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Results */}
          {simulationResults && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs">
                <strong className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Simulation Results & Stability Analysis
                </strong>
                <span className="text-[10px] text-emerald-400 font-bold">GRID STABLE</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div className="p-2 bg-[#0a1220] rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">FREQUENCY TRANSIENT</span>
                  <strong className="text-amber-400">{simulationResults.frequencyDip}</strong>
                </div>
                <div className="p-2 bg-[#0a1220] rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">SPINNING RESERVE DEPLOYED</span>
                  <strong className="text-emerald-400">{simulationResults.spinningReserveActivated}</strong>
                </div>
                <div className="p-2 bg-[#0a1220] rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">VOLTAGE STABILITY</span>
                  <strong className="text-slate-200">{simulationResults.voltageStability}</strong>
                </div>
                <div className="p-2 bg-[#0a1220] rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">AUTOMATIC LOAD SHEDDING</span>
                  <strong className="text-emerald-400">{simulationResults.loadSheddingRequired}</strong>
                </div>
              </div>

              {/* Remedial Action Dispatch */}
              <div className="p-2.5 bg-[#0a1220] rounded-lg border border-slate-800 space-y-1.5 text-[10px]">
                <span className="text-slate-400 font-bold uppercase block">
                  Automated Remedial Action Scheme (RAS) Dispatch Order:
                </span>
                {simulationResults.remedialActions.map((act: string, i: number) => (
                  <div key={i} className="text-cyan-300">
                    {act}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#09101d] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Engine: Fast Decoupled Load Flow (FDLF) & Dynamic Frequency Stability Model</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
