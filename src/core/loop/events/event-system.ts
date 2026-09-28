import { LoopContext, LoopState } from '../types';
import { generateId, generateHash } from '../../shared/crypto';

export type LoopEventName =
  | 'LoopStarted'
  | 'ObservationCompleted'
  | 'PlanGenerated'
  | 'ExecutionCompleted'
  | 'ValidationCompleted'
  | 'ReflectionCompleted'
  | 'LoopCompleted'
  | 'LoopFailed'
  | 'LoopCancelled'
  | 'DecisionGenerated'
  | 'RecommendationApproved'
  | 'RecommendationRejected'
  | 'LegalValidationCompleted'
  | 'SupplierRiskUpdated'
  | 'BudgetVarianceDetected'
  | 'ContractForecastUpdated'
  | 'MarketSignalReceived'
  | 'AppealRiskChanged'
  | 'AuditFindingCreated'
  | 'KnowledgeGraphUpdated'
  | 'DecisionGraphUpdated'
  | 'LoopPaused'
  | 'LoopResumed'
  | 'RetryStarted'
  | 'RetryCompleted'
  | 'CheckpointCreated'
  | 'CheckpointRestored'
  | 'TimeoutTriggered'
  | 'CancellationRequested'
  | 'PipelineStarted'
  | 'PipelineCompleted';

export interface LoopEvent {
  id: string;
  name: LoopEventName;
  timestamp: number;
  loopId: string;
  executionId: string;
  context: Partial<LoopContext>;
  payload: any;
  signature?: string;
}

type EventListener = (event: LoopEvent) => void | Promise<void>;

export class LoopEventSystem {
  private static listeners = new Map<LoopEventName, EventListener[]>();

  public static subscribe(eventName: LoopEventName, listener: EventListener): () => void {
    const list = this.listeners.get(eventName) || [];
    list.push(listener);
    this.listeners.set(eventName, list);

    return () => {
      const active = this.listeners.get(eventName) || [];
      const filtered = active.filter(item => item !== listener);
      this.listeners.set(eventName, filtered);
    };
  }

  public static async publish(eventName: LoopEventName, loopId: string, executionId: string, context: Partial<LoopContext>, payload: any): Promise<LoopEvent> {
    const event: LoopEvent = {
      id: generateId('evt'),
      name: eventName,
      timestamp: Date.now(),
      loopId,
      executionId,
      context,
      payload,
      signature: `SHA256_${generateHash('evt-bus-' + Date.now()).substring(0, 12)}_EVT_BUS`
    };

    const list = this.listeners.get(eventName) || [];
    // Run listeners asynchronously to avoid blocking the main reasoning loop thread
    for (const listener of list) {
      try {
        await Promise.resolve(listener(event));
      } catch (err) {
        console.error(`[EventSystem Error] Listener failed for ${eventName}:`, err);
      }
    }

    return event;
  }
}
