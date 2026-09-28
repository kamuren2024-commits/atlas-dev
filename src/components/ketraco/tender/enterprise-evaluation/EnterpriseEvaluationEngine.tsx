import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Cpu, ScrollText, HardDrive, 
  RefreshCw, Eye, AlertTriangle, CheckCircle2, 
  Search, BookOpen, Clock, ChevronRight, Lock, 
  AlertCircle, FileText, Sparkles, Sliders, Info, 
  Check, Trash2, Upload, FileCheck, X, HelpCircle, 
  Save, Plus, ChevronDown, ChevronUp, History,
  Database, Fingerprint, Scale, Binary, Network
} from 'lucide-react';
import { 
  ManagedDocument, AgentStatus, EvaluationFinding, 
  ProcurementEvent, ProcurementRule 
} from '../../../../types/evaluation';

// Next-Generation Evaluation OS Presentation Layer
import EvaluationOSDashboard from '../evaluation-os/EvaluationOSDashboard';

// Sub-components preserved for deep inspection
import { IntakeLayer } from './IntakeLayer';
import { AgentStatusPanel } from './AgentStatusPanel';
import { ActivityStream } from './ActivityStream';
import { ReasoningPanel } from './ReasoningPanel';
import { EvidenceGraph } from './EvidenceGraph';
import { RuleEngineView } from './RuleEngineView';
import { ProcurementTimeline } from './ProcurementTimeline';
import { AuditLogView } from './AuditLogView';
import { MultiStagePipeline } from './MultiStagePipeline';
import { AgentRegistry } from './AgentRegistry';
import { ExecutiveMonitoring } from './ExecutiveMonitoring';
import { RiskIntelligence } from './RiskIntelligence';
import { ExplainableScorecard } from './ExplainableScorecard';
import DecisionIntelligenceWorkspace from '../../../intelligence/DecisionIntelligenceWorkspace';

interface EnterpriseEvaluationEngineProps {
  onSelectContextTab?: (tabId: string) => void;
  activeContextTab?: string;
  selectedTender?: any;
  selectedEvaluationId?: string;
  onSelectEvaluationId?: (id: string) => void;
}

export default function EnterpriseEvaluationEngine({
  onSelectContextTab,
  activeContextTab = 'evaluation-os',
  selectedTender,
  selectedEvaluationId,
  onSelectEvaluationId
}: EnterpriseEvaluationEngineProps = {}) {
  // Evaluation OS is a sub-module of Tender Intelligence inside Salience Atlas.
  // This presentation layer upgrades the Evaluation OS interface while preserving
  // all underlying backend endpoints, evaluation workflows, and security/audit controls.
  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-[#06080f]" id="enterprise-evaluation-engine-root">
      <EvaluationOSDashboard
        onSelectContextTab={onSelectContextTab}
        activeContextTab={activeContextTab}
        selectedTender={selectedTender}
        selectedEvaluationId={selectedEvaluationId}
        onSelectEvaluationId={onSelectEvaluationId}
      />
    </div>
  );
}

// Export sub-components for direct modular access across Tender Intelligence
export {
  EvaluationOSDashboard,
  IntakeLayer,
  AgentStatusPanel,
  ActivityStream,
  ReasoningPanel,
  EvidenceGraph,
  RuleEngineView,
  ProcurementTimeline,
  AuditLogView,
  MultiStagePipeline,
  AgentRegistry,
  ExecutiveMonitoring,
  RiskIntelligence,
  ExplainableScorecard,
  DecisionIntelligenceWorkspace
};
