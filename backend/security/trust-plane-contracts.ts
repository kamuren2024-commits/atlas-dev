export type AuthenticationMethod = 'PASSWORD' | 'OIDC' | 'SESSION' | 'MUTUAL_TLS' | 'SERVICE_ACCOUNT';
export type AuthorizationDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'NOT_APPLICABLE' | 'POLICY_UNAVAILABLE';
export type EvidenceType =
  | 'SOURCE'
  | 'DERIVED'
  | 'MODEL_GENERATED'
  | 'HUMAN_ASSERTED'
  | 'EXTERNAL_VERIFICATION'
  | 'SYSTEM_OBSERVATION';
export type AuditStatus = 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';

export interface IdentityContext {
  actorId: string;
  tenantId: string;
  authenticationMethod: AuthenticationMethod;
  authenticationStrength: 'LOW' | 'MEDIUM' | 'HIGH';
  roles: string[];
  attributes: Record<string, string | number | boolean | string[]>;
  sessionId?: string;
  issuer?: string;
  issuedAt: string;
  expiresAt?: string;
}

export interface TenantContext {
  tenantId: string;
  tenantName?: string;
  resourceTenantId: string;
  actorTenantId: string;
  trustBoundary: 'LOCAL' | 'CROSS_TENANT_RESTRICTED' | 'UNVERIFIED';
}

export interface AuthorizationContext {
  actor: string;
  tenant: string;
  resource: string;
  resourceType: string;
  action: string;
  purpose?: string;
  mission?: string;
  workflow?: string;
  risk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  policyVersion?: string;
}

export interface ApprovalDecision {
  approvalId: string;
  missionId: string;
  workflowId: string;
  tenantId: string;
  requestedBy: string;
  approvedBy?: string;
  authority: string;
  decision: 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED' | 'PENDING';
  reason: string;
  policyVersion: string;
  requestedAt: string;
  decidedAt?: string;
  expiresAt?: string;
  evidenceRefs: string[];
}

export interface EvidenceRecord {
  evidenceId: string;
  tenantId: string;
  missionId: string;
  agentId?: string;
  workflowId?: string;
  sourceType: EvidenceType;
  sourceId?: string;
  contentHash: string;
  sourceUri?: string;
  capturedAt: string;
  capturedBy: string;
  classification?: string;
  confidence?: number;
  provenance?: string;
  validFrom?: string;
  validTo?: string;
  integrityStatus: 'VERIFIED' | 'UNVERIFIED' | 'TAMPERED';
}

export interface TrustBoundaryResult {
  ok: boolean;
  decision: AuthorizationDecision;
  reason: string;
}

export function buildTrustBoundaryResult(allowed: boolean, reason: string): TrustBoundaryResult {
  return {
    ok: allowed,
    decision: allowed ? 'ALLOW' : 'DENY',
    reason,
  };
}

export function enforceTenantBoundary(ctx: TenantContext): TrustBoundaryResult {
  const actorMatches = ctx.actorTenantId === ctx.tenantId;
  const resourceMatches = ctx.resourceTenantId === ctx.tenantId;
  const allowed = actorMatches && resourceMatches && ctx.trustBoundary !== 'UNVERIFIED';

  if (!actorMatches || !resourceMatches) {
    return buildTrustBoundaryResult(false, 'TENANT_BOUNDARY_FAILURE: actor and resource tenant context do not match.');
  }

  if (!allowed) {
    return buildTrustBoundaryResult(false, 'TENANT_BOUNDARY_FAILURE: trust boundary is unverified or restricted.');
  }

  return buildTrustBoundaryResult(true, 'Tenant boundary verified.');
}

export function ensureIdentityPresent(identity: Partial<IdentityContext> | null | undefined): TrustBoundaryResult {
  if (!identity || !identity.actorId || !identity.tenantId) {
    return buildTrustBoundaryResult(false, 'AUTHENTICATION_FAILURE: actor or tenant is missing.');
  }

  return buildTrustBoundaryResult(true, 'Identity verified.');
}
