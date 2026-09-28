/**
 * Loop Runtime Engine — Timeout Management
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { TimeoutError } from '../errors';

export class TimeoutManager {
  private activeTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Wraps any promise with a localized timeout, executing a pre-termination callback on trigger.
   */
  public async wrapWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    label: string,
    onTimeoutTriggered: () => void | Promise<void>
  ): Promise<T> {
    if (timeoutMs <= 0 || timeoutMs === Infinity) {
      return promise;
    }

    let timerId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(async () => {
        try {
          await Promise.resolve(onTimeoutTriggered());
        } catch (err) {
          console.error(`[TimeoutManager] Callback error on ${label}:`, err);
        }
        reject(new TimeoutError(`Timeout of ${timeoutMs}ms exceeded for: ${label}`));
      }, timeoutMs);
    });

    const key = `${label}-${Date.now()}`;
    if (timerId) {
      this.activeTimers.set(key, timerId);
    }

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      return result;
    } finally {
      if (timerId) {
        clearTimeout(timerId);
      }
      this.activeTimers.delete(key);
    }
  }

  public clearAll(): void {
    this.activeTimers.forEach((timer) => clearTimeout(timer));
    this.activeTimers.clear();
  }
}
