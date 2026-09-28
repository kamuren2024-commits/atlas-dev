/**
 * Enterprise Workflow Orchestrator (EWO) — Workflow Scheduler
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export interface ScheduledTask {
  id: string;
  workflowId: string;
  tenantId: string;
  inputs: Record<string, any>;
  triggerType: 'IMMEDIATE' | 'DELAYED' | 'RECURRING' | 'EVENT' | 'DEPENDENCY';
  priority: number; // Higher values execute first
  delayMs?: number;
  scheduledTime?: number;
  cronExpression?: string; // e.g., "*/5 * * * *"
  eventTriggerName?: string;
  parentWorkflowId?: string;
}

export class WorkflowScheduler {
  private static instance: WorkflowScheduler;
  private taskQueue: ScheduledTask[] = [];
  private intervals: NodeJS.Timeout[] = [];

  private constructor() {}

  public static getInstance(): WorkflowScheduler {
    if (!WorkflowScheduler.instance) {
      WorkflowScheduler.instance = new WorkflowScheduler();
    }
    return WorkflowScheduler.instance;
  }

  public schedule(task: ScheduledTask, executeCallback: (task: ScheduledTask) => Promise<void> | void): void {
    const enrichedTask = { ...task };
    if (task.triggerType === 'IMMEDIATE') {
      enrichedTask.scheduledTime = Date.now();
      this.taskQueue.push(enrichedTask);
      this.sortQueue();
      // Dispatch immediately asynchronously
      setTimeout(() => executeCallback(enrichedTask), 0);
    } else if (task.triggerType === 'DELAYED') {
      enrichedTask.scheduledTime = Date.now() + (task.delayMs || 0);
      this.taskQueue.push(enrichedTask);
      this.sortQueue();
      setTimeout(() => executeCallback(enrichedTask), task.delayMs || 0);
    } else if (task.triggerType === 'RECURRING') {
      enrichedTask.scheduledTime = Date.now();
      this.taskQueue.push(enrichedTask);
      // Run every 10 seconds for simulated recurring task in-memory
      const interval = setInterval(() => {
        executeCallback(enrichedTask);
      }, 10000);
      this.intervals.push(interval);
    } else {
      // Event-triggered or Dependency-triggered
      enrichedTask.scheduledTime = Date.now();
      this.taskQueue.push(enrichedTask);
    }
  }

  private sortQueue(): void {
    // Sort by priority desc, then scheduledTime asc
    this.taskQueue.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return (a.scheduledTime || 0) - (b.scheduledTime || 0);
    });
  }

  public getQueue(): ScheduledTask[] {
    return this.taskQueue;
  }

  public triggerEvent(eventName: string, executeCallback: (task: ScheduledTask) => void): void {
    const tasks = this.taskQueue.filter((t) => t.triggerType === 'EVENT' && t.eventTriggerName === eventName);
    tasks.forEach((t) => executeCallback(t));
  }

  public clearAll(): void {
    this.taskQueue = [];
    this.intervals.forEach(clearInterval);
    this.intervals = [];
  }
}
