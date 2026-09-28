/**
 * Atlas Input Validation & Sanitization Middleware
 * Prevents XSS, injection, and malformed data at the API boundary.
 */

import { Request, Response, NextFunction } from 'express';

// ─── Sanitization ───────────────────────────────────────────────────

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /expression\(/gi,
  /(\b(union|select|insert|update|delete|drop|alter|create|truncate)\b)/gi,
  /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
  /['";]\s*(or|and|union|select|insert|update|delete|drop)\b/gi,
  /\.\.\/|\.\.\\|\.\/|\.\//g,
  /\0/g,
];

function sanitizeString(value: string): string {
  let clean = value;
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  // Trim and limit length
  clean = clean.trim();
  if (clean.length > 10000) {
    clean = clean.substring(0, 10000);
  }
  return clean;
}

function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      const cleanKey = sanitizeString(key);
      clean[cleanKey] = sanitizeValue(val);
    }
    return clean;
  }
  return value;
}

// ─── Validation Rules ───────────────────────────────────────────────

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  body?: ValidationRule[];
  query?: ValidationRule[];
  params?: ValidationRule[];
}

function validateValue(value: any, rule: ValidationRule): string | null {
  // Required check
  if (rule.required && (value === undefined || value === null || value === '')) {
    return `${rule.field} is required`;
  }

  // Skip further checks if optional and not present
  if ((value === undefined || value === null) && !rule.required) {
    return null;
  }

  // Type check
  if (rule.type) {
    if (rule.type === 'array' && !Array.isArray(value)) {
      return `${rule.field} must be an array`;
    }
    if (rule.type !== 'array' && typeof value !== rule.type) {
      return `${rule.field} must be of type ${rule.type}`;
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `${rule.field} must be at least ${rule.minLength} characters`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${rule.field} must be at most ${rule.maxLength} characters`;
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${rule.field} has invalid format`;
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `${rule.field} must be at least ${rule.min}`;
    }
    if (rule.max !== undefined && value > rule.max) {
      return `${rule.field} must be at most ${rule.max}`;
    }
  }

  // Custom validation
  if (rule.custom) {
    const error = rule.custom(value);
    if (error) return error;
  }

  return null;
}

// ─── Middleware Factory ──────────────────────────────────────────────

export function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Sanitize all inputs
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeValue(req.query) as any;
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeValue(req.params) as any;
    }

    // Validate body
    if (schema.body) {
      for (const rule of schema.body) {
        const value = req.body?.[rule.field];
        const error = validateValue(value, rule);
        if (error) errors.push(error);
      }
    }

    // Validate query
    if (schema.query) {
      for (const rule of schema.query) {
        const value = req.query?.[rule.field];
        const error = validateValue(value, rule);
        if (error) errors.push(error);
      }
    }

    // Validate params
    if (schema.params) {
      for (const rule of schema.params) {
        const value = req.params?.[rule.field];
        const error = validateValue(value, rule);
        if (error) errors.push(error);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
        correlationId: req.correlationId,
      });
      return;
    }

    next();
  };
}

// ─── Common Validation Schemas ───────────────────────────────────────

export const Schemas = {
  // Generic CRUD
  idParam: {
    params: [{ field: 'id', required: true, type: 'string', minLength: 1, maxLength: 255 }],
  },

  // AI Inference
  aiInference: {
    body: [
      { field: 'prompt', required: true, type: 'string', minLength: 1, maxLength: 50000 },
      { field: 'model', type: 'string', maxLength: 100 },
      { field: 'maxTokens', type: 'number', min: 1, max: 100000 },
    ],
  },

  // Agent orchestration
  agentOrchestrate: {
    body: [
      { field: 'query', required: true, type: 'string', minLength: 1, maxLength: 10000 },
      { field: 'tenantId', type: 'string', maxLength: 255 },
    ],
  },

  // Event publishing
  eventPublish: {
    body: [
      { field: 'eventType', required: true, type: 'string', maxLength: 100 },
      { field: 'source', required: true, type: 'string', maxLength: 100 },
      { field: 'payload', required: true, type: 'object' },
    ],
  },

  // Decision logging
  decisionLog: {
    body: [
      { field: 'decisionName', required: true, type: 'string', minLength: 1, maxLength: 500 },
      { field: 'reasoning', required: true, type: 'array' },
      { field: 'confidenceScore', required: true, type: 'number', min: 0, max: 1 },
      { field: 'outcomeStatus', required: true, type: 'string' },
    ],
  },

  // Workflow start
  workflowStart: {
    body: [
      { field: 'definitionId', required: true, type: 'string', minLength: 1, maxLength: 255 },
      { field: 'tenantId', required: true, type: 'string', minLength: 1, maxLength: 255 },
      { field: 'context', type: 'object' },
    ],
  },
};
