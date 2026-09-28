/**
 * Loop Runtime Engine — High-Fidelity Task Scheduler
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export interface SchedulerTask {
  id: string;
  loopId: string;
  priority: number; // Higher numbers represent higher priority
  delayMs?: number;
  cronExpr?: string;
  dependencies?: string[]; // IDs of tasks that must complete before this runs
  action: () => Promise<void> | void;
}

export class LoopScheduler {
  private tasks = new Map<string, SchedulerTask>();
  private completedTasks = new Set<string>();
  private activeTimers = new Map<string, NodeJS.Timeout>();

  public schedule(task: SchedulerTask): void {
    this.tasks.set(task.id, task);

    if (task.delayMs && task.delayMs > 0) {
      const timer = setTimeout(async () => {
        await this.executeTaskWithPrechecks(task.id);
      }, task.delayMs);
      this.activeTimers.set(task.id, timer);
    } else if (task.cronExpr) {
      // Periodic simulated execution pattern matching cron triggers (every 4s for mock loops)
      const timer = setInterval(async () => {
        await this.executeTaskWithPrechecks(task.id, true);
      }, 4000);
      this.activeTimers.set(task.id, timer);
    } else {
      // Queue for immediate sorted priority evaluation
      this.dispatchImmediate();
    }
  }

  public cancelTask(taskId: string): void {
    const timer = this.activeTimers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      this.activeTimers.delete(taskId);
    }
    this.tasks.delete(taskId);
  }

  public getPendingTasks(): SchedulerTask[] {
    return Array.from(this.tasks.values())
      .filter((t) => !this.completedTasks.has(t.id))
      .sort((a, b) => b.priority - a.priority);
  }

  private async executeTaskWithPrechecks(taskId: string, recurring = false): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Evaluate dependency safety
    if (task.dependencies && task.dependencies.length > 0) {
      const allCompleted = task.dependencies.every((depId) => this.completedTasks.has(depId));
      if (!allCompleted) {
        return; // Postpone execution until dependencies clear
      }
    }

    try {
      await Promise.resolve(task.action());
      if (!recurring) {
        this.completedTasks.add(taskId);
      }
    } catch (err) {
      console.error(`[LoopScheduler] Failed running scheduled task ${taskId}:`, err);
    }
  }

  private async dispatchImmediate(): Promise<void> {
    const pending = this.getPendingTasks().filter(
      (t) => !t.delayMs && !t.cronExpr && (!t.dependencies || t.dependencies.every((dep) => this.completedTasks.has(dep)))
    );

    for (const task of pending) {
      await this.executeTaskWithPrechecks(task.id);
    }
  }

  public clearAll(): void {
    this.activeTimers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.activeTimers.clear();
    this.tasks.clear();
    this.completedTasks.clear();
  }
}
