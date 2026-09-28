/**
 * Enterprise Agent Framework (EAF) — Agent Events PubSub
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentState, AgentTelemetry } from '../types';
import { generateId } from '../../shared/crypto';

export type AgentEventType =
  | 'AgentRegistered'
  | 'AgentInitialized'
  | 'AgentReady'
  | 'AgentStarted'
  | 'AgentPaused'
  | 'AgentResumed'
  | 'AgentCompleted'
  | 'AgentFailed'
  | 'AgentRecovered'
  | 'AgentDisabled'
  | 'AgentHealthChanged';

export interface AgentEvent {
  id: string;
  type: AgentEventType;
  agentId: string;
  timestamp: number;
  payload: Record<string, any>;
  telemetrySnapshot?: AgentTelemetry;
}

export type AgentEventListener = (event: AgentEvent) => void | Promise<void>;

export class AgentEventPublisher {
  private static listeners = new Map<AgentEventType, Set<AgentEventListener>>();

  public static subscribe(type: AgentEventType, listener: AgentEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(listener);
      }
    };
  }

  public static async publish(
    type: AgentEventType,
    agentId: string,
    payload: Record<string, any> = {},
    telemetrySnapshot?: AgentTelemetry
  ): Promise<void> {
    const event: AgentEvent = {
      id: generateId('evt-agt'),
      type,
      agentId,
      timestamp: Date.now(),
      payload,
      telemetrySnapshot
    };

    const targetSet = this.listeners.get(type);
    if (targetSet) {
      for (const listener of targetSet) {
        try {
          await listener(event);
        } catch (err) {
          console.error(`Error in Agent Event listener for event type "${type}":`, err);
        }
      }
    }
  }

  public static clearAll(): void {
    this.listeners.clear();
  }
}
