import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Upload, CheckCircle2, Search, ArrowRight, 
  Sparkles, FileCode, Archive, Layers
} from 'lucide-react';
import { processAIRequest } from '../utils/ai';

interface DocumentFile {
  name: string;
  size: string;
  format: 'pdf' | 'csv' | 'markdown' | 'docx';
  chunks: string[];
}

export default function DocumentIntelligence() {
  const [docs, setDocs] = useState<DocumentFile[]>([
    {
      name: 'WORKSPACE_COMPLIANCE_STANDARDS.pdf',
      size: '224 KB',
      format: 'pdf',
      chunks: [
        "Chunk #1: Local persistent token storage must maintain isolated cryptography models. Shared user browser caches are strictly designated as short-term context stores only.",
        "Chunk #2: Model orchestration procedures require fallback triggers to redirect traffic automatically to high-efficiency nodes, maintaining at least 95%+ server uptime thresholds.",
        "Chunk #3: Security detectors must monitor API key leakage and log continuous memory weight alterations securely inside the central database layer."
      ]
    },
    {
      name: 'ESBUILD_COMPILING_CONFIG.md',
      size: '12 KB',
      format: 'markdown',
      chunks: [
        "Chunk #1: To compile Express typescript files smoothly inside production buckets, bundle all relative pathways directly into high-speed CJS server streams.",
        "Chunk #2: Native Node.js modules are excluded from the bundle configurations. Specify packages=external to avoid bundle payload bloating beyond normal boundaries."
      ]
    }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<DocumentFile>(docs[0]);
  const [selectedChunkIdx, setSelectedChunkIdx] = useState<number | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [docSummary, setDocSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSummarizeDoc = async (doc: DocumentFile) => {
    setLoading(true);
    setDocSummary(null);

    // Prompt content construction
    const fullText = doc.chunks.join('\n');
    const response = await processAIRequest({
      module: 'document',
      prompt: `Summarize this file index: "${doc.name}". Ingested text: "${fullText}"`,
      systemInstruction: "You are the Document Intelligence Synthesizer. Distill the text into core actionable insights, a security compliance rating, and structural recommendations."
    });

    setDocSummary(response.text);
    setLoading(false);
  };

  const handleIngestPaste = () => {
    if (!pastedText.trim()) return;
    const newDoc: DocumentFile = {
      name: `PASTED_OPERATOR_SOURCE_${Date.now().toString().slice(-4)}.md`,
      size: `${(pastedText.length / 1024).toFixed(1)} KB`,
      format: 'markdown',
      chunks: pastedText.split('\n\n').filter(Boolean).map((t, idx) => `Chunk #${idx+1}: ${t}`)
    };
    setDocs(prev => [...prev, newDoc]);
    setSelectedDoc(newDoc);
    setPastedText('');
    setDocSummary(null);
    setSelectedChunkIdx(null);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6" id="document-intelligence-module">
      {/* File Indexer and Uploader */}
      <div className="flex-1 space-y-6 max-h-[750px] overflow-y-auto">
        {/* Upload section */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-indigo-500/10 pb-3">
            <Upload className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-display font-semibold text-white">Ingest Workspace Source</h3>
          </div>

          <div className="border border-dashed border-slate-800 hover:border-indigo-500/30 bg-slate-950/40 rounded-xl p-8 text-center space-y-2 cursor-pointer transition-all">
            <FileText className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <p className="text-xs text-slate-300">Drag & drop raw documents here</p>
            <p className="text-[10px] text-slate-500">Supports PDF, DOCX, TXT, CSV, or Markdown (Max 10MB)</p>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-mono text-indigo-300 uppercase block">Raw Text Paste Ingress</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste paragraph notes here..."
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                className="flex-1 bg-slate-950/60 border border-slate-800 rounded-lg text-xs py-2 px-3 focus:outline-none focus:border-indigo-500/50 text-white"
              />
              <button 
                onClick={handleIngestPaste}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs p-2 rounded-lg transition-colors shrink-0"
              >
                Ingest
              </button>
            </div>
          </div>
        </div>

        {/* Ingested Documents Registry list */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
            <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-cyan-400" /> Document Document Workspace Directory
            </h3>
            <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded">
              {docs.length} WORKSPACE FILES
            </span>
          </div>

          <div className="space-y-2.5">
            {docs.map((doc, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDoc(doc);
                  setSelectedChunkIdx(null);
                  setDocSummary(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedDoc.name === doc.name 
                    ? 'bg-indigo-500/10 border-indigo-500/35' 
                    : 'bg-slate-950/40 border-slate-900 hover:border-slate-850'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-slate-900 rounded-lg text-indigo-400">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-display font-medium text-white truncate">{doc.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">{doc.size} // {doc.format.toUpperCase()}</p>
                  </div>
                </div>

                <div onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => handleSummarizeDoc(doc)}
                    className="p-1 px-2 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-mono uppercase rounded transition-colors"
                  >
                    Brief
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Parser & Interactive Chunk viewer */}
      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col justify-between max-h-[750px] overflow-y-auto">
        <div className="space-y-6">
          <div className="border-b border-indigo-500/10 pb-4">
            <h3 className="text-sm font-display font-semibold text-white tracking-wide">
              Document Visual Segmentation Map
            </h3>
            <p className="text-xs text-slate-400">Indices of segmented semantic weight chunks in spatial array</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-indigo-400">
              <span>TARGET FILE: {selectedDoc.name}</span>
              <span>{selectedDoc.chunks.length} BLOCKS IDENTIFIED</span>
            </div>

            {/* Chunk selector list */}
            <div className="space-y-2.5">
              {selectedDoc.chunks.map((chk, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedChunkIdx(index)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs leading-relaxed space-y-1 ${
                    selectedChunkIdx === index 
                      ? 'bg-indigo-950/80 border-indigo-400 text-white' 
                      : 'bg-slate-950/50 border-slate-900 text-slate-300 hover:border-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[9px] text-slate-500 mb-1">
                    <span>UNIT_METADATA_CHUNK_0{index+1}</span>
                    <span>{chk.length} CHARS</span>
                  </div>
                  <p>{chk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summarizers block */}
          <div className="border-t border-slate-850 pt-5 space-y-4">
            <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Synthesized Chunk Diagnostic briefing
            </h4>

            <AnimatePresence mode="wait">
              {loading && (
                <div className="p-4 bg-slate-950 text-slate-400 text-xs text-center border border-slate-900 rounded-xl space-y-1.5">
                  <div className="w-4 h-4 rounded-full border border-indigo-400 border-t-transparent animate-spin mx-auto"></div>
                  <p className="font-mono text-[10px] uppercase text-cyan-400">Consolidating lexical representations...</p>
                </div>
              )}

              {!loading && docSummary && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-slate-950/90 border border-indigo-500/15 rounded-xl space-y-3"
                >
                  <p className="text-xs leading-relaxed text-slate-300 font-sans prose prose-invert">
                    {docSummary.split('\n').map((line, i) => (
                      <span key={i} className="block mb-1.5">{line}</span>
                    ))}
                  </p>
                </motion.div>
              )}

              {!loading && !docSummary && (
                <div className="p-8 border border-dashed border-slate-900 rounded-xl text-center space-y-1">
                  <Layers className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-500">Run summarization briefing to extract automated highlights.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
