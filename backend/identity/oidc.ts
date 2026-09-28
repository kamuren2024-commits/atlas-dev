import crypto from 'crypto';

export interface IdentityContext {
  subject: string;
  tenantId: string;
  roles: string[];
  groups: string[];
  scopes: string[];
  issuer: string;
  audience: string | string[];
  expiresAt: number;
}

export interface OidcConfig {
  issuer: string;
  audience: string;
  jwksUri: string;
  clockSkewSeconds: number;
}

interface JwksKey {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
}

interface JwksResponse {
  keys: JwksKey[];
}

export class OidcTokenValidator {
  private jwks: JwksResponse | null = null;

  constructor(private readonly config: OidcConfig) {}

  public async validate(token: string): Promise<IdentityContext> {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid OIDC token format.');
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as { alg?: string; kid?: string };
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<string, unknown>;
    if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported or missing OIDC signing algorithm.');
    if (payload.iss !== this.config.issuer) throw new Error('OIDC issuer validation failed.');
    if (!this.hasAudience(payload.aud, this.config.audience)) throw new Error('OIDC audience validation failed.');
    if (typeof payload.exp !== 'number' || payload.exp + this.config.clockSkewSeconds < Math.floor(Date.now() / 1000)) {
      throw new Error('OIDC token has expired.');
    }

    const key = await this.findKey(header.kid);
    const publicKey = crypto.createPublicKey({ key: { kty: key.kty, n: key.n, e: key.e }, format: 'jwk' });
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    if (!verifier.verify(publicKey, Buffer.from(parts[2], 'base64url'))) {
      throw new Error('OIDC token signature validation failed.');
    }

    const tenantId = this.stringClaim(payload.tenant_id || payload.tenantId);
    if (!tenantId) throw new Error('OIDC token is missing tenant identity.');
    return {
      subject: this.stringClaim(payload.sub) || '',
      tenantId,
      roles: this.arrayClaim(payload.roles || payload.realm_access && (payload.realm_access as { roles?: unknown }).roles),
      groups: this.arrayClaim(payload.groups),
      scopes: this.stringClaim(payload.scope)?.split(' ').filter(Boolean) || [],
      issuer: this.config.issuer,
      audience: payload.aud as string | string[],
      expiresAt: payload.exp as number
    };
  }

  private async findKey(kid: string): Promise<JwksKey> {
    if (!this.jwks) {
      const response = await fetch(this.config.jwksUri);
      if (!response.ok) throw new Error(`OIDC JWKS request failed with status ${response.status}.`);
      this.jwks = await response.json() as JwksResponse;
    }
    const key = this.jwks.keys.find(candidate => candidate.kid === kid);
    if (!key) {
      this.jwks = null;
      throw new Error('OIDC signing key is not available in JWKS.');
    }
    return key;
  }

  private hasAudience(value: unknown, expected: string): boolean {
    return Array.isArray(value) ? value.includes(expected) : value === expected;
  }

  private stringClaim(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  private arrayClaim(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  }
}
