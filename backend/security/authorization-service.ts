import { UserIdentity } from './identity-service';
import { DevAdminService, DEV_ADMIN_ID, DEV_ADMIN_PERMISSIONS } from './dev-admin';
import { FinancePermissionAction } from '../../packages/domain';

export interface PolicyResult {
  isAuthorized: boolean;
  reason: string;
  decision?: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'NOT_APPLICABLE' | 'POLICY_UNAVAILABLE';
}

export class AuthorizationService {
  private static ROLE_PERMISSIONS: Record<string, string[]> = {
    'admin': ['*'],
    'Administrator': ['*'],
    'Demo_User': ['logistics:read'],
    'Director Grid Logistics': [
      'project:read',
      'tender:view', 'procurement:read', 'tender:create', 'tender:edit', 'tender:draft', 'tender:approve_minor',
      'contract:view', 'contract:edit', 'contract:sign',
      'workflow:view', 'workflow:trigger',
      'agent:view', 'agent:execute',
      'compliance:view', 'compliance:score',
      'finance_source:view', 'finance_budget:view', 'finance_commitment:view',
      'finance_invoice:view', 'finance_payment:view', 'finance_project:view',
      'finance_quality:view', 'finance_lineage:view',
      'logistics:read', 'logistics:create', 'logistics:update', 'logistics:dispatch', 'logistics:cancel', 'logistics:admin'
    ],
    'LOGISTICS_OPERATOR': [
      'logistics:read', 'logistics:create', 'logistics:update'
    ],
    'LOGISTICS_DISPATCHER': [
      'logistics:read', 'logistics:create', 'logistics:update', 'logistics:dispatch', 'logistics:cancel'
    ],
    'LOGISTICS_ADMIN': [
      'logistics:read', 'logistics:create', 'logistics:update', 'logistics:dispatch', 'logistics:cancel', 'logistics:admin'
    ],
    'System Administrator': ['*'],
    'Executive': ['logistics:read'],
    'Logistics Manager': [
      'logistics:read', 'logistics:create', 'logistics:update', 'logistics:dispatch', 'logistics:cancel'
    ],
    'Fleet Manager': ['logistics:read', 'logistics:create', 'logistics:update'],
    'Dispatcher': [
      'logistics:read', 'logistics:create', 'logistics:update', 'logistics:dispatch', 'logistics:cancel'
    ],
    'Driver': ['logistics:read'],
    'Engineer': ['logistics:read', 'logistics:update'],
    'Project Manager': ['logistics:read'],
    'Maintenance Manager': ['logistics:read', 'logistics:create', 'logistics:update'],
    'Finance Officer': ['logistics:read'],
    'Procurement Officer': ['logistics:read'],
    'Security Officer': ['logistics:read'],
    'Auditor': ['logistics:read'],
    'Chief Procurement Officer': [
      'project:read',
      'tender:view', 'procurement:read', 'tender:create', 'tender:edit', 'tender:draft', 'tender:approve_minor', 'tender:approve_major',
      'contract:view', 'contract:edit', 'contract:sign',
      'workflow:view', 'workflow:trigger', 'workflow:override',
      'agent:view', 'agent:execute', 'agent:collaborate',
      'compliance:view', 'compliance:score', 'compliance:override',
      'finance_source:view', 'finance_budget:view', 'finance_commitment:view', 'finance_commitment:create',
      'finance_invoice:view', 'finance_payment:view', 'finance_project:view',
      'finance_quality:view', 'finance_lineage:view',
      'logistics:read'
    ],
    'SCM Intelligence Officer': [
      'project:read',
      'tender:view', 'procurement:read', 'tender:create', 'tender:edit', 'tender:draft',
      'contract:view', 'contract:edit',
      'workflow:view', 'workflow:trigger',
      'agent:view', 'agent:execute',
      'compliance:view', 'compliance:score',
      'finance_source:view', 'finance_budget:view', 'finance_commitment:view',
      'finance_invoice:view', 'finance_payment:view', 'finance_project:view',
      'finance_quality:view', 'finance_lineage:view',
      'logistics:read'
    ],
    'Board Director': [
      'project:read',
      'tender:view', 'procurement:read', 'tender:approve_major', 'tender:award',
      'contract:view',
      'workflow:view',
      'compliance:view',
      'executive:view',
      'finance_budget:view', 'finance_commitment:view',
      'finance_invoice:view', 'finance_payment:view', 'finance_project:view',
      'finance_quality:view', 'finance_report:view', 'finance_forecast:view',
      'finance_risk:view',
      'logistics:read'
    ],
    'Guest': [
      'tender:view', 'procurement:read',
      'contract:view',
      'workflow:view'
    ],
    'FINANCE_VIEWER': [
      'finance_source:view',
      'finance_budget:view',
      'finance_account:view',
      'finance_cost_centre:view',
      'finance_commitment:view',
      'finance_invoice:view',
      'finance_payment:view',
      'finance_project:view',
      'finance_quality:view',
      'finance_lineage:view',
      'finance_ingestion:view'
    ],
    'FINANCE_ANALYST': [
      'finance_source:view',
      'finance_budget:view',
      'finance_account:view',
      'finance_cost_centre:view',
      'finance_commitment:view', 'finance_commitment:create',
      'finance_invoice:view', 'finance_invoice:create',
      'finance_payment:view',
      'finance_project:view', 'finance_project:create',
      'finance_quality:view',
      'finance_lineage:view',
      'finance_ingestion:view', 'finance_ingestion:execute',
      'finance_report:view'
    ],
    'FINANCE_OFFICER': [
      'finance_source:view',
      'finance_budget:view', 'finance_budget:create', 'finance_budget:edit', 'finance_budget:approve',
      'finance_account:view',
      'finance_cost_centre:view',
      'finance_commitment:view', 'finance_commitment:create', 'finance_commitment:edit',
      'finance_invoice:view', 'finance_invoice:create', 'finance_invoice:edit',
      'finance_payment:view', 'finance_payment:create', 'finance_payment:approve',
      'finance_project:view', 'finance_project:create', 'finance_project:edit',
      'finance_quality:view',
      'finance_lineage:view',
      'finance_ingestion:view', 'finance_ingestion:execute',
      'finance_report:view', 'finance_forecast:view',
      'finance_risk:view'
    ],
    'FINANCE_MANAGER': [
      'finance_source:view', 'finance_source:configure',
      'finance_budget:view', 'finance_budget:create', 'finance_budget:edit', 'finance_budget:approve',
      'finance_account:view', 'finance_account:create',
      'finance_cost_centre:view', 'finance_cost_centre:create',
      'finance_commitment:view', 'finance_commitment:create', 'finance_commitment:edit',
      'finance_invoice:view', 'finance_invoice:create', 'finance_invoice:edit', 'finance_invoice:approve',
      'finance_payment:view', 'finance_payment:create', 'finance_payment:approve',
      'finance_project:view', 'finance_project:create', 'finance_project:edit',
      'finance_quality:view',
      'finance_lineage:view',
      'finance_ingestion:view', 'finance_ingestion:execute', 'finance_ingestion:configure',
      'finance_report:view', 'finance_report:create',
      'finance_forecast:view', 'finance_forecast:create',
      'finance_risk:view', 'finance_risk:create', 'finance_risk:edit'
    ],
    'FINANCE_DIRECTOR': [
      'finance_source:view', 'finance_source:configure',
      'finance_budget:view', 'finance_budget:create', 'finance_budget:edit', 'finance_budget:approve',
      'finance_account:view', 'finance_account:create',
      'finance_cost_centre:view', 'finance_cost_centre:create',
      'finance_commitment:view', 'finance_commitment:create', 'finance_commitment:edit',
      'finance_invoice:view', 'finance_invoice:create', 'finance_invoice:edit', 'finance_invoice:approve',
      'finance_payment:view', 'finance_payment:create', 'finance_payment:approve', 'finance_payment:execute',
      'finance_project:view', 'finance_project:create', 'finance_project:edit',
      'finance_quality:view',
      'finance_lineage:view', 'finance_lineage:export',
      'finance_ingestion:view', 'finance_ingestion:execute', 'finance_ingestion:configure',
      'finance_report:view', 'finance_report:create', 'finance_report:export',
      'finance_forecast:view', 'finance_forecast:create', 'finance_forecast:approve',
      'finance_risk:view', 'finance_risk:create', 'finance_risk:edit', 'finance_risk:approve'
    ],
    'FINANCE_ADMIN': [
      'finance_source:view', 'finance_source:create', 'finance_source:edit', 'finance_source:configure',
      'finance_budget:view', 'finance_budget:create', 'finance_budget:edit', 'finance_budget:approve',
      'finance_account:view', 'finance_account:create', 'finance_account:edit',
      'finance_cost_centre:view', 'finance_cost_centre:create', 'finance_cost_centre:edit',
      'finance_commitment:view', 'finance_commitment:create', 'finance_commitment:edit', 'finance_commitment:delete',
      'finance_invoice:view', 'finance_invoice:create', 'finance_invoice:edit', 'finance_invoice:approve',
      'finance_payment:view', 'finance_payment:create', 'finance_payment:edit', 'finance_payment:approve', 'finance_payment:execute',
      'finance_project:view', 'finance_project:create', 'finance_project:edit',
      'finance_quality:view', 'finance_quality:configure',
      'finance_lineage:view', 'finance_lineage:export',
      'finance_ingestion:view', 'finance_ingestion:execute', 'finance_ingestion:configure',
      'finance_report:view', 'finance_report:create', 'finance_report:export',
      'finance_forecast:view', 'finance_forecast:create', 'finance_forecast:approve',
      'finance_risk:view', 'finance_risk:create', 'finance_risk:edit', 'finance_risk:approve',
      'finance:configure_policy'
    ],
    'AUDITOR': [
      'project:read',
      'tender:view',
      'contract:view',
      'compliance:view',
      'finance_source:view',
      'finance_budget:view',
      'finance_account:view',
      'finance_cost_centre:view',
      'finance_commitment:view',
      'finance_invoice:view',
      'finance_payment:view',
      'finance_project:view',
      'finance_quality:view',
      'finance_lineage:view', 'finance_lineage:export',
      'finance_report:view', 'finance_report:export',
      'finance_ingestion:view',
      'finance_risk:view',
      'finance_forecast:view'
    ],
    'EXECUTIVE': [
      'tender:view', 'tender:approve_major',
      'contract:view',
      'compliance:view',
      'executive:view',
      'finance_source:view',
      'finance_budget:view',
      'finance_commitment:view',
      'finance_invoice:view',
      'finance_payment:view',
      'finance_project:view',
      'finance_quality:view',
      'finance_lineage:view',
      'finance_report:view', 'finance_report:export',
      'finance_risk:view',
      'finance_forecast:view'
    ]
  };

