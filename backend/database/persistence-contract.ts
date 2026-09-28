export type DatabaseState =
  | 'DATABASE_AVAILABLE'
  | 'DATABASE_UNAVAILABLE'
  | 'DATABASE_INITIALIZING'
  | 'DATABASE_DEGRADED'
  | 'DATABASE_CORRUPT'
  | 'DATABASE_MIGRATION_REQUIRED';

export type PersistenceResultCode =
  | 'SUCCESS'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'PERSISTENCE_UNAVAILABLE'
  | 'PERSISTENCE_ERROR'
  | 'INTEGRITY_ERROR';

export interface PersistenceResult<T = unknown> {
  status: PersistenceResultCode;
  databaseState: DatabaseState;
  data?: T;
  message?: string;
  error?: string;
}

export function successResult<T>(data?: T, databaseState: DatabaseState = 'DATABASE_AVAILABLE'): PersistenceResult<T> {
  return {
    status: 'SUCCESS',
    databaseState,
    data,
    message: 'Operation succeeded.',
  };
}

export function unavailableResult<T>(message: string, databaseState: DatabaseState = 'DATABASE_UNAVAILABLE'): PersistenceResult<T> {
  return {
    status: 'PERSISTENCE_UNAVAILABLE',
    databaseState,
    message,
    error: message,
  };
}

export function errorResult<T>(status: PersistenceResultCode, message: string, databaseState: DatabaseState): PersistenceResult<T> {
  return {
    status,
    databaseState,
    message,
    error: message,
  };
}
