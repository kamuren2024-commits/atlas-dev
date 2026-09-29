import { useState, useEffect, useCallback } from 'react';
import {
  EvaluationTableRow,
  LifecycleStageItem,
  EvaluationAuditEvent,
  ActiveTenderContext,
  EvaluationDataState
} from './types';

interface UseEvaluationDataOptions {
  tenderOverride?: Partial<ActiveTenderContext>;
  evaluationIdOverride?: string;
}

interface AuditActivityRecord {
  id?: string;
  timestamp?: string;
  agent?: string;
  actor?: string;
  action?: string;
  bidder?: string;
  evidence?: string;
  criterion?: string;
  legalBasis?: string;
  status?: string;
}

function toTenderContext(
  tender: Partial<ActiveTenderContext> | undefined,
  evaluationId: string
): ActiveTenderContext {
  return {
    id: tender?.id || '',
    refNumber: tender?.refNumber || tender?.id || 'No tender selected',
    title: tender?.title || 'Tender information unavailable',
    category: tender?.category || '',
    estimatedValue: tender?.estimatedValue || '',
    currency: tender?.currency || '',
    status: tender?.status || 'Unknown',
    stage: tender?.stage || 'Evaluation plan unavailable',
    committeeCode: tender?.committeeCode || '',
    evaluationId,
    procurementMethod: tender?.procurementMethod || '',
    quorumStatus: tender?.quorumStatus || 'Not available',
    submissionDeadline: tender?.submissionDeadline
  };
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

function asArray<T>(value: unknown, endpoint: string): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`${endpoint} returned an invalid response`);
  }
  return value as T[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown request failure';
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export function useEvaluationData(options: UseEvaluationDataOptions = {}) {
  const tender = options.tenderOverride;
  const tenderId = tender?.id || '';
  const evaluationId = options.evaluationIdOverride || tender?.evaluationId || '';
  const refNumber = tender?.refNumber || '';
  const title = tender?.title || '';
  const category = tender?.category || '';
  const estimatedValue = tender?.estimatedValue || '';
  const currency = tender?.currency || '';
  const tenderStatus = tender?.status || '';
  const stage = tender?.stage || '';
  const committeeCode = tender?.committeeCode || '';
  const procurementMethod = tender?.procurementMethod || '';
  const quorumStatus = tender?.quorumStatus || '';
  const submissionDeadline = tender?.submissionDeadline || '';

  const [dataState, setDataState] = useState<EvaluationDataState>(() => ({
    loading: true,
    error: null,
    activeTender: toTenderContext(tender, evaluationId),
    rows: [],
    stages: [],
    auditEvents: [],
    agents: [],
    findings: []
  }));

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!tenderId) {
      setDataState(prev => ({
        ...prev,
        loading: false,
        error: 'Select an authoritative tender to load evaluation records.',
        activeTender: toTenderContext(tender, evaluationId),
        rows: [],
        stages: [],
        auditEvents: [],
        agents: [],
        findings: []
      }));
      return;
    }

    setDataState(prev => ({
      ...prev,
      loading: true,
      error: null,
      activeTender: toTenderContext(tender, evaluationId)
    }));

    const query = `?tenderId=${encodeURIComponent(tenderId)}`;
    const results = await Promise.allSettled([
      fetchJson(`/api/v2/evaluation/rows${query}`, signal),
      fetchJson(`/api/v2/evaluation/activity${query}`, signal)
    ]);

    const errors: string[] = [];
    let rows: EvaluationTableRow[] = [];
    let auditEvents: EvaluationAuditEvent[] = [];

    if (results[0].status === 'fulfilled') {
      try {
        rows = asArray<EvaluationTableRow>(results[0].value, 'Evaluation rows');
      } catch (error) {
        errors.push(`Evaluation rows: ${getErrorMessage(error)}`);
      }
    } else {
      errors.push(`Evaluation rows unavailable: ${getErrorMessage(results[0].reason)}`);
    }

    if (results[1].status === 'fulfilled') {
      try {
        const activity = asArray<AuditActivityRecord>(results[1].value, 'Audit activity');
        auditEvents = activity.map((event, index) => ({
          id: event.id || `unidentified-event-${index}`,
          time: event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : '',
          actor: event.agent || event.actor || '',
          action: event.action || '',
          bidder: event.bidder || '',
          evidence: event.evidence || '',
          criterion: event.criterion || '',
          legalBasis: event.legalBasis || '',
          status: event.status === 'FLAGGED'
            ? 'FLAGGED'
            : event.status === 'RESOLVED'
              ? 'RESOLVED'
              : event.status === 'COMPLIANT' || event.status === 'VERIFIED'
                ? 'COMPLIANT'
                : 'UNVERIFIED'
        }));
      } catch (error) {
        errors.push(`Audit activity: ${getErrorMessage(error)}`);
      }
    } else {
      errors.push(`Audit activity unavailable: ${getErrorMessage(results[1].reason)}`);
    }

    setDataState(prev => ({
      ...prev,
      loading: false,
      error: errors.length ? errors.join('; ') : null,
      activeTender: toTenderContext(tender, evaluationId),
      rows,
      stages: [],
      auditEvents,
      agents: [],
      findings: []
    }));
  }, [
    tenderId,
    evaluationId,
    refNumber,
    title,
    category,
    estimatedValue,
    currency,
    tenderStatus,
    stage,
    committeeCode,
    procurementMethod,
    quorumStatus,
    submissionDeadline
  ]);

  const requireTenderId = useCallback(() => {
    if (!tenderId) {
      throw new Error('An authoritative tender must be selected before this action can run.');
    }
    return tenderId;
  }, [tenderId]);

  const submitScore = useCallback(async (input: {
    bidderId: string;
    criterionCode: string;
    evaluatorId: string;
    evaluatorName: string;
    score: number;
    rationale: string;
    comments?: string;
  }) => {
    const result = await postJson('/api/v2/evaluation/scores/submit', {
      tenderId: requireTenderId(),
      ...input
    });
    await fetchData();
    return result;
  }, [fetchData, requireTenderId]);

  const requestClarification = useCallback(async (input: {
    bidderId: string;
    criterionCode: string;
    details: string;
  }) => {
    const result = await postJson('/api/v2/evaluation/clarifications/request', {
      tenderId: requireTenderId(),
      ...input
    });
    await fetchData();
    return result;
  }, [fetchData, requireTenderId]);

  const recordConsensus = useCallback(async (input: {
    resolutionNumber: string;
    recommendedBidderId: string;
    awardAmount: number;
    chairName: string;
    deliberations: string;
  }) => {
    const result = await postJson('/api/v2/evaluation/committee/consensus', {
      tenderId: requireTenderId(),
      ...input
    });
    await fetchData();
    return result;
  }, [fetchData, requireTenderId]);

  const generateReport = useCallback(async (reportType: string) => {
    const currentTenderId = requireTenderId();
    const query = new URLSearchParams({ tenderId: currentTenderId });
    return fetchJson(`/api/v2/evaluation/reports/${encodeURIComponent(reportType)}?${query}`);
  }, [requireTenderId]);

  const searchProcurement = useCallback(async (query: string) => {
    const params = new URLSearchParams({ q: query, tenderId: requireTenderId() });
    return fetchJson(`/api/v2/evaluation/search?${params}`);
  }, [requireTenderId]);

  const verifyAuditLedger = useCallback(async () => {
    const query = new URLSearchParams({ tenderId: requireTenderId() });
    return fetchJson(`/api/v2/evaluation/audit/verify-db?${query}`);
  }, [requireTenderId]);

  const reconstructAuditTrail = useCallback(async () => {
    const query = new URLSearchParams({ tenderId: requireTenderId() });
    return fetchJson(`/api/v2/evaluation/audit/reconstruct-db?${query}`);
  }, [requireTenderId]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  useEffect(() => {
    setDataState(prev => ({
      ...prev,
      activeTender: toTenderContext(tender, evaluationId)
    }));
  }, [
    tenderId,
    evaluationId,
    refNumber,
    title,
    category,
    estimatedValue,
    currency,
    tenderStatus,
    stage,
    committeeCode,
    procurementMethod,
    quorumStatus,
    submissionDeadline
  ]);

  return {
    ...dataState,
    refresh: fetchData,
    submitScore,
    requestClarification,
    recordConsensus,
    generateReport,
    searchProcurement,
    verifyAuditLedger,
    reconstructAuditTrail
  };
}
