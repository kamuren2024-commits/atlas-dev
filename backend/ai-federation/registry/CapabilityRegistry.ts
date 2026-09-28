// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — CAPABILITY REGISTRY
// Maps capabilities to models and agents
// ============================================================================

import { ModelIdentity, ProviderCategory } from '../federation/types';

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: 'REASONING' | 'ANALYSIS' | 'GENERATION' | 'EXTRACTION' | 'CLASSIFICATION' | 'EMBEDDING' | 'DOMAIN';
}

export interface ModelCapabilityMapping {
  modelId: string;
  providerId: string;
  score: number;  // 0-100
}

export interface AgentCapabilityMapping {
  agentId: string;
  requiredCapabilities: string[];
  providedCapabilities: string[];
}

// Pre-defined capabilities for the enterprise
export const ENTERPRISE_CAPABILITIES: Capability[] = [
  { id: 'reasoning', name: 'Logical Reasoning', description: 'Multi-step logical reasoning and deduction', category: 'REASONING' },
  { id: 'numerical_reasoning', name: 'Numerical Reasoning', description: 'Mathematical and numerical analysis', category: 'REASONING' },
  { id: 'legal_reasoning', name: 'Legal Reasoning', description: 'Legal analysis and regulatory interpretation', category: 'DOMAIN' },
  { id: 'coding', name: 'Code Generation', description: 'Code writing, debugging, and analysis', category: 'GENERATION' },
  { id: 'document_analysis', name: 'Document Analysis', description: 'Document comprehension and extraction', category: 'ANALYSIS' },
  { id: 'structured_output', name: 'Structured Output', description: 'JSON and structured data generation', category: 'GENERATION' },
  { id: 'summarization', name: 'Summarization', description: 'Text summarization and condensation', category: 'GENERATION' },
  { id: 'creative', name: 'Creative Generation', description: 'Creative writing and content generation', category: 'GENERATION' },
  { id: 'multilingual', name: 'Multilingual Support', description: 'Multi-language understanding and generation', category: 'DOMAIN' },
  { id: 'data_analysis', name: 'Data Analysis', description: 'Statistical and data analysis', category: 'ANALYSIS' },
  { id: 'domain_expertise', name: 'Domain Expertise', description: 'Specialized domain knowledge', category: 'DOMAIN' },
  { id: 'citation', name: 'Citation Generation', description: 'Source citation and reference management', category: 'EXTRACTION' },
  { id: 'classification', name: 'Text Classification', description: 'Content categorization and tagging', category: 'CLASSIFICATION' },
  { id: 'extraction', name: 'Entity Extraction', description: 'Named entity and relationship extraction', category: 'EXTRACTION' },
  { id: 'embedding', name: 'Text Embedding', description: 'Semantic text embedding generation', category: 'EMBEDDING' },
  { id: 'tool_calling', name: 'Tool Calling', description: 'Function and tool invocation', category: 'REASONING' },
  { id: 'vision', name: 'Vision', description: 'Image understanding and analysis', category: 'ANALYSIS' },
  { id: 'agent_coordination', name: 'Agent Coordination', description: 'Multi-agent task coordination', category: 'REASONING' },
  { id: 'forecasting', name: 'Forecasting', description: 'Time-series and trend prediction', category: 'ANALYSIS' },
  { id: 'compliance_checking', name: 'Compliance Checking', description: 'Regulatory compliance verification', category: 'DOMAIN' },
];

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, Capability> = new Map();
  private modelMappings: Map<string, ModelCapabilityMapping[]> = new Map();
  private agentMappings: Map<string, AgentCapabilityMapping> = new Map();

  private constructor() {
    // Register built-in capabilities
    for (const cap of ENTERPRISE_CAPABILITIES) {
      this.capabilities.set(cap.id, cap);
    }
  }

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  /**
   * Register a capability
   */
  registerCapability(capability: Capability): void {
    this.capabilities.set(capability.id, capability);
  }

  /**
   * Map a capability to a model with a score
   */
  mapCapabilityToModel(capabilityId: string, modelId: string, providerId: string, score: number): void {
    if (!this.modelMappings.has(capabilityId)) {
      this.modelMappings.set(capabilityId, []);
    }
    const mappings = this.modelMappings.get(capabilityId)!;
    const existing = mappings.find(m => m.modelId === modelId);
    if (existing) {
      existing.score = score;
    } else {
      mappings.push({ modelId, providerId, score });
    }
  }

  /**
   * Find models that provide a set of capabilities
   */
  findModelsForCapabilities(    requiredCapabilities: string[],
    minimumScore: number = 60
  ): Array<{
    modelId: string;
    providerId: string;
    matchedCapabilities: string[];
    averageScore: number;
  }> {
    const modelScores: Map<string, { providerId: string; scores: number[]; matched: string[] }> = new Map();

    for (const capId of requiredCapabilities) {
      const mappings = this.modelMappings.get(capId) || [];
      for (const mapping of mappings) {
        if (mapping.score >= minimumScore) {
          if (!modelScores.has(mapping.modelId)) {
            modelScores.set(mapping.modelId, { providerId: mapping.providerId, scores: [], matched: [] });
          }
          const entry = modelScores.get(mapping.modelId)!;
          entry.scores.push(mapping.score);
          entry.matched.push(capId);
        }
      }
    }

    const results: Array<{
      modelId: string;
      providerId: string;
      matchedCapabilities: string[];
      averageScore: number;
    }> = [];

    for (const [modelId, data] of modelScores) {
      // Only include models that match ALL required capabilities
      if (data.matched.length >= requiredCapabilities.length) {
        results.push({
          modelId,
          providerId: data.providerId,
          matchedCapabilities: data.matched,
          averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
        });
      }
    }

    results.sort((a, b) => b.averageScore - a.averageScore);
    return results;
  }

  /**
   * Find agents that have specific capabilities
   */
  findAgentsWithCapability(capabilityId: string): AgentCapabilityMapping[] {
    return Array.from(this.agentMappings.values()).filter(
      a => a.providedCapabilities.includes(capabilityId) || a.requiredCapabilities.includes(capabilityId)
    );
  }

  /**
   * Register agent capabilities
   */
  registerAgentCapabilities(agentId: string, required: string[], provided: string[]): void {
    this.agentMappings.set(agentId, {
      agentId,
      requiredCapabilities: required,
      providedCapabilities: provided,
    });
  }

  /**
   * Get all capability IDs a model supports
   */
  supportedCapabilities(modelId: string): string[] {
    const result: string[] = [];
    for (const [capId, mappings] of this.modelMappings) {
      if (mappings.some(m => m.modelId === modelId && m.score >= 60)) {
        result.push(capId);
      }
    }
    return result;
  }

  /**
   * Check whether a model supports a given capability
   */
  hasCapability(modelId: string, capabilityId: string): boolean {
    const mappings = this.modelMappings.get(capabilityId);
    if (!mappings) return false;
    return mappings.some(m => m.modelId === modelId && m.score >= 60);
  }

  /**
   * Get all capabilities
   */
  getAllCapabilities(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Get a capability by ID
   */
  getCapability(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }
}
