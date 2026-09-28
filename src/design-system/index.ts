// ============================================================================
// ATLAS DESIGN SYSTEM — UNIFIED BARREL EXPORT
// v1.0 — Single import entry point for all modules.
//
// Import pattern:
//   import { colors, motionTokens, AtlasPanel, AtlasKPI } from '@/src/design-system';
// ============================================================================

// --- Tokens (layer 1: primitive values) ---
export { colors } from './tokens/colors';
export { radius } from './tokens/radius';
export { typography } from './tokens/typography';
export { spacing } from './tokens/spacing';
export { shadows } from './tokens/shadows';
export { motionTokens } from './tokens/motion';

// --- Extended tokens (layer 2: new tokens aligned with ATLAS-DS spec) ---
export { borders } from './borders';
export { elevation } from './elevation';
export { breakpoints } from './breakpoints';

// ============================================================================
// ATLAS COMPONENT PRIMITIVES (layer 3: shared UI components)
// Imported from components/ui/atlas to avoid circular deps with token layer.
// ============================================================================

export { AtlasPanel } from '../components/ui/atlas/AtlasPanel';
export { AtlasKPI } from '../components/ui/atlas/AtlasKPI';
export { AtlasStatusBadge } from '../components/ui/atlas/AtlasStatusBadge';
export { AtlasButton } from '../components/ui/atlas/AtlasButton';
export { AtlasTable } from '../components/ui/atlas/AtlasTable';
export { AtlasDrawer } from '../components/ui/atlas/AtlasDrawer';
export { AtlasModal } from '../components/ui/atlas/AtlasModal';
export { AtlasEmptyState } from '../components/ui/atlas/AtlasEmptyState';
export { AtlasErrorState } from '../components/ui/atlas/AtlasErrorState';
export { AtlasSkeleton } from '../components/ui/atlas/AtlasSkeleton';
export { AtlasPageHeader } from '../components/ui/atlas/AtlasPageHeader';
export { AtlasModuleHero } from '../components/ui/atlas/AtlasModuleHero';
export { AtlasAIInsight } from '../components/ui/atlas/AtlasAIInsight';
export { AtlasTimeline } from '../components/ui/atlas/AtlasTimeline';
export { AtlasMissionBrief } from '../components/ui/atlas/AtlasMissionBrief';
export { AtlasAgentPulse, DEFAULT_ENTERPRISE_AGENTS } from '../components/ui/atlas/AtlasAgentPulse';
export type { AtlasAgentStatus } from '../components/ui/atlas/AtlasAgentPulse';
export { AtlasEvidenceReveal } from '../components/ui/atlas/AtlasEvidenceReveal';
export type { AtlasEvidenceLevel, AtlasEvidenceLevel as AtlasEvidence } from '../components/ui/atlas/AtlasEvidenceReveal';
export { AtlasIntelligenceCanvas } from '../components/ui/atlas/AtlasIntelligenceCanvas';

// --- Convenience grouped exports ---
export * as AtlasTokens from './tokens-barrel';
