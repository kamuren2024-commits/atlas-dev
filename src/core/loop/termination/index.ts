import { LoopContext, LoopState } from '../types';

export class TerminationControls {
  private static killSwitchTriggered = false;

  public static activateKillSwitch(): void {
    this.killSwitchTriggered = true;
    console.warn('[KILL SWITCH] Centralized Autonomous reasoning termination requested.');
  }

  public static resetKillSwitch(): void {
    this.killSwitchTriggered = false;
  }

  public static checkSafety(context: LoopContext): void {
    if (this.killSwitchTriggered) {
      throw new Error('Termination requested: System-wide kill switch is ACTIVE.');
    }

    if (context.state === LoopState.CANCELLED) {
      throw new Error('Termination requested: Execution was explicitly CANCELLED.');
    }

    // Check timeout (default: 5 minutes)
    const timeoutMs = context.metadata.timeoutMs || 300000;
    const currentDuration = Date.now() - context.startTime;
    if (currentDuration > timeoutMs) {
      context.state = LoopState.TIMED_OUT;
      throw new Error(`Termination requested: Execution exceeded maximum time limit of ${timeoutMs}ms.`);
    }
  }
}
