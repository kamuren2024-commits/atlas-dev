import React, { useState } from 'react';
import { GitBranch, ExternalLink, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Scale, FileText, Check } from 'lucide-react';

interface EvidenceLineagePanelProps {
  onViewFullGraph?: () => void;
}

interface LineageNode {
  id: string;
  label: string;
  sublabel: string;
  category: 'tender' | 'criterion' | 'evidence' | 'ai' | 'evaluator' | 'legal' | 'consensus' | 'approval' | 'audit';
  status: 'VERIFIED' | 'COMPLETED' | 'ACTIVE';
}

const LINEAGE_NODES: LineageNode[] = [
  { id: '1', label: 'Tender Requirement', sublabel: 'KETRACO/PROC/2026/041', category: 'tender', status: 'VERIFIED' },
  { id: '2', label: 'Evaluation Criterion', sublabel: 'T3 Technical Capacity (15%)', category: 'criterion', status: 'VERIFIED' },
  { id: '3', label: 'Bidder Evidence', sublabel: 'DOC-00471 Proposal.pdf', category: 'evidence', status: 'VERIFIED' },
  { id: '4', label: 'AI Extraction', sublabel: 'Confidence 92% (OCR Pass)', category: 'ai', status: 'VERIFIED' },
  { id: '5', label: 'Evaluator Review', sublabel: 'E-017 Score: 90/100', category: 'evaluator', status: 'ACTIVE' },
  { id: '6', label: 'Legal Basis', sublabel: 'PPADA 2015 Sec 79', category: 'legal', status: 'VERIFIED' },
  { id: '7', label: 'Committee Consensus', sublabel: 'TEC-001 Moderation', category: 'consensus', status: 'COMPLETED' },
  { id: '8', label: 'Approval', sublabel: 'Accounting Officer', category: 'approval', status: 'COMPLETED' },
  { id: '9', label: 'Audit Record', sublabel: 'EVT-00842 Immutable', category: 'audit', status: 'VERIFIED' },
];

export default function EvidenceLineagePanel({
  onViewFullGraph
}: EvidenceLineagePanelProps) {
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);

  return (
    <div className="bg-[#0b1220] border border-slate-800/80 rounded-xl p-4 flex flex-col h-full shadow-lg shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Evidence Lineage
          </h2>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
            9-NODE FLOW
          </span>
        </div>

        <button
          type="button"
          onClick={onViewFullGraph}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View Full Graph</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Interactive Lineage Graph Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden py-3 flex items-center">
        <div className="flex items-center gap-2 min-w-max px-2">
          {LINEAGE_NODES.map((node, index) => {
            const isSelected = selectedNode?.id === node.id;
            const isActive = node.status === 'ACTIVE';

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <button
                  type="button"
                  onClick={() => setSelectedNode(node)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,225,255,0.25)] ring-1 ring-cyan-400'
                      : isActive
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_10px_rgba(0,225,255,0.15)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Step 0{index + 1}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>

                  <div className="text-xs font-bold text-white whitespace-nowrap">
                    {node.label}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-[140px] mt-0.5">
                    {node.sublabel}
                  </div>
                </button>

                {/* Arrow Connector */}
                {index < LINEAGE_NODES.length - 1 && (
                  <div className="flex items-center text-slate-600 px-0.5">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-500/40" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Active Node Info Banner */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10.5px] font-mono text-slate-400 shrink-0">
        <span className="truncate">
          {selectedNode
            ? `Selected: ${selectedNode.label} (${selectedNode.sublabel})`
            : 'Click any node above to inspect provenance anchor & verification cryptographic certificate.'}
        </span>
        <span className="text-cyan-400 font-bold shrink-0 ml-2">Deterministic DAG</span>
      </div>
    </div>
  );
}
