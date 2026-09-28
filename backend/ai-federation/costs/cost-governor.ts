export interface CostRecord {
  timestamp: string;
  module: string;
  agent?: string;
  user: string;
  workflow?: string;
  tokens: number;
  costUsd: number;
  provider: string;
}

export class CostGovernor {
  private static records: CostRecord[] = [];
  private static alerts: string[] = [];
  private static monthlyBudget = 1500.0; // SCM AI Board Budget limits (Kenya Shillings / US Dollar offsets)

  static recordTransaction(
    module: string, 
    user: string, 
    tokens: number, 
    costUsd: number, 
    provider: string, 
    agent?: string, 
    workflow?: string
  ): void {
    const record: CostRecord = {
      timestamp: new Date().toISOString(),
      module,
      agent,
      user,
      workflow,
      tokens,
      costUsd,
      provider
    };
    this.records.push(record);
    this.checkBudgetAlerts();
  }

  static getCostReport(period: 'hourly' | 'daily' | 'monthly'): {
    totalCost: number;
    totalTokens: number;
    byModule: Record<string, number>;
    byAgent: Record<string, number>;
    byProvider: Record<string, number>;
    byWorkflow: Record<string, number>;
  } {
    const now = new Date();
    let filtered = this.records;

    if (period === 'hourly') {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      filtered = this.records.filter(r => new Date(r.timestamp) >= oneHourAgo);
    } else if (period === 'daily') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filtered = this.records.filter(r => new Date(r.timestamp) >= oneDayAgo);
    } else if (period === 'monthly') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = this.records.filter(r => new Date(r.timestamp) >= oneMonthAgo);
    }

    let totalCost = 0;
    let totalTokens = 0;
    const byModule: Record<string, number> = {};
    const byAgent: Record<string, number> = {};
    const byProvider: Record<string, number> = {};
    const byWorkflow: Record<string, number> = {};

    filtered.forEach(r => {
      totalCost += r.costUsd;
      totalTokens += r.tokens;

      byModule[r.module] = (byModule[r.module] || 0) + r.costUsd;
      if (r.agent) {
        byAgent[r.agent] = (byAgent[r.agent] || 0) + r.costUsd;
      }
      byProvider[r.provider] = (byProvider[r.provider] || 0) + r.costUsd;
      if (r.workflow) {
        byWorkflow[r.workflow] = (byWorkflow[r.workflow] || 0) + r.costUsd;
      }
    });

    return {
      totalCost: Number(totalCost.toFixed(6)),
      totalTokens,
      byModule,
      byAgent,
      byProvider,
      byWorkflow
    };
  }

  private static checkBudgetAlerts(): void {
    const totalSpent = this.records.reduce((acc, r) => acc + r.costUsd, 0);
    const percentage = (totalSpent / this.monthlyBudget) * 100;

    if (percentage > 90 && !this.alerts.some(a => a.includes('90% Budget'))) {
      this.alerts.push(`[BUDGET WARNING] SCM AI Federation has exhausted 90% of monthly budget! Spent: $${totalSpent.toFixed(2)}`);
    } else if (percentage > 75 && !this.alerts.some(a => a.includes('75% Budget'))) {
      this.alerts.push(`[BUDGET WARNING] SCM AI Federation has exhausted 75% of monthly budget! Spent: $${totalSpent.toFixed(2)}`);
    } else if (percentage > 50 && !this.alerts.some(a => a.includes('50% Budget'))) {
      this.alerts.push(`[BUDGET NOTICE] SCM AI Federation has reached 50% of monthly budget. Spent: $${totalSpent.toFixed(2)}`);
    }
  }

  static getBudgetAlerts(): string[] {
    return this.alerts;
  }

  static clearAlerts(): void {
    this.alerts = [];
  }
}
