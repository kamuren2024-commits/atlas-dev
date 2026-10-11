import { randomUUID, createHash, randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, 'atlas-salt-v1', KEY_LENGTH);
}

function resolveEncryptionSecret(): string {
  const configured = process.env.ATLAS_ENCRYPTION_SECRET?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('ATLAS_ENCRYPTION_SECRET must be configured before encryption is used in production.');
  }

  const generated = randomBytes(KEY_LENGTH).toString('hex');
  process.env.ATLAS_ENCRYPTION_SECRET = generated;
  return generated;
}

// Generate a prefixed UUID (e.g., "evt-550e8400-e29b-41d4-a716-446655440000")
export function generateId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

// Generate a short ID (first 8 chars of UUID, no dashes)
export function generateShortId(prefix: string): string {
  return `${prefix}-${randomUUID().replace(/-/g, '').substring(0, 8)}`;
}

// Generate a SHA-256 hash of input data
export function generateHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

// Generate a correlation ID
export function generateCorrelationId(): string {
  return `corr-${randomUUID()}`;
}

// Generate a trace ID
export function generateTraceId(): string {
  return `trace-${randomUUID()}`;
}

// Generate a span ID
export function generateSpanId(): string {
  return `spn-${randomUUID().replace(/-/g, '').substring(0, 12)}`;
}

// AES-256-GCM Encryption
export function encrypt(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `enc:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

// AES-256-GCM Decryption
export function decrypt(ciphertext: string, secret: string): string {
  if (!ciphertext.startsWith('enc:')) return ciphertext;
  const parts = ciphertext.slice(4).split(':');
  if (parts.length !== 3) return ciphertext;
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = deriveKey(secret);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

// Convenience wrappers using the configured or ephemeral development secret.
export function encryptValue(value: any): string {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  return encrypt(raw, resolveEncryptionSecret());
}

export function decryptValue(cipher: string): any {
  if (!cipher.startsWith('enc:')) return cipher;
  const decoded = decrypt(cipher, resolveEncryptionSecret());
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
}
