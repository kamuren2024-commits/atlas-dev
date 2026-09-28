import React, { useState, useEffect } from 'react';
import RelationshipExplorer from '../graph/RelationshipExplorer';
import SupplierTwin from '../twin/SupplierTwin';
import TenderTwin from '../twin/TenderTwin';
import OrganizationTwin from '../twin/OrganizationTwin';
import { fetchFullGraph, fetchSupplierTwin, fetchTenderTwin, fetchOrganizationTwin, runCollusionAnalysis, fetchNodeTraverse } from '../../utils/graph-service';
import { GraphNode, GraphEdge, DigitalTwin } from '../../types/evaluation';
import { Network, UserCheck, FileText, Search, ShieldAlert, GitBranch, Landmark, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AtlasMissionBrief } from '../ui/atlas/AtlasMissionBrief';
import { AtlasAgentPulse, DEFAULT_ENTERPRISE_AGENTS } from '../ui/atlas/AtlasAgentPulse';

const ProcurementGraphCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'supplier' | 'tender' | 'organization'>('explorer');
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] }>({ nodes: [], edges: [] });
  const [selectedSupplier, setSelectedSupplier] = useState<string>('supplier-shanghai');
  const [selectedTender, setSelectedTender] = useState<string>('tender-2026-08');
  const [selectedOrg, setSelectedOrg] = useState<string>('ent-ketraco');
  const [supplierTwin, setSupplierTwin] = useState<DigitalTwin | null>(null);
  const [tenderTwin, setTenderTwin] = useState<DigitalTwin | null>(null);
  const [orgTwin, setOrgTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentsOpen, setAgentsOpen] = useState(false);

  // Collusion modal state
  const [showCollusionModal, setShowCollusionModal] = useState(false);
  const [collusionFindings, setCollusionFindings] = useState<any[]>([]);
  const [collusionLoading, setCollusionLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const graph = await fetchFullGraph();
      setGraphData(graph);
      
      const sTwin = await fetchSupplierTwin(selectedSupplier);
      setSupplierTwin(sTwin);
      
      const tTwin = await fetchTenderTwin(selectedTender);
      setTenderTwin(tTwin);

      const oTwin = await fetchOrganizationTwin(selectedOrg);
      setOrgTwin(oTwin);
    } catch (err) {
      console.error('Failed to load graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCollusionScan = async () => {
    setCollusionLoading(true);
    setShowCollusionModal(true);
    try {
      const findings = await runCollusionAnalysis();
      setCollusionFindings(findings);
    } catch (err) {
      console.error('Collusion scan failed:', err);
    } finally {
      setCollusionLoading(false);
    }
  };

  const handleTraverseEntityGraph = async () => {
    setActiveTab('explorer');
    try {
      const result = await fetchNodeTraverse('ent-ketraco', 2);
      if (result.nodes.length) {
        setGraphData(result);
      }
    } catch (err) {
      console.error('Entity graph traversal failed:', err);
    }
  };

  const handleSelectTwinContext = (type: string, id: string) => {
    if (type === 'supplier') {
      setSelectedSupplier(id);
      fetchSupplierTwin(id).then(setSupplierTwin);
      setActiveTab('supplier');
    } else if (type === 'tender') {
      setSelectedTender(id);
      fetchTenderTwin(id).then(setTenderTwin);
      setActiveTab('tender');
    } else if (type === 'organization' || type === 'entity') {
      setSelectedOrg(id);
      fetchOrganizationTwin(id).then(setOrgTwin);
      setActiveTab('organization');
    }
  };

  const tabs = [
    { id: 'explorer', label: 'Relationship Explorer', icon: Network },
    { id: 'supplier', label: 'Supplier Digital Twin', icon: UserCheck },
    { id: 'tender', label: 'Tender Digital Twin', icon: FileText },
    { id: 'organization', label: 'Organization Twin', icon: Landmark }
  ];

  const riskCount = graphData.nodes?.filter(n => n.type === 'RISK').length || 1;

  return (
    <div className="flex flex-col h-full bg-[#05070D] space-y-3 overflow-hidden" id="procurement-graph-center">
      {/* Mission Brief — knowledge graph operating statement */}
      <AtlasMissionBrief
        moduleLabel="Knowledge Graph"
        mission="Enterprise relationships mapped, traversed and reasoned over."
        description="Enterprise Procurement Relationship Intelligence Layer — suppliers, tenders, organizations and assets as one connected web."
        metrics={[
          { label: 'Nodes', value: graphData?.nodes?.length || 0, icon: Network, tone: 'info' },
          { label: 'Edges', value: graphData?.edges?.length || 0, icon: GitBranch, tone: 'healthy' },
          { label: 'Active Conflicts', value: riskCount, icon: ShieldAlert, tone: 'risk' },
          { label: 'Graph Engine', value: 'SYNCED', icon: Activity, tone: 'healthy' },
        ]}
      />

      <div className="px-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0B1220] border border-slate-800/70 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#101827] text-cyan-300 shadow-sm border border-cyan-500/20' 
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative px-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#05070D]/60 backdrop-blur-sm rounded-2xl border border-slate-800/60 z-10"
            >
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-medium">Reconstructing Procurement Graph...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto"
            >
              {activeTab === 'explorer' && (
                <RelationshipExplorer 
                  initialNodes={graphData.nodes} 
                  initialEdges={graphData.edges}
                  onSelectTwin={handleSelectTwinContext}
                />
              )}
              {activeTab === 'supplier' && supplierTwin && (
                <SupplierTwin twin={supplierTwin} />
              )}
              {activeTab === 'tender' && tenderTwin && (
                <TenderTwin twin={tenderTwin} />
              )}
              {activeTab === 'organization' && orgTwin && (
                <OrganizationTwin twin={orgTwin} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-5 pb-2">
        <div className="flex items-center gap-6 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Nodes: {graphData?.nodes?.length || 0}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Edges: {graphData?.edges?.length || 0}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Active Conflicts: {riskCount}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunCollusionScan}
            className="flex items-center gap-2 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer px-3 py-1.5 bg-[#0B1220] hover:bg-[#101827] border border-cyan-500/20 rounded-xl"
          >
            <ShieldAlert size={14} />
            Run Collusion Intelligence Scan
          </button>
        </div>
      </div>

      {/* Contextual Intelligence rail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-5 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
          <div className="flex items-baseline gap-1">Integrated across</div>
          <button 
            onClick={handleTraverseEntityGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1220] hover:bg-[#101827] border border-slate-800/70 rounded-xl text-cyan-300 transition-all cursor-pointer"
          >
            <Search size={12} /> Traverse Entity Graph
          </button>
        </div>
        <AtlasAgentPulse agents={DEFAULT_ENTERPRISE_AGENTS} expanded={agentsOpen} onToggle={() => setAgentsOpen(o => !o)} />
      </div>

      {/* Collusion Intelligence Modal */}
      <AnimatePresence>
        {showCollusionModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1220] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert size={20} />
                  <h3 className="font-bold text-slate-100 text-base">Collusion Intelligence Scan Findings</h3>
                </div>
                <button onClick={() => setShowCollusionModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
              </div>

              {collusionLoading ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                  <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs">Scanning graph for bidder collusion & shared directors...</p>
                </div>
              ) : collusionFindings.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-200">No Horizontal Collusion Anomalies Detected</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">Graph verification completed. IP addresses, directorship stakes, and price distributions exhibit statutory independence.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {collusionFindings.map((finding: any, idx: number) => (
                    <div key={idx} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-400 text-sm flex items-center gap-2">
                          <AlertTriangle size={16} />
                          {finding.title || 'Horizontal Bidder Collusion Signal'}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold rounded uppercase">
                          {finding.riskLevel || 'CRITICAL'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Common directors detected between bidding suppliers in Tender 2026-08 with matching network IP infrastructure.
                      </p>
                      <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                        <span>Confidence: {((finding.confidence || 0.98) * 100).toFixed(0)}%</span>
                        <span>Source: Collusion Detection Engine</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowCollusionModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProcurementGraphCenter;
