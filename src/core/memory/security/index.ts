/**
 * Enterprise Memory Fabric (EMF) — Security Shield & Isolation
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemoryContext, MemoryEntry } from '../types';
import { encryptValue, decryptValue } from '../../shared/crypto';

export class MemorySecurityGuard {
  /**
   * Enforces strict multi-tenant context boundary check
   */
  public static verifyTenantIsolation(context: MemoryContext, entry: MemoryEntry): boolean {
    return context.tenantId === entry.context.tenantId;
  }

  /**
   * Enforces namespace isolation matching
   */
  public static verifyNamespaceAccess(context: MemoryContext, namespace: string): boolean {
    if (!context.metadata?.namespace) return true; // Default global
    return context.metadata.namespace === namespace;
  }

  /**
   * Verifies context authorization credentials for read/write requests
   */
  public static verifyPermissions(context: MemoryContext, requiredAction: 'READ' | 'WRITE' | 'MANAGE', resourceName: string): boolean {
    if (!context.permissions || context.permissions.length === 0) {
      // If no permission policies are loaded, fail safe for write, allow default read
      return requiredAction === 'READ';
    }

    return context.permissions.some((p) => {
      if (!p.authorized) return false;
      const actionMatches = p.action === requiredAction || p.action === 'MANAGE';
      const resourceMatches = p.resource === '*' || p.resource === resourceName;
      return actionMatches && resourceMatches;
    });
  }

  /**
   * Abstraction for Memory Payload zero-fill safe wiping (secure deletion)
   */
  public static secureWipePayload(entry: MemoryEntry): MemoryEntry {
    return {
      ...entry,
      value: '[SECURE_WIPED_BY_SYSTEM]',
      context: {
        ...entry.context,
        securityContext: { userId: 'SYSTEM_WIPER', roles: ['SYSTEM'] }
      }
    };
  }

  /**
   * AES-256-GCM encryption for memory payloads
   */
  public static encrypt(value: any): string {
    const raw = typeof value === 'string' ? value : JSON.stringify(value);
    return encryptValue(raw);
  }

  /**
   * AES-256-GCM decryption for memory payloads
   */
  public static decrypt(cipher: string): any {
    if (!cipher.startsWith('enc:')) return cipher;
    const decoded = decryptValue(cipher);
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  }
}
