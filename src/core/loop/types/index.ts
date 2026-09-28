/**
 * Loop Engineering Framework — Core Type & State Definitions
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export enum LoopState {
  CREATED = 'CREATED',
  OBSERVING = 'OBSERVING',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  VERIFYING = 'VERIFYING',
  REFLECTING = 'REFLECTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMED_OUT = 'TIMED_OUT'
}

export interface LoopContext {
  loopId: string;
  executionId: string;
  parentWorkflowId?: string;
  tenantId: string;
  state: LoopState;
  startTime: number;
  lastUpdateTime: number;
  duration: number;
  metadata: Record<string, any>;
  workingMemory: string[];
  sessionMemory: Record<string, any>;
  longTermMemoryRef?: string[];
  errors: Array<{ timestamp: number; message: string; stage: LoopState }>;
  metrics: {
    ragPrecision?: number;
    latencyMs?: number;
    ruleCoverage?: number;
    auditConfidence?: number;
  };
}

export interface LoopResult {
  loopId: string;
  executionId: string;
  success: boolean;
  finalState: LoopState;
  output: any;
  duration: number;
  metrics: Record<string, any>;
  auditTrailHash?: string;
}

export type LoopStrategyType = 'OODA' | 'PDCA' | 'ReAct' | 'Reflection' | 'Reflexion' | 'Goal' | 'Event' | 'Memory' | 'MultiAgent' | 'EnterpriseIntelligence';
