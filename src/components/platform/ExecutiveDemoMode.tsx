import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, ChevronRight, ChevronLeft, ArrowRight, Eye, Shield, Network, Bot, Workflow, GitBranch, CheckCircle2, Presentation } from 'lucide-react';
import { motionTokens } from '../../design-system/tokens';
import { AtlasStatusBadge } from '../ui/atlas/AtlasStatusBadge';
import { AtlasAIInsight } from '../ui/atlas/AtlasAIInsight';

/* ============================================================================
 * ATLAS EXECUTIVE DEMO MODE
 * A controlled presentation environment that hides development elements and
 * walks stakeholders through a curated enterprise intelligence story.
 * ========================================================================== */

export interface DemoScene {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  /** Target module to navigate to when this scene becomes active */
  module?: string;
  /** Narrative-driven copy shown to stakeholders */
  narrative?: string;
}

export interface ExecutiveDemoModeProps {
  scenes: DemoScene[];
  onNavigate: (moduleId: string) => void;
  activeModule: string;
  onExit: () => void;
  className?: string;
}

export function ExecutiveDemoMode({ scenes, onNavigate, activeModule, onExit, className = '' }: ExecutiveDemoModeProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [started, setStarted] = useState(false);

  const scene = scenes[sceneIndex];
  const isLast = sceneIndex === scenes.length - 1;

  const advance = () => {
    if (!started) { setStarted(true); return; }
    if (isLast) { onExit(); return; }
    const next = sceneIndex + 1;
    setSceneIndex(next);
    const target = scenes[next];
    if (target && target.module) onNavigate(target.module);
  };

  const back = () => {
    if (sceneIndex === 0) return;
    const prev = sceneIndex - 1;
    setSceneIndex(prev);
    const target = scenes[prev];
    if (target && target.module) onNavigate(target.module);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={motionTokens.transition.slow}
      className={`fixed inset-0 z-[60] bg-[#04060C] flex flex-col ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Executive demo mode"
    >
      {/* Demo chrome */}
      <div className="flex items-center justify-between px-5 md:px-8 py-3 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <div className="ml-3 flex items-center gap-2">
            <Presentation className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-slate-300 uppercase">Executive Demo Mode</span>
            <AtlasStatusBadge status="LIVE" pulse size="xs" />
          </div>
        </div>
        <button
          onClick={onExit}
          className="atlas-focus p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
          aria-label="Exit demo mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scene progress */}
      <div className="px-5 md:px-8 pt-4 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          {scenes.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= sceneIndex ? 'bg-cyan-400' : 'bg-slate-800'}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Scene {sceneIndex + 1} of {scenes.length} — {scene.title}
        </div>
      </div>

      {/* Scene content */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={motionTokens.transition.slow}
            className="max-w-3xl w-full text-center"
          >
            {/* Scene icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...motionTokens.transition.slow, delay: 0.1 }}
              className="mx-auto mb-8"
            >
              {scene.icon ? (
                <div className="w-20 h-20 mx-auto rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/60 to-violet-950/30 flex items-center justify-center text-cyan-400">
                  <scene.icon className="w-9 h-9" />
                </div>
              ) : (
                <AtlasStatusBadge status="ACTIVE" label="OPERATIONAL" pulse size="md" />
              )}
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-slate-100 leading-[1.08]">
              {scene.title}
            </h2>
            <p className="mt-5 text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              {scene.subtitle}
            </p>

            {scene.narrative && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...motionTokens.transition.slow, delay: 0.3 }}
                className="mt-8 mx-auto max-w-xl text-left"
              >
                <AtlasStatusBadge status="AI INSIGHT" label="ATLAS INTELLIGENCE" className="mb-3" />
                <div className="text-[13px] text-slate-300 leading-relaxed border-l-2 border-violet-500/40 pl-4">
                  {scene.narrative}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="shrink-0 px-6 md:px-10 py-5 border-t border-slate-800/60 flex items-center justify-between">
        <button
          onClick={back}
          disabled={sceneIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[11px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
            sceneIndex === 0
              ? 'border-slate-900 text-slate-700 cursor-not-allowed'
              : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <button
          onClick={advance}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-black tracking-widest uppercase transition-all cursor-pointer"
        >
          {!started ? (
            <><Play className="w-3.5 h-3.5" /> Begin Presentation</>
          ) : isLast ? (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Complete</>
          ) : (
            <><ChevronRight className="w-3.5 h-3.5" /> Next Scene</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default ExecutiveDemoMode;
