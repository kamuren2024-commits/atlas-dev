export interface AuditLogEntry {
  actorId: string;
  action: string;
  timestamp?: string;
  attributes?: Record<string, unknown>;
}

export interface AuditLogger {
  log(...args: any[]): void;
}
