import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  FileText, 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  HelpCircle,
  Vote,
  Sparkles
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { 
  EXECUTIVE_STRATEGIC_PROJECTS,
  EXECUTIVE_CHANGE_FEED,
  EXECUTIVE_ATTENTION_ITEMS,
  EXECUTIVE_DECISION_ITEMS
} from '../../adapters/fixtures';
import { ProjectViewMode } from '../../types';

interface ExecutiveCommandViewProps {
  onSelectProject: (projectId: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

export const ExecutiveCommandView: React.FC<ExecutiveCommandViewProps> = ({
  onSelectProject,
  onNavigateView
}) => {
  const [decisions, setDecisions] = useState(EXECUTIVE_DECISION_ITEMS);
  const [activeDecisionFilter, setActiveDecisionFilter] = useState<'ALL' | 'PENDING' | 'DECIDED'>('PENDING');
  const [selectedOptionByDecision, setSelectedOptionByDecision] = useState<Record<string, string>>({});
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  const handleApplyDecision = (decisionId: string, actionKey: string) => {
    setDecisions(prev => prev.map(d => {
      if (d.id === decisionId) {
        return {
          ...d,
          status: actionKey === 'APPROVE' ? 'APPROVED' : 'REJECTED'
        };
      }
      return d;
    }));
    setDecisionFeedback(`Decision recorded: ${actionKey} applied to #${decisionId}. Governance audit trail updated.`);
    setTimeout(() => setDecisionFeedback(null), 4000);
  };

  const filteredDecisions = decisions.filter(d => {
    if (activeDecisionFilter === 'PENDING') return d.status === 'PENDING';
    if (activeDecisionFilter === 'DECIDED') return d.status !== 'PENDING';
    return true;
  });

  return (
    <UIStateContainer moduleName="Executive View">
      <div className="space-y-4">
        {/* Executive Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">EXECUTIVE DIRECTIVE //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                BOARD & MD BRIEFING
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Executive Strategic Oversight & Decision Room
            </h1>
            <p className="text-xs text-slate-400">
              Strategic delivery assurance, high-capital commitments, exception escalations and board approval mandates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-900/90 rounded border border-slate-800 text-xs font-mono text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Cabinet Priority Delivery</span>
              <span className="text-emerald-400 font-bold">88.4% On-Track</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-950/40 rounded border border-purple-500/30 text-xs font-mono text-right">
              <span className="text-[10px] text-purple-300 block uppercase">Decisions Requiring Action</span>
              <span className="text-purple-200 font-bold">
                {decisions.filter(d => d.status === 'PENDING').length} Pending Board Review
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {decisionFeedback && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{decisionFeedback}</span>
          </div>
        )}

        {/* 4-Question Executive Arc Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Arc 1: Strategic Projects Status & Delivery Probability */}
          <div className="bg-[#080d17] p-3 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Strategic Flagship Projects
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Vision 2030 Flagships</span>
            </div>

            <div className="space-y-2.5">
              {EXECUTIVE_STRATEGIC_PROJECTS.map((proj) => (
                <div key={proj.id} className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-cyan-400 font-bold mr-1.5">{proj.code}</span>
                      <span className="font-semibold text-slate-100">{proj.name}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded uppercase border ${
                      proj.status === 'HEALTHY' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
                      proj.status === 'AT_RISK' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                      'text-rose-400 border-rose-500/40 bg-rose-500/10'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {proj.strategicObjective}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-slate-950/60 p-2 rounded border border-slate-800/60">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Capital Budget</span>
                      <span className="text-slate-200 font-medium">{proj.capitalBudget}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Committed</span>
                      <span className="text-cyan-300 font-medium">{proj.capitalCommitted}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">Confidence</span>
                      <span className="text-emerald-400 font-bold">{proj.deliveryProbability}%</span>
                    </div>
                  </div>

                  <div className="text-[11px] bg-slate-950/40 p-2 rounded border border-slate-800/40 space-y-1">
                    <div className="text-amber-300/90">
                      <strong>Headline Issue:</strong> {proj.headlineIssue}
                    </div>
                    <div className="text-cyan-300">
                      <strong>Action Mandated:</strong> {proj.actionRequired}
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        onSelectProject(proj.id);
                        onNavigateView('project-360');
                      }}
                      className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                    >
                      Inspect Detailed Project 360
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arc 2: "What Requires Attention?" Escalations */}
          <div className="space-y-4">
            <div className="bg-[#080d17] p-3 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  What Requires Immediate Executive Attention?
                </h3>
                <span className="text-[10px] font-mono text-rose-400">Escalated to MD</span>
              </div>

              <div className="space-y-2.5">
                {EXECUTIVE_ATTENTION_ITEMS.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-900/80 rounded border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{item.project}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                        item.urgency === 'IMMEDIATE' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        item.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {item.urgency} ATTENTION
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Area: <strong className="text-slate-300">{item.area}</strong> • Escalated by: {item.escalatedBy}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="text-rose-300 bg-rose-950/20 p-1.5 rounded border border-rose-500/20">
                        <strong>Financial Impact:</strong> {item.financialImpact}
                      </div>
                      <div className="text-amber-300 bg-amber-950/20 p-1.5 rounded border border-amber-500/20">
                        <strong>Timeline Impact:</strong> {item.timelineImpact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arc 3: "What Changed?" Real-time Intelligence Feed */}
            <div className="bg-[#080d17] p-3 rounded-lg border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  What Changed? (Executive Activity Delta)
                </h3>
                <span className="text-[10px] font-mono text-purple-400">Past 48 Hours</span>
              </div>

              <div className="space-y-2">
                {EXECUTIVE_CHANGE_FEED.map((feed) => (
                  <div key={feed.id} className="p-2.5 bg-slate-900/60 rounded border border-slate-800/60 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="text-slate-300">{feed.timestamp}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                        {feed.type}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-200 text-xs">{feed.headline}</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {feed.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Arc 4: "What Decision is Required?" Interactive Decision Cards */}
        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Vote className="w-4 h-4 text-cyan-400" />
                What Decision Is Required? (Executive Action Board)
              </h3>
              <p className="text-[11px] text-slate-400">
                Actionable executive authorizations requiring Managing Director or Board Approval
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => setActiveDecisionFilter('PENDING')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeDecisionFilter === 'PENDING' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending ({decisions.filter(d => d.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setActiveDecisionFilter('DECIDED')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeDecisionFilter === 'DECIDED' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Decided ({decisions.filter(d => d.status !== 'PENDING').length})
              </button>
              <button
                onClick={() => setActiveDecisionFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeDecisionFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Records
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filteredDecisions.map((dec) => {
              const selectedKey = selectedOptionByDecision[dec.id] || dec.options[0]?.actionKey;

              return (
                <div 
                  key={dec.id} 
                  className={`p-3.5 rounded-lg border text-xs space-y-3 transition-all ${
                    dec.status === 'APPROVED' ? 'bg-[#0a141c]/60 border-emerald-500/30' :
                    dec.status === 'REJECTED' ? 'bg-[#140b0f]/60 border-rose-500/30' :
                    'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">{dec.decisionId}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                      dec.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      dec.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}>
                      {dec.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-100 text-sm leading-snug">{dec.title}</h4>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      Project: <span className="text-slate-300">{dec.project}</span> • Authority: {dec.authority}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                    {dec.summary}
                  </p>

                  <div className="text-[10px] font-mono text-rose-300 bg-rose-950/20 p-2 rounded border border-rose-500/20">
                    <strong>Financial Commitment:</strong> {dec.financialImplication}
                  </div>

                  {/* Decision Options */}
                  {dec.status === 'PENDING' ? (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Evaluate Proposed Options:
                      </span>
                      {dec.options.map((opt) => (
                        <label
                          key={opt.actionKey}
                          className={`block p-2 rounded border text-[11px] cursor-pointer transition-all ${
                            selectedKey === opt.actionKey
                              ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 font-medium'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`dec-${dec.id}`}
                              checked={selectedKey === opt.actionKey}
                              onChange={() => setSelectedOptionByDecision(prev => ({ ...prev, [dec.id]: opt.actionKey }))}
                              className="text-cyan-500 focus:ring-0"
                            />
                            <span>{opt.label}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 pl-5 mt-0.5 leading-tight">
                            Impact: {opt.impact}
                          </div>
                        </label>
                      ))}

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleApplyDecision(dec.id, selectedKey || 'APPROVE')}
                          className="flex-1 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded font-mono text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Execute Decision
                        </button>
                        <button
                          onClick={() => handleApplyDecision(dec.id, 'REJECT')}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded font-mono text-xs transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2.5 rounded border border-slate-800 text-center">
                      Governance action recorded. Formal minute dispatched to Corporate Secretary.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </UIStateContainer>
  );
};
