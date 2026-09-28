export type McpRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface McpToolDescriptor {
  toolId: string;
  provider: string;
  version: string;
  capabilities: string[];
  inputSchema: object;
  outputSchema: object;
  requiredScopes: string[];
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  allowedRoles: string[];
  allowedTenants: string[];
  allowedDestinations: string[];
  rateLimit: { requests: number; windowSeconds: number };
  timeoutMs: number;
  riskLevel: McpRiskLevel;
  humanApprovalRequirement: 'NONE' | 'REQUIRED';
}

export interface McpInvocation {
  tool: McpToolDescriptor;
  actorId: string;
  tenantId: string;
  purpose: string;
  input: unknown;
  traceId: string;
}

export interface McpPolicyGuard {
  authorize(invocation: McpInvocation): Promise<'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'ESCALATE'>;
}
