import { ProviderHealthRegistry } from './health-registry';
import { ProviderRegistry } from '../config/provider-registry';

export type ProviderStatus = 'ACTIVE' | 'DEGRADED' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'DISABLED';

export class ProviderStatusService {
  private static statusOverrides: Record<string, ProviderStatus> = {};

  /**
   * Evaluates the absolute runtime status of a provider using real-time metrics
   */
  static getProviderStatus(providerId: string): ProviderStatus {
    const isEnabled = ProviderRegistry.isProviderEnabled(providerId);
    if (!isEnabled) {
      return 'DISABLED';
    }

    if (this.statusOverrides[providerId]) {
      return this.statusOverrides[providerId];
    }

    const metrics = ProviderHealthRegistry.getProviderStatus(providerId);
    if (!metrics) {
      const config = ProviderRegistry.getProviderConfig(providerId);
      if (config && (config.apiKey || providerId === 'ollama')) {
        return 'ACTIVE';
      }
      return 'UNAVAILABLE';
    }

    if (!metrics.isOnline) {
      return 'UNAVAILABLE';
    }

    if (metrics.rateLimit429Count > 0) {
      return 'RATE_LIMITED';
    }

    if (metrics.errorRate > 0.1 || metrics.avgLatencyMs > 1500) {
      return 'DEGRADED';
    }

    return 'ACTIVE';
  }

  static setStatusOverride(providerId: string, status: ProviderStatus): void {
    this.statusOverrides[providerId] = status;
  }

  static clearStatusOverride(providerId: string): void {
    delete this.statusOverrides[providerId];
  }
}
