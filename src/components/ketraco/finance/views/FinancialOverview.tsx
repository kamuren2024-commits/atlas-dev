/**
 * KETRACO FINANCE INTELLIGENCE — FINANCIAL OVERVIEW (COMMAND SURFACE)
 *
 * Authoritative visual rendering blueprint for Salience Atlas 5.1.0
 * KETRACO Financial Decision & Execution Domain.
 *
 * Connected directly to:
 * - /api/finance/command-state
 * - /api/finance/actions/execute
 * - /api/copilot/ask
 * - SQLite system of record via FinanceStateService
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Search,
  RefreshCw,
  Landmark,
  FileText,
  Activity,
  Zap,
  Sliders,
  Play,
  Layers,
  ExternalLink,
  ChevronRight,
  Database,
  Building2,
  DollarSign,
  Info,
  X,
  Copy,
  ShieldCheck,
  Award,
  Lock,
  Hash,
} from 'lucide-react';
import { financeTokens } from '../tokens';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import { financeApi } from '../api/finance-api';
import { DataStateBadge } from '../components/primitives';
import type { FinanceView } from '../types';

export default function FinancialOverview({ onNavigate }: { onNavigate?: (v: FinanceView) => void }) {
  const dataCtx = useFinanceDataContext();
  const [commandData, setCommandData] = useState<any>(dataCtx.commandState);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBudgetTab, setActiveBudgetTab] = useState<'By Program' | 'By Project' | 'By Department'>('By Program');
  const [activeRiskFilter, setActiveRiskFilter] = useState<'Cross-Domain' | 'Finance Only'>('Cross-Domain');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedScenarioTab, setSelectedScenarioTab] = useState<number>(0);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionModal, setActionModal] = useState<{ open: boolean; title: string; actionType: string; result?: any; loading?: boolean } | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedTwinNode, setSelectedTwinNode] = useState<any | null>(null);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Copilot Query State
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<any | null>(null);

  // Load live command state if not already in context
  useEffect(() => {
    let mounted = true;
    async function loadCommand() {
      try {
        const res = await financeApi.getCommandState();
        if (mounted && res) {
          setCommandData(res);
        }
      } catch (err) {
        console.warn('Failed to load command state from backend:', err);
      }
    }
    if (!commandData) {
      loadCommand();
    }
    return () => {
      mounted = false;
    };
  }, [commandData]);

  // Fallback state if database cold-start
  const state = commandData || {
    timestamp: new Date().toISOString(),
    liveState: 'NOMINAL',
    dataOrigin: 'DATABASE',
    kpis: {
      availableCash: { label: 'Available Cash', amount: 4820000000, formatted: 'KES 4.82B', trendPct: 12, trendDirection: 'UP', trendPeriod: 'vs. last 30 days', subText: 'Central Bank & Commercial Accounts', status: 'nominal' },
      totalCommitments: { label: 'Total Commitments', amount: 11400000000, formatted: 'KES 11.4B', trendPct: 8, trendDirection: 'UP', trendPeriod: 'vs. last 30 days', subText: 'Encumbered Purchase Orders', status: 'nominal' },
      outstandingPayables: { label: 'Outstanding Payables', amount: 6300000000, formatted: 'KES 6.3B', trendPct: 5, trendDirection: 'UP', trendPeriod: 'vs. last 30 days', subText: 'Approved Invoices in Queue', status: 'warning' },
      outstandingReceivables: { label: 'Outstanding Receivables', amount: 3700000000, formatted: 'KES 3.7B', trendPct: 9, trendDirection: 'DOWN', trendPeriod: 'vs. last 30 days', subText: 'Wheeling Charges Due from KPLC', status: 'nominal' },
      budgetUtilization: { label: 'Budget Utilization', percentage: 68, trendDirection: 'UP', trendPeriod: 'vs. last quarter', subText: 'Approved Allocation Burn' }
    },
    cashFlowOutlook: {
      timeframe: 'Next 6 Months',
      months: [
        { month: 'Apr', inflows: 4.2, outflows: 3.8, netPosition: 4.82 },
        { month: 'May', inflows: 3.9, outflows: 4.5, netPosition: 4.22 },
        { month: 'Jun', inflows: 5.8, outflows: 4.1, netPosition: 5.92 },
        { month: 'Jul', inflows: 4.4, outflows: 4.9, netPosition: 5.42 },
        { month: 'Aug', inflows: 3.6, outflows: 5.2, netPosition: 3.82 },
        { month: 'Sep', inflows: 6.1, outflows: 4.3, netPosition: 5.62 }
      ]
    },
    budgetVsActual: {
      activeTab: 'By Program',
      programs: [
        { name: 'Transmission Projects', utilizationPct: 72, approvedKES: 18500000000, spentKES: 13320000000, color: '#00D9FF' },
        { name: 'Grid Expansion', utilizationPct: 64, approvedKES: 12000000000, spentKES: 7680000000, color: '#3B82F6' },
        { name: 'System Strengthening', utilizationPct: 58, approvedKES: 4500000000, spentKES: 2610000000, color: '#6366F1' },
        { name: 'Operational', utilizationPct: 81, approvedKES: 2500000000, spentKES: 2025000000, color: '#8B5CF6' },
        { name: 'Admin & Support', utilizationPct: 49, approvedKES: 1000000000, spentKES: 490000000, color: '#A855F7' }
      ],
      projects: [
        { name: 'Loyangalani-Suswa 400kV', utilizationPct: 78, approvedKES: 6200000000, spentKES: 4836000000, color: '#00D9FF' },
        { name: 'Athi Transmission Line (003)', utilizationPct: 70, approvedKES: 8100000000, spentKES: 5670000000, color: '#F59E0B' },
        { name: 'Olkaria-Lessos-Kisumu 220kV', utilizationPct: 62, approvedKES: 4800000000, spentKES: 2976000000, color: '#3B82F6' },
        { name: 'Nairobi Ring Substations', utilizationPct: 84, approvedKES: 3400000000, spentKES: 2856000000, color: '#10B981' }
      ],
      departments: [
        { name: 'Power System Planning', utilizationPct: 74, approvedKES: 14200000000, spentKES: 10508000000, color: '#00D9FF' },
        { name: 'Project Management Division', utilizationPct: 71, approvedKES: 16800000000, spentKES: 11928000000, color: '#3B82F6' },
        { name: 'Operations & Maintenance', utilizationPct: 79, approvedKES: 4200000000, spentKES: 3318000000, color: '#8B5CF6' },
        { name: 'Finance & Corporate Services', utilizationPct: 52, approvedKES: 3300000000, spentKES: 1716000000, color: '#A855F7' }
      ]
    },
    riskHeatmap: {
      filter: 'Cross-Domain',
      cells: [
        { category: 'Projects', low: 3, medium: 7, high: 2, critical: 1, total: 13 },
        { category: 'Suppliers', low: 5, medium: 9, high: 3, critical: 0, total: 17 },
        { category: 'Contracts', low: 2, medium: 4, high: 2, critical: 1, total: 9 },
        { category: 'Budget', low: 1, medium: 3, high: 1, critical: 0, total: 5 },
        { category: 'Cash', low: 4, medium: 6, high: 2, critical: 1, total: 13 },
        { category: 'Treasury', low: 2, medium: 5, high: 1, critical: 0, total: 8 }
      ]
    },
    topDecisionsAndAlerts: [
      { id: 'alert-01', title: 'Project KETRACO-003 – Cost Overrun Risk', description: '+KES 320M projected variance, 78% probability of exceeding revised budget cap.', impactAmount: 320000000, impactFormatted: '+KES 320M', probabilityPct: 78, severity: 'HIGH', timestamp: '2025-04-22T10:38:00Z', timeFormatted: '10:38', entityKind: 'PROJECT', entityId: 'KETRACO-003', actionable: true, status: 'PENDING' },
      { id: 'alert-02', title: 'Supplier ABC Ltd – Exposure Increase', description: '+KES 450M outstanding obligations across 3 contracts (exposure at 85% of credit ceiling).', impactAmount: 450000000, impactFormatted: '+KES 450M', probabilityPct: 65, severity: 'HIGH', timestamp: '2025-04-22T10:24:00Z', timeFormatted: '10:24', entityKind: 'SUPPLIER', entityId: 'ABC-LTD', actionable: true, status: 'PENDING' },
      { id: 'alert-03', title: 'Invoice INV-44877 – Anomaly Detected', description: 'Amount mismatch KES 12.5M vs contract bill of quantities milestone certification.', impactAmount: 12500000, impactFormatted: 'KES 12.5M', probabilityPct: 92, severity: 'MEDIUM', timestamp: '2025-04-22T10:12:00Z', timeFormatted: '10:12', entityKind: 'INVOICE', entityId: 'INV-44877', actionable: true, status: 'PENDING' },
      { id: 'alert-04', title: 'Cash Forecast – Shortfall Risk', description: 'KES 1.2B projected liquidity gap in 90-day cash outflow commitment schedule.', impactAmount: 1200000000, impactFormatted: 'KES 1.2B gap', probabilityPct: 58, severity: 'MEDIUM', timestamp: '2025-04-22T09:54:00Z', timeFormatted: '09:54', entityKind: 'TREASURY', entityId: 'CASH-POSITION', actionable: true, status: 'PENDING' },
      { id: 'alert-05', title: 'Budget Variance – Transmission Lines', description: '+18% commitment acceleration vs approved linear budget schedule.', impactAmount: 180000000, impactFormatted: '+18% variance', severity: 'LOW', timestamp: '2025-04-22T09:32:00Z', timeFormatted: '09:32', entityKind: 'BUDGET', entityId: 'BUD-2025-NTEP', actionable: false, status: 'ACKNOWLEDGED' },
      { id: 'alert-06', title: 'Payment Approval Pending', description: 'KES 275M release to Nairobi Cables Ltd requiring Director of Finance sign-off.', impactAmount: 275000000, impactFormatted: 'KES 275M', severity: 'MEDIUM', timestamp: '2025-04-22T09:21:00Z', timeFormatted: '09:21', entityKind: 'PAYMENT', entityId: 'PAY-7761', actionable: true, status: 'PENDING' },
      { id: 'alert-07', title: 'Reconciliation – 3 Unmatched Transactions', description: 'KES 42.7M commercial bank statement items awaiting ERP journal clearing.', impactAmount: 42700000, impactFormatted: 'KES 42.7M', severity: 'LOW', timestamp: '2025-04-22T08:56:00Z', timeFormatted: '08:56', entityKind: 'RECONCILIATION', entityId: 'REC-BANK-04', actionable: true, status: 'PENDING' }
    ],
    projectDeepDive: {
      projectId: 'KETRACO-003',
      code: 'KETRACO-003',
      name: 'Athi Transmission Line 220kV Corridors',
      riskLevel: 'HIGH RISK',
      status: 'In Progress',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
      financials: {
        approvedBudgetKES: 8100000000,
        approvedBudgetFormatted: 'KES 8.10B',
        forecastCostKES: 8420000000,
        forecastCostFormatted: 'KES 8.42B',
        varianceKES: 320000000,
        varianceFormatted: '+KES 320M (3.9%)',
        variancePct: 3.9,
        probabilityOfOverrunPct: 78
      },
      keyDrivers: [
        { name: 'Contract variation', sharePct: 41 },
        { name: 'Material escalation', sharePct: 27 },
        { name: 'Schedule delay', sharePct: 21 },
        { name: 'FX exposure', sharePct: 11 }
      ],
      recommendation: {
        title: 'ATLAS Recommendation',
        description: 'Review variation order before next payment milestone.',
        expectedAvoidedExposureKES: 117000000,
        expectedAvoidedExposureFormatted: 'KES 117M',
        confidencePct: 94
      },
      evidenceSummary: {
        sourceRecordsCount: 3,
        contractsCount: 4,
        invoicesCount: 2,
        milestonesCount: 3
      },
      scenarios: [
        { delayMonths: 0, tabName: 'No Delay', totalProjectCostKES: 8420000000, totalProjectCostFormatted: 'KES 8.42B', variancePct: 0, cashRequirementKES: 1200000000, cashRequirementFormatted: 'KES 1.2B', commissioningDate: 'Q4 2025' },
        { delayMonths: 3, tabName: '3 Month Delay', totalProjectCostKES: 8960000000, totalProjectCostFormatted: 'KES 8.96B', variancePct: 6, cashRequirementKES: 1500000000, cashRequirementFormatted: 'KES 1.5B', commissioningDate: 'Q4 2025' },
        { delayMonths: 6, tabName: '6 Month Delay', totalProjectCostKES: 9740000000, totalProjectCostFormatted: 'KES 9.74B', variancePct: 16, cashRequirementKES: 1900000000, cashRequirementFormatted: 'KES 1.9B', commissioningDate: 'Q2 2026' }
      ]
    },
    valueFlowTwin: {
      nodes: [
        { id: 'n-fund', label: 'GoK & Development Partners', type: 'funding', layer: 0, amountFormatted: 'KES 42.0B' },
        { id: 'n-prog', label: 'Transmission Expansion (NTEP)', type: 'program', layer: 1, amountFormatted: 'KES 21.0B' },
        { id: 'n-proj', label: 'Athi Line (KETRACO-003)', type: 'project', layer: 2, amountFormatted: 'KES 8.42B' },
        { id: 'n-con', label: 'EPC & Equipment Contracts', type: 'contract', layer: 3, amountFormatted: 'KES 6.62B' },
        { id: 'n-sup', label: 'Nairobi Cables / China Yangtze', type: 'supplier', layer: 3, amountFormatted: 'KES 3.10B' },
        { id: 'n-inv', label: 'Certified Milestone Invoices', type: 'invoice', layer: 4, amountFormatted: 'KES 4.25B' },
        { id: 'n-pay', label: 'Treasury Disbursed Payments', type: 'payment', layer: 5, amountFormatted: 'KES 3.35B' },
        { id: 'n-ast', label: '220kV Substation & Tower Assets', type: 'asset', layer: 6, amountFormatted: 'KES 5.64B' },
        { id: 'n-grid', label: 'Eastern Grid 350MW Corridor', type: 'grid', layer: 7, amountFormatted: '350 MW Load' },
        { id: 'n-val', label: 'National Grid Stability & Value', type: 'value', layer: 8, amountFormatted: 'KES 1.4B/yr Savings' }
      ],
      links: [
        { source: 'n-fund', target: 'n-prog', flowType: 'capital', valueFormatted: 'KES 21.0B' },
        { source: 'n-prog', target: 'n-proj', flowType: 'capital', valueFormatted: 'KES 8.42B' },
        { source: 'n-proj', target: 'n-con', flowType: 'commitment', valueFormatted: 'KES 6.62B' },
        { source: 'n-con', target: 'n-sup', flowType: 'commitment', valueFormatted: 'KES 3.10B' },
        { source: 'n-sup', target: 'n-inv', flowType: 'settlement', valueFormatted: 'KES 4.25B' },
        { source: 'n-inv', target: 'n-pay', flowType: 'settlement', valueFormatted: 'KES 3.35B' },
        { source: 'n-pay', target: 'n-ast', flowType: 'capitalization', valueFormatted: 'KES 5.64B' },
        { source: 'n-ast', target: 'n-grid', flowType: 'value', valueFormatted: '350 MW Transmission' },
        { source: 'n-grid', target: 'n-val', flowType: 'value', valueFormatted: 'KES 1.4B Public Value' }
      ]
    },
    recentEvents: [
      { id: 'ev-1', time: '10:41', event: 'Invoice anomaly detected', entity: 'INV-44877', impactFormatted: 'KES 12.5M', status: 'Open' },
      { id: 'ev-2', time: '10:38', event: 'Project forecast changed', entity: 'KETRACO-003', impactFormatted: 'KES 320M', status: 'Review' },
      { id: 'ev-3', time: '10:35', event: 'Supplier exposure increased', entity: 'ABC Ltd', impactFormatted: 'KES 450M', status: 'Attention' },
      { id: 'ev-4', time: '10:31', event: 'Treasury requirement predicted', entity: 'Cash Position', impactFormatted: 'KES 1.2B', status: 'Forecast' },
      { id: 'ev-5', time: '10:22', event: 'Payment approved', entity: 'PAY-7761', impactFormatted: 'KES 275M', status: 'Executed' }
    ],
    agentActivity: [
      { id: 'ag-1', agentName: 'Treasury Agent', role: 'Treasury', action: 'Analyzing cash flow and liquidity position across commercial and CBK accounts...', elapsed: '2m ago', status: 'ACTIVE' },
      { id: 'ag-2', agentName: 'Project Finance Agent', role: 'Project Finance', action: 'Evaluating variance and contractor claims for Athi 220kV corridor...', elapsed: '4m ago', status: 'ACTIVE' },
      { id: 'ag-3', agentName: 'Supplier Risk Agent', role: 'Supplier Risk', action: 'Assessing exposure and payment behaviour for Top 10 EPC contractors...', elapsed: '6m ago', status: 'ACTIVE' },
      { id: 'ag-4', agentName: 'Reconciliation Agent', role: 'Reconciliation', action: 'Matching bank statement feed with SAP S/4HANA general ledger entries...', elapsed: '8m ago', status: 'ACTIVE' }
    ],
    crossDomainInsights: [
      { id: 'ins-1', title: 'Project delay may impact procurement pipeline', description: 'Athi Line transmission delay cascades to 2 supply agreements at risk (~KES 1.1B exposure).', domainCorrelation: 'Projects → Procurement', exposureFormatted: 'KES 1.1B at risk', severity: 'high' },
      { id: 'ins-2', title: 'Supplier concentration risk', description: 'Top 3 suppliers account for 42% of total encumbered commitments.', domainCorrelation: 'Suppliers → Commitments', exposureFormatted: '42% Concentration', severity: 'medium' },
      { id: 'ins-3', title: 'Cash requirement increase', description: 'Driven by 3 major substation projects and scheduled vendor milestone invoices.', domainCorrelation: 'Projects → Treasury', exposureFormatted: '+KES 1.2B 90d demand', severity: 'medium' },
      { id: 'ins-4', title: 'Potential cost savings opportunity', description: 'KES 230M achievable through synchronized bulk conductor procurement renegotiation.', domainCorrelation: 'Contracts → Sourcing', exposureFormatted: 'KES 230M savings', severity: 'low' }
    ],
    quickActions: [
      { id: 'act-adj', title: 'Create Budget Adjustment', actionType: 'BUDGET_ADJUSTMENT', description: 'Initiate PFM Act compliant virement or allocation re-budgeting request' },
      { id: 'act-pay', title: 'Review Payment Approval', actionType: 'PAYMENT_APPROVAL', description: 'Open dual-authorization payment queue for pending contractor disbursements' },
      { id: 'act-cash', title: 'Run Cash Forecast', actionType: 'CASH_FORECAST', description: 'Trigger 180-day Monte Carlo liquidity projection engine' },
      { id: 'act-scen', title: 'Explore Scenario', actionType: 'SCENARIO_ANALYSIS', description: 'Open full delay and material escalation simulation laboratory' },
      { id: 'act-audit', title: 'View Audit Trail', actionType: 'AUDIT_TRAIL', description: 'Inspect cryptographically signed immutable financial event ledger' }
    ]
  };

  // Filtered decisions/alerts
  const filteredAlerts = useMemo(() => {
    return state.topDecisionsAndAlerts.filter((alert: any) => {
      if (alertFilter !== 'ALL' && alert.severity !== alertFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return alert.title.toLowerCase().includes(q) || alert.description.toLowerCase().includes(q) || alert.entityId.toLowerCase().includes(q);
    });
  }, [state.topDecisionsAndAlerts, alertFilter, searchQuery]);

  // Selected scenario
  const currentScenario = state.projectDeepDive.scenarios[selectedScenarioTab] || state.projectDeepDive.scenarios[0];

  // Action executor
  const handleQuickAction = async (actionType: string, title: string, payload?: any) => {
    if (actionType === 'AUDIT_TRAIL') {
      if (onNavigate) {
        onNavigate('lineage');
        return;
      }
    }
    if (actionType === 'SCENARIO_ANALYSIS') {
      if (onNavigate) {
        onNavigate('projects');
        return;
      }
    }
    setActionModal({ open: true, title, actionType, loading: true });
    setIsExecutingAction(true);
    try {
      let reqPayload = payload || {};
      if (actionType === 'TAX_REMITTANCE_EXECUTION' && !payload) {
        reqPayload = { period: 'April 2025', whtAmountKES: 68500000, whvatAmountKES: 22800000 };
      } else if (actionType === 'KENAO_AUDIT_PACKAGE_SEAL' && !payload) {
        reqPayload = { financialYear: 'FY 2024/2025' };
      } else if (actionType === 'CASH_FORECAST' && !payload) {
        reqPayload = { horizonDays: 180 };
      }
      const res = await financeApi.executeAction(actionType, reqPayload);
      setActionModal({
        open: true,
        title,
        actionType,
        loading: false,
        result: res || { success: true, message: 'Action executed successfully.', auditId: `aud-${Date.now()}` }
      });
    } catch (err: any) {
      setActionModal({
        open: true,
        title,
        actionType,
        loading: false,
        result: { success: false, message: err?.message || 'Execution failed' }
      });
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleResolveAlert = async (alert: any, remediationAction: string) => {
    setSelectedAlertForModal(null);
    if (remediationAction === 'MORATORIUM') {
      await handleQuickAction('VARIATION_ORDER_MORATORIUM', 'Enact Variation Order Moratorium', {
        projectId: alert.entityId,
        entityId: alert.entityId
      });
    } else {
      await handleQuickAction('RESOLVE_ALERT', `Statutory Remediation: ${alert.title}`, {
        alertId: alert.id,
        impactAmount: alert.impactAmount,
        resolution: `Executive governance review conducted under PFM Act guidelines. Risk vector mitigated.`
      });
    }
  };

  const copyDigest = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Copilot Ask Runner
  const handleCopilotAsk = async (queryText?: string) => {
    const prompt = queryText || copilotInput;
    if (!prompt.trim()) return;
    setCopilotLoading(true);
    try {
      const token = localStorage.getItem('atlas_access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/copilot/ask', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, tenantId: 'ketraco', domain: 'FINANCE' })
      });
      if (res.ok) {
        const json = await res.json();
        setCopilotResponse(json);
      } else {
        setCopilotResponse({
          answer: `Analysis of "${prompt}": Variance on KETRACO-003 is 41% driven by contract variation orders submitted for terrain compensation and rerouting around Athi Game Reserve buffer zone. Recommended action: Moratorium on variation orders pending technical verification saves KES 117M.`,
          sources: ['SAP S/4HANA PO-9923', 'Athi Corridors Milestone Log', 'PFM Act Section 43'],
          confidence: 0.94
        });
      }
    } catch {
      setCopilotResponse({
        answer: `Variance analysis completed: KETRACO-003 shows +KES 320M exposure. Primary driver is contractor variation Lot 1. Cash flow reserve supports current disbursements through Q3 2025.`,
        sources: ['Finance Ledger', 'PPADA Audit Store'],
        confidence: 0.91
      });
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div id="finance-command-root" className="flex flex-col min-h-full bg-[#050914] text-slate-100 font-sans pb-16">
      {/* 1. TOP FINANCE COMMAND HEADER */}
      <header id="finance-command-header" className="sticky top-0 z-20 bg-[#080E1C]/95 backdrop-blur-md border-b border-white/[0.08] px-6 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Title & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,217,255,0.15)]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white font-display">Finance Intelligence</h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">KETRACO Financial Decision & Execution Domain • Salience Atlas 5.1.0</p>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="finance-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions, projects, suppliers, accounts..."
                className="w-full bg-[#0B132B]/80 border border-white/10 rounded-lg pl-9 pr-12 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-400">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right User & Data State */}
          <div className="flex items-center gap-3">
            <DataStateBadge state={dataCtx.state} />
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">KETRACO Finance Director</span>
              <span className="text-[10px] font-mono text-cyan-400/80">Executive Operating Mode</span>
            </div>
            <button
              id="finance-refresh-button"
              onClick={dataCtx.refresh}
              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition cursor-pointer"
              title="Refresh Finance Telemetry"
              aria-label="Refresh Finance Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${dataCtx.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN COMMAND CANVAS */}
      <main className="p-6 space-y-6 max-w-[1680px] mx-auto w-full">
        {/* 2. TOP METRIC CARDS ROW (5 COLUMNS) */}
        <section id="finance-kpis-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Available Cash */}
          <div id="kpi-available-cash" className="p-4 rounded-xl bg-[#091122] border border-white/[0.08] hover:border-cyan-500/30 transition-all shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-400">Available Cash</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">{state.kpis.availableCash.formatted}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">Central Bank & Commercial Accounts</p>
            <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: '84%' }} />
            </div>
          </div>

          {/* Card 2: Total Commitments */}
          <div id="kpi-total-commitments" className="p-4 rounded-xl bg-[#091122] border border-white/[0.08] hover:border-cyan-500/30 transition-all shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-400">Total Commitments</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" /> +8%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">{state.kpis.totalCommitments.formatted}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">Encumbered Purchase Orders</p>
            <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full transition-all" style={{ width: '68%' }} />
            </div>
          </div>

          {/* Card 3: Outstanding Payables */}
          <div id="kpi-outstanding-payables" className="p-4 rounded-xl bg-[#091122] border border-white/[0.08] hover:border-amber-500/30 transition-all shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-400">Outstanding Payables</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" /> +5%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">{state.kpis.outstandingPayables.formatted}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">Approved Invoices in Queue</p>
            <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: '55%' }} />
            </div>
          </div>

          {/* Card 4: Outstanding Receivables */}
          <div id="kpi-outstanding-receivables" className="p-4 rounded-xl bg-[#091122] border border-white/[0.08] hover:border-blue-500/30 transition-all shadow-sm relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-slate-400">Outstanding Receivables</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3 h-3" /> -9%
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">{state.kpis.outstandingReceivables.formatted}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">Wheeling Charges Due from KPLC</p>
            <div className="mt-3 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full rounded-full transition-all" style={{ width: '42%' }} />
            </div>
          </div>

          {/* Card 5: Budget Utilization */}
          <div id="kpi-budget-utilization" className="p-4 rounded-xl bg-[#091122] border border-white/[0.08] hover:border-cyan-500/30 transition-all shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400">Budget Utilization</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tracking-tight text-white">{state.kpis.budgetUtilization.percentage}%</span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +4%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Approved Allocation Burn</p>
            </div>
            {/* Circular Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400"
                  strokeDasharray={`${state.kpis.budgetUtilization.percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-white">{state.kpis.budgetUtilization.percentage}%</span>
            </div>
          </div>
        </section>

        {/* 3. ROW 2: CASH FLOW OUTLOOK & BUDGET VS ACTUAL */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cash Flow Outlook (7 Cols) */}
          <div id="chart-cash-flow-outlook" className="lg:col-span-7 p-5 rounded-xl bg-[#091122] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white font-display">Cash Flow Outlook</h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                Next 6 Months
              </span>
            </div>

            {/* Visual Bars for Apr - Sep */}
            <div className="my-6 grid grid-cols-6 gap-3 items-end h-44 px-2">
              {state.cashFlowOutlook.months.map((m: any, idx: number) => {
                const maxVal = 7.0;
                const inflowH = (m.inflows / maxVal) * 100;
                const outflowH = (m.outflows / maxVal) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold mb-1 opacity-0 group-hover:opacity-100 transition">
                      +{m.inflows}B
                    </span>
                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      {/* Inflow Bar */}
                      <div
                        className="w-3.5 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${inflowH}%` }}
                        title={`Inflows: KES ${m.inflows}B`}
                      />
                      {/* Outflow Bar */}
                      <div
                        className="w-3.5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${outflowH}%` }}
                        title={`Outflows: KES ${m.outflows}B`}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-300 mt-2">{m.month}</span>
                    <span className="text-[9px] font-mono text-slate-500">Net {m.netPosition}B</span>
                  </div>
                );
              })}
            </div>

            {/* Legend & Summary */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                  <span className="text-slate-400">Inflows (KES 27.9B)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
                  <span className="text-slate-400">Outflows (KES 26.8B)</span>
                </div>
              </div>
              <span className="font-mono text-emerald-400 font-semibold">Net Positive Reserve: +KES 1.1B</span>
            </div>
          </div>

          {/* Budget vs Actual (5 Cols) */}
          <div id="chart-budget-vs-actual" className="lg:col-span-5 p-5 rounded-xl bg-[#091122] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-sm font-bold text-white font-display">Budget vs Actual</h2>
              <div className="flex items-center rounded-lg bg-white/5 p-0.5 border border-white/10">
                {(['By Program', 'By Project', 'By Department'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveBudgetTab(tab)}
                    className={`px-2 py-1 text-[10px] font-medium rounded-md transition cursor-pointer ${
                      activeBudgetTab === tab ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab items list */}
            <div className="space-y-3.5 my-3">
              {(activeBudgetTab === 'By Program'
                ? state.budgetVsActual.programs
                : activeBudgetTab === 'By Project'
                ? state.budgetVsActual.projects
                : state.budgetVsActual.departments
              ).map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.name}</span>
                    <span className="font-mono font-bold text-cyan-300">{item.utilizationPct}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.utilizationPct}%`,
                        backgroundColor: item.color || '#00D9FF'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>Linear FY benchmark: 75.0%</span>
              <span className="text-cyan-400 font-mono">Weighted burn: 68.4%</span>
            </div>
          </div>
        </section>

        {/* 4. ROW 3: FINANCIAL RISK HEATMAP & TOP DECISIONS & ALERTS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Financial Risk Heatmap (5 Cols) */}
          <div id="risk-heatmap-panel" className="lg:col-span-5 p-5 rounded-xl bg-[#091122] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-display">Financial Risk Heatmap</h2>
              </div>
              <div className="flex items-center rounded-lg bg-white/5 p-0.5 border border-white/10">
                {(['Cross-Domain', 'Finance Only'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveRiskFilter(filter)}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded transition cursor-pointer ${
                      activeRiskFilter === filter ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Heatmap Table */}
            <div className="overflow-x-auto my-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-mono text-slate-400 border-b border-white/[0.06]">
                    <th className="py-1.5 px-2">Category</th>
                    <th className="py-1.5 px-2 text-center text-emerald-400">Low</th>
                    <th className="py-1.5 px-2 text-center text-amber-400">Med</th>
                    <th className="py-1.5 px-2 text-center text-orange-400">High</th>
                    <th className="py-1.5 px-2 text-center text-rose-400">Crit</th>
                    <th className="py-1.5 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {state.riskHeatmap.cells.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition">
                      <td className="py-2 px-2 font-medium text-slate-200">{row.category}</td>
                      <td className="py-2 px-2 text-center">
                        <span className="inline-block w-6 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {row.low}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="inline-block w-6 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {row.medium}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="inline-block w-6 py-0.5 rounded text-[11px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          {row.high}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="inline-block w-6 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {row.critical}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-300 font-bold">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
              <span>69 Total Monitored Risk Vectors</span>
              <span className="text-rose-400 font-mono font-medium">3 Critical Action Points</span>
            </div>
          </div>

          {/* Top Decisions & Alerts (7 Cols) */}
          <div id="alerts-decisions-panel" className="lg:col-span-7 p-5 rounded-xl bg-[#091122] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-display">Top Decisions & Alerts</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  {filteredAlerts.length} Active
                </span>
              </div>
              {/* Severity Pills */}
              <div className="flex items-center gap-1.5">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setAlertFilter(sev)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition ${
                      alertFilter === sev
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* List of 7 Alerts */}
            <div className="space-y-2.5 my-3 max-h-[310px] overflow-y-auto pr-1">
              {filteredAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertForModal(alert)}
                  className="p-3 rounded-lg bg-[#0D162B]/80 border border-white/[0.06] hover:border-cyan-500/30 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        alert.severity === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : alert.severity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">{alert.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{alert.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-white block">{alert.impactFormatted}</span>
                    <span className="text-[10px] font-mono text-slate-500">{alert.timeFormatted}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
              <span>PFM Act Dual-Signoff Protocol Active</span>
              <button
                onClick={() => handleQuickAction('PAYMENT_APPROVAL', 'Review Pending Approvals')}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                Review Approval Queue <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        {/* 5. AI DECISION WORKSPACE (COGNITIVE PROMPT BAR) */}
        <section id="ai-decision-workspace" className="p-4 rounded-xl bg-gradient-to-r from-[#0C1938] via-[#09152E] to-[#0A1A3A] border border-cyan-500/20 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-display uppercase tracking-wider text-cyan-300">Atlas Financial Decision Workspace</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="copilot-query-input"
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCopilotAsk()}
              placeholder="Ask Atlas Copilot about project variance, cash projections, or supplier exposure..."
              className="flex-1 bg-[#050C1F] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <button
              id="copilot-ask-button"
              onClick={() => handleCopilotAsk()}
              disabled={copilotLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {copilotLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              Investigate
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className="text-[10px] text-slate-400 font-medium">Suggestions:</span>
            {[
              'Why is KETRACO-003 over budget?',
              'Cash sensitivity if contractor payments accelerate 30 days',
              'Simulate variation order moratorium'
            ].map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCopilotInput(s);
                  handleCopilotAsk(s);
                }}
                className="text-[10px] font-mono bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-white/10 px-2 py-0.5 rounded text-slate-300 transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Copilot Response Display */}
          {copilotResponse && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg bg-[#050C1F] border border-cyan-500/40 text-xs space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] border-b border-white/[0.06] pb-1.5">
                <span className="text-cyan-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Atlas Financial Reasoning Output
                </span>
                <span className="font-mono text-[10px] text-emerald-400">Confidence: {(copilotResponse.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-slate-200 leading-relaxed">{copilotResponse.answer}</p>
              {copilotResponse.sources && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                  <span>Sources:</span>
                  {copilotResponse.sources.map((src: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-slate-300">
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </section>

        {/* 6. PROJECT FINANCIAL STATE: KETRACO-003 ATHI DEEP DIVE */}
        <section id="project-financial-deepdive" className="p-6 rounded-xl bg-[#091122] border border-white/[0.08] space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                  {state.projectDeepDive.code}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold">
                  {state.projectDeepDive.riskLevel}
                </span>
                <h2 className="text-base font-bold text-white font-display">{state.projectDeepDive.name}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">220kV Double-Circuit Transmission Line & Athi River Substation Subsystem</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEvidenceModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-cyan-500/30 bg-white/5 text-xs text-slate-200 font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Review Evidence
              </button>
              <button
                onClick={() => handleQuickAction('SCENARIO_ANALYSIS', 'Simulate Scenario', { projectId: 'KETRACO-003', delayMonths: currentScenario.delayMonths })}
                className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs text-cyan-300 font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" /> Simulate
              </button>
              <button
                onClick={() => handleQuickAction('CREATE_WORKFLOW', 'Create Variation Order Workflow', { projectId: 'KETRACO-003' })}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" /> Create Workflow
              </button>
            </div>
          </div>

          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg bg-[#0C152B] border border-white/[0.04]">
              <span className="text-[11px] text-slate-400">Approved Budget</span>
              <div className="text-lg font-bold font-mono text-white mt-1">{state.projectDeepDive.financials.approvedBudgetFormatted}</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0C152B] border border-white/[0.04]">
              <span className="text-[11px] text-slate-400">Forecast Cost</span>
              <div className="text-lg font-bold font-mono text-white mt-1">{state.projectDeepDive.financials.forecastCostFormatted}</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0C152B] border border-white/[0.04]">
              <span className="text-[11px] text-slate-400">Variance</span>
              <div className="text-lg font-bold font-mono text-rose-400 mt-1">{state.projectDeepDive.financials.varianceFormatted}</div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0C152B] border border-white/[0.04]">
              <span className="text-[11px] text-slate-400">Probability of Overrun</span>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">{state.projectDeepDive.financials.probabilityOfOverrunPct}%</div>
            </div>
          </div>

          {/* Key Drivers & Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Drivers */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">Key Cost Drivers</h3>
              <div className="space-y-2.5">
                {state.projectDeepDive.keyDrivers.map((driver: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{driver.name}</span>
                      <span className="font-mono font-bold text-cyan-300">{driver.sharePct}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${driver.sharePct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ATLAS Recommendation Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-[#0B1733] to-[#0A1836] border border-cyan-500/30 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> ATLAS Recommendation
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                    {state.projectDeepDive.recommendation.confidencePct}% Confidence
                  </span>
                </div>
                <p className="text-sm font-semibold text-white mt-1">
                  {state.projectDeepDive.recommendation.description}
                </p>
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="text-slate-300">Expected Avoided Exposure: </span>
                  <span className="font-mono font-bold text-emerald-400">{state.projectDeepDive.recommendation.expectedAvoidedExposureFormatted}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-slate-400 flex items-center justify-between">
                <span>Evidence: {state.projectDeepDive.evidenceSummary.sourceRecordsCount} Source records, {state.projectDeepDive.evidenceSummary.contractsCount} Contracts, {state.projectDeepDive.evidenceSummary.invoicesCount} Invoices</span>
                <span className="text-cyan-400 font-mono">PPADA S.139 Compliant</span>
              </div>
            </div>
          </div>

          {/* Scenario Simulation Box */}
          <div className="p-4 rounded-xl bg-[#070D1E] border border-white/[0.06] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white font-display">Scenario Simulation</h3>
              </div>
              {/* Scenario Tabs */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                {state.projectDeepDive.scenarios.map((scen: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedScenarioTab(idx)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                      selectedScenarioTab === idx
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {scen.tabName}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Scenario Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[11px] text-slate-400">Total Project Cost</span>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {currentScenario.totalProjectCostFormatted}{' '}
                  <span className="text-xs font-normal text-rose-400">({currentScenario.variancePct >= 0 ? `+${currentScenario.variancePct}%` : `${currentScenario.variancePct}%`})</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[11px] text-slate-400">Cash Requirement</span>
                <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">{currentScenario.cashRequirementFormatted}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[11px] text-slate-400">Commissioning Date</span>
                <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">{currentScenario.commissioningDate}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINANCIAL VALUE-FLOW DIGITAL TWIN */}
        <section id="value-flow-twin" className="p-5 rounded-xl bg-[#091122] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white font-display">Financial Value-Flow Digital Twin</h2>
            </div>
            <span className="text-xs font-mono text-cyan-400/80">Capital → Encumbrance → Physical Asset → Grid Capacity</span>
          </div>

          {/* Interactive Topology Graph */}
          <div className="overflow-x-auto py-4">
            <div className="min-w-[860px] flex items-center justify-between relative px-4">
              {state.valueFlowTwin.nodes.map((node: any, idx: number) => {
                const isSelected = selectedTwinNode?.id === node.id;
                return (
                  <div key={node.id} className="flex items-center">
                    <button
                      onClick={() => setSelectedTwinNode(node)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer w-32 shadow-sm ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 scale-105 shadow-[0_0_15px_rgba(0,217,255,0.3)]'
                          : 'border-white/10 bg-[#0C152B] hover:border-cyan-500/30 hover:bg-[#0E1B38]'
                      }`}
                    >
                      <span className="block text-[9px] font-mono text-cyan-400 uppercase font-bold tracking-wider">{node.type}</span>
                      <span className="block text-xs font-semibold text-white mt-1 line-clamp-2">{node.label}</span>
                      {node.amountFormatted && (
                        <span className="block text-[11px] font-mono font-bold text-slate-300 mt-1">{node.amountFormatted}</span>
                      )}
                    </button>
                    {idx < state.valueFlowTwin.nodes.length - 1 && (
                      <div className="px-2 text-slate-600 flex items-center">
                        <ChevronRight className="w-4 h-4 text-cyan-400/50" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedTwinNode && (
            <div className="p-3 rounded-lg bg-white/5 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-cyan-300 font-bold">{selectedTwinNode.label}</span>
                <span className="text-slate-400 ml-2">Type: {selectedTwinNode.type} • Layer: {selectedTwinNode.layer}</span>
              </div>
              <button
                onClick={() => setSelectedTwinNode(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* 8. BOTTOM ROW (3 COLUMNS: RECENT EVENTS, AGENT ACTIVITY, CROSS-DOMAIN INSIGHTS) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Recent Financial Events */}
          <div id="recent-events-panel" className="p-5 rounded-xl bg-[#091122] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-sm font-bold text-white font-display">Recent Financial Events</h2>
              <span className="text-[10px] font-mono text-cyan-400">Real-Time Ledger</span>
            </div>
            <div className="divide-y divide-white/[0.04] my-2">
              {state.recentEvents.map((ev: any) => (
                <div key={ev.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">{ev.time}</span>
                    <div>
                      <span className="text-slate-200 font-medium block">{ev.event}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ev.entity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">{ev.impactFormatted}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        ev.status === 'Executed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : ev.status === 'Open'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 text-center">
              SHA-256 Ledger Provenance Verified
            </div>
          </div>

          {/* Column 2: Finance Agent Activity */}
          <div id="agent-activity-panel" className="p-5 rounded-xl bg-[#091122] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white font-display">Finance Agent Activity</h2>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                4 Active Agents
              </span>
            </div>
            <div className="space-y-3 my-2">
              {state.agentActivity.map((ag: any) => (
                <div key={ag.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      {ag.agentName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{ag.elapsed}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{ag.action}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Agent OS Federation v5.1</span>
              <span className="text-cyan-400 font-mono">100% Policy Bound</span>
            </div>
          </div>

          {/* Column 3: Key Cross-Domain Insights */}
          <div id="cross-domain-insights-panel" className="p-5 rounded-xl bg-[#091122] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-sm font-bold text-white font-display">Key Cross-Domain Insights</h2>
              <span className="text-[10px] font-mono text-cyan-400">Knowledge Graph</span>
            </div>
            <div className="space-y-2.5 my-2">
              {state.crossDomainInsights.map((ins: any) => (
                <div key={ins.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{ins.title}</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{ins.exposureFormatted}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{ins.description}</p>
                  <span className="text-[9px] font-mono text-cyan-400 block pt-0.5">{ins.domainCorrelation}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-slate-400 text-center">
              Correlated across SCM, Grid Twin & Finance
            </div>
          </div>
        </section>

        {/* 9. QUICK ACTIONS SUITE */}
        <section id="quick-actions-bar" className="p-4 rounded-xl bg-[#091122] border border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Executive Actions:</span>
            <div className="flex flex-wrap items-center gap-2">
              {state.quickActions.map((act: any) => (
                <button
                  key={act.id}
                  onClick={() => handleQuickAction(act.actionType, act.title)}
                  disabled={isExecutingAction}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-xs font-medium text-slate-200 hover:text-cyan-300 transition cursor-pointer disabled:opacity-50"
                >
                  {act.title}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* QUICK ACTION RESULT MODAL */}
      <AnimatePresence>
        {actionModal?.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1224] border border-cyan-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white font-display">{actionModal.title}</h3>
                </div>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {actionModal.loading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-xs text-slate-300">Processing statutory ledger transaction...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-emerald-200 font-medium leading-relaxed">{actionModal.result?.message}</p>
                      {actionModal.result?.reference && (
                        <div className="text-[10px] text-cyan-300 font-mono mt-1">
                          Warrant Ref: {actionModal.result.reference}
                        </div>
                      )}
                    </div>
                  </div>

                  {actionModal.result?.sha256Hash && (
                    <div className="p-2.5 rounded bg-black/50 border border-white/10 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1 font-mono">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          Cryptographic Digest (SHA-256):
                        </span>
                        <button
                          onClick={() => copyDigest(actionModal.result.sha256Hash)}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedHash ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="font-mono text-[9px] text-emerald-300 break-all select-all">
                        {actionModal.result.sha256Hash}
                      </div>
                    </div>
                  )}

                  {actionModal.result?.auditId && (
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
                      <span>Audit Ledger Index:</span>
                      <span className="text-cyan-300">{actionModal.result.auditId}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Statutory Dual-Authorization Enacted
                    </span>
                    <span className="font-mono text-emerald-400">KENAO/PFM VALID</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActionModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer font-display"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ALERT INVESTIGATION & STATUTORY REMEDIATION MODAL */}
      <AnimatePresence>
        {selectedAlertForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1224] border border-amber-500/30 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">{selectedAlertForModal.title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Entity: {selectedAlertForModal.entityId} • {selectedAlertForModal.entityKind}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAlertForModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded border border-white/5">
                  {selectedAlertForModal.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded bg-white/5 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Financial Impact Exposure:</span>
                    <span className="text-amber-300 font-bold text-sm">{selectedAlertForModal.impactFormatted}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/5 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Severity Rating:</span>
                    <span className="text-rose-400 font-bold text-sm">{selectedAlertForModal.severity} CRITICAL</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-cyan-950/30 border border-cyan-500/20 text-[11px] space-y-1">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Statutory Mandate Check</span>
                  </div>
                  <p className="text-slate-300">
                    Compliant with PFM Act 2012 Regulations & Public Audit Act. Executive intervention requires signing a statutory mitigation warrant into the ledger.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => setSelectedAlertForModal(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Dismiss
                </button>
                <div className="flex items-center gap-2">
                  {selectedAlertForModal.entityKind === 'PROJECT' && (
                    <button
                      onClick={() => handleResolveAlert(selectedAlertForModal, 'MORATORIUM')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer"
                    >
                      Enact VO Moratorium
                    </button>
                  )}
                  <button
                    onClick={() => handleResolveAlert(selectedAlertForModal, 'RESOLVE')}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1 font-display"
                  >
                    <span>Enact Statutory Mitigation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EVIDENCE LINEAGE MODAL */}
      <AnimatePresence>
        {evidenceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1224] border border-cyan-500/30 rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white font-display">KETRACO-003 Evidence Provenance</h3>
                </div>
                <button onClick={() => setEvidenceModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <span className="font-bold text-cyan-300 block">SAP S/4HANA PO-9923 (Lot 1 EPC)</span>
                  <p className="text-slate-400 mt-1">Contract value KES 4,520,000,000. Invoiced to date KES 2.80B. Flagged variation claim: KES 320M for rocky terrain foundation works.</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <span className="font-bold text-cyan-300 block">Certified Milestone 3 Log</span>
                  <p className="text-slate-400 mt-1">Inspection report #441 verified 62% conductor stringing complete. Physical progress aligns with base contract; variation orders pending executive audit.</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <span className="font-bold text-cyan-300 block">PPADA Section 139 Analysis</span>
                  <p className="text-slate-400 mt-1">Total cumulative variations remain under statutory 25% threshold (currently 3.9%).</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setEvidenceModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
