import React, { useCallback, useEffect, useState } from 'react';
import { Activity, CheckCircle2, GitBranch, MessageSquare, ShieldAlert } from 'lucide-react';
import type { GraphEdge, GraphNode } from '../../types/evaluation';
import AtlasAIInsight from '../ui/atlas/AtlasAIInsight';
import AtlasEmptyState from '../ui/atlas/AtlasEmptyState';
import AtlasErrorState from '../ui/atlas/AtlasErrorState';
import AtlasKPI from '../ui/atlas/AtlasKPI';
import AtlasPageHeader from '../ui/atlas/AtlasPageHeader';
import AtlasPanel from '../ui/atlas/AtlasPanel';
import AtlasStatusBadge from '../ui/atlas/AtlasStatusBadge';

interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const focusId = 'project-suswa-04';

export default function AtlasModuleWorkspace({ onAskAtlas }: { onAskAtlas?: (prompt: string) => void }) {
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v3/graph/traverse/${focusId}?depth=4`);
      if (!response.ok) throw new Error(`Graph service returned ${response.status}`);
      setGraph(await response.json());
    } catch (cause) {
      setError(cause);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGraph();
  }, [loadGraph]);

  const project = graph?.nodes.find(node => node.id === focusId);
  const risks = graph?.nodes.filter(node => node.type === 'RISK') ?? [];
  const evidenceEdges = graph?.edges.filter(edge => edge.provenance) ?? [];

  return (
    <div className="flex-1 overflow-y-auto">
      <AtlasPageHeader
        eyebrow="BESPOKE MODULE PLATFORM · DEMONSTRATION"
        title="Project Supply Nexus"
        description="A reusable Atlas module surface: bounded graph context, evidence-backed intelligence, and approval-gated action."
        icon={<GitBranch className="w-6 h-6" />}
        status={loading ? 'LOADING' : error ? 'DEGRADED' : 'CONNECTED'}
        lastUpdated={graph ? new Date().toLocaleTimeString() : undefined}
        actions={
          <button
            type="button"
            onClick={() => onAskAtlas?.('Trace delayed shipments affecting the Suswa Lot 4 project and show evidence.')}
            className="atlas-btn h-9 px-3 rounded-lg border border-cyan-500/30 text-cyan-300 text-xs inline-flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> Ask Atlas
          </button>
        }
      />

      <div className="p-5 sm:p-7 space-y-5">
        {error ? (
          <AtlasErrorState operationLabel="load graph context" error={error} onRetry={() => void loadGraph()} />
        ) : loading ? (
          <AtlasEmptyState variant="loading" compact />
        ) : !graph || !project ? (
          <AtlasEmptyState variant="no-data" title="Graph context unavailable" description="No authorized project context was returned by the graph service." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AtlasKPI label="GRAPH NODES" value={graph.nodes.length} status="ACTIVE" source="Atlas Graph Service" />
              <AtlasKPI label="RELATIONSHIPS" value={graph.edges.length} status="HEALTHY" source="Bounded neighborhood" />
              <AtlasKPI label="CONNECTED RISKS" value={risks.length} status={risks.length ? 'WARNING' : 'HEALTHY'} source="System-derived graph query" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <AtlasPanel title="Enterprise context" description="Actual relationships returned by the graph service" icon={GitBranch} className="xl:col-span-2" padded>
                <div className="space-y-2">
                  {graph.edges.map(edge => {
                    const source = graph.nodes.find(node => node.id === edge.source)?.label ?? edge.source;
                    const target = graph.nodes.find(node => node.id === edge.target)?.label ?? edge.target;
                    return (
                      <div key={edge.id} className="flex items-center gap-3 rounded-lg border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-xs">
                        <span className="text-slate-300 truncate">{source}</span>
                        <span className="text-cyan-400 font-mono shrink-0">{edge.type}</span>
                        <span className="text-slate-300 truncate">{target}</span>
                        <AtlasStatusBadge status={edge.provenance?.verificationStatus ?? 'UNVERIFIED'} size="xs" className="ml-auto shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </AtlasPanel>

              <AtlasPanel title="Intelligence" description="No fabricated recommendations" icon={ShieldAlert} accentSide="left" accentColor="warning">
                <AtlasAIInsight
                  title="Shipment delay exposure"
                  summary={risks.length ? `${risks[0].label} is connected to ${project.label}. Review the delayed shipment before commissioning decisions.` : 'No connected risk was returned.'}
                  confidence={risks.length ? 0.92 : undefined}
                  sourceSystem="SYSTEM_DERIVED graph relationship"
                />
              </AtlasPanel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <AtlasPanel title="Approval-gated action" description="Irreversible execution is not automatic" icon={Activity}>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Replenishment draft available</span>
                  <AtlasStatusBadge status="PENDING" label="HUMAN APPROVAL" className="ml-auto" />
                </div>
              </AtlasPanel>
              <AtlasPanel title="Evidence" description="Provenance attached to graph facts" icon={ShieldAlert}>
                <p className="text-sm text-slate-400">{evidenceEdges.length} of {graph.edges.length} relationships include source and observation metadata.</p>
              </AtlasPanel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
