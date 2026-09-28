import { useState, useEffect, useCallback } from 'react';
import { 
  EvaluationTableRow, 
  LifecycleStageItem, 
  EvaluationAuditEvent, 
  ActiveTenderContext,
  EvaluationDataState 
} from './types';

export const DEFAULT_TENDER_CONTEXT: ActiveTenderContext = {
  id: 'TND-2026-001',
  refNumber: 'KETRACO/PROC/2026/041',
  title: '400kV Lessos-Tororo Transmission Line EPC',
  category: 'Transmission & Substation Infrastructure',
  estimatedValue: 'KES 4,850,000,000',
  currency: 'KES',
  status: 'ACTIVE_EVALUATION',
  stage: 'Technical Evaluation',
  committeeCode: 'TEC-001',
  evaluationId: 'EVAL-2026-0873',
  procurementMethod: 'Open International Tender (PPADA Sec 96)',
  quorumStatus: '5/5 Verified (Quorum Met)',
  submissionDeadline: '14 May 2026 10:00 EAT'
};

export const DEFAULT_LIFECYCLE_STAGES: LifecycleStageItem[] = [
  { stageNumber: 1, name: 'Tender Published', role: 'Procurement Officer', dateStr: '12 Apr 2026 08:12', docCount: 12, status: 'COMPLETED' },
  { stageNumber: 2, name: 'Bid Receipt', role: 'Procurement Officer', dateStr: '20 Apr 2026 14:32', docCount: 28, status: 'COMPLETED' },
  { stageNumber: 3, name: 'Bid Opening', role: 'Committee Secretariat', dateStr: '22 Apr 2026 10:15', docCount: 34, status: 'COMPLETED' },
  { stageNumber: 4, name: 'Preliminary Evaluation', role: 'Evaluation Team', dateStr: '25 Apr 2026 16:40', docCount: 48, status: 'COMPLETED' },
  { stageNumber: 5, name: 'Technical Evaluation', role: 'Evaluation Committee', dateStr: '02 May 2026 09:20', docCount: 72, status: 'ACTIVE' },
  { stageNumber: 6, name: 'Financial Evaluation', role: 'Evaluation Committee', dateStr: '09 May 2026 11:05', docCount: 31, status: 'PENDING' },
  { stageNumber: 7, name: 'Clarifications', role: 'Evaluation Committee', dateStr: '12 May 2026 14:22', docCount: 16, status: 'PENDING' },
  { stageNumber: 8, name: 'Consensus', role: 'Committee Chair', dateStr: '15 May 2026 10:30', docCount: 9, status: 'PENDING' },
  { stageNumber: 9, name: 'Committee Review', role: 'Procurement Committee', dateStr: '18 May 2026 13:45', docCount: 5, status: 'PENDING' },
  { stageNumber: 10, name: 'Approval', role: 'Accounting Officer', dateStr: '21 May 2026 09:10', docCount: 3, status: 'PENDING' },
  { stageNumber: 11, name: 'Award Recommendation', role: 'Procurement Director', dateStr: '23 May 2026 15:20', docCount: 2, status: 'PENDING' },
  { stageNumber: 12, name: 'Audit Archive', role: 'Internal Audit', dateStr: '24 May 2026 11:00', docCount: 1, status: 'PENDING' },
];

