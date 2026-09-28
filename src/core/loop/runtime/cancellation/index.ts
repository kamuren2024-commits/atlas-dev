/**
 * Loop Runtime Engine — Cancellation Framework
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { CancellationError } from '../errors';

export class CancellationToken {
  private isCancelledState = false;
  private reasonMessage = '';
  private listeners: (() => void)[] = [];

  public get isCancelled(): boolean {
    return this.isCancelledState;
  }

  public get reason(): string {
    return this.reasonMessage;
  }

  public cancel(reason: string): void {
    if (this.isCancelledState) return;
    this.isCancelledState = true;
    this.reasonMessage = reason;
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[CancellationToken] Error executing listener callback:', err);
      }
    });
  }

  public throwIfCancelled(): void {
    if (this.isCancelledState) {
      throw new CancellationError(`Cancellation requested: ${this.reasonMessage}`);
    }
  }

  public register(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((item) => item !== callback);
    };
  }
}

export class CancellationManager {
  private tokens = new Map<string, CancellationToken>();

  public createToken(executionId: string): CancellationToken {
    const token = new CancellationToken();
    this.tokens.set(executionId, token);
    return token;
  }

  public getToken(executionId: string): CancellationToken | undefined {
    return this.tokens.get(executionId);
  }

  public cancel(executionId: string, reason: string): void {
    const token = this.tokens.get(executionId);
    if (token) {
      token.cancel(reason);
    }
  }

  public removeToken(executionId: string): void {
    this.tokens.delete(executionId);
  }
}
