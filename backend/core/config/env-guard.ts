import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type EnvEvent = 'ENV_DELETED' | 'ENV_CORRUPTED' | 'ENV_CHANGED' | 'ENV_INVALID';

export class EnvIntegrityMonitor {
  private static envPath = path.resolve(process.cwd(), '.env');
  private static initialHash = '';
  private static isMonitoring = false;
  private static intervalId: NodeJS.Timeout | null = null;

  /**
   * Calculates the SHA-256 hash of the current .env file.
   */
  private static calculateHash(): string {
    if (!fs.existsSync(this.envPath)) {
      return '';
    }
    const content = fs.readFileSync(this.envPath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Initializes the monitor and registers the baseline state hash.
   */
  static init(): void {
    if (fs.existsSync(this.envPath)) {
      this.initialHash = this.calculateHash();
      console.log(`[INTEGRITY BASELINE] .env hash recorded: ${this.initialHash.substring(0, 16)}...`);
    } else {
      this.triggerEvent('ENV_DELETED', 'Baseline registration failed: .env does not exist.');
    }
  }

  /**
   * Performs an instantaneous integrity scan.
   */
  static check(): { intact: boolean; event?: EnvEvent; message?: string } {
    if (!fs.existsSync(this.envPath)) {
      this.triggerEvent('ENV_DELETED', 'The critical .env configuration file was deleted.');
      return { intact: false, event: 'ENV_DELETED', message: 'File deleted.' };
    }

    const currentHash = this.calculateHash();
    if (this.initialHash && currentHash !== this.initialHash) {
      this.triggerEvent('ENV_CHANGED', 'The .env configuration file has been modified externally.');
      return { intact: false, event: 'ENV_CHANGED', message: 'File modified externally.' };
    }

    return { intact: true };
  }

  /**
   * Starts a continuous background file watcher to protect .env.
   */
  static startContinuousMonitoring(intervalMs = 15000): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    this.intervalId = setInterval(() => {
      this.check();
    }, intervalMs);

    // Also register native file watch as a supplementary real-time sentinel
    try {
      fs.watch(this.envPath, (eventType) => {
        if (eventType === 'rename' || eventType === 'change') {
          this.check();
        }
      });
    } catch (e: any) {
      // Watch might fail on certain restricted platforms; polling fallback will handle it
    }
  }

  /**
   * Stops continuous background monitoring.
   */
  static stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Logs security/operations events and alerts the administration teams.
   */
  private static triggerEvent(event: EnvEvent, message: string): void {
    const timestamp = new Date().toISOString();
    const alertMessage = `[SECURITY_ALERT] [${timestamp}] EVENT: ${event} | MESSAGE: ${message}`;
    console.error(alertMessage);

    // Log the event to a persistent operations audit ledger
    const logDir = path.resolve(process.cwd(), 'docs/operations');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logPath = path.join(logDir, 'security-events.log');
    fs.appendFileSync(logPath, `${timestamp} [${event}] ${message}\n`, 'utf8');
  }
}
