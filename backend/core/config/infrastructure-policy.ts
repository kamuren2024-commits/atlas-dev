/**
 * Infrastructure Policy Architecture
 * Centralized governance defining operational constraints across development,
 * testing, staging, and production environments.
 */

export interface InfrastructurePolicy {
  environment: 'development' | 'production' | 'test';
  redisRequired: boolean;
  redisBlocksStartup: boolean;
  redisBlocksAuthentication: boolean;
  redisBlocksAuthorization: boolean;
  allowInMemoryFallback: boolean;
  allowDevAdmin: boolean;
}

export class InfrastructurePolicyService {
  private static cachedPolicy: InfrastructurePolicy | null = null;

  /**
   * Resolves the current infrastructure policy based on the canonical runtime environment.
   */
  public static getPolicy(): InfrastructurePolicy {
    if (this.cachedPolicy) {
      return this.cachedPolicy;
    }

    const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase().trim();
    const isProduction = nodeEnv === 'production';
    const isTest = nodeEnv === 'test';

    if (isProduction) {
      this.cachedPolicy = {
        environment: 'production',
        redisRequired: true,
        redisBlocksStartup: true,
        redisBlocksAuthentication: true,
        redisBlocksAuthorization: true,
        allowInMemoryFallback: false,
        allowDevAdmin: false,
      };
    } else {
      this.cachedPolicy = {
        environment: isTest ? 'test' : 'development',
        redisRequired: false,
        redisBlocksStartup: false,
        redisBlocksAuthentication: false,
        redisBlocksAuthorization: false,
        allowInMemoryFallback: true,
        allowDevAdmin: !isTest,
      };
    }

    return this.cachedPolicy;
  }

  /**
   * Helper predicates
   */
  public static isDevelopment(): boolean {
    return this.getPolicy().environment === 'development';
  }

  public static isProduction(): boolean {
    return this.getPolicy().environment === 'production';
  }

  /**
   * Force reset of policy cache (used in test suites for matrix validation)
   */
  public static resetPolicyForTesting(): void {
    this.cachedPolicy = null;
  }
}
