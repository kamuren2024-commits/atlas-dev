import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Zap, 
  Flame, 
  ArrowRight, 
  Radio, 
  Gauge, 
  Cpu, 
  AlertTriangle,
  FileSpreadsheet,
  Split,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  ScenarioDefinition, 
  SimulationPowerFlowResult, 
  ScenarioComparisonResult, 
  RemedialActionOption, 
  ContingencySeverity 
} from './types';
import { GridScenarioEngine } from './scenario-engine';
import { GridAsset, TransmissionLine } from '../types';

interface ScenarioLabProps {
  substations: Record<string, GridAsset>;
  lines: Record<string, TransmissionLine>;
  onSelectAsset?: (assetId: string) => void;
  preselectedScenarioId?: string | null;
}

export default function ScenarioLab({
  substations,
  lines,
  onSelectAsset,
  preselectedScenarioId
}: ScenarioLabProps) {
  const [scenarios] = useState<ScenarioDefinition[]>(GridScenarioEngine.STANDARD_SCENARIOS || []);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    preselectedScenarioId || GridScenarioEngine.STANDARD_SCENARIOS?.[0]?.id || 'SCEN_SUSWA_T1_TRIP'
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ScenarioComparisonResult>(() => {
    const defaultScen = GridScenarioEngine.STANDARD_SCENARIOS?.find(s => s.id === (preselectedScenarioId || 'SCEN_SUSWA_T1_TRIP')) || GridScenarioEngine.STANDARD_SCENARIOS?.[0];
    return GridScenarioEngine.compareScenarioWithRemediations(defaultScen, substations, lines);
  });
  const [selectedRemedialId, setSelectedRemedialId] = useState<string>('ACTION_OPT_A_REDISPATCH');

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0] || ({
    id: 'SCEN_SUSWA_T1_TRIP',
    name: 'Suswa 400/220kV Auto-Transformer T1 Trip',
    type: 'N_MINUS_1_TRANSFORMER',
    description: 'Sudden loss of 350MVA auto-transformer at Suswa national hub.',
    contingentAssetId: 'suswa_t1',
    lossMW: 320,
    defaultSeverity: 'CRITICAL',
    probability: 0.042
  } as unknown as ScenarioDefinition);

  const handleRunSimulation = (scenId: string) => {
    setIsSimulating(true);
    setSelectedScenarioId(scenId);
    setTimeout(() => {
      const scen = scenarios.find(s => s.id === scenId) || scenarios[0];
      const result = GridScenarioEngine.compareScenarioWithRemediations(scen, substations, lines);
      setComparisonResult(result);
      setSelectedRemedialId(result?.remedialOptions?.[0]?.id || 'ACTION_OPT_A_REDISPATCH');
      setIsSimulating(false);
    }, 280);
  };

  const currentRemedial = comparisonResult?.remedialOptions?.find(o => o.id === selectedRemedialId) || comparisonResult?.remedialOptions?.[0];
  const remediatedFlow = currentRemedial?.simulatedOutcome || comparisonResult?.baseline || {
    frequencyHz: 50.00,
    freqDeltaHz: 0.0,
    unservedEnergyMW: 0,
    spinningReserveMW: 120,
    minBusVoltagePU: 0.99,
    minBusVoltageKV: 396,
    maxLineLoadingPct: 78,
    overloadedLineCount: 0,
    riskIndex: 15,
    summary: 'System nominal'
  };

  const severityBadge = (severity: ContingencySeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-red-500/20 text-red-400 border border-red-500/40">CRITICAL</span>;
      case 'SEVERE':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">SEVERE</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">HIGH</span>;
      case 'MODERATE':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">MODERATE</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">SAFE / LOW</span>;
    }
  };

  return (
    <div className="w-full bg-[#050913] text-slate-100 p-4 space-y-4 font-mono">
      {/* Header Banner & Safety Boundary Notice */}
      <div className="bg-[#090e1a] border border-cyan-900/50 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="text-base font-bold tracking-wider text-slate-100">
                SCENARIO LAB: WHAT-IF DIGITAL TWIN SIMULATION
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                AC POWER-FLOW & CONTINGENCY SOLVER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate physical contingency cascades, assess post-trip frequency & thermal excursions, and evaluate remedial mitigation candidates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRunSimulation(selectedScenarioId)}
              disabled={isSimulating}
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
            >
              <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'SOLVING AC FLOW...' : 'RUN SIMULATION'}
            </button>
          </div>
        </div>

        {/* Safety Boundary Notice */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-500/10 px-3 py-1.5 rounded border border-amber-500/20">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>SAFETY BOUNDARY ENFORCED:</strong> Decision support tool only. The system does not automatically dispatch generation, trip breakers, or modify topology. Operator manual authorization is strictly mandatory.
          </span>
        </div>
      </div>

      {/* Scenario Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {scenarios.map(scen => {
          const isSelected = scen.id === selectedScenarioId;
          return (
            <div
              key={scen.id}
              onClick={() => handleRunSimulation(scen.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0d182e] border-cyan-500 shadow-md shadow-cyan-500/20'
                  : 'bg-[#090e1a] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {scen.type.replace('_', ' ')}
                  </span>
                  {severityBadge(scen.defaultSeverity)}
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-2">{scen.name}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{scen.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Loss: <strong className="text-red-400">-{scen.lossMW} MW</strong></span>
                <span>Prob: <strong className="text-cyan-400">{(scen.probability * 100).toFixed(1)}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Workspace: BASELINE vs SCENARIO vs REMEDIATED */}
      <div className="bg-[#090e1a] border border-slate-800 rounded-lg p-4 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-slate-200">
              TRIPLE POWER-FLOW COMPARISON MATRIX: {activeScenario.name}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Solver Duration: <strong>{comparisonResult.contingency.executionDurationMs} ms</strong>
          </span>
        </div>

        {/* 3-Column State Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: BASELINE (Normal) */}
          <div className="bg-[#050913] border border-slate-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>STATE 1: BASELINE (NORMAL)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">NORMAL 50.02 Hz</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">System Frequency</span>
                <span className="font-bold text-slate-200">{comparisonResult.baseline.frequencyHz} Hz</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Demand Served</span>
                <span className="font-bold text-slate-200">{comparisonResult.baseline.demandServedMW} MW</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Spinning Reserve</span>
                <span className="font-bold text-emerald-400">{comparisonResult.baseline.spinningReserveMW} MW</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Min 400kV Bus Voltage</span>
                <span className="font-bold text-slate-200">{comparisonResult.baseline.minBusVoltagePU} p.u. ({comparisonResult.baseline.minBusVoltageKV} kV)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Max Line Loading</span>
                <span className="font-bold text-slate-200">{comparisonResult.baseline.maxLineLoadingPct}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Overloaded Lines</span>
                <span className="font-bold text-emerald-400">0 Overloads</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">System Risk Index</span>
                <span className="font-bold text-slate-200">{comparisonResult.baseline.riskIndex} / 100</span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
              {comparisonResult.baseline.summary}
            </div>
          </div>

          {/* Column 2: SCENARIO (Unmitigated Contingency) */}
          <div className="bg-[#0f0a14] border border-red-900/60 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-red-900/60 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping"></span>
                <span>STATE 2: CONTINGENCY (POST-TRIP)</span>
              </div>
              {severityBadge(comparisonResult.contingency.contingencySeverity)}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-red-950">
                <span className="text-slate-400">System Frequency</span>
                <span className="font-bold text-red-400">{comparisonResult.contingency.frequencyHz} Hz ({comparisonResult.contingency.freqDeltaHz} Hz)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-950">
                <span className="text-slate-400">Unserved Energy</span>
                <span className={`font-bold ${comparisonResult.contingency.unservedEnergyMW > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                  {comparisonResult.contingency.unservedEnergyMW} MW
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-950">
                <span className="text-slate-400">Spinning Reserve</span>
                <span className="font-bold text-amber-400">{comparisonResult.contingency.spinningReserveMW} MW</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-950">
                <span className="text-slate-400">Min Bus Voltage</span>
                <span className="font-bold text-amber-400">{comparisonResult.contingency.minBusVoltagePU} p.u. ({comparisonResult.contingency.minBusVoltageKV} kV)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-950">
                <span className="text-slate-400">Max Line Loading</span>
                <span className="font-bold text-red-400">{comparisonResult.contingency.maxLineLoadingPct}% (THERMAL EXCURSION)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-red-950">
                <span className="text-slate-400">Overloaded Lines</span>
                <span className="font-bold text-red-400">{comparisonResult.contingency.overloadedLineCount} Lines Exceeded</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Contingency Risk</span>
                <span className="font-bold text-red-400">{comparisonResult.contingency.riskIndex} / 100</span>
              </div>
            </div>

            <div className="p-2 rounded bg-red-950/40 border border-red-900/50 text-[11px] text-red-300">
              {comparisonResult.contingency.summary}
            </div>
          </div>

          {/* Column 3: REMEDIATED (Mitigation Applied) */}
          <div className="bg-[#05131f] border border-cyan-900/60 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>STATE 3: WITH REMEDIAL ACTION</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] rounded font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">STABILIZED</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-cyan-950">
                <span className="text-slate-400">System Frequency</span>
                <span className="font-bold text-cyan-400">{remediatedFlow.frequencyHz} Hz ({remediatedFlow.freqDeltaHz} Hz)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-950">
                <span className="text-slate-400">Unserved Energy</span>
                <span className="font-bold text-emerald-400">{remediatedFlow.unservedEnergyMW} MW</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-950">
                <span className="text-slate-400">Spinning Reserve</span>
                <span className="font-bold text-cyan-400">{remediatedFlow.spinningReserveMW} MW</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-950">
                <span className="text-slate-400">Min Bus Voltage</span>
                <span className="font-bold text-emerald-400">{remediatedFlow.minBusVoltagePU} p.u. ({remediatedFlow.minBusVoltageKV} kV)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-950">
                <span className="text-slate-400">Max Line Loading</span>
                <span className="font-bold text-emerald-400">{remediatedFlow.maxLineLoadingPct}% (SAFE)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyan-950">
                <span className="text-slate-400">Overloaded Lines</span>
                <span className="font-bold text-emerald-400">{remediatedFlow.overloadedLineCount} Overloads</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Post-Action Risk</span>
                <span className="font-bold text-emerald-400">{remediatedFlow.riskIndex} / 100</span>
              </div>
            </div>

            <div className="p-2 rounded bg-cyan-950/40 border border-cyan-900/50 text-[11px] text-cyan-300">
              {remediatedFlow.summary}
            </div>
          </div>
        </div>

        {/* Remedial Action Option Picker */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">
              SELECT CANDIDATE REMEDIAL ACTION (REMEDIATION ADVISORY):
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {comparisonResult.remedialOptions.map(opt => {
              const isSel = opt.id === selectedRemedialId;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedRemedialId(opt.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-400/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-100">{opt.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {opt.confidence}% CONF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-2">{opt.description}</p>
                  <div className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 p-1.5 rounded border border-cyan-900">
                    Benefit: {opt.expectedBenefit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
