import crypto from 'crypto';

export class CryptographyService {
  private static DEFAULT_KEY = crypto.scryptSync(
    process.env.JWT_SECRET || 'salience-atlas-v5-enterprise-secret-key-salt',
    'salt-for-key-derivation',
    32
  );

  /**
   * Encrypt a plain-text string using AES-256-GCM
   */
  static encrypt(text: string, customKey?: Buffer): { iv: string; encryptedData: string; tag: string } {
    const iv = crypto.randomBytes(12);
    const key = customKey || this.DEFAULT_KEY;
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      tag: tag
    };
  }

  /**
   * Decrypt an AES-256-GCM encrypted payload
   */
  static decrypt(payload: { iv: string; encryptedData: string; tag: string }, customKey?: Buffer): string {
    const key = customKey || this.DEFAULT_KEY;
    const iv = Buffer.from(payload.iv, 'hex');
    const tag = Buffer.from(payload.tag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Deterministic SHA-256 hashing
   */
  static hashSHA256(text: string): string {
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  }

  /**
   * Generate a cryptographically secure random hexadecimal token
   */
  static generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generate an HMAC SHA-256 signature
   */
  static hmacSign(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify an HMAC SHA-256 signature
   */
  static verifyHmacSign(data: string, signature: string, secret: string): boolean {
    const expected = this.hmacSign(data, secret);
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  }
}
