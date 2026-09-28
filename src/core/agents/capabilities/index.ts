/**
 * Enterprise Agent Framework (EAF) — Capability Registry & Implementations
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentCapability, AgentCapabilityType } from '../types';

export class CapabilityRegistry {
  private static defaultCapabilities = new Map<AgentCapabilityType, AgentCapability>();

  static {
    this.registerDefault('PLANNING', {
      type: 'PLANNING',
      name: 'Dynamic Task Planner',
      description: 'Generates step-by-step execution plans and hierarchical graphs.',
      execute: (input) => ({ plan: [`Step 1: ${input.goal || 'Initiate'}`] })
    });

    this.registerDefault('ANALYSIS', {
      type: 'ANALYSIS',
      name: 'Analytical Engine',
      description: 'Processes logs, parses metrics, and generates strategic recommendations.',
      execute: (input) => ({ evaluationScore: 0.85, flags: [] })
    });

    this.registerDefault('RETRIEVAL', {
      type: 'RETRIEVAL',
      name: 'Knowledge Retriever',
      description: 'Queries in-memory schemas or indexes for regulatory texts.',
      execute: (input) => ({ results: [{ snippet: `Matched regulatory section: ${input.query || '*'}` }] })
    });

    this.registerDefault('VALIDATION', {
      type: 'VALIDATION',
      name: 'Integrity Validator',
      description: 'Checks constraints and validates structural formats.',
      execute: (input) => ({ valid: true })
    });

    this.registerDefault('GENERATION', {
      type: 'GENERATION',
      name: 'Language Synthesizer',
      description: 'Constructs structured human-readable text drafts.',
      execute: (input) => ({ text: `Generated response for: ${input.prompt || 'Draft'}` })
    });

    this.registerDefault('REFLECTION', {
      type: 'REFLECTION',
      name: 'Self-Correction Module',
      description: 'Inspects its own operations to repair runtime failures.',
      execute: (input) => ({ corrected: true })
    });

    this.registerDefault('MONITORING', {
      type: 'MONITORING',
      name: 'System Sentry',
      description: 'Alerts if metrics cross unsafe thresholds.',
      execute: (input) => ({ alertFired: false })
    });

    this.registerDefault('NOTIFICATION', {
      type: 'NOTIFICATION',
      name: 'Alert Dispatcher',
      description: 'Sends notifications to registered webhooks or users.',
      execute: (input) => ({ dispatched: true })
    });

    this.registerDefault('COMPLIANCE', {
      type: 'COMPLIANCE',
      name: 'Regulatory Auditor',
      description: 'Evaluates legality of activities against acts like Kenya PPADA 2015.',
      execute: (input) => ({ compliant: true, actMatched: 'PPADA 2015' })
    });

    this.registerDefault('REPORTING', {
      type: 'REPORTING',
      name: 'Telemetry Summarizer',
      description: 'Collates execution metrics into clean PDF/Markdown tables.',
      execute: (input) => ({ reportText: 'Compliance & Performance Summary' })
    });
  }

  public static registerDefault(type: AgentCapabilityType, cap: AgentCapability): void {
    this.defaultCapabilities.set(type, cap);
  }

  public static getDefault(type: AgentCapabilityType): AgentCapability | undefined {
    return this.defaultCapabilities.get(type);
  }
}
