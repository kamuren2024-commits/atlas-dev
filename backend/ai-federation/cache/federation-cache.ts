import { AIConfig } from '../config/provider-config';
import { RedisService } from '../../database/redis-service';

export interface CacheEntry {
  hash: string;
  response: any;
  timestamp: number;
  provider: string;
  model: string;
}

export class FederationCache {
  private static localCache: Map<string, CacheEntry> = new Map();
  private static TTL = AIConfig?.caching?.ttlSeconds || 3600;
  private static redis = RedisService.getInstance();

  /**
   * Simple stable string hashing to avoid absolute node crypto library loading issues
   */
  private static generateHash(prompt: string, context?: string): string {
    const combined = `${prompt}|||${context || ''}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `sha256_fed_${Math.abs(hash).toString(16)}`;
  }

  static async get(prompt: string, context?: string): Promise<CacheEntry | undefined> {
    const hash = this.generateHash(prompt, context);

    if (AIConfig?.caching?.enabled) {
      try {
        const cached = await this.redis.getCache<CacheEntry>('ai_federation', hash);
        if (cached) {
          return cached;
        }
      } catch (err: any) {
        console.warn('[FEDERATION CACHE] Redis get fallback:', err.message);
      }
    }

    const entry = this.localCache.get(hash);
    if (!entry) return undefined;

    // Check expiration TTL
    if (Date.now() - entry.timestamp > this.TTL * 1000) {
      this.localCache.delete(hash);
      return undefined;
    }

    return entry;
  }

  static async set(prompt: string, response: any, provider: string, model: string, context?: string): Promise<void> {
    const hash = this.generateHash(prompt, context);
    const entry: CacheEntry = {
      hash,
      response,
      timestamp: Date.now(),
      provider,
      model
    };

    if (AIConfig?.caching?.enabled) {
      try {
        await this.redis.setCache('ai_federation', hash, entry, this.TTL);
      } catch (err: any) {
        console.warn('[FEDERATION CACHE] Redis set fallback:', err.message);
      }
    }

    this.localCache.set(hash, entry);
  }

  static async clear(): Promise<void> {
    try {
      await this.redis.clearCacheRegion('ai_federation');
    } catch (err: any) {
      console.warn('[FEDERATION CACHE] Redis clear fallback:', err.message);
    }
    this.localCache.clear();
  }

  static getCacheSize(): number {
    return this.localCache.size;
  }
}

