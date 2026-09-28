import React, { useMemo, useState } from 'react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import { Panel, DataStateBadge, formatFullKES, formatKES } from '../components/primitives';
import { financeTokens } from '../tokens';

interface GNode {
  id: string;
  kind: string;
  label: string;
  value: number;
  cx: number;
  cy: number;
}

interface GEdge {
  from: string;
  to: string;
  rel: string;
}

const KIND_COLOR: Record<string, string> = {
  BUDGET: financeTokens.chart.budget,
  PROJECT: financeTokens.chart.forecast,
  SUPPLIER: financeTokens.chart.committed,
  CONTRACT: financeTokens.colors.secondary,
  COMMITMENT: financeTokens.chart.actual,
  INVOICE: financeTokens.chart.paid,
  PAYMENT: '#10B981',
  ASSET: financeTokens.chart.remaining,
  'COST CENTRE': '#8B5CF6',
  ACCOUNT: '#64748B',
};

const EDGE_RELS = new Set(['ALLOCATED_TO', 'CONTRACTED_WITH', 'GENERATED', 'SETTLES', 'BELONGS_TO', 'CAPITALIZES']);

export default function FinancialGraph() {
  const data = useFinanceDataContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSupplyers, setShowSupplyers] = useState(false);

  // Build the node graph from real data
  const { nodes, edges } = useMemo(() => {
    const nodes: GNode[] = [];
    const edges: GEdge[] = [];
    const cx = 400;
    const cy = 250;

    const budgets = data.budgets;
    const projects = data.projects;
    const commitments = data.commitments;
    const invoices = data.invoices;
    const payments = data.payments;

    // Place nodes in a ring; budgets at center-left
    budgets.forEach((b, i) => {
      nodes.push({ id: `b-${b.budgetId}`, kind: 'BUDGET', label: b.name, value: b.revisedAmount, cx: 120 + (i % 3) * 40, cy: 120 + (i / 3) * 90 });
    });
    projects.forEach((p, i) => {
      const angle = (i / Math.max(projects.length, 1)) * Math.PI * 2 - Math.PI / 2;
      nodes.push({ id: `p-${p.projectId}`, kind: 'PROJECT', label: p.name, value: p.totalBudget, cx: cx + Math.cos(angle) * 160, cy: cy + Math.sin(angle) * 130 });
    });
    const supplierNames = [...new Set(data.commitments.map((c) => c.supplierName).filter(Boolean))];
    supplierNames.forEach((s, i) => {
      const angle = (i / Math.max(supplierNames.length, 1)) * Math.PI * 2;
      nodes.push({ id: `s-${i}`, kind: 'SUPPLIER', label: s as string, value: data.commitments.filter((c) => c.supplierName === s).reduce((acc, c) => acc + c.amount, 0), cx: cx + Math.cos(angle) * 300, cy: cy + Math.sin(angle) * 210 });
    });

    // Edges
    budgets.forEach((b) => {
      if (b.projectId) edges.push({ from: `p-${b.projectId}`, to: `b-${b.budgetId}`, rel: 'ALLOCATED_TO' });
    });
    commitments.forEach((c) => {
      if (c.budgetId) edges.push({ from: `b-${c.budgetId}`, to: `c-${c.commitmentId}`, rel: 'ALLOCATED_TO' });
      if (c.projectId) edges.push({ from: `p-${c.projectId}`, to: `c-${c.commitmentId}`, rel: 'RELATES_TO' });
      const si = supplierNames.findIndex((s) => s === c.supplierName);
      if (si >= 0) edges.push({ from: `s-${si}`, to: `c-${c.commitmentId}`, rel: 'CONTRACTED_WITH' });
      nodes.push({ id: `c-${c.commitmentId}`, kind: 'COMMITMENT', label: c.reference, value: c.amount, cx: cx, cy: cy });
    });
    invoices.forEach((inv) => {
      if (inv.commitmentId) edges.push({ from: `c-${inv.commitmentId}`, to: `i-${inv.invoiceId}`, rel: 'GENERATED' });
      nodes.push({ id: `i-${inv.invoiceId}`, kind: 'INVOICE', label: inv.invoiceNumber, value: inv.amount, cx: cx + 120, cy: cy });
    });
    payments.forEach((pay) => {
      if (pay.invoiceId) edges.push({ from: `i-${pay.invoiceId}`, to: `pay-${pay.paymentId}`, rel: 'SETTLES' });
      nodes.push({ id: `pay-${pay.paymentId}`, kind: 'PAYMENT', label: pay.paymentNumber, value: pay.amount, cx: cx + 240, cy: cy });
    });

    return { nodes, edges };
  }, [data.budgets, data.projects, data.commitments, data.invoices, data.payments]);

  const nodeById = useMemo(() => {
    const m = new Map<string, GNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  // Select neighborhood
  const selected = selectedId ? nodeById.get(selectedId) : null;
  const neighborIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const set = new Set<string>([selectedId]);
    edges.forEach((e) => {
      if (e.from === selectedId) set.add(e.to);
      if (e.to === selectedId) set.add(e.from);
    });
    return set;
  }, [selectedId, edges]);

  const W = 820;
  const H = 520;

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="Financial Graph"
        subtitle="Finance knowledge graph — budgets, projects, suppliers, commitments, invoices and payments"
        right={<DataStateBadge state={data.state} />}
      />

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Graph canvas */}
          <Panel
            title="Interactive Finance Graph"
            subtitle="Select a node to focus its neighbourhood"
            className="xl:col-span-3"
            accent={financeTokens.colors.primary}
            right={
              <label className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 cursor-pointer">
                <input type="checkbox" checked={showSupplyers} onChange={(e) => setShowSupplyers(e.target.checked)} className="accent-cyan-400" />
                Suppliers
              </label>
            }
          >
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-[#070B14] rounded border border-white/5" role="img" aria-label="Interactive knowledge graph of finance entities and relationships">
              {/* Edges */}
              {edges.map((e, i) => {
                const f = nodeById.get(e.from);
                const t = nodeById.get(e.to);
                if (!f || !t) return null;
                if (e.from === e.to) return null;
                const highlighted = selectedId ? neighborIds.has(e.from) && neighborIds.has(e.to) : true;
                const dimmed = selectedId && !(neighborIds.has(e.from) && neighborIds.has(e.to));
                if (!showSupplyers && (f.kind === 'SUPPLIER' || t.kind === 'SUPPLIER')) return null;
                const midX = (f.cx + t.cx) / 2;
                const midY = (f.cy + t.cy) / 2;
                return (
                  <g key={i} opacity={dimmed ? 0.08 : highlighted ? 0.7 : 0.2}>
                    <line x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy} stroke="rgba(0,217,255,0.4)" strokeWidth={1} />
                    <line x1={f.cx} y1={f.cy} x2={t.cx} y2={t.cy} stroke="rgba(0,217,255,0.8)" strokeWidth={1.2}>
                      <animate attributeName="stroke-dashoffset" from="10" to="0" dur="2s" repeatCount="indefinite" />
                    </line>
                    <text x={midX} y={midY - 4} textAnchor="middle" fontSize="6.5" fill="#64748B" fontFamily="'JetBrains Mono',monospace">{e.rel}</text>
                  </g>
                );
              })}
              {/* Nodes */}
              {nodes.map((n) => {
                if (!showSupplyers && n.kind === 'SUPPLIER') return null;
                const color = KIND_COLOR[n.kind] ?? '#00D9FF';
                const selectedNode = selected?.id === n.id;
                const inNeighborhood = selectedId ? neighborIds.has(n.id) : true;
                const dimmed = selectedId && !inNeighborhood;
                const r = 10 + Math.log10(n.value + 1) * 4;
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(selectedNode ? null : n.id)}
                    opacity={dimmed ? 0.15 : 1}
                  >
                    {selectedNode && <circle cx={n.cx} cy={n.cy} r={r + 8} fill="none" stroke={color} strokeWidth={1} strokeDasharray="3 2" />}
                    <circle cx={n.cx} cy={n.cy} r={r} fill={`${color}26`} stroke={color} strokeWidth={1.5} />
                    <text x={n.cx} y={n.cy + 3} textAnchor="middle" fontSize="7" fill="#F8FAFC" fontFamily="'JetBrains Mono',monospace" fontWeight="bold">{n.kind[0]}</text>
                    <text x={n.cx} y={n.cy + r + 11} textAnchor="middle" fontSize="7" fill="#94A3B8" fontFamily="'JetBrains Mono',monospace">{n.label.length > 20 ? n.label.slice(0, 20) + '…' : n.label}</text>
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(KIND_COLOR).map(([k, c]) => (
                <span key={k} className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />{k}
                </span>
              ))}
            </div>
          </Panel>

          {/* Inspector */}
          <div className="space-y-4">
            <Panel title="Entity Inspector">
              {selected ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: KIND_COLOR[selected.kind] }} />
                    <span className="finance-label" style={{ color: KIND_COLOR[selected.kind] }}>{selected.kind}</span>
                  </div>
                  <div className="text-[13px] font-display font-semibold text-slate-100">{selected.label}</div>
                  <div className="finance-value" style={{ color: KIND_COLOR[selected.kind] }}>{formatFullKES(selected.value)}</div>
                  <div className="text-[10px] font-mono text-slate-500">{neighborIds.size - 1} relationships in focus</div>
                  <div className="border-t border-white/5 pt-2 space-y-1">
                    {neighborIds.size > 1 && [...neighborIds].filter((id) => id !== selected.id).map((id) => {
                      const nn = nodeById.get(id);
                      if (!nn) return null;
                      return (
                        <button key={id} onClick={() => setSelectedId(id)} className="w-full text-left flex items-center gap-2 text-[10px] font-mono text-slate-400 hover:text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: KIND_COLOR[nn.kind] }} />
                          <span className="truncate">{nn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 font-mono">Select a node to inspect its neighbourhood and relationships. Hovering edges reveals relationship type (e.g. ALLOCATED_TO, SETTLES).</div>
              )}
            </Panel>
            <Panel title="Traversal Hint">
              <div className="text-[10px] font-mono text-slate-500 space-y-1">
                <div>Budget → Commitment → Invoice → Payment traces cash flow.</div>
                <div>Project → Budget → Supplier → Contract captures origin.</div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
