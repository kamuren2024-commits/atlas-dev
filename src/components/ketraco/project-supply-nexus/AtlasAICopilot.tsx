import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  ArrowRight,
  TrendingDown,
  Clock,
  Coins,
  ShieldAlert,
  Send,
  Bot,
  CheckCircle2,
  Cpu,
  RefreshCw,
  X
} from 'lucide-react';

interface AtlasAICopilotProps {
  onAskCopilot?: (question: string) => void;
  onInvestigateAnomaly?: () => void;
  onSimulateAnomaly?: () => void;
  onCreateRecoveryPlan?: () => void;
}

interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  thought?: string;
  actions?: string[];
}

export const AtlasAICopilot: React.FC<AtlasAICopilotProps> = ({
  onAskCopilot,
  onInvestigateAnomaly,
  onSimulateAnomaly,
  onCreateRecoveryPlan
}) => {
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeResponse, setActiveResponse] = useState<CopilotMessage | null>(null);

  const triggerAIResponse = (userPrompt: string) => {
    setIsThinking(true);
    onAskCopilot?.(userPrompt);

    setTimeout(() => {
      setIsThinking(false);

      let text = `Analysis of **${userPrompt}**: Delivery risk is concentrated in the Section 3 conductor delivery window. Critical path slack is currently -7 days.`;
      let thought = 'Queried PDS knowledge graph · Evaluated 4 suppliers · Correlated with Mombasa port congestion index';
      let actions = ['Authorize Alternate Shipment', 'Notify Project Director', 'View Risk Heatmap'];

      if (userPrompt.toLowerCase().includes('tana')) {
        text = 'Tana River 220kV currently has 3 unresolved wayleave disputes in Section 4. Land compensation escrow release is pending approval from the National Land Commission.';
        thought = 'Evaluated land registry parcels · Scanned recent gazette notices · Cross-referenced dispute filings';
        actions = ['Review RAP Parcel 742', 'Escalate to Legal Taskforce'];
      } else if (userPrompt.toLowerCase().includes('recover') || userPrompt.toLowerCase().includes('plan')) {
        text = 'Recovery plan generated: Implementing 24/7 dual-shift tower pad casting will compress civil works duration by 11 days, fully offsetting the maritime shipping delay.';
        thought = 'Ran Monte Carlo scenario · Calculated labor overtime multiplier · Verified EPC contractor capacity';
        actions = ['Approve Dual-Shift Contingency', 'Export Recovery Schedule'];
      } else if (userPrompt.toLowerCase().includes('cost') || userPrompt.toLowerCase().includes('saving')) {
        text = 'Identified bulk procurement opportunity: Combining conductor requisition for Western Grid and Mombasa line yields KES 45M in volume discount savings.';
        thought = 'Analyzed cross-project BOM similarities · Evaluated supplier tiering · Assessed FX exposure';
        actions = ['Initiate Pooled RFP', 'Send to Commercial Lead'];
      }

      setActiveResponse({
        id: Date.now().toString(),
        sender: 'assistant',
        text,
        thought,
        actions,
        time: 'Just now'
      });
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim();
    setQuery('');
    triggerAIResponse(q);
  };

  const handleActionClick = (actionName: string) => {
    triggerAIResponse(`Execute: ${actionName}`);
  };

  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-purple-500/20 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight">
                ATLAS AI Copilot
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">
                Always on. Always watching.
              </p>
            </div>
          </div>
          <button
            onClick={() => onAskCopilot?.('Provide executive status overview of transmission portfolio')}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Open Global Copilot Drawer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Anomaly Detection Banner */}
        <div className="mt-2.5 p-2.5 rounded-md bg-purple-950/30 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
              New anomaly detected
            </span>
            <span className="text-[9px] font-mono text-purple-400">92% Confidence</span>
          </div>

          <p className="text-xs font-semibold text-slate-200 leading-snug">
            Supplier delivery probability dropped from 88% → 71%
          </p>

          <div className="text-[11px] text-slate-400 space-y-0.5 pl-1">
            <div className="text-[10px] text-slate-500 uppercase font-mono">Why?</div>
            <div className="text-slate-300">✦ Factory delay in conductor annealing</div>
            <div className="text-slate-300">✦ Logistics congestion at Mombasa Port</div>
            <div className="text-slate-300">✦ Historical supplier lead-time pattern</div>
          </div>

          {/* Anomaly Action Buttons */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-purple-500/20">
            <button
              onClick={() => {
                onInvestigateAnomaly?.();
                triggerAIResponse('Investigate conductor supplier delivery probability drop');
              }}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              Investigate
            </button>
            <button
              onClick={() => {
                onSimulateAnomaly?.();
                triggerAIResponse('Simulate logistics impact of conductor shipment delay');
              }}
              className="px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-[10px] font-mono text-purple-200 border border-purple-500/40 transition-colors cursor-pointer"
            >
              Simulate
            </button>
            <button
              onClick={() => {
                onCreateRecoveryPlan?.();
                triggerAIResponse('Generate comprehensive recovery plan for Mombasa 400kV line');
              }}
              className="px-2 py-0.5 rounded bg-cyan-950/40 hover:bg-cyan-900/60 text-[10px] font-mono text-cyan-300 border border-cyan-500/40 ml-auto transition-colors cursor-pointer"
            >
              Create Recovery Plan
            </button>
          </div>
        </div>

        {/* Interactive Response Stream (if query active) */}
        {isThinking && (
          <div className="mt-2.5 p-2 rounded-md bg-purple-950/20 border border-purple-500/30 flex items-center gap-2 text-xs font-mono text-purple-300">
            <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Atlas Copilot analyzing telemetry & graph dependencies...</span>
          </div>
        )}

        {activeResponse && !isThinking && (
          <div className="mt-2.5 p-2.5 rounded-md bg-[#0d1424] border border-cyan-500/40 space-y-2 relative">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Bot className="w-3 h-3" />
                <span>Atlas Intelligence Response</span>
              </div>
              <button
                onClick={() => setActiveResponse(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {activeResponse.thought && (
              <div className="text-[10px] font-mono text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-purple-400 uppercase font-bold text-[9px] mr-1">Thought:</span>
                {activeResponse.thought}
              </div>
            )}

            <div className="text-xs text-slate-200 leading-relaxed font-sans">
              {activeResponse.text}
            </div>

            {activeResponse.actions && (
              <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-800">
                {activeResponse.actions.map(act => (
                  <button
                    key={act}
                    onClick={() => handleActionClick(act)}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-medium transition-colors cursor-pointer"
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Insights Stream */}
        {!activeResponse && !isThinking && (
          <div className="mt-3 space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Recent Insights
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div
                onClick={() => triggerAIResponse('Schedule risk increased for Tana River 220kV')}
                className="flex items-start gap-2 text-slate-300 hover:text-white cursor-pointer group"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-tight">
                  <span className="group-hover:text-cyan-300 transition-colors">Schedule risk increased for Tana River 220kV</span>
                  <span className="text-[9px] font-mono text-slate-500 ml-1">· 12m ago</span>
                </div>
              </div>

              <div
                onClick={() => triggerAIResponse('Opportunity: KES 45M cost saving in tower supply')}
                className="flex items-start gap-2 text-slate-300 hover:text-white cursor-pointer group"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-tight">
                  <span className="group-hover:text-cyan-300 transition-colors">Opportunity: KES 45M cost saving in tower supply</span>
                  <span className="text-[9px] font-mono text-slate-500 ml-1">· 28m ago</span>
                </div>
              </div>

              <div
                onClick={() => triggerAIResponse('Which 2 decisions require immediate approval?')}
                className="flex items-start gap-2 text-slate-300 hover:text-white cursor-pointer group"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-tight">
                  <span className="group-hover:text-cyan-300 transition-colors">2 decisions require approval</span>
                  <span className="text-[9px] font-mono text-slate-500 ml-1">· 1h ago</span>
                </div>
              </div>

              <div
                onClick={() => triggerAIResponse('Wayleave progress update')}
                className="flex items-start gap-2 text-slate-300 hover:text-white cursor-pointer group"
              >
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-tight">
                  <span className="group-hover:text-cyan-300 transition-colors">Wayleave progress improved (+6%)</span>
                  <span className="text-[9px] font-mono text-slate-500 ml-1">· 2h ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Input Box */}
      <form onSubmit={handleSubmit} className="mt-3 relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask a question about your projects..."
          className="w-full h-8 pl-3 pr-8 rounded-md bg-[#080d15] border border-slate-800 hover:border-purple-500/40 focus:border-purple-500/70 text-slate-200 placeholder-slate-500 text-xs focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-1.5 top-1.5 text-slate-500 hover:text-purple-400 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