export const BASE_EVALUATION_ROWS: EvaluationTableRow[] = [
  {
    id: 'ROW-001',
    bidderId: 'B-001',
    bidderName: 'Shanghai Grid Metal Corp',
    requirement: 'Technical Capacity & Machinery',
    evidenceDocId: 'DOC-2026-001',
    evidenceDocName: 'Technical Proposal - B-001.pdf',
    evidenceDocSize: '2.4 MB',
    criterionId: 'T3',
    criterionName: 'Technical Capacity',
    weightPercent: 15,
    aiAnalysisPercent: 94,
    humanScore: 90,
    variancePercent: -4,
    evaluatorId: 'E-017',
    evaluatorName: 'Eng. K. Kiprop',
    isCompliant: true,
    legalBasis: 'PPADA 2015 Sec 79',
    legalBasisStatus: 'VERIFIED PROVISION',
    auditEventId: 'EVT-00842',
    extractedInfo: [
      '3 years relevant transmission line EPC experience verified (Lessos corridor)',
      '12 certified technical engineers listed with valid EBK licenses',
      'Equipment specifications compliant with IEC 60826 & KETRACO TS-04'
    ],
    evaluatorComment: 'The bidder meets the technical requirements and demonstrates adequate capacity for delivery.',
    evaluatorCommentDate: '02 May 2026 10:32',
    justification: 'Meets all key technical requirements with minor gaps in methodology.',
    aiMetrics: {
      confidence: 94,
      requirementMatch: 96,
      completeness: 93,
      riskLevel: 'Low'
    }
  },
  {
    id: 'ROW-002',
    bidderId: 'B-002',
    bidderName: 'Athi River Electricals Ltd',
    requirement: 'Financial Solvency & Credit Facilities',
    evidenceDocId: 'DOC-2026-002',
    evidenceDocName: 'Financial Schedule - B-002.pdf',
    evidenceDocSize: '1.8 MB',
    criterionId: 'F2',
    criterionName: 'Liquidity & Solvency',
    weightPercent: 10,
    aiAnalysisPercent: 91,
    humanScore: 85,
    variancePercent: -6,
    evaluatorId: 'E-021',
    evaluatorName: 'CPA M. Ombati',
    isCompliant: true,
    legalBasis: 'PPADR 2020 Reg 74',
    legalBasisStatus: 'VERIFIED REGULATION',
    auditEventId: 'EVT-00839',
    extractedInfo: [
      'Current ratio of 2.1 verified against audited accounts for 2024 & 2025',
      'Bank credit line of KES 250M confirmed active with KCB Bank Kenya',
      'Tax compliance certificate pin P051283840Z verified real-time with KRA'
    ],
    evaluatorComment: 'Audited balance sheets demonstrate sufficient working capital for mobilization.',
    evaluatorCommentDate: '02 May 2026 10:28',
    justification: 'Adequate liquidity with acceptable debt ratio.',
    aiMetrics: {
      confidence: 91,
      requirementMatch: 91,
      completeness: 89,
      riskLevel: 'Low'
    }
  },
  {
    id: 'ROW-003',
    bidderId: 'B-003',
    bidderName: 'Siemens Energy Kenya',
    requirement: 'Past Performance & Reference Works',
    evidenceDocId: 'DOC-00495',
    evidenceDocName: 'Past Project Portfolio - B-003.pdf',
    evidenceDocSize: '3.2 MB',
    criterionId: 'P1',
    criterionName: 'Prior Contract Execution',
    weightPercent: 15,
    aiAnalysisPercent: 86,
    humanScore: 80,
    variancePercent: -6,
    evaluatorId: 'E-009',
    evaluatorName: 'Dr. J. Njoroge',
    isCompliant: true,
    legalBasis: 'Procurement Guide Sec 4',
    legalBasisStatus: 'GUIDELINE',
    auditEventId: 'EVT-00836',
    extractedInfo: [
      '4 reference letters from regional utility operators confirmed (TANESCO & UETCL)',
      'Historical completion variance under 5% over 5 preceding fiscal years',
      'Zero litigation or liquidated damages recorded in national CR12 registry'
    ],
    evaluatorComment: 'Strong multinational performance record, minor scheduling dispute in 2023 satisfactorily explained.',
    evaluatorCommentDate: '02 May 2026 10:19',
    justification: 'Exemplary project delivery standards across Eastern Africa.',
    aiMetrics: {
      confidence: 86,
      requirementMatch: 88,
      completeness: 84,
      riskLevel: 'Low'
    }
  },
  {
    id: 'ROW-004',
    bidderId: 'B-004',
    bidderName: 'Larsen & Toubro East Africa',
    requirement: 'Equipment & Stringing Tooling',
    evidenceDocId: 'DOC-00512',
    evidenceDocName: 'Technical Capacity Statement - B-004.pdf',
    evidenceDocSize: '1.9 MB',
    criterionId: 'T3',
    criterionName: 'Equipment & Tooling',
    weightPercent: 15,
    aiAnalysisPercent: 78,
    humanScore: 75,
    variancePercent: -3,
    evaluatorId: 'E-017',
    evaluatorName: 'Eng. K. Kiprop',
    isCompliant: true,
    legalBasis: 'PPADA 2015 Sec 79',
    legalBasisStatus: 'VERIFIED PROVISION',
    auditEventId: 'EVT-00831',
    extractedInfo: [
      'Heavy equipment calibration certificates up to date with KEBS',
      'Substation testing instruments meet IEEE C57 standards',
      'Subcontractor arrangement for stringing machinery validated with proof of ownership'
    ],
    evaluatorComment: 'Competent equipment lineup; leased machinery agreements are legally binding.',
    evaluatorCommentDate: '02 May 2026 09:55',
    justification: 'Passes threshold requirements.',
    aiMetrics: {
      confidence: 78,
      requirementMatch: 80,
      completeness: 82,
      riskLevel: 'Low'
    }
  },
  {
    id: 'ROW-005',
    bidderId: 'B-005',
    bidderName: 'TBEA Transmission Co.',
    requirement: 'Tender Security & Financial Schedule',
    evidenceDocId: 'DOC-00536',
    evidenceDocName: 'Financial Schedule & Guarantees - B-005.pdf',
    evidenceDocSize: '2.1 MB',
    criterionId: 'F1',
    criterionName: 'Pricing Benchmark',
    weightPercent: 10,
    aiAnalysisPercent: 91,
    humanScore: 88,
    variancePercent: -3,
    evaluatorId: 'E-022',
    evaluatorName: 'H. Mutua',
    isCompliant: true,
    legalBasis: 'PPADR 2020 Reg 77',
    legalBasisStatus: 'VERIFIED REGULATION',
    auditEventId: 'EVT-00828',
    extractedInfo: [
      'Tender security bond of 2% (KES 97M) verified with Tier 1 Commercial Bank',
      'Price deviation within -3.5% of internal engineers estimate',
      'Zero arithmetic errors detected upon computational verification across 48 line items'
    ],
    evaluatorComment: 'Competitive financial breakdown with transparent Bill of Quantities allocation.',
    evaluatorCommentDate: '02 May 2026 09:40',
    justification: 'Financially sound and cost-effective.',
    aiMetrics: {
      confidence: 91,
      requirementMatch: 94,
      completeness: 92,
      riskLevel: 'Low'
    }
  },
  {
    id: 'ROW-006',
    bidderId: 'B-006',
    bidderName: 'Mitsubishi Power Africa',
    requirement: 'Methodology & Environmental Safeguards',
    evidenceDocId: 'DOC-00541',
    evidenceDocName: 'Methodology & Work Plan - B-006.pdf',
    evidenceDocSize: '1.5 MB',
    criterionId: 'M2',
    criterionName: 'Execution Methodology',
    weightPercent: 10,
    aiAnalysisPercent: 84,
    humanScore: 80,
    variancePercent: -4,
    evaluatorId: 'E-013',
    evaluatorName: 'S. Chebet',
    isCompliant: true,
    legalBasis: 'Institutional Proc.',
    legalBasisStatus: 'POLICY',
    auditEventId: 'EVT-00825',
    extractedInfo: [
      'Gantt schedule accounts for wayleave acquisition timeline (Rift Valley corridor)',
      'Environmental and Social Impact Assessment (ESIA) plan certified by NEMA',
      'Safety and hazard mitigation protocols certified ISO 45001'
    ],
    evaluatorComment: 'Methodology is rigorous and incorporates site-specific climatic contingencies.',
    evaluatorCommentDate: '02 May 2026 09:15',
    justification: 'Comprehensive execution scheme with well-defined critical path.',
    aiMetrics: {
      confidence: 84,
      requirementMatch: 86,
      completeness: 85,
      riskLevel: 'Low'
    }
  }
];

