/**
 * Atlas Global Error Handler Middleware
 * Catches all unhandled errors and returns structured responses.
 * Never swallows errors — always logs and reports.
 */

import { Request, Response, NextFunction } from 'express';

export interface AtlasError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

export function createError(statusCode: number, message: string, code?: string, details?: any): AtlasError {
  const error = new Error(message) as AtlasError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  error.isOperational = true;
  return error;
}

export function errorHandler(err: AtlasError, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || statusCode < 500;

  // Log all errors (structured)
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: isOperational ? 'WARN' : 'ERROR',
    statusCode,
    message: err.message,
    code: err.code,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId,
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  if (isOperational) {
    console.warn('[ATLAS-OPERATIONAL]', JSON.stringify(logEntry));
  } else {
    console.error('[ATLAS-SYSTEM]', JSON.stringify(logEntry));
  }

  // Send response
  res.status(statusCode).json({
    error: isOperational ? err.message : 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    details: isOperational ? err.details : undefined,
    correlationId: req.correlationId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
    correlationId: req.correlationId,
  });
}

/**
 * Async route wrapper — catches rejected promises and forwards to error handler
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
