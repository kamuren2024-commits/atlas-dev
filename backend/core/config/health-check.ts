export type HealthCheckStatus = 'healthy' | 'starting' | 'degraded';

export interface HealthCheckResult {
  status: HealthCheckStatus;
  httpStatus: 200 | 503;
}

export function resolveHealthCheckStatus(
  databaseStatus: string,
  systemHealth: string,
): HealthCheckResult {
  if (databaseStatus === 'UP' && systemHealth === 'NOMINAL') {
    return { status: 'healthy', httpStatus: 200 };
  }

  const status = systemHealth.toLowerCase() === 'starting' ? 'starting' : 'degraded';
  return { status, httpStatus: 503 };
}
