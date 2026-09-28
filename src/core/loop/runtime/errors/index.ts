/**
 * Loop Runtime Engine — Error Hierarchy
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export class LoopError extends Error {
  constructor(message: string, public readonly cause?: any) {
    super(message);
    this.name = 'LoopError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PlanningError extends LoopError {
  constructor(message: string, cause?: any) {
    super(message, cause);
    this.name = 'PlanningError';
  }
}

export class ExecutionError extends LoopError {
  constructor(message: string, cause?: any) {
    super(message, cause);
    this.name = 'ExecutionError';
  }
}

export class ValidationError extends LoopError {
  constructor(message: string, cause?: any) {
    super(message, cause);
    this.name = 'ValidationError';
  }
}

export class ReflectionError extends LoopError {
  constructor(message: string, cause?: any) {
    super(message, cause);
    this.name = 'ReflectionError';
  }
}

export class TimeoutError extends LoopError {
  constructor(message: string, cause?: any) {
    super(message, cause);
    this.name = 'TimeoutError';
  }
}

export class CancellationError extends LoopError {
  constructor(message: string, cause?: any) {
    super(message, cause);
    this.name = 'CancellationError';
  }
}

export class RetryLimitExceeded extends LoopError {
  constructor(message: string, cause?: any) {
    super(message, cause);
    this.name = 'RetryLimitExceeded';
  }
}
