import React, { useState, useEffect } from 'react';
import { DecisionRecommendation, EvaluationFinding } from '../../types/evaluation';
import { ShieldCheck, AlertTriangle, Scale, BookOpen, MessageSquare, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DecisionIntelligenceWorkspaceProps {
  evaluationId: string;
  findings: EvaluationFinding[];
}

const DecisionIntelligenceWorkspace: React.FC<DecisionIntelligenceWorkspaceProps> = ({ evaluationId, findings }) => {
  const [recommendation, setRecommendation] = useState<DecisionRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateDecision();
  }, [evaluationId]);

  const generateDecision = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v4/decisions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationId, findings })
      });
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Synthesizing Decision Intelligence...</p>
    </div>
  );

  if (!recommendation) return null;

  return (
    <div className="space-y-6" id="decision-workspace">
      {/* Primary Recommendation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className={`px-8 py-6 border-b border-slate-100 flex items-center justify-between ${
          recommendation.decision === 'AWARD' ? 'bg-emerald-50/50' : 'bg-rose-50/50'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              recommendation.decision === 'AWARD' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Decision: {recommendation.decision === 'AWARD' ? 'Recommended for Award' : 'Recommended for Rejection'}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm font-medium">
                <span className="text-slate-500">Confidence Score:</span>
                <span className={recommendation.confidence > 0.8 ? 'text-emerald-600' : 'text-amber-600'}>
                  {(recommendation.confidence * 100).toFixed(1)}%
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-slate-500">Status: {recommendation.status}</span>
              </div>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
            Endorse Decision
          </button>
        </div>

        <div className="p-8 grid grid-cols-3 gap-8">
          {/* Evidence & Logic */}
          <div className="col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={16} />
                Supporting Evidence & Reasoning
              </h3>
              <div className="space-y-3">
                {recommendation.evidence.map((ev, i) => (
                  <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                    <ChevronRight size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    {ev}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Scale size={14} />
                  Applicable Legal Basis
                </h4>
                <div className="space-y-2">
                  {recommendation.applicableLaws.map((law, i) => (
                    <div key={i} className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-400" />
                      {law}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare size={14} />
                  Expected Outcomes
                </h4>
                <div className="space-y-2">
                  {recommendation.outcomes.map((out, i) => (
                    <div key={i} className="text-sm text-slate-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                      {out}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 rounded-2xl text-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Profile</h3>
                <AlertTriangle size={18} className={recommendation.riskAssessment.score > 50 ? 'text-rose-500' : 'text-emerald-500'} />
              </div>
              <div className="text-4xl font-bold mb-1">{recommendation.riskAssessment.score}%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">Aggregate Risk Score</div>
              
              <div className="space-y-3">
                {recommendation.riskAssessment.findings.map((f, i) => (
                  <div key={i} className="text-xs text-slate-400 flex gap-2">
                    <span className="text-rose-500">•</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-4">Alternative Options</h3>
              <div className="space-y-3">
                {recommendation.alternatives.map((alt, i) => (
                  <button key={i} className="w-full text-left px-4 py-2 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors">
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionIntelligenceWorkspace;