  /**
   * Evaluates if a user is allowed to perform an action on a specific resource using RBAC + ABAC
   */
  static checkPermission(
    user: UserIdentity,
    action: string,
    resource: string,
    resourceAttributes: Record<string, any> = {}
  ): PolicyResult {
    const isDevAdmin = user.id === DEV_ADMIN_ID;
    if (isDevAdmin && !DevAdminService.isDevAdminEnabled()) {
      return {
        isAuthorized: false,
        decision: 'DENY',
        reason: 'DEV_ADMIN authorization is available only in an explicit development environment.'
      };
    }

    // DEV_ADMIN uses a scoped development allowlist instead of the Administrator wildcard.
    const permissions = isDevAdmin
      ? DEV_ADMIN_PERMISSIONS
      : this.ROLE_PERMISSIONS[user.role] || this.ROLE_PERMISSIONS['Guest'];
    // 1. Wildcard Check (Admin bypass)
    if (permissions.includes('*')) {
      return { isAuthorized: true, reason: 'Superuser admin bypass authorized.' };
    }

    // 2. RBAC Basic Scope Verification
    const requestedPermission = `${resource}:${action}`;
    const hasRbac = permissions.includes(requestedPermission);
    if (!hasRbac) {
      return {
        isAuthorized: false,
        decision: 'DENY',
        reason: `Access Denied: Role "${user.role}" does not possess the required RBAC privilege "${requestedPermission}".`
      };
    }

    // 3. ABAC Attribute Policy Evaluation
    // Policy 1: Major Spending Thresholds (PPADA Section 70 / Kenya National Treasury Limits)
    if (resource === 'tender' && (action === 'approve_major' || action === 'award')) {
      const costUSD = resourceAttributes.costUSD || 0;
      if (costUSD > 1000000 && user.role !== 'Chief Procurement Officer' && user.role !== 'Board Director') {
        return {
          isAuthorized: false,
          decision: 'REQUIRE_APPROVAL',
          reason: `ABAC Violation: Tender value of $${costUSD.toLocaleString()} exceeds your role's maximum delegated award threshold ($1,000,000). Board approval required.`
        };
      }
    }

    // Policy 2: Price Variation Controls (PPRA limit of 10%)
    if (resource === 'contract' && action === 'approve_variation') {
      const variationPct = resourceAttributes.variationPct || 0;
      if (variationPct > 10 && user.role !== 'Chief Procurement Officer' && user.role !== 'Board Director') {
        return {
          isAuthorized: false,
          decision: 'REQUIRE_APPROVAL',
          reason: `ABAC Violation: Contract variation of ${variationPct}% exceeds the standard 10% statutory threshold. Requires CPO or Board authorization and PPRA notice.`
        };
      }
    }

    // Policy 3: Regional / Clearances Levels Enforcements
    const resourceSecurityLevel = resourceAttributes.securityLevel || 'LEVEL 01';
    const userLevelNum = parseInt(user.accessLevel.replace('LEVEL ', ''), 10) || 1;
    const resourceLevelNum = parseInt(resourceSecurityLevel.replace('LEVEL ', ''), 10) || 1;

    if (userLevelNum < resourceLevelNum) {
      return {
        isAuthorized: false,
        decision: 'DENY',
        reason: `Security Clearance Failure: Active Clearance level "${user.accessLevel}" is insufficient for resource clearance tier "${resourceSecurityLevel}".`
      };
    }

    // Policy 4: Tenant Separation Guard
    if (resourceAttributes.tenantId && resourceAttributes.tenantId !== user.tenantId) {
      return {
        isAuthorized: false,
        decision: 'DENY',
        reason: `Multi-Tenant Violation: Operation barred. Attempted cross-tenant access from tenant "${user.tenantId}" to tenant "${resourceAttributes.tenantId}".`
      };
    }

    // Policy 5: Finance — Segregation of Duties (SoD)
    //    Custom drafted person ("creator") cannot approve their own document.
    //    Resource tag `actorId`/`createdBy` records the actor who created the
    //    invoice/budget/commitment; same user approving is a hard SoD denial.
    const financeSoD =
      (resource === 'finance_payment' && action === 'approve') ||
      (resource === 'finance_budget' && action === 'approve') ||
      (resource === 'finance_invoice' && action === 'approve') ||
      (resource === 'finance_commitment' && action === 'approve');
    if (financeSoD) {
      const creator = resourceAttributes.actorId ?? resourceAttributes.createdBy ?? resourceAttributes.approverId;
      if (typeof creator === 'string' && creator === user.id) {
        return {
          isAuthorized: false,
          decision: 'DENY',
          reason: 'SoD Violation: Segregation of Duties policy blocked. The user who created this document cannot approve it. Elevate to a different approver (FINANCE_MANAGER or higher).'
        };
      }
    }

    // Policy 6: Finance — Approval Thresholds (Kenya National Treasury delegation)
    //    FINANCE_OFFICER:   ≤ 500K KES
    //    FINANCE_MANAGER:   ≤ 5M   KES
    //    FINANCE_DIRECTOR:  ≤ 50M  KES
    //    FINANCE_ADMIN / EXECUTIVE / BOARD: unlimited
    if (resource.startsWith('finance_') && (action === 'approve' || action === 'execute_financial_action')) {
      const amountKES = Number(resourceAttributes.amountKES || resourceAttributes.amount || 0);
      const thresholds: Record<string, number> = {
        'FINANCE_OFFICER': 500_000,
        'FINANCE_MANAGER': 5_000_000,
        'FINANCE_DIRECTOR': 50_000_000,
        'FINANCE_ADMIN': Infinity,
        'FINANCE_ADMIN_ROLE': Infinity,
        'EXECUTIVE': Infinity,
        'Board Director': Infinity,
        'Chief Procurement Officer': Infinity,
        'Administrator': Infinity,
        'admin': Infinity,
        'AUDITOR': 0
      };
      const limit = thresholds[user.role] ?? 0;
      if (amountKES > 0 && amountKES > limit) {
        return {
          isAuthorized: false,
          decision: 'REQUIRE_APPROVAL',
          reason: `ABAC Finance Threshold: Amount of KES ${amountKES.toLocaleString()} exceeds role "${user.role}" delegated limit (KES ${Number.isFinite(limit) ? limit.toLocaleString() : 'UNLIMITED'}). Escalate to a higher approver.`
        };
      }
    }

    // Policy 7: CP-03 — Production Fixture Guard
    //    Never allow fixture-only operations in production mode
    if (
      process.env.PROD_MODE === 'true' &&
      resourceAttributes.isFixture === true
    ) {
      return {
        isAuthorized: false,
        decision: 'DENY',
        reason: 'CP-03 Production Fixture Guard: Fixture record operations are blocked when PROD_MODE=true. DATA UNAVAILABLE / UNCERTAIN state enforced.'
      };
    }

    return {
      isAuthorized: true,
      decision: 'ALLOW',
      reason: 'Permissions successfully evaluated. Access Granted.'
    };
  }

