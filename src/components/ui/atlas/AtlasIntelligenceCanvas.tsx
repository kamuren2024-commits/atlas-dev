import React from 'react';
import { motion } from 'motion/react';
import { motionTokens } from '../../../design-system/tokens';

/**
 * Intelligence Canvas — the core Atlas 3-layer layout pattern.
 *
 * ┌─────────────────────────────────────────────────────┐
 * │ GLOBAL MISSION CONTEXT                              │ (render props / children)
 * ├────────────┬───────────────────────────┬────────────┤
 * │ NAVIGATION │    PRIMARY INTELLIGENCE    │ CONTEXTUAL │
 * │  (rail)    │        CANVAS              │ INTELLIGENCE
 * └────────────┴───────────────────────────┴────────────┘
 *
 * Progressive layers: Level 1 (executive) → Level 2 (operational) → Level 3 (evidence).
 */

interface AtlasIntelligenceCanvasProps {
  children: React.ReactNode;
  contextual?: React.ReactNode;   // right contextual intelligence column
  className?: string;
  contextWidth?: 'narrow' | 'wide';
}

export function AtlasIntelligenceCanvas({
  children,
  contextual,
  className = '',
  contextWidth = 'narrow',
}: AtlasIntelligenceCanvasProps) {
  const contextualWidth =
    contextWidth === 'wide'
      ? 'lg:grid-cols-[1fr_340px]'
      : 'lg:grid-cols-[1fr_300px]';

  return (
    <div
      className={`grid grid-cols-1 ${contextualWidth} gap-3 p-3 sm:p-4 overflow-hidden min-h-0 ${className}`}
    >
      {/* Primary intelligence canvas */}
      <div className="flex flex-col gap-3 min-w-0 min-h-0 overflow-hidden">{children}</div>

      {/* Contextual intelligence column */}
      {contextual && (
        <motion.aside
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={motionTokens.transition.normal}
          className="hidden lg:flex flex-col gap-3 min-w-0 overflow-y-auto pr-0.5 scrollbar-hide"
          aria-label="Contextual intelligence"
        >
          {contextual}
        </motion.aside>
      )}
    </div>
  );
}

export default AtlasIntelligenceCanvas;
