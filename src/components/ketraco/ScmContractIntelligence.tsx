import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, ShieldCheck, Cpu, Play, CheckCircle, AlertTriangle, XCircle, 
  Search, RefreshCw, BarChart3, TrendingUp, Layers, UserCheck, Key, 
  HelpCircle, ArrowRight, GitFork, Activity, Landmark, FileCheck, Info
} from 'lucide-react';

interface Contract {
  id: string;
  name: string;
  supplier: string;
  chi: number; // Contract Health Index
  variation: number; // Variation %
  contingencyUsed: number;
  commitment: number;
  category: string;
  status: 'COMPLIANT' | 'WARNING_HOLD' | 'CRITICAL_HOLD' | 'BREACH_HOLD';
  milestones: { id: string; label: string; date: string; status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED'; weight: number }[];
  obligations: { name: string; requiredBy: string; status: 'MET' | 'PENDING' | 'OVERDUE' | 'FAILED' }[];
  graphEdges: { source: string; target: string; type: string }[];
}

interface ScmModuleProps {
  onAskCopilot: (promptText: string) => void;
}

export default function ScmContractIntelligence({ onAskCopilot }: ScmModuleProps) {
  // Mock active contracts dataset
  const initialContracts: Contract[] = [
    {
      id: 'KTR-2026-SUSWA-04',
      name: 'Suswa-Nairobi 220kV Transmission Line',
      supplier: 'Shanghai Cable Corp',
      chi: 92,
      variation: 14.5,
      contingencyUsed: 1200000,
      commitment: 12400000,
      category: 'Transmission lines',
      status: 'COMPLIANT',
      milestones: [
        { id: 'm1', label: 'Route Survey & Clearance', date: '2026-02-15', status: 'COMPLETED', weight: 10 },
        { id: 'm2', label: 'Tower Foundations', date: '2026-04-10', status: 'COMPLETED', weight: 30 },
        { id: 'm3', label: 'Structural Steel Erection', date: '2026-08-30', status: 'IN_PROGRESS', weight: 40 },
        { id: 'm4', label: 'Conductor Stringing & Commissioning', date: '2026-11-20', status: 'PENDING', weight: 20 }
      ],
      obligations: [
        { name: 'KRA Tax Standing Compliance', requiredBy: '2026-01-01', status: 'MET' },
        { name: 'Performance Security Bond (10%)', requiredBy: '2026-01-15', status: 'MET' },
        { name: 'Right of Way (RoW) Clearance', requiredBy: '2026-03-01', status: 'MET' },
        { name: 'IEC Material Test Certs', requiredBy: '2026-07-15', status: 'PENDING' }
      ],
      graphEdges: [
        { source: 'Shanghai Cable Corp', target: 'Award SBD-409', type: 'awarded' },
        { source: 'Award SBD-409', target: 'KTR-2026-SUSWA-04', type: 'creates' },
        { source: 'KTR-2026-SUSWA-04', target: 'Suswa Substation Grid Node', type: 'upgrades' },
        { source: 'KTR-2026-SUSWA-04', target: 'Nairobi Ring Project', type: 'dependencies' }
      ]
    },
    {
      id: 'KTR-2026-MARIA-02',
      name: 'Mariakani Substation Geotechnical Upgrade',
      supplier: 'Siemens Local Joint-Venture',
      chi: 48,
      variation: 24.2,
      contingencyUsed: 4200000,
      commitment: 8600000,
      category: 'Substations',
      status: 'WARNING_HOLD',
      milestones: [
        { id: 'm1', label: 'Soil Infiltration Survey', date: '2026-01-10', status: 'COMPLETED', weight: 15 },
        { id: 'm2', label: 'Concrete Foundation Piling', date: '2026-03-25', status: 'DELAYED', weight: 35 },
        { id: 'm3', label: 'Switchgear Housing construction', date: '2026-07-15', status: 'PENDING', weight: 25 },
        { id: 'm4', label: 'HV Transformer installation', date: '2026-10-10', status: 'PENDING', weight: 25 }
      ],
      obligations: [
        { name: 'Environmental Impact Audit (NEMA)', requiredBy: '2026-01-10', status: 'MET' },
        { name: 'Contractor Public Liability Insurance', requiredBy: '2026-02-01', status: 'MET' },
        { name: 'Performance Bond Reinforcement', requiredBy: '2026-04-15', status: 'OVERDUE' },
        { name: 'Piling Geotechnical Certify', requiredBy: '2026-05-30', status: 'FAILED' }
      ],
      graphEdges: [
        { source: 'Siemens Local JV', target: 'Award SBD-201', type: 'awarded' },
        { source: 'Award SBD-201', target: 'KTR-2026-MARIA-02', type: 'creates' },
        { source: 'KTR-2026-MARIA-02', target: 'Mariakani Depot', type: 'supplies_to' },
        { source: 'KTR-2026-MARIA-02', target: 'Coast Power Grid Loop', type: 'upgrades' }
      ]
    },
    {
      id: 'KTR-2026-NKR-08',
      name: 'Nakuru-Nyahururu Line Foundation Works',
      supplier: 'El-Molo Geotechnical JV',
      chi: 76,
      variation: 4.8,
      contingencyUsed: 250000,
      commitment: 5200000,
      category: 'Geotechnical civil works',
      status: 'COMPLIANT',
      milestones: [
        { id: 'm1', label: 'Site Geotechnical Digging', date: '2026-03-01', status: 'COMPLETED', weight: 20 },
        { id: 'm2', label: 'Steel Reinforcement Mesh', date: '2026-05-15', status: 'COMPLETED', weight: 30 },
        { id: 'm3', label: 'High-Strength Concrete Pouring', date: '2026-07-20', status: 'IN_PROGRESS', weight: 30 },
        { id: 'm4', label: 'Ground Earthing Rods Placement', date: '2026-09-30', status: 'PENDING', weight: 20 }
      ],
      obligations: [
        { name: 'Local Content Ratio Audit (30%)', requiredBy: '2026-02-15', status: 'MET' },
        { name: 'Workmen Compensation Insurance', requiredBy: '2026-02-28', status: 'MET' },
        { name: 'NEMA Environmental Clearance', requiredBy: '2026-03-10', status: 'MET' },
        { name: 'Steel Tensile Strength Report', requiredBy: '2026-06-15', status: 'MET' }
      ],
      graphEdges: [
        { source: 'El-Molo Geotechnical JV', target: 'Award SBD-109', type: 'awarded' },
        { source: 'Award SBD-109', target: 'KTR-2026-NKR-08', type: 'creates' },
        { source: 'KTR-2026-NKR-08', target: 'Nakuru Power Station', type: 'dependencies' }
      ]
    },
    {
      id: 'KTR-2026-LDV-11',
      name: 'Loldia Geothermal Conductor Supplies',
      supplier: 'Far-East Power Grid Ltd',
      chi: 14,
      variation: 26.5,
      contingencyUsed: 3100000,
      commitment: 11700000,
      category: 'Conductors & Isolators',
      status: 'BREACH_HOLD',
      milestones: [
        { id: 'm1', label: 'SBD Sample Spec Verification', date: '2026-01-20', status: 'COMPLETED', weight: 10 },
        { id: 'm2', label: 'Factory Inspection Payout', date: '2026-03-15', status: 'COMPLETED', weight: 20 },
        { id: 'm3', label: 'Mombasa Port Cargo Offloading', date: '2026-05-10', status: 'DELAYED', weight: 40 },
        { id: 'm4', label: 'Mariakani Depot Material Delivery', date: '2026-06-30', status: 'DELAYED', weight: 30 }
      ],
      obligations: [
        { name: 'Tax Compliance Ledger Check', requiredBy: '2026-01-05', status: 'MET' },
        { name: 'Performance Security Deposit', requiredBy: '2026-01-20', status: 'MET' },
        { name: 'Oceanic Shipping Bill of Lading', requiredBy: '2026-04-10', status: 'FAILED' },
        { name: 'Inspection Committee Handover', requiredBy: '2026-06-20', status: 'OVERDUE' }
      ],
      graphEdges: [
        { source: 'Far-East Power Grid Ltd', target: 'Award SBD-801', type: 'awarded' },
        { source: 'Award SBD-801', target: 'KTR-2026-LDV-11', type: 'creates' },
        { source: 'KTR-2026-LDV-11', target: 'Loldia Geothermal Node', type: 'upgrades' }
      ]
    }
  ];

  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [selectedContractId, setSelectedContractId] = useState<string>('KTR-2026-SUSWA-04');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'obligations' | 'graph'>('details');

  // Simulation controls state
  const [simulatedScenario, setSimulatedScenario] = useState<string>('none');
  const [simulationResults, setSimulationResults] = useState<{
    chiDelta: number;
    variationDelta: number;
    probability: number;
    verdict: string;
    actionRequired: string;
  } | null>(null);

  // HITL signature form state
  const [hitlComment, setHitlComment] = useState('');
  const [hitlPin, setHitlPin] = useState('');
  const [hitlCoSigner, setHitlCoSigner] = useState('Director SCM');
  const [hitlStatus, setHitlStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const selectedContract = contracts.find(c => c.id === selectedContractId) || contracts[0];

  const filteredContracts = contracts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger what-if simulation run
  const runWhatIfSimulation = (scenario: string) => {
    setSimulatedScenario(scenario);
    if (scenario === 'copper_price_spike') {
      setSimulationResults({
        chiDelta: -12,
        variationDelta: 7.2,
        probability: 94,
        verdict: 'STATUTORY WARNING: Cumulative variation will approach 21.7%. Approaching PPADA Section 139 limit!',
        actionRequired: 'Requires Head of SCM and Project Director digital handshake.'
      });
    } else if (scenario === 'soil_failure_delay') {
      setSimulationResults({
        chiDelta: -32,
        variationDelta: 12.5,
        probability: 65,
        verdict: 'STATUTORY CEILING CRASHED: Proposed variation exceeds 25.0% maximum permitted by PPADA Sec 139!',
        actionRequired: 'CRITICAL SHIELD ENGAGED. Fully blocked. Negotiation Sandbox recommends counterfactual retender or local material sourcing.'
      });
    } else if (scenario === 'schedule_crash_air') {
      setSimulationResults({
        chiDelta: 8,
        variationDelta: 3.5,
        probability: 88,
        verdict: 'COMPLIANT: Solves scheduling bottleneck with nominal contingency drawdown.',
        actionRequired: 'Permitted. Signature of executive required to commit Ksh 435,000 extra shipping contingency.'
      });
    } else {
      setSimulationResults(null);
    }
  };

  // Submit secure HITL Overrides to change the contract status
  const handleSubmitOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (hitlPin !== '1234') {
      setHitlStatus({ success: false, message: 'Invalid Sovereign PIN clearance. Access Denied.' });
      return;
    }
    if (!hitlComment.trim()) {
      setHitlStatus({ success: false, message: 'Auditable justification comments are legally mandatory.' });
      return;
    }

    // Process override and resolve state changes on selected contract
    const updated = contracts.map(c => {
      if (c.id === selectedContractId) {
        let newVariation = c.variation;
        if (simulatedScenario === 'copper_price_spike') {
          newVariation = +(c.variation + 7.2).toFixed(1);
        } else if (simulatedScenario === 'schedule_crash_air') {
          newVariation = +(c.variation + 3.5).toFixed(1);
        }

        return {
          ...c,
          status: 'COMPLIANT' as const,
          chi: Math.min(c.chi + 15, 100),
          variation: newVariation
        };
      }
      return c;
    });

    setContracts(updated);
    setHitlStatus({ 
      success: true, 
      message: `MANDATORY LOCK RESOLVED: Successfully authorized override for ${selectedContract.id}. Incident signed & published to Policy Memory.` 
    });
    setHitlComment('');
    setHitlPin('');
    setSimulatedScenario('none');
    setSimulationResults(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0f1d] text-slate-100 font-sans" id="acin-framework">
      {/* HEADER SECTION: Portfolio Telemetry & Executive Scoreboards */}
      <div className="p-4 bg-[#111a31] border-b border-cyan-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-cyan-500/30 rounded-xl bg-[#09101f] flex items-center justify-center text-cyan-400">
            <Cpu className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono tracking-widest text-[#00E1FF] font-black uppercase">ACIN COGNITIVE SYSTEM</span>
              <span className="text-[7.5px] font-mono bg-indigo-950/40 border border-indigo-500/20 px-1 py-0.2 rounded font-black text-indigo-400">PHASE 24 ACTIVE</span>
            </div>
            <h1 className="text-base font-display font-medium text-slate-100">Autonomous Contract Intelligence Network</h1>
          </div>
        </div>

        {/* Global KPI dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 bg-slate-950/45 rounded-lg border border-slate-800 flex flex-col justify-center">
            <span className="text-[8px] font-mono text-slate-500 uppercase font-black">Portfolio Commitment</span>
            <span className="text-xs font-mono font-bold text-white mt-0.5">Ksh 42.4 Billion</span>
          </div>
          <div className="p-2.5 bg-slate-950/45 rounded-lg border border-slate-800 flex flex-col justify-center">
            <span className="text-[8px] font-mono text-slate-500 uppercase font-black">Contingency Reserve</span>
            <span className="text-xs font-mono font-bold text-[#00E1FF] mt-0.5">Ksh 6.8 Billion</span>
          </div>
          <div className="p-2.5 bg-slate-950/45 rounded-lg border border-slate-800 flex flex-col justify-center">
            <span className="text-[8px] font-mono text-slate-500 uppercase font-black">PPADA Statutory Holds</span>
            <span className="text-xs font-mono font-bold text-amber-400 mt-0.5">2 Active Holds</span>
          </div>
          <div className="p-2.5 bg-slate-950/45 rounded-lg border border-slate-800 flex flex-col justify-center">
            <span className="text-[8px] font-mono text-slate-500 uppercase font-black">Portfolio Health Index</span>
            <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5">82.4%</span>
          </div>
        </div>
      </div>

      {/* THREE-PANEL CORE SPACE LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT COMPARTMENT: Live Digital Twin Registry Selector */}
        <div className="w-full lg:w-96 border-r border-slate-850 bg-[#070b15]/60 flex flex-col overflow-hidden shrink-0">
          <div className="p-3 border-b border-slate-900 bg-[#0d1222]/80">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search contract twin ID or supplier..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#03060c] border border-slate-800 focus:border-cyan-500/25 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Living list items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest block pl-2 py-1">
              Active Portfolio Twins
            </span>
            {filteredContracts.map(c => {
              const isSelected = c.id === selectedContractId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedContractId(c.id);
                    setSimulatedScenario('none');
                    setSimulationResults(null);
                    setHitlStatus(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 relative cursor-pointer ${
                    isSelected 
                      ? 'bg-[#121a30] border-cyan-500/35 shadow-[0_0_15px_rgba(0,225,255,0.08)]' 
                      : 'bg-[#080d1a] border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold text-slate-450">{c.id}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded font-black border ${
                      c.status === 'COMPLIANT' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' :
                      c.status === 'WARNING_HOLD' ? 'bg-amber-950/20 border-amber-500/30 text-amber-400' :
                      'bg-pink-950/20 border-pink-500/30 text-pink-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-white truncate w-full">{c.name}</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-slate-900">
                    <div>
                      <span className="text-slate-500 block">Health Index</span>
                      <span className={`font-bold ${c.chi > 75 ? 'text-emerald-400' : c.chi > 45 ? 'text-amber-400' : 'text-pink-400'}`}>
                        {c.chi}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Variation %</span>
                      <span className={`font-bold ${c.variation > 15 ? 'text-pink-400' : 'text-slate-200'}`}>
                        {c.variation}% / 25% Max
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTRAL & RIGHT COMPARTMENTS: Selected Twin Details & Graph Mesh */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Main Selected Twin Interactive Segment Header */}
          <div className="p-4 bg-[#0d1323] border-b border-slate-900 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{selectedContract.id}</span>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-mono text-slate-400">{selectedContract.category}</span>
              </div>
              <h2 className="text-sm font-semibold text-white mt-1">{selectedContract.name}</h2>
              <p className="text-[11px] font-mono text-slate-500 mt-1">Supplier Party: <span className="text-[#00E1FF]">{selectedContract.supplier}</span></p>
            </div>

            {/* Quick module action query */}
            <button 
              onClick={() => onAskCopilot(`Explain active reasoning logic parameters and rules set for the contract twin: ${selectedContract.id}`)}
              className="px-2.5 py-1.5 bg-[#121c32] hover:bg-[#192744] text-[10.5px] font-mono text-[#00E1FF] border border-cyan-500/20 rounded-lg transition-colors flex items-center gap-1.5 self-start cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ask Atlas AI Explainability Trace</span>
            </button>
          </div>

          {/* Sub-tab Selection inside Twin Compartment */}
          <div className="flex border-b border-slate-900 bg-[#080d19]/40 px-4">
            {(['details', 'obligations', 'graph'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 text-xs font-mono border-b-2 transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'border-cyan-400 text-[#00E1FF] bg-cyan-950/5' 
                    : 'border-transparent text-slate-500 hover:text-white'
                }`}
              >
                {tab === 'details' ? 'Digital Twin Timeline' :
                 tab === 'obligations' ? 'Active Obligations Audit' :
                 'Contract Graph Network'}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS DISPLAY WINDOW */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 block font-bold">CONTRACT VALUE LIMIT</span>
                    <span className="text-sm font-mono font-bold text-white block mt-1">Ksh {(selectedContract?.commitment ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 block font-bold">CONTINGENCY ALLOCATED</span>
                    <span className="text-sm font-mono font-bold text-[#00E1FF] block mt-1">Ksh {(selectedContract?.contingencyUsed ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-[#0a0f1d] border border-slate-850 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 block font-bold">PPADA CEILING EXPOSURE</span>
                    <span className={`text-sm font-mono font-bold block mt-1 ${selectedContract.variation > 20 ? 'text-pink-400 animate-pulse' : 'text-slate-300'}`}>
                      {selectedContract.variation}% / 25% Max
                    </span>
                  </div>
                </div>

                {/* Milestone Delivery Tracks */}
                <div className="bg-[#090e1a] border border-slate-850 rounded-xl p-4">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold mb-3 uppercase tracking-wider">
                    Milestone Physical Delivery Tracking
                  </span>
                  
                  <div className="space-y-4 relative pl-4 border-l border-slate-800 ml-2">
                    {selectedContract.milestones.map((m, idx) => (
                      <div key={m.id} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border ${
                          m.status === 'COMPLETED' ? 'bg-emerald-400 border-emerald-950 shadow-[0_0_6px_rgba(52,211,153,0.6)]' :
                          m.status === 'IN_PROGRESS' ? 'bg-[#00D9FF] border-cyan-950 animate-pulse' :
                          m.status === 'DELAYED' ? 'bg-pink-400 border-pink-950 animate-ping' :
                          'bg-slate-700 border-slate-950'
                        }`} />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <span className="text-xs font-semibold text-white block">{m.label}</span>
                            <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">Target Deadline: {m.date} | Weight: {m.weight}%</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[8.5px] font-mono rounded font-black self-start sm:self-center border ${
                            m.status === 'COMPLETED' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' :
                            m.status === 'IN_PROGRESS' ? 'bg-cyan-950/20 border-cyan-500/20 text-[#00E1FF]' :
                            m.status === 'DELAYED' ? 'bg-pink-950/20 border-pink-500/20 text-pink-400' :
                            'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'obligations' && (
              <div className="bg-[#090e1a] border border-slate-850 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-850 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                    Sovereign Obligation compliance checklist
                  </span>
                  <span className="text-[8px] font-mono text-[#00E1FF] bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                    Live Audit Sync
                  </span>
                </div>
                <div className="divide-y divide-slate-850">
                  {selectedContract.obligations.map((o, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {o.status === 'MET' ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> :
                         o.status === 'PENDING' ? <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" /> :
                         o.status === 'FAILED' ? <XCircle className="w-4 h-4 text-pink-400 shrink-0" /> :
                         <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />}
                        <div>
                          <span className="text-white font-medium block">{o.name}</span>
                          <span className="text-[9.5px] font-mono text-slate-500 mt-0.5 block">Audit Threshold Due: {o.requiredBy}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[8.5px] font-mono rounded font-black border ${
                        o.status === 'MET' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' :
                        o.status === 'PENDING' ? 'bg-cyan-950/20 border-cyan-500/20 text-[#00E1FF]' :
                        o.status === 'FAILED' ? 'bg-pink-950/20 border-pink-500/20 text-pink-400' :
                        'bg-amber-950/20 border-amber-500/20 text-amber-400'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="bg-[#090e1a] border border-slate-850 rounded-xl p-4 min-h-[220px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      Contract Knowledge Graph Network Mesh
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">Semantic GraphRAG Engine</span>
                  </div>

                  {/* High Fidelity Visual Semantic Nodes Mapping */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 text-center">
                      <span className="text-[8.5px] font-mono text-slate-500 block uppercase font-bold">SOURCE PARTY</span>
                      <span className="text-xs font-semibold text-[#00E1FF] block mt-1">{selectedContract.supplier}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 text-center flex flex-col justify-center items-center">
                      <span className="text-[8.5px] font-mono text-slate-500 block uppercase font-bold">TRANSITION ENTITY</span>
                      <span className="text-xs font-semibold text-white mt-1 font-mono">{selectedContract.id}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 text-center">
                      <span className="text-[8.5px] font-mono text-slate-500 block uppercase font-bold">TARGET GRID BOUNDARY</span>
                      <span className="text-xs font-semibold text-emerald-400 block mt-1">National Transmission Loop</span>
                    </div>
                  </div>

                  {/* Multi-Hop Traversals Preview list */}
                  <div className="mt-4 space-y-1.5 p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block mb-1">Traversable Semantic Edges:</span>
                    {selectedContract.graphEdges.map((e, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10.5px] font-mono text-slate-350">
                        <span className="text-slate-450 font-bold">{e.source}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                        <span className="text-indigo-400 bg-indigo-950/30 px-1 py-0.2 rounded border border-indigo-500/10 text-[9px]">{e.type}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                        <span className="text-white">{e.target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-850 flex items-center gap-2">
                  <GitFork className="w-3.5 h-3.5 text-[#00E1FF]" />
                  <span>Interactive GraphRAG maps relationships, dependencies, and structural risk propagation instantly.</span>
                </div>
              </div>
            )}

            {/* BOTTOM COMPARTMENT: Negotiation Simulator Sandbox & Statutory Compliance Overrides */}
            <div className="bg-[#0e162b] border border-cyan-500/20 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    ACIN Multi-Agent Negotiation Simulator
                  </span>
                </div>
                <span className="text-[8.5px] font-mono text-[#00E1FF] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 font-black">
                  Causal AI Engine
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scenario Selector & description */}
                <div className="space-y-3 text-xs">
                  <label className="text-[10.5px] font-mono text-slate-400 block font-bold">CHOOSE SIMULATION SCENARIO</label>
                  <select 
                    value={simulatedScenario}
                    onChange={(e) => runWhatIfSimulation(e.target.value)}
                    className="w-full bg-[#040812] border border-slate-800 focus:border-cyan-500/25 rounded-lg py-2 px-3 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="none">-- Select Scenario proposal to run --</option>
                    <option value="copper_price_spike">A: Material copper surge (+15% Conductor raw material cost)</option>
                    <option value="soil_failure_delay">B: Geotechnical soil foundation shift (+60 days schedule delay)</option>
                    <option value="schedule_crash_air">C: Speed up critical path logistics (Air charter shipment of insulators)</option>
                  </select>

                  <p className="text-[11px] leading-relaxed text-slate-450">
                    The simulator runs the project's digital twin against the structural, logistical, and legal constraints 
                    defined in KETRACO's SCM repositories, checking compliance limits under PPADA Section 139.
                  </p>
                </div>

                {/* Simulation Output results overlay */}
                <AnimatePresence mode="wait">
                  {simulationResults ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="p-3 bg-[#040812] border border-cyan-500/15 rounded-lg space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
                        <span className="text-[9.5px] font-mono text-cyan-400 font-bold uppercase">PROJECTION METRICS</span>
                        <span className="text-[9.5px] font-mono text-emerald-400 font-bold">Confidence: {simulationResults.probability}%</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                        <div>
                          <span className="text-slate-500 block">Health Index Delta</span>
                          <span className={`font-bold ${simulationResults.chiDelta < 0 ? 'text-pink-400' : 'text-emerald-400'}`}>
                            {simulationResults.chiDelta > 0 ? '+' : ''}{simulationResults.chiDelta}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Variation Delta</span>
                          <span className="text-white font-bold">
                            +{simulationResults.variationDelta}%
                          </span>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-950 rounded border border-slate-900 text-[10px] leading-relaxed">
                        <span className="text-amber-400 font-bold block mb-0.5">Sovereign Audit Verdict:</span>
                        <p className="text-slate-350">{simulationResults.verdict}</p>
                      </div>

                      <div className="text-[9.5px] font-mono text-slate-450 leading-relaxed">
                        <span className="text-[#00E1FF] font-bold">Next Action:</span> {simulationResults.actionRequired}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col justify-center items-center p-6 border border-dashed border-slate-800 rounded-lg text-slate-550 select-none text-center">
                      <TrendingUp className="w-7 h-7 text-slate-700 mb-1" />
                      <span className="text-[10px] font-mono">Select a simulation proposal scenario on the left to review metrics</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* MANDATORY SOVEREIGN HUMAN SIGNATURE KEYLOCK FORM */}
              {selectedContract.status !== 'COMPLIANT' && (
                <form onSubmit={handleSubmitOverride} className="mt-4 p-4 bg-[#070c19] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-850">
                    <UserCheck className="w-4 h-4 text-[#00D9FF]" />
                    <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                      MANDATORY HITL COMPLIANCE SIGN-OFF LOCK
                    </span>
                  </div>

                  <p className="text-[10.5px] leading-relaxed text-slate-500">
                    The contract is currently in a statutory hold state under PPADA directives. Releasing funds or committing price variations 
                    requires a validated signature co-signed and logged to the enterprise policy memory.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-slate-400 font-bold block uppercase">CO-SIGNER PARTY</label>
                      <select 
                        value={hitlCoSigner}
                        onChange={(e) => setHitlCoSigner(e.target.value)}
                        className="w-full bg-[#03060c] border border-slate-850 focus:border-cyan-500/25 rounded-lg py-1.5 px-3.5 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        <option value="Director SCM">SCM Director</option>
                        <option value="Managing Director">Managing Director</option>
                        <option value="Board Chairman">Board Chairman</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-mono text-slate-400 font-bold block uppercase">SOVEREIGN PIN (Default: 1234)</label>
                      <input 
                        type="password" 
                        placeholder="PIN Code"
                        value={hitlPin}
                        onChange={(e) => setHitlPin(e.target.value)}
                        className="w-full bg-[#03060c] border border-slate-850 focus:border-cyan-500/25 rounded-lg py-1.5 px-3.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 md:col-span-1">
                      <label className="text-[9.5px] font-mono text-slate-400 font-bold block uppercase">COMMIT OVERRIDE</label>
                      <button 
                        type="submit"
                        className="w-full bg-[#00D9FF]/10 text-[#00D9FF] hover:bg-[#00D9FF]/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg py-1.5 text-xs font-mono font-bold cursor-pointer transition-all uppercase flex items-center justify-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Sign Lock Handshake</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono text-slate-400 font-bold block uppercase">LEGAL AUDITABLE JUSTIFICATION REMARKS</label>
                    <textarea 
                      placeholder="Input official justification remarks to commit to the unalterable audit ledger..."
                      value={hitlComment}
                      onChange={(e) => setHitlComment(e.target.value)}
                      rows={2}
                      className="w-full bg-[#03060c] border border-slate-850 focus:border-cyan-500/25 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none font-sans"
                    />
                  </div>

                  <AnimatePresence>
                    {hitlStatus && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                          hitlStatus.success 
                            ? 'bg-emerald-950/20 border-emerald-500/25 text-emerald-400' 
                            : 'bg-pink-950/20 border-pink-500/25 text-pink-400'
                        }`}
                      >
                        {hitlStatus.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
