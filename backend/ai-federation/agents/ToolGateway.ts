// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — TOOL GATEWAY
// Policy-enforced tool execution gateway
// ============================================================================

export interface ToolRequest {
  agentId: string;
  agentName: string;
  action: string;
  parameters: Record<string, any>;
  allowedTools: string[];
}

export interface ToolResult {
  allowed: boolean;
  reason: string;
  result?: any;
  requiresApproval: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Destructive operation patterns
const DESTRUCTIVE_PATTERNS = [
  'delete', 'remove', 'destroy', 'drop', 'truncate',
  'update', 'modify', 'change', 'alter', 'replace',
  'send', 'dispatch', 'execute', 'commit', 'publish',
  'approve', 'authorize', 'confirm', 'finalize',
];

// Safety-critical patterns (Class D — Prohibited)
const PROHIBITED_PATTERNS = [
  'scada', 'protection relay', 'grid control', 'circuit breaker',
  'safety system', 'emergency shutdown', 'load shedding relay',
];

export class ToolGateway {
  private static instance: ToolGateway;
  private executionLog: Array<{
    agentId: string;
    action: string;
    allowed: boolean;
    riskLevel: string;
    timestamp: string;
  }> = [];

  private constructor() {}

  public static getInstance(): ToolGateway {
    if (!ToolGateway.instance) {
      ToolGateway.instance = new ToolGateway();
    }
    return ToolGateway.instance;
  }

  /**
   * Execute a tool request with policy enforcement
   */
  async execute(request: ToolRequest): Promise<ToolResult> {
    const riskLevel = this.assessRisk(request);
    const isDestructive = this.isDestructiveOperation(request.action);
    const isProhibited = this.isProhibitedOperation(request.action);

    // 1. Check for prohibited operations (Class D)
    if (isProhibited) {
      const result: ToolResult = {
        allowed: false,
        reason: 'PROHIBITED: Safety-critical operation requires human approval and cannot be executed by AI',
        requiresApproval: false,
        riskLevel: 'CRITICAL',
      };
      this.logExecution(request, result);
      return result;
    }

    // 2. Check agent authorization
    const isAuthorized = this.checkAuthorization(request);
    if (!isAuthorized) {
      const result: ToolResult = {
        allowed: false,
        reason: `UNAUTHORIZED: Agent ${request.agentName} is not authorized for this action`,
        requiresApproval: false,
        riskLevel: 'HIGH',
      };
      this.logExecution(request, result);
      return result;
    }

    // 3. Assess risk level
    if (riskLevel === 'CRITICAL' || isDestructive) {
      const result: ToolResult = {
        allowed: false,
        reason: `APPROVAL_REQUIRED: ${isDestructive ? 'Destructive operation' : 'High-risk operation'} requires human approval`,
        requiresApproval: true,
        riskLevel,
      };
      this.logExecution(request, result);
      return result;
    }

    // 4. Allow low-risk operations
    const result: ToolResult = {
      allowed: true,
      reason: 'Policy check passed',
      result: { status: 'executed', action: request.action },
      requiresApproval: false,
      riskLevel,
    };
    this.logExecution(request, result);
    return result;
  }

  private assessRisk(request: ToolRequest): ToolResult['riskLevel'] {
    const action = request.action.toLowerCase();

    if (this.isProhibitedOperation(action)) return 'CRITICAL';
    if (this.isDestructiveOperation(action)) return 'HIGH';
    if (request.action.length > 50) return 'MEDIUM'; // complex operations
    return 'LOW';
  }

  private isDestructiveOperation(action: string): boolean {
    const lower = action.toLowerCase();
    return DESTRUCTIVE_PATTERNS.some(pattern => lower.includes(pattern));
  }

  private isProhibitedOperation(action: string): boolean {
    const lower = action.toLowerCase();
    return PROHIBITED_PATTERNS.some(pattern => lower.includes(pattern));
  }

  private checkAuthorization(request: ToolRequest): boolean {
    // Check if the action matches any allowed tool patterns
    return request.allowedTools.some(tool =>
      request.action.toLowerCase().includes(tool.toLowerCase()) ||
      tool === '*'
    );
  }

  private logExecution(request: ToolRequest, result: ToolResult): void {
    this.executionLog.push({
      agentId: request.agentId,
      action: request.action.substring(0, 100),
      allowed: result.allowed,
      riskLevel: result.riskLevel,
      timestamp: new Date().toISOString(),
    });

    // Cap log size
    if (this.executionLog.length > 5000) {
      this.executionLog = this.executionLog.slice(-2500);
    }
  }

  /**
   * Get execution log
   */
  getExecutionLog(filters?: { agentId?: string; allowed?: boolean; limit?: number }): typeof this.executionLog {
    let results = [...this.executionLog];
    if (filters?.agentId) results = results.filter(r => r.agentId === filters.agentId);
    if (filters?.allowed !== undefined) results = results.filter(r => r.allowed === filters.allowed);
    if (filters?.limit) results = results.slice(-filters.limit);
    return results;
  }
}
