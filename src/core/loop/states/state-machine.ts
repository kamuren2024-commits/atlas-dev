import { LoopState } from '../types';

export class LoopStateMachine {
  private static readonly VALID_TRANSITIONS: Record<LoopState, LoopState[]> = {
    [LoopState.CREATED]: [LoopState.OBSERVING, LoopState.FAILED, LoopState.CANCELLED],
    [LoopState.OBSERVING]: [LoopState.PLANNING, LoopState.FAILED, LoopState.CANCELLED, LoopState.TIMED_OUT],
    [LoopState.PLANNING]: [LoopState.EXECUTING, LoopState.FAILED, LoopState.CANCELLED, LoopState.TIMED_OUT],
    [LoopState.EXECUTING]: [LoopState.VERIFYING, LoopState.FAILED, LoopState.CANCELLED, LoopState.TIMED_OUT],
    [LoopState.VERIFYING]: [LoopState.REFLECTING, LoopState.FAILED, LoopState.CANCELLED, LoopState.TIMED_OUT],
    [LoopState.REFLECTING]: [LoopState.COMPLETED, LoopState.FAILED, LoopState.CANCELLED, LoopState.TIMED_OUT],
    [LoopState.COMPLETED]: [],
    [LoopState.FAILED]: [],
    [LoopState.CANCELLED]: [],
    [LoopState.TIMED_OUT]: []
  };

  public static canTransition(current: LoopState, next: LoopState): boolean {
    const allowed = this.VALID_TRANSITIONS[current];
    return allowed ? allowed.includes(next) : false;
  }

  public static validateTransition(current: LoopState, next: LoopState): void {
    if (current === next) return; // Self-transition is a no-op
    if (!this.canTransition(current, next)) {
      throw new Error(`Invalid state transition: Cannot transition from [${current}] to [${next}]`);
    }
  }
}