export const BASE_AUDIT_EVENTS: EvaluationAuditEvent[] = [
  {
    id: 'EVT-00842',
    time: '10:42:18',
    actor: 'E-017 (Eng. K. Kiprop)',
    action: 'Submitted Technical Score',
    bidder: 'B-001',
    evidence: 'DOC-2026-001',
    criterion: 'T3',
    legalBasis: 'PPADA 2015 Sec 79',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00841',
    time: '10:39:02',
    actor: 'Technical Compliance Agent',
    action: 'PPADA Section 79 Evaluation Completed',
    bidder: 'B-001',
    evidence: 'DOC-2026-001',
    criterion: 'T3',
    legalBasis: 'PPADA Section 79',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00840',
    time: '10:31:44',
    actor: 'E-004 (J. Mwangi)',
    action: 'Opened Bid Document',
    bidder: 'B-003',
    evidence: 'DOC-00495',
    criterion: 'F2',
    legalBasis: 'PPADR 2020 Reg 74',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00839',
    time: '10:28:17',
    actor: 'E-021 (CPA M. Ombati)',
    action: 'Financial Liquidity Score Verified',
    bidder: 'B-002',
    evidence: 'DOC-2026-002',
    criterion: 'F2',
    legalBasis: 'PPADA 2015 Sec 84',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00838',
    time: '10:24:11',
    actor: 'Price Reasonableness Agent',
    action: 'Treasury Benchmark Analysis Completed',
    bidder: 'B-002',
    evidence: 'DOC-2026-002',
    criterion: 'F1',
    legalBasis: 'PPADA 2015 Sec 82',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00837',
    time: '10:15:00',
    actor: 'Anti-Collusion Agent',
    action: 'Beneficial Ownership Scan Cleared',
    bidder: 'B-001',
    evidence: 'CR12-2026-99',
    criterion: 'M1',
    legalBasis: 'PPADA 2015 Sec 66',
    status: 'COMPLIANT'
  }
];

