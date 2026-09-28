/**
 * Enterprise Memory Fabric (EMF) — Utilities
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { generateId } from '../../shared/crypto';

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
}

export function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `hash-${Math.abs(hash).toString(16)}`;
}

export function generateUUID(): string {
  return generateId('mem');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
