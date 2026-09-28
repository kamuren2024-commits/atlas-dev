/**
 * Enterprise Agent Framework (EAF) — Lifecycle Manager
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentState } from '../types';
import { IAgentLifecycleManager } from '../contracts';
import { AgentEventPublisher, AgentEventType } from '../events';

export class AgentLifecycleManager implements IAgentLifecycleManager {
  private static instance: AgentLifecycleManager;
  private states = new Map<string, AgentState>();

  private constructor() {}

  public static getInstance(): AgentLifecycleManager {
    if (!AgentLifecycleManager.instance) {
      AgentLifecycleManager.instance = new AgentLifecycleManager();
    }
    return AgentLifecycleManager.instance;
  }

  public transitionTo(agentId: string, nextState: AgentState, reason?: string): void {
    const previousState = this.states.get(agentId);
    if (previousState === nextState) return;

    this.states.set(agentId, nextState);

    // Map next state to standard AgentEventType
    let eventType: AgentEventType;
    switch (nextState) {
      case AgentState.REGISTERED:
        eventType = 'AgentRegistered';
        break;
      case AgentState.INITIALIZING:
        eventType = 'AgentInitialized';
        break;
      case AgentState.READY:
        eventType = 'AgentReady';
        break;
      case AgentState.EXECUTING:
        eventType = 'AgentStarted';
        break;
      case AgentState.PAUSED:
        eventType = 'AgentPaused';
        break;
      case AgentState.WAITING:
        eventType = 'AgentResumed'; // Resumed/Waiting mapping
        break;
      case AgentState.COMPLETED:
        eventType = 'AgentCompleted';
        break;
      case AgentState.FAILED:
        eventType = 'AgentFailed';
        break;
      case AgentState.RECOVERED:
        eventType = 'AgentRecovered';
        break;
      case AgentState.DISABLED:
        eventType = 'AgentDisabled';
        break;
      default:
        eventType = 'AgentHealthChanged';
        break;
    }

    AgentEventPublisher.publish(eventType, agentId, {
      previousState,
      nextState,
      reason: reason || 'State transition requested.'
    });
  }

  public getState(agentId: string): AgentState | undefined {
    return this.states.get(agentId);
  }

  public clearAll(): void {
    this.states.clear();
  }
}
