export interface Goal {
  id: string;
  description: string;
}

export interface Tool {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
}

export interface AgentMemory {
  shortTerm: string[];
  longTerm: string[];
  semantic: Record<string, any>;
  tenderMemory?: string[];
  supplierMemory?: string[];
  contractMemory?: string[];
  projectMemory?: string[];
  inventoryMemory?: string[];
  logisticsMemory?: string[];
  complianceMemory?: string[];
  sourcingMemory?: string[];
  executiveMemory?: string[];
  conversationHistory?: string[];
  successfulWorkflows?: string[];
}

// Unified Agent API Standard conforming to requirement 11
export interface Agent {
  id: string;
  name: string;
  domain: string;
  goals: Goal[];
  tools: Tool[];
  memory: AgentMemory;
  capabilities: string[]; // standard skill strings
  memoryAccess: string[]; // memory permissions
  
  reasoning(input: string): Promise<string>;
  execute(task: string): Promise<any>;
  learn(feedback: string): Promise<void>;
  collaborate(agentIds: string[]): Promise<any>;
  
  observe(event: { type: string; payload: any }): Promise<any>;
  recommend(context: string): Promise<any>;
}

export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  taskType?: string;
  correlationId?: string;
}

export interface AgentExecutionLog {
  id: string;
  agentId: string;
  agentName: string;
  task: string;
  thoughtProcess: string[];
  toolsUsed: string[];
  result: any;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error';
}

// Workflow types (Requirement 6)
export interface WorkflowStep {
  id: string;
  name: string;
  assignedAgentId: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  requiresApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'requested_review';
  output?: string;
  timestamp?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  currentStepIndex: number;
  steps: WorkflowStep[];
  startedAt?: string;
  completedAt?: string;
}

// Governance Queue types (Requirement 7)
export interface GovernanceQueueItem {
  id: string;
  workflowId?: string;
  stepId?: string;
  actionRequested: string;
  targetAgentId: string;
  confidence: number;
  reason: string;
  riskRating: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'approved' | 'rejected' | 'requested_review';
  requestedAt: string;
  resolvedAt?: string;
  operatorFeedback?: string;
}

// RAG Knowledge Base types (Requirement 9)
export interface KnowledgeDocument {
  id: string;
  title: string;
  type: 'pdf' | 'contract' | 'tender' | 'report' | 'manual';
  uploadedAt: string;
  size: string;
  contentLength: number;
  tags: string[];
  chunks: string[];
}

// Digital Twin intelligence models (Requirement 10)
export interface TwinEntity {
  id: string;
  type: 'Asset' | 'Project' | 'Supplier' | 'Contract' | 'Tender' | 'Department' | 'Risk';
  name: string;
  status: 'optimal' | 'nominal' | 'degraded' | 'critical';
  healthScore: number;
  metrics: Record<string, any>;
  observe(): Promise<{ status: string; description: string; logs: string[] }>;
  analyze(): Promise<{ insights: string[]; anomalousIndicators: string[] }>;
  predict(): Promise<{ riskRating: string; failureProbability: number; recommendation: string }>;
  recommend(): Promise<{ immediateActions: string[]; backupSources: string[] }>;
}
