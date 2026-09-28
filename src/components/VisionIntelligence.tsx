import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, Cpu, ScanLine, Camera, Image, Layers, RefreshCcw 
} from 'lucide-react';

interface VisualAnchor {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

export default function VisionIntelligence() {
  const [activeModel, setActiveModel] = useState('YOLO-v10-Cortex');
  const [analyzing, setAnalyzing] = useState(false);
  const [anchors, setAnchors] = useState<VisualAnchor[]>([
    { label: "Executive Terminal Ingress", x: 40, y: 30, w: 180, h: 90, confidence: 99.4 },
    { label: "Active Worker G-14 (Busy)", x: 260, y: 80, w: 100, h: 120, confidence: 94.2 },
    { label: "Anomalous Core CPU Burst", x: 110, y: 140, w: 120, h: 60, confidence: 88.5 }
  ]);

  const [activeFrame, setActiveFrame] = useState<'matrix' | 'abstract'>('matrix');

  const triggerOpticalScan = async () => {
    setAnalyzing(true);
    // Erase bounding targets
    setAnchors([]);

    await new Promise(r => setTimeout(r, 1400));

    // Regulate results
    setAnchors([
      { label: "Target Segmented Node-9", x: 80, y: 40, w: 160, h: 100, confidence: 98.2 },
      { label: "Compliance Anomaly Detected (CPU)", x: 280, y: 110, w: 90, h: 80, confidence: 96.4 },
      { label: "Telemetry Cluster (Standard)", x: 40, y: 160, w: 180, h: 50, confidence: 91.1 }
    ]);
    setAnalyzing(false);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6" id="vision-module">
      {/* Interactive visual canvas overlays */}
      <div className="flex-[2] glass-panel rounded-2xl p-5 flex flex-col justify-between overflow-hidden min-h-[460px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-cyan-400 rounded-lg">
                <Eye className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white">Optical Space Intelligence</h3>
                <p className="text-[11px] text-slate-400">Classify structural frame inputs, track bounding coordinates, and isolate objects</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
              {['matrix', 'abstract'].map((f: any) => (
                <button
                  key={f}
                  onClick={() => setActiveFrame(f)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-semibold transition-all ${
                    activeFrame === f ? 'bg-indigo-600/40 text-cyan-200' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f.toUpperCase()}_FRAME
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Simulator displaying coordinate bounding blocks */}
        <div className="flex-1 my-6 relative bg-slate-950/90 border border-slate-900 rounded-xl overflow-hidden min-h-[300px] flex justify-center items-center">
          {/* Animated Matrix Background representing continuous scanning */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-10">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border-t border-l border-cyan-400/40 text-[8px] font-mono text-cyan-500/30 p-1">
                {activeFrame === 'matrix' ? '10' : 'OS'}
              </div>
            ))}
          </div>

          {/* Glowing lens scanner line */}
          <div className="absolute inset-x-0 h-[1px] bg-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-bounce z-10"></div>

          {/* Visual representations */}
          {activeFrame === 'matrix' ? (
            <div className="text-center space-y-2 pointer-events-none relative z-0 opacity-40">
              <div className="text-cyan-400 font-mono text-2xl font-bold tracking-widest leading-none gowing-text">
                SALIENCE_ATLAS_V2
              </div>
              <div className="text-[10px] text-indigo-300 font-mono">
                COMPUTE_COGNITION_CORE_INGRESS_ONLINE
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 border border-indigo-500/25 rounded-full flex justify-center items-center animate-spin pointer-events-none duration-1000 opacity-25">
              <div className="w-32 h-32 border border-cyan-400/30 rounded-full flex justify-center items-center">
                <div className="w-16 h-16 border border-pink-500/30 rounded-full"></div>
              </div>
            </div>
          )}

          {/* Bounding box graphics overlay */}
          <AnimatePresence>
            {!analyzing && anchors.map((box, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute border border-dashed border-cyan-400 p-1 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.w}px`,
                  height: `${box.h}px`
                }}
              >
                {/* Floating coordinate and confidence stats tags */}
                <div className="absolute -top-5 left-0 bg-cyan-950/95 border border-cyan-500/40 text-[8px] font-mono text-cyan-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="font-bold">{box.label}</span>
                  <span className="text-slate-400">({box.confidence}%)</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Status Overlay */}
          <AnimatePresence>
            {analyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 flex flex-col justify-center items-center gap-2 z-20"
              >
                <ScanLine className="w-8 h-8 text-cyan-400 animate-pulse" />
                <p className="text-xs font-mono text-cyan-300 tracking-widest uppercase animate-pulse">Running Optical Ingress...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-[9px] font-mono text-slate-500 uppercase flex justify-between items-center mt-2 shrink-0">
          <span>COGNITIVE CORE CAMERA ACTIVE</span>
          <span>RESOLUTION: 1080P // STREAM FEED</span>
        </div>
      </div>

      {/* Model Selector & Optical diagnostics */}
      <div className="flex-1 glass-panel rounded-2xl p-5 flex flex-col justify-between max-h-[460px] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
            <h3 className="text-sm font-display font-semibold text-white">Visual Intelligence Diagnostic</h3>
            <button 
              onClick={triggerOpticalScan}
              disabled={analyzing}
              className="p-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] uppercase rounded-lg transition-colors"
            >
              Scan Frame
            </button>
          </div>

          <div className="space-y-3 font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-indigo-300 block">Classifier Engine Weight</label>
              <select
                value={activeModel}
                onChange={e => setActiveModel(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-900 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="YOLO-v10-Cortex">YOLO v10 Cortex (Fastest)</option>
                <option value="Segment-Anything-API">Segment Anything API (Precise)</option>
                <option value="OCR-Ingress-L-9">OCR Ingress L9 (Character heavy)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-xl space-y-2">
              <h4 className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider">Identified Targets Table</h4>
              <div className="space-y-2">
                {anchors.map((b, i) => (
                  <div key={i} className="flex justify-between items-center text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-950">
                    <span className="font-display font-medium text-white">{b.label}</span>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/25">{b.confidence}%</span>
                  </div>
                ))}
                {anchors.length === 0 && !analyzing && (
                  <p className="text-[10px] text-slate-500 text-center py-4">Optical index empty. Perform scan to process bounding tables.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