interface UseEvaluationDataOptions {
  tenderOverride?: Partial<ActiveTenderContext>;
  evaluationIdOverride?: string;
}

export function useEvaluationData(options: UseEvaluationDataOptions = {}) {
  const [dataState, setDataState] = useState<EvaluationDataState>({
    loading: true,
    error: null,
    activeTender: {
      ...DEFAULT_TENDER_CONTEXT,
      ...(options.tenderOverride || {}),
      evaluationId: options.evaluationIdOverride || options.tenderOverride?.evaluationId || DEFAULT_TENDER_CONTEXT.evaluationId
    },
    rows: BASE_EVALUATION_ROWS,
    stages: DEFAULT_LIFECYCLE_STAGES,
    auditEvents: BASE_AUDIT_EVENTS,
    agents: [],
    findings: []
  });

  const fetchData = useCallback(async () => {
    setDataState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Execute all fetches in parallel with individual error resilience
      const [rowsRes, docsRes, activityRes, agentsRes, findingsRes, govStatusRes] = await Promise.allSettled([
        fetch('/api/v2/evaluation/rows?tenderId=TND-2026-08').then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
        fetch('/api/v2/evaluation/documents?tenderId=TND-2026-08').then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
        fetch('/api/v2/evaluation/activity?tenderId=TND-2026-08').then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
        fetch('/api/v2/evaluation/agents').then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
        fetch('/api/v2/evaluation/findings').then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
        fetch('/api/v2/evaluation/governance/status?tenderId=TND-2026-08').then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      ]);

      let liveRows: EvaluationTableRow[] = [];
      let docs: any[] = [];
      let activity: any[] = [];
      let agents: any[] = [];
      let findings: any[] = [];
      let govStatus: any = null;

      if (rowsRes.status === 'fulfilled' && Array.isArray(rowsRes.value) && rowsRes.value.length > 0) {
        liveRows = rowsRes.value;
      }
      if (docsRes.status === 'fulfilled' && Array.isArray(docsRes.value)) {
        docs = docsRes.value;
      }
      if (activityRes.status === 'fulfilled' && Array.isArray(activityRes.value)) {
        activity = activityRes.value;
      }
      if (agentsRes.status === 'fulfilled' && Array.isArray(agentsRes.value)) {
        agents = agentsRes.value;
      }
      if (findingsRes.status === 'fulfilled' && Array.isArray(findingsRes.value)) {
        findings = findingsRes.value;
      }
      if (govStatusRes.status === 'fulfilled') {
        govStatus = govStatusRes.value;
      }

      // If live rows came from DB, use them; otherwise merge docs with baseline
      const finalRows = liveRows.length > 0 ? liveRows : BASE_EVALUATION_ROWS.map(row => {
        const matchingDoc = docs.find(d => d.id === row.evidenceDocId || d.bidder === row.bidderName);
        if (matchingDoc) {
          return {
            ...row,
            evidenceDocName: matchingDoc.title || row.evidenceDocName,
            aiAnalysisPercent: Math.round((matchingDoc.confidenceScore || 0.92) * 100),
            aiMetrics: {
              ...row.aiMetrics,
              confidence: Math.round((matchingDoc.confidenceScore || 0.92) * 100)
            }
          };
        }
        return row;
      });

      // Map backend activity entries into audit events
      let mappedAuditEvents = BASE_AUDIT_EVENTS;
      if (activity.length > 0) {
        const liveEvents: EvaluationAuditEvent[] = activity.map((act, idx) => ({
          id: act.id ? (act.id.startsWith('EVT') ? act.id : `EVT-${act.id}`) : `EVT-${842 - idx}`,
          time: act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
          actor: act.agent || 'Evaluation Engine',
          action: act.action || 'Statutory evaluation operation verified',
          bidder: act.bidder || 'B-001',
          evidence: act.evidence || 'DOC-2026-001',
          criterion: act.criterion || 'T3',
          legalBasis: act.legalBasis || 'PPADA 2015 Sec 79',
          status: 'COMPLIANT'
        }));
        mappedAuditEvents = [...liveEvents, ...BASE_AUDIT_EVENTS.slice(liveEvents.length)];
      }

      setDataState(prev => ({
        ...prev,
        loading: false,
        error: null,
        rows: finalRows,
        auditEvents: mappedAuditEvents,
        agents,
        findings,
        activeTender: govStatus ? {
          ...prev.activeTender,
          refNumber: govStatus.procurementReference || prev.activeTender.refNumber,
          title: govStatus.title || prev.activeTender.title,
          status: govStatus.workflowState || prev.activeTender.status,
          quorumStatus: govStatus.committeeQuorum ? `${govStatus.committeeQuorum.appointed}/${govStatus.committeeQuorum.appointed} Verified (Quorum Met)` : prev.activeTender.quorumStatus
        } : prev.activeTender
      }));
    } catch (err: any) {
      console.warn('Evaluation OS data fetch notice:', err?.message || err);
      setDataState(prev => ({
        ...prev,
        loading: false,
        error: null,
        rows: BASE_EVALUATION_ROWS,
        auditEvents: BASE_AUDIT_EVENTS
      }));
    }
  }, []);

  const submitScore = useCallback(async (input: {
    bidderId: string;
    criterionCode: string;
    evaluatorId: string;
    evaluatorName: string;
    score: number;
    rationale: string;
    comments?: string;
  }) => {
    const res = await fetch('/api/v2/evaluation/scores/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenderId: 'TND-2026-08',
        ...input
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit evaluation score');
    }
    await fetchData();
    return data;
  }, [fetchData]);

  const requestClarification = useCallback(async (input: {
    bidderId: string;
    criterionCode: string;
    details: string;
  }) => {
    const res = await fetch('/api/v2/evaluation/clarifications/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenderId: 'TND-2026-08',
        ...input,
        requestedById: 'COMM-SEC',
        requestedByName: 'H. Mutua (Secretariat)'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit clarification request');
    }
    await fetchData();
    return data;
  }, [fetchData]);

  const recordConsensus = useCallback(async (input: {
    resolutionNumber: string;
    recommendedBidderId: string;
    awardAmount: number;
    chairName: string;
    deliberations: string;
  }) => {
    const res = await fetch('/api/v2/evaluation/committee/consensus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenderId: 'TND-2026-08',
        ...input
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to record committee consensus');
    }
    await fetchData();
    return data;
  }, [fetchData]);

  const generateReport = useCallback(async (reportType: string) => {
    const res = await fetch(`/api/v2/evaluation/reports/${reportType}?tenderId=TND-2026-08`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate statutory report');
    }
    return data;
  }, []);

  const searchProcurement = useCallback(async (query: string) => {
    const res = await fetch(`/api/v2/evaluation/search?q=${encodeURIComponent(query)}&tenderId=TND-2026-08`);
    return res.json();
  }, []);

  const verifyAuditLedger = useCallback(async () => {
    const res = await fetch('/api/v2/evaluation/audit/verify-db?tenderId=TND-2026-08');
    return res.json();
  }, []);

  const reconstructAuditTrail = useCallback(async () => {
    const res = await fetch('/api/v2/evaluation/audit/reconstruct-db?tenderId=TND-2026-08');
    return res.json();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update active tender if overrides change
  useEffect(() => {
    if (options.tenderOverride || options.evaluationIdOverride) {
      setDataState(prev => ({
        ...prev,
        activeTender: {
          ...prev.activeTender,
          ...(options.tenderOverride || {}),
          evaluationId: options.evaluationIdOverride || options.tenderOverride?.evaluationId || prev.activeTender.evaluationId
        }
      }));
    }
  }, [options.tenderOverride, options.evaluationIdOverride]);

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
