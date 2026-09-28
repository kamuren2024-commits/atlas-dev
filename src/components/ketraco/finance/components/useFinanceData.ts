import { useCallback, useEffect, useMemo, useState } from 'react';
import { financeApi } from '../api/finance-api';
import type {
  FinanceSource,
  FinanceBatch,
  FinanceAccount,
  FinanceCostCentre,
  FinanceBudget,
  FinanceCommitment,
  FinanceInvoice,
  FinancePayment,
  FinanceProject,
  FinanceLineageRecord,
  DataQualityScore,
  DataState,
  FinanceMetric,
} from '../types';

export interface FinanceDataState {
  loading: boolean;
  state: DataState;
  sources: FinanceSource[];
  batches: FinanceBatch[];
  accounts: FinanceAccount[];
  costCentres: FinanceCostCentre[];
  budgets: FinanceBudget[];
  commitments: FinanceCommitment[];
  invoices: FinanceInvoice[];
  payments: FinancePayment[];
  projects: FinanceProject[];
  lineage: FinanceLineageRecord[];
  quality: DataQualityScore[];
  metrics: FinanceMetric[];
  commandState: any | null;
  auditTrail: any[];
  executeAction: (actionType: string, payload?: any) => Promise<any>;
  refresh: () => Promise<void>;
}

export function useFinanceData(): FinanceDataState {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<DataState>('LOADING');
  const [sources, setSources] = useState<FinanceSource[]>([]);
  const [batches, setBatches] = useState<FinanceBatch[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [costCentres, setCostCentres] = useState<FinanceCostCentre[]>([]);
  const [budgets, setBudgets] = useState<FinanceBudget[]>([]);
  const [commitments, setCommitments] = useState<FinanceCommitment[]>([]);
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [projects, setProjects] = useState<FinanceProject[]>([]);
  const [lineage, setLineage] = useState<FinanceLineageRecord[]>([]);
  const [quality, setQuality] = useState<DataQualityScore[]>([]);
  const [metrics, setMetrics] = useState<FinanceMetric[]>([]);
  const [commandState, setCommandState] = useState<any | null>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [
        sRes, bRes, aRes, ccRes, bgRes, cmRes, invRes, pmRes, prRes, linRes, qRes, metRes, cmdRes, audRes
      ] = await Promise.allSettled([
        financeApi.getSources(),
        financeApi.getBatches(),
        financeApi.getAccounts(),
        financeApi.getCostCentres(),
        financeApi.getBudgets(),
        financeApi.getCommitments(),
        financeApi.getInvoices(),
        financeApi.getPayments(),
        financeApi.getProjects(),
        financeApi.getLineage(),
        financeApi.getQuality(),
        financeApi.getMetrics(),
        financeApi.getCommandState(),
        financeApi.getAuditTrail(),
      ]);

      const states = new Set<DataState>();
      const setters = [setSources, setBatches, setAccounts, setCostCentres, setBudgets, setCommitments, setInvoices, setPayments, setProjects, setLineage, setQuality, setMetrics];

      [sRes, bRes, aRes, ccRes, bgRes, cmRes, invRes, pmRes, prRes, linRes, qRes, metRes].forEach((r, i) => {
        const setter = setters[i];
        if (r.status === 'fulfilled') {
          states.add((r.value as any).dataState);
          setter((r.value as any).items);
        } else {
          states.add('ERROR');
          setter([]);
        }
      });

      if (cmdRes.status === 'fulfilled' && cmdRes.value) {
        setCommandState(cmdRes.value);
        states.add('REAL');
      }

      if (audRes.status === 'fulfilled' && audRes.value) {
        setAuditTrail(audRes.value);
      }

      // If any endpoint is REAL, prefer showing real state for those.
      const resolved: DataState = states.has('REAL')
        ? 'REAL'
        : states.has('ERROR') && !states.has('DEVELOPMENT_FIXTURE')
          ? 'ERROR'
          : states.has('DEVELOPMENT_FIXTURE')
            ? 'DEVELOPMENT_FIXTURE'
            : states.has('PARTIAL')
              ? 'PARTIAL'
              : 'UNAVAILABLE';

      setState(resolved);
    } catch {
      setState('ERROR');
    } finally {
      setLoading(false);
    }
  }, []);

  const executeAction = useCallback(async (actionType: string, payload?: any) => {
    const res = await financeApi.executeAction(actionType, payload);
    if (res?.commandState) {
      setCommandState(res.commandState);
    }
    if (res?.enactment) {
      setAuditTrail(prev => [res.enactment, ...prev]);
    }
    // Refresh to synchronize all repositories and metrics
    await load();
    return res;
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<FinanceDataState>(
    () => ({
      loading,
      state,
      sources,
      batches,
      accounts,
      costCentres,
      budgets,
      commitments,
      invoices,
      payments,
      projects,
      lineage,
      quality,
      metrics,
      commandState,
      auditTrail,
      executeAction,
      refresh: load,
    }),
    [loading, state, sources, batches, accounts, costCentres, budgets, commitments, invoices, payments, projects, lineage, quality, metrics, commandState, auditTrail, executeAction, load],
  );

  return value;
}
