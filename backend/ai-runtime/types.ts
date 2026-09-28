export interface AIModel {
  id: string;
  provider: string;
  name: string;
  version: string;
  capabilities: string[];
  contextWindow: number;
  supportedTools: string[];
  latencyProfile: 'low' | 'medium' | 'high';
  tokenPricing: {
    prompt: number;
    completion: number;
  };
  fallbackPriority: number;
  status: 'online' | 'offline' | 'degraded';
}

export interface PromptTemplate {
  id: string;
  name: string;
  version: number;
  content: string;
  systemInstruction?: string;
  parameters?: Record<string, any>;
  owner?: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
}

export interface ExecutionContext {
  userId?: string;
  tenantId?: string;
  workflowId?: string;
  moduleId?: string;
  correlationId?: string;
}

export interface InferenceRequest {
  promptName?: string;
  promptVersion?: number;
  rawPrompt?: string;
  variables?: Record<string, any>;
  context?: ExecutionContext;
  modelStrategy?: 'cost' | 'reasoning' | 'latency' | 'availability';
  overrides?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
  };
  tools?: string[];
}

export interface InferenceResponse {
  id: string;
  text: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  performance: {
    latencyMs: number;
    timeToFirstToken?: number;
  };
  evaluation?: {
    confidence: number;
    groundingScore?: number;
    safetyScore?: number;
  };
  traceId: string;
}

export interface MemoryEntry {
  id: string;
  type: 'semantic' | 'episodic' | 'working' | 'workflow' | 'agent';
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
}
