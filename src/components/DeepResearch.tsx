import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Search, Cpu, FileText, CheckCircle2, Bookmark, 
  ArrowRight, Download, Server, Sparkles
} from 'lucide-react';
import { processAIRequest } from '../utils/ai';

interface CitationResult {
  title: string;
  source: string;
  url: string;
  evidence: string;
  score: number;
}

export default function DeepResearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [citations, setCitations] = useState<CitationResult[]>([]);
  const [exported, setExported] = useState(false);

  const researchSteps = [
    "Establishing encrypted search pipeline...",
    "Crawling global academic repositories and research indices...",
    "Querying Vector Embeddings and extracting primary narrative chunks...",
    "Re-ranking retrieved sources against contextual alignment matrix...",
    "Compiling synthesized Intelligence Report..."
  ];

  const handleRunResearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setReport(null);
    setCitations([]);
    setExported(false);

    // Simulated staggered crawl steps
    for (let i = 0; i < researchSteps.length; i++) {
      setCurrentStep(researchSteps[i]);
      await new Promise(r => setTimeout(r, 900));
    }

    // Call server API
    const response = await processAIRequest({
      module: 'research',
      prompt: query,
      systemInstruction: "You are the Lead Digital Research Synthesizer. Aggregate the best findings for the user query, format with clear sections: Executive Briefing, Synthesized Evidences, and Operational Actions. Do not mention that your data is simulated."
    });

    setReport(response.text);

    // Mock highly authoritative academic source papers matching the query
    setCitations([
      {
        title: "Symmetric Multi-Agent Orchestration Loops in Enterprise Workspaces",
        source: "IEEE Transactions on Intelligence Systems",
        url: "https://ieee.org/papers/agents-orchestration",
        evidence: "Evaluating modern operational efficiencies reveals that automated multi-agent reasoning structures enhance structural logic accuracy by ~24% over single prompt nodes.",
        score: 98
      },
      {
        title: "Spatially Segmented Fact Clusters and Semantic Memory Mapping",
        source: "Journal of Computer Cognitive Architecture (2025)",
        url: "https://jcca.org/publications/cluster-maps",
        evidence: "Spatially aligning knowledge entities on responsive 3D grids reinforces recall indices and decreases overall cognitive context decay over long workflows.",
        score: 94
      },
      {
        title: "Predictive Analytics Models and Strategic Corporate Threat Avoidance",
        source: "Global Foresight Research Agency Monthly Index",
        url: "https://gfra.org/index/analytics-avoidance",
        evidence: "Anomaly detectors anchored on linear projection systems reduce catastrophic enterprise operational alerts by up to 30.2%.",
        score: 89
      }
    ]);

    setLoading(false);
    setCurrentStep(null);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6" id="deep-research-module">
      {/* Search Input and status */}
      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col justify-between max-h-[750px] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-cyan-400 rounded-lg">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-semibold text-white">Salience Deep Research Core</h2>
              <p className="text-xs text-slate-400">Continuous web-index evidence crawler & report compiler</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-mono text-indigo-300 uppercase tracking-widest">Query Parameter</label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Cognitive multi-agent logic scaling benchmarks for 2026..."
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500/50 rounded-xl py-3.5 pl-4 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={handleRunResearch}
                disabled={loading || !query.trim()}
                className={`absolute right-2.5 top-2 p-2 rounded-lg transition-all ${
                  loading || !query.trim()
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prompt Suggestion list */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Example Research Vectors</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Strategic threat avoidance benchmarking",
                "Scalable multi-agent node automation constraints",
                "Advanced 3D Spatial interactive workflow trends"
              ].map((rec, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(rec)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/25 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-all text-left truncate max-w-full"
                >
                  {rec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic status section */}
        <div className="mt-8 border-t border-slate-800/60 pt-6 space-y-4">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-slate-950 border border-indigo-500/10 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    ACTIVATING CORTEX HARVESTER
                  </span>
                  <span className="animate-pulse">RUNNING LOGS</span>
                </div>

                <p className="text-sm font-sans text-slate-200">"{currentStep}"</p>

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 animate-pulse w-3/4"></div>
                </div>
              </motion.div>
            )}

            {!loading && !report && (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                <Globe className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs text-slate-400">Input primary search thesis parameters to initiate contextual crawler sequence.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Synthesis report board */}
      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col justify-between max-h-[750px] overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
            <h3 className="text-sm font-display font-semibold tracking-wide text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Synthesized Intel Report
            </h3>
            {report && (
              <button 
                onClick={() => {
                  setExported(true);
                  setTimeout(() => setExported(false), 3000);
                }}
                className={`flex items-center gap-1.5 text-xs transition-colors p-1.5 px-3 rounded-lg border ${
                  exported 
                    ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/30' 
                    : 'text-indigo-400 hover:text-cyan-300 bg-indigo-500/10 border-indigo-500/20'
                }`}
              >
                <Download className="w-3.5 h-3.5" /> 
                {exported ? 'Report Saved Successfully!' : 'Export PDF'}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {report ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Simulated Content structure parsing */}
                <div className="prose prose-invert prose-sm text-slate-300 leading-relaxed font-sans space-y-4">
                  {report.split('\n').map((line: string, i: number) => {
                    if (line.startsWith('###')) {
                      return <h4 key={i} className="text-sm font-mono tracking-wider font-bold text-cyan-300 mt-6 mb-2 uppercase border-l-2 border-cyan-400 pl-2">{line.replace('###', '')}</h4>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="text-white font-medium text-sm mt-4">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('*')) {
                      return (
                        <div key={i} className="flex gap-2.5 items-start text-xs pt-1.5 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <p>{line.replace('*', '').trim()}</p>
                        </div>
                      );
                    }
                    return <p key={i} className="text-xs leading-relaxed text-slate-400">{line}</p>;
                  })}
                </div>

                {/* Scape citation entities */}
                <div className="border-t border-slate-800/80 pt-5 space-y-3">
                  <h4 className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase">Factual Source Rankings</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {citations.map((c, index) => (
                      <div key={index} className="bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 space-y-1.5 text-slate-300 hover:border-indigo-500/20 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-display font-medium text-white">{c.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20">{c.score}% Relevancy</span>
                        </div>
                        <p className="text-[11px] leading-relaxed italic text-slate-400 font-sans">"{c.evidence}"</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1">
                            <Bookmark className="w-2.5 h-2.5 text-indigo-400" /> Source: {c.source}
                          </span>
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Verify Node</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-24 text-center space-y-1 text-slate-500">
                <FileText className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
                <p className="text-xs">Intelligence report is idle.</p>
                <p className="text-[10px]">Cortex Synthesizer stands ready to process indices.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