  // ---------- Segregation of Duties (SoD) — standalone static helper ----------
  static checkSegregationOfDuties(
    user: UserIdentity,
    action: FinancePermissionAction,
    resource: string,
    attributes?: Record<string, unknown>,
  ): PolicyResult {
    const priorActor = attributes?.actorId as string | undefined;
    if (priorActor && priorActor === user.id) {
      return { isAuthorized: false, reason: 'Segregation of duties violation: same user cannot perform both actions' };
    }
    return { isAuthorized: true, reason: 'SoD boundary satisfied' };
  }

  // ---------- Singleton / instance adapter (for Finance dependency injection) ----------
  private static _instance: AuthorizationService | null = null;
  static getInstance(): AuthorizationService {
    if (!AuthorizationService._instance) AuthorizationService._instance = new AuthorizationService();
    return AuthorizationService._instance;
  }

  /**
   * Instance-level evaluate alias for checkPermission.  Normalizes a user payload
   * carrying a `roles` array (as used by the Finance API layer) to the canonical
   * `role` scalar required by the static implementation, then delegates.
   */
  evaluate(
    user: { id: string; role?: string; roles?: string[]; tenantId?: string; organizationId?: string; permissions?: string[]; email?: string; name?: string; clearance?: string; accessLevel?: string } | null,
    action: string,
    resource: string,
    resourceAttributes?: Record<string, unknown>,
  ): PolicyResult {
    const role = (user?.role) ?? (Array.isArray(user?.roles) ? user!.roles[0] ?? 'viewer' : 'viewer');
    const canonical: UserIdentity = {
      id: user?.id ?? 'anonymous',
      role,
      roles: Array.isArray(user?.roles) ? user!.roles : (role ? [role] : []),
      tenantId: user?.tenantId ?? 'ketraco',
      organizationId: user?.organizationId ?? 'default',
      accessLevel: user?.accessLevel ?? 'standard',
      clearance: user?.clearance ?? 'standard',
      permissions: user?.permissions ?? [],
      email: user?.email,
      name: user?.name,
    };
    return AuthorizationService.checkPermission(canonical, action, resource, resourceAttributes ?? {});
  }

  async check(
    userId: string | null | undefined,
    resource: string,
    action: string,
    resourceAttributes: Record<string, unknown> = {},
  ): Promise<boolean> {
    if (!userId) return false;

    const user = {
      id: userId,
      role: (resourceAttributes.role as string | undefined) ?? 'Guest',
      roles: [(resourceAttributes.role as string | undefined) ?? 'Guest'],
      tenantId: (resourceAttributes.tenantId as string | undefined) ?? 'ketraco',
      organizationId: (resourceAttributes.organizationId as string | undefined) ?? 'default',
      permissions: Array.isArray(resourceAttributes.permissions) ? resourceAttributes.permissions as string[] : [],
      accessLevel: (resourceAttributes.accessLevel as string | undefined) ?? 'standard',
      clearance: (resourceAttributes.clearance as string | undefined) ?? 'standard',
      email: (resourceAttributes.email as string | undefined),
      name: (resourceAttributes.name as string | undefined),
    };

    return this.evaluate(user, action, resource, resourceAttributes).isAuthorized;
  }
}
