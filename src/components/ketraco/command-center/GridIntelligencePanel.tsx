import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Activity, Zap, Cpu, 
  Layers, Sparkles, CheckCircle2, Clock, Info, ArrowRight,
  TrendingUp, Database, FileText, ChevronRight, X, User, ExternalLink,
  Send, HelpCircle, Network, Flame, Search
} from 'lucide-react';
import { 
  GridAsset, 
  GridAlarm, 
  GridEvent, 
  AiInvestigationInsight 
} from './types';
import { GridAnomaly, GridIncident, CopilotQAResult } from './intelligence/types';
import { GridIntelligenceState } from './intelligence/intelligence-fabric';

interface GridIntelligencePanelProps {
  selectedAsset: GridAsset | null;
  onClearSelection: () => void;
  alarms: GridAlarm[];
  events: GridEvent[];
  aiInsights: Record<string, AiInvestigationInsight>;
  onAskCopilot: (prompt: string) => void;
  intelligenceState?: GridIntelligenceState;
  copilotQAHistory?: CopilotQAResult[];
  onSelectAsset?: (assetId: string) => void;
}

export default function GridIntelligencePanel({
  selectedAsset,
  onClearSelection,
  alarms,
  events,
  aiInsights,
  onAskCopilot,
  intelligenceState,
  copilotQAHistory = [],
  onSelectAsset
}: GridIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState<'copilot' | 'anomalies' | 'incidents' | 'telemetry' | 'health_risk' | 'topology'>('copilot');
  const [customPrompt, setCustomPrompt] = useState('');

  const anomalies = intelligenceState?.anomalies || [];
  const incidents = intelligenceState?.incidents || [];
  const accuracy = intelligenceState?.accuracyMetrics;

  const smartQuestions = [
    'What is abnormal across the national grid?',
    'Why is Suswa Auto-Transformer T1 top-oil temperature elevated?',
    'What happens if the 400kV Suswa–Isinya line trips (N-1)?',
    'What alternative bypass paths exist for Nairobi Metro Ring?',
    'What should the operator investigate on the Western 220kV link?'
  ];

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    onAskCopilot(promptText);
    setCustomPrompt('');
  };

  // If no asset is selected, render National Grid Overview Intelligence & Copilot
  if (!selectedAsset) {
    return (
      <aside className="w-88 xl:w-[420px] bg-[#0a1220]/95 border-l border-slate-800/90 flex flex-col h-full overflow-hidden select-none z-20 backdrop-blur-md font-mono text-xs">
        
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-wider uppercase block">
                GRID INTELLIGENCE COPILOT
              </span>
              <span className="text-[9px] text-slate-400">
                Phase 04 Operating System ({accuracy?.overallAccuracy || 94.2}% Accuracy)
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[9px] rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
            {accuracy?.isPassingTarget ? 'ACCURACY PASS' : 'AUDIT'}
          </span>
        </div>

        {/* Global Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-[#08101e] px-2 text-[10px]">
          {[
            { id: 'copilot', label: 'AI Copilot' },
            { id: 'anomalies', label: `Anomalies (${anomalies.length})` },
            { id: 'incidents', label: `Incidents (${incidents.length})` },
            { id: 'generation', label: 'Fuel Mix' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-2.5 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-slate-300">
          
          {/* TAB 1: COPILOT CONVERSATIONAL OPERATING INTELLIGENCE */}
          {activeTab === 'copilot' && (
            <div className="space-y-3">
              
              {/* Query Input Box */}
              <div className="p-2.5 rounded-xl bg-[#0e192c] border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Grid Intelligence Copilot</span>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(customPrompt)}
                    placeholder="Ask about anomalies, root causes, N-1 risk, or bypass paths..."
                    className="flex-1 px-2.5 py-1.5 bg-[#070e1a] border border-slate-700 rounded-lg text-[10.5px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    onClick={() => handleSendPrompt(customPrompt)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>

                {/* Instant Smart Question Buttons */}
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Operator Fast Inquiries:</span>
                  <div className="flex flex-col gap-1">
                    {smartQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendPrompt(q)}
                        className="text-left px-2 py-1 bg-[#09111e] hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 rounded text-[9.5px] transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <span className="truncate pr-1">{q}</span>
                        <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 text-cyan-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest Copilot Answers / Responses */}
              {copilotQAHistory.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase pb-1 border-b border-slate-800">
                    <span>Grounded Operator Responses</span>
                    <span className="text-cyan-400">{copilotQAHistory.length} QA records</span>
                  </div>

                  {copilotQAHistory.slice().reverse().map((qa, i) => (
                    <div key={i} className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/40 space-y-2 text-[10px]">
                      <div className="flex items-start justify-between gap-2 border-b border-cyan-500/20 pb-1">
                        <strong className="text-cyan-300 text-[10.5px]">{qa.question}</strong>
                        <span className="text-[9px] text-emerald-400 font-bold shrink-0">
                          {qa.confidence}% Conf
                        </span>
                      </div>

                      <p className="text-slate-200 leading-relaxed text-[10px]">
                        {qa.answer}
                      </p>

                      {/* Affected Assets */}
                      {qa.affectedAssets.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-[9px] pt-1">
                          <span className="text-slate-400">Affected:</span>
                          {qa.affectedAssets.map((ast, aIdx) => (
                            <span 
                              key={aIdx} 
                              onClick={() => onSelectAsset && onSelectAsset(ast.id)}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 cursor-pointer hover:border-cyan-400"
                            >
                              {ast.name} ({ast.voltageKV}kV)
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Recommended Steps */}
                      {qa.investigationSteps && qa.investigationSteps.length > 0 && (
                        <div className="p-2 bg-[#070e1a] rounded border border-slate-800 space-y-1 text-[9.5px]">
                          <strong className="text-amber-300 block uppercase text-[8.5px]">Recommended Operator Actions:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                            {qa.investigationSteps.map((step, sIdx) => (
                              <li key={sIdx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Provenance Footer */}
                      <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>Sources: {qa.dataSources.join(' • ')}</span>
                        <span>{new Date(qa.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#0e192c] border border-slate-800 text-center text-slate-400 text-[10px]">
                  <Sparkles className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                  <span>Select any fast inquiry above or type a custom question to get explainable grid intelligence grounded in SCADA, PMU, and PostGIS.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REAL-TIME ANOMALIES FEED */}
          {activeTab === 'anomalies' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase pb-1 border-b border-slate-800">
                <span>Dynamic Baseline Deviations</span>
                <span className="text-amber-400">{anomalies.length} active</span>
              </div>

              {anomalies.map(anom => (
                <div 
                  key={anom.id}
                  className={`p-3 rounded-xl border space-y-1.5 transition-all text-[10px] ${
                    anom.severity === 'CRITICAL' ? 'bg-rose-950/20 border-rose-500/50' :
                    anom.severity === 'HIGH' ? 'bg-amber-950/20 border-amber-500/50' :
                    'bg-[#0e192c] border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                          anom.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/50' :
                          'bg-amber-950 text-amber-300 border border-amber-500/50'
                        }`}>
                          {anom.severity}
                        </span>
                        <strong 
                          className="text-white cursor-pointer hover:text-cyan-400"
                          onClick={() => onSelectAsset && onSelectAsset(anom.assetId)}
                        >
                          {anom.assetName}
                        </strong>
                      </div>
                      <span className="text-[9px] text-cyan-400 block mt-0.5">{anom.signal}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-amber-300 font-bold">{anom.deviationPct > 0 ? '+' : ''}{anom.deviationPct}%</span>
                      <span className="text-[8px] text-slate-500 block">{anom.durationMin}m duration</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 py-1 text-[9px] bg-[#070e1a] p-1.5 rounded border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">MEASURED:</span>
                      <strong className="text-white">{anom.currentValue}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">DYNAMIC BASELINE:</span>
                      <strong className="text-slate-300">{anom.baselineValue}</strong>
                    </div>
                  </div>

                  <p className="text-slate-300 text-[9.5px] leading-tight pt-0.5">{anom.explanation}</p>
                  
                  <div className="text-[8.5px] text-cyan-300/80 italic">
                    Probable Cause: {anom.probableCause}
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>Source: {anom.source}</span>
                    <span>Confidence: {anom.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CORRELATED INCIDENTS & ROOT-CAUSE */}
          {activeTab === 'incidents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase pb-1 border-b border-slate-800">
                <span>Multi-Alarm Correlated Incidents</span>
                <span className="text-cyan-400">{incidents.length} incidents</span>
              </div>

              {incidents.map(inc => (
                <div key={inc.id} className="p-3 rounded-xl bg-[#0e192c] border border-cyan-500/40 space-y-2.5 text-[10px]">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-950 text-rose-300 border border-rose-500/50">
                          {inc.severity}
                        </span>
                        <strong className="text-white text-[11px]">{inc.title}</strong>
                      </div>
                      <span className="text-[9px] text-cyan-400 block mt-0.5">{inc.affectedCorridors.join(', ')}</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold shrink-0">{inc.confidence}% Conf</span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[10px]">{inc.summary}</p>

                  {/* Ranked Root Cause Hypotheses */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Ranked Root-Cause Hypotheses:</span>
                    {inc.rootCauseHypotheses.map((h, hIdx) => (
                      <div key={hIdx} className="p-2 bg-[#08101e] rounded-lg border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            h.certainty === 'LIKELY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                            h.certainty === 'POSSIBLE' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                            'bg-slate-900 text-slate-400 border border-slate-700'
                          }`}>
                            {h.certainty} ({h.confidence}%)
                          </span>
                          <strong className="text-white text-[9.5px] truncate max-w-[200px]">{h.hypothesis}</strong>
                        </div>
                        <div className="text-[8.5px] text-slate-400">
                          <strong className="text-emerald-400">Supporting: </strong>
                          {h.supportingEvidence?.[0]}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actionable Operator Advisory */}
                  {inc.advisory && (
                    <div className="p-2 bg-cyan-950/40 rounded-lg border border-cyan-500/30 space-y-1 text-[9.5px]">
                      <strong className="text-cyan-300 block uppercase text-[9px]">Operator Advisory:</strong>
                      <p className="text-slate-200">{inc.advisory.impact}</p>
                      <div className="text-emerald-300 text-[8.5px] font-semibold pt-0.5">
                        Expected Outcome: {inc.advisory.expectedOutcome}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: GENERATION FUEL MIX BALANCE */}
          {activeTab === 'generation' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#0e192c] border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase pb-1 border-b border-slate-800">
                  <span>National Generation Dispatch Mix</span>
                  <span className="text-cyan-400">3,120 MW</span>
                </div>
                
                <div className="space-y-1.5 pt-1 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Geothermal (Olkaria / Menengai)
                    </span>
                    <strong className="text-emerald-300">892 MW (28.6%)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Hydro (Seven Forks / Turkwel / Sondu)
                    </span>
                    <strong className="text-cyan-300">860 MW (27.5%)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Ethiopia 500kV HVDC Ingest
                    </span>
                    <strong className="text-amber-300">750 MW (24.0%)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Wind (Lake Turkana / Ngong)
                    </span>
                    <strong className="text-purple-300">350 MW (11.2%)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                      Solar (Garissa / Cedate)
                    </span>
                    <strong className="text-orange-300">120 MW (3.8%)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </aside>
    );
  }

  // Active Asset Selected View
  const assetAlarms = alarms.filter(a => a.assetId === selectedAsset.id);
  const assetInsight = aiInsights[selectedAsset.id];

  return (
    <aside className="w-88 xl:w-[420px] bg-[#0a1220]/95 border-l border-slate-800/90 flex flex-col h-full overflow-hidden select-none z-20 backdrop-blur-md font-mono text-xs">
      
      {/* Header with Asset Name & Dismiss */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              selectedAsset.state === 'CRITICAL' ? 'bg-rose-400 animate-ping' :
              selectedAsset.state === 'WARNING' || selectedAsset.state === 'CONGESTED' ? 'bg-amber-400 animate-pulse' :
              'bg-emerald-400'
            }`} />
            <span className="text-xs font-bold text-white tracking-wider truncate">
              {selectedAsset.name}
            </span>
          </div>
          <span className="text-[9.5px] text-cyan-400 block mt-0.5">
            {selectedAsset.code} • {selectedAsset.voltageLevelKV}kV {selectedAsset.type.replace(/_/g, ' ')}
          </span>
        </div>

        <button
          onClick={onClearSelection}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close Asset Intelligence Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Reconciliation & Entity Resolution Badge */}
      <div className="px-3.5 py-2 bg-[#0d1728] border-b border-slate-800/60 flex items-center justify-between text-[9px]">
        <div className="flex items-center gap-1 text-slate-400">
          <Database className="w-3 h-3 text-cyan-400" />
          <span>RECONCILIATION:</span>
          <strong className="text-emerald-400 font-bold">{selectedAsset.confidence}% {selectedAsset.reconciliationStatus}</strong>
        </div>
        <span className="text-slate-400">SCADA: {selectedAsset.scadaId}</span>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center border-b border-slate-800 bg-[#0a1220] px-2 text-[10px]">
        {[
          { id: 'copilot', label: 'AI Copilot' },
          { id: 'telemetry', label: 'Telemetry' },
          { id: 'health_risk', label: 'Health/Risk' },
          { id: 'alarms', label: `Alarms (${assetAlarms.length})` },
          { id: 'topology', label: 'Topology' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-2.5 border-b-2 font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Body Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-slate-300">
        
        {/* TAB 1: COPILOT GROUNDED INVESTIGATION FOR ACTIVE ASSET */}
        {activeTab === 'copilot' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-cyan-500/20">
                <span className="font-bold text-cyan-400 uppercase text-[10px]">Asset Investigation Questions</span>
                <span className="text-[9px] text-emerald-400 font-bold">96.8% Grounded</span>
              </div>
              <div className="space-y-1">
                {[
                  `What is abnormal on ${selectedAsset.name}?`,
                  `Why is ${selectedAsset.name} in state ${selectedAsset.state}?`,
                  `What happens if ${selectedAsset.name} trips (N-1 Contingency)?`,
                  `What alternative bypass paths are available for ${selectedAsset.name}?`,
                  `What should the operator investigate on ${selectedAsset.name}?`
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(q)}
                    className="w-full text-left px-2 py-1.5 bg-[#09111e] hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 rounded text-[9.5px] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span className="truncate pr-1">{q}</span>
                    <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Asset Query Box */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(customPrompt)}
                placeholder={`Ask Copilot about ${selectedAsset.name}...`}
                className="flex-1 px-2.5 py-1.5 bg-[#070e1a] border border-slate-700 rounded-lg text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleSendPrompt(customPrompt)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>

            {/* Render Last Copilot QA for this asset */}
            {copilotQAHistory.length > 0 && (
              <div className="p-3 rounded-xl bg-[#0e192c] border border-slate-800 space-y-2 text-[10px]">
                <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1">
                  <span>Latest Copilot Explanation</span>
                  <span className="text-[9px] text-emerald-400">{copilotQAHistory[copilotQAHistory.length - 1].confidence}% Confidence</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-[10px]">
                  {copilotQAHistory[copilotQAHistory.length - 1].answer}
                </p>
                <div className="text-[8px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Sources: {copilotQAHistory[copilotQAHistory.length - 1].dataSources.join(' • ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#0e192c] border border-slate-800">
                <span className="text-[8.5px] text-slate-400 block">ACTIVE POWER</span>
                <strong className="text-base text-cyan-300 font-black">
                  {selectedAsset.telemetry.activePowerMW?.value ?? selectedAsset.currentLoadMW} MW
                </strong>
                <span className="text-[8px] text-slate-400 block mt-0.5">
                  Rating: {selectedAsset.ratedCapacityMVA} MVA
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e192c] border border-slate-800">
                <span className="text-[8.5px] text-slate-400 block">REACTIVE POWER</span>
                <strong className="text-base text-slate-200 font-black">
                  {selectedAsset.telemetry.reactivePowerMVAR?.value || 0} MVAR
                </strong>
                <span className="text-[8px] text-slate-400 block mt-0.5">
                  PF: {selectedAsset.telemetry.powerFactor?.value || 0.98}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e192c] border border-slate-800">
                <span className="text-[8.5px] text-slate-400 block">BUS VOLTAGE</span>
                <strong className="text-base text-white font-black">
                  {selectedAsset.telemetry.voltageKV?.value || selectedAsset.voltageLevelKV} kV
                </strong>
                <span className="text-[8px] text-emerald-400 block mt-0.5">
                  PMU Sync: Good
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e192c] border border-slate-800">
                <span className="text-[8.5px] text-slate-400 block">FREQUENCY</span>
                <strong className="text-base text-emerald-400 font-black">
                  {selectedAsset.telemetry.frequencyHz?.value || 50.00} Hz
                </strong>
                <span className="text-[8px] text-slate-400 block mt-0.5">
                  Deviation: 0.00 Hz
                </span>
              </div>
            </div>

            {/* Equipment Diagnostics Metrics */}
            <div className="p-3 rounded-xl bg-[#0e192c] border border-slate-800/80 space-y-2 text-[10px]">
              <div className="text-slate-400 font-bold uppercase pb-1 border-b border-slate-800">
                Substation Equipment Telemetry
              </div>
              
              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Thermal Loading</span>
                <strong className="text-cyan-300 font-bold">
                  {selectedAsset.telemetry.thermalLoadingPct?.value || Math.round((selectedAsset.currentLoadMW / selectedAsset.ratedCapacityMVA) * 100)}%
                </strong>
              </div>

              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">Transformer Oil Temp</span>
                <strong className="text-slate-200 font-bold">
                  {selectedAsset.telemetry.transformerOilTempC?.value || 55.0} °C
                </strong>
              </div>

              <div className="flex justify-between items-center py-0.5 border-b border-slate-800/40">
                <span className="text-slate-400">SF6 Gas Pressure</span>
                <strong className="text-emerald-400 font-bold">
                  {selectedAsset.telemetry.sf6PressureBar?.value || 6.4} bar
                </strong>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-400">Installed Transformers</span>
                <strong className="text-slate-200">{selectedAsset.transformersCount || 3} Banks</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HEALTH & RISK */}
        {activeTab === 'health_risk' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#0e192c] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block">ASSET HEALTH SCORE</span>
                  <strong className="text-2xl font-black text-emerald-400">{selectedAsset.healthScore}/100</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">COMPOSITE RISK INDEX</span>
                  <strong className={`text-2xl font-black ${selectedAsset.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedAsset.riskScore}/100
                  </strong>
                </div>
              </div>

              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>Criticality Index:</span>
                  <strong className="text-white">{selectedAsset.criticalityScore} / 10 (High Backbone)</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>N-1 Redundancy:</span>
                  <strong className={selectedAsset.nMinusOneRedundant ? 'text-emerald-400' : 'text-amber-400'}>
                    {selectedAsset.nMinusOneRedundant ? 'SECURE' : 'SINGLE POINT OF FAILURE'}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Reconciliation Provenance:</span>
                  <strong className="text-cyan-400">{selectedAsset.sources.join(', ')}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ALARMS */}
        {activeTab === 'alarms' && (
          <div className="space-y-2.5">
            {assetAlarms.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-[#0e192c] rounded-xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-300 block">No Active Alarms</span>
                <span className="text-[9.5px]">All protection relays and thermal thresholds normal.</span>
              </div>
            ) : (
              assetAlarms.map(alarm => (
                <div 
                  key={alarm.id}
                  className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2 text-[10px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-bold">
                      {alarm.severity} ALARM
                    </span>
                    <span className="text-slate-400">{alarm.timestamp}</span>
                  </div>
                  <strong className="text-slate-200 text-[11px] block">{alarm.title}</strong>
                  <p className="text-slate-300 text-[9.5px] leading-relaxed">{alarm.description}</p>
                  <div className="p-2 bg-[#0a1220] rounded border border-slate-800 text-[9px] text-slate-300">
                    <strong className="text-cyan-400 block mb-0.5">Remedial Action:</strong>
                    {alarm.remedialAction}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: TOPOLOGY */}
        {activeTab === 'topology' && (
          <div className="space-y-3 text-[10px]">
            <div className="p-3 rounded-xl bg-[#0e192c] border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold uppercase pb-1 border-b border-slate-800">
                Upstream Power Inflows
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAsset.upstreamNodes.map((u, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-[#0a1220] border border-slate-700 text-cyan-300">
                    {u}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e192c] border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold uppercase pb-1 border-b border-slate-800">
                Downstream Load Outflows
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedAsset.downstreamNodes.map((d, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-[#0a1220] border border-slate-700 text-emerald-300">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e192c] border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold uppercase pb-1 border-b border-slate-800">
                Alternative Redundant Bypass Corridors
              </div>
              <div className="space-y-1">
                {selectedAsset.alternativePaths.map((p, i) => (
                  <div key={i} className="p-1.5 bg-[#0a1220] rounded border border-slate-800 text-slate-300">
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

