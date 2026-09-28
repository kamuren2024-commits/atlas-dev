export const GRID_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['platform:read', 'platform:write', 'model:approve', 'risk:override', 'workflow:dispatch'],
  ASSET_MANAGER: ['asset:read', 'asset:write', 'defect:review', 'risk:read'],
  MAINTENANCE_ENGINEER: ['asset:read', 'defect:review', 'workflow:assign', 'work_order:close'],
  FIELD_ENGINEER: ['asset:read', 'evidence:upload', 'work_order:verify'],
  CONTROL_ROOM: ['asset:read', 'alert:ack', 'operations:read'],
  EXECUTIVE: ['dashboard:read', 'risk:read', 'portfolio:report'],
  SCM_OFFICER: ['asset:read', 'evidence:review', 'workflow:read'],
  SAFETY_OFFICER: ['asset:read', 'risk:read', 'approval:review'],
  ENGINEER: ['asset:read', 'defect:review', 'recommendation:read'],
  AUDITOR: ['audit:read', 'model:read', 'history:read']
};

export type GridSecurityPolicy = {
  role: keyof typeof GRID_ROLE_PERMISSIONS;
  requiredMfa: boolean;
  defaultTenantScope: 'single-tenant';
};

export const GRID_SECURITY_POLICIES: GridSecurityPolicy[] = Object.keys(GRID_ROLE_PERMISSIONS).map((role) => ({
  role: role as keyof typeof GRID_ROLE_PERMISSIONS,
  requiredMfa: role === 'ADMIN' || role === 'EXECUTIVE' || role === 'SAFETY_OFFICER',
  defaultTenantScope: 'single-tenant'
}));
