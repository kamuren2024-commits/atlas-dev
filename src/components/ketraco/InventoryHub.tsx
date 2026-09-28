import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, ShieldAlert, Sparkles, CheckCircle, Clock, Lock, Key, FileText, 
  Table, RefreshCw, Cpu, Activity, ShieldCheck, Database, Sliders, Warehouse, 
  AlertTriangle, Layers, Maximize2, Filter, ChevronDown, List, History, Compass, 
  Plus, Send, Mic, Volume2, Play, Users, FileCheck, Check, Search, Map, 
  BarChart3, Settings, HelpCircle, Eye, AlertCircle, Info, Shuffle
} from 'lucide-react';

import ItemMasterPanel from './domain/ItemMasterPanel';
import WarehouseMapPanel from './domain/WarehouseMapPanel';
import LedgerEnginePanel from './domain/LedgerEnginePanel';
import ReceivingIntelPanel from './domain/ReceivingIntelPanel';
import IssuingIntelPanel from './domain/IssuingIntelPanel';
import ForecastingPanel from './domain/ForecastingPanel';
import OptimizationPanel from './domain/OptimizationPanel';
import AuditGovernancePanel from './domain/AuditGovernancePanel';
import AiAgentsPanel from './domain/AiAgentsPanel';

// =========================================================
// ONTOLOGY STRUCTURES & INTERACTIVE MOCK DATA
// =========================================================

interface InventoryItem {
  id: string;
  name: string;
  category: 'Conductors' | 'Insulators' | 'Transformers' | 'Circuit Breakers' | 'Gantry Steel' | 'Earthing Kits';
  materialGroup: string;
  criticality: 'CRITICAL_SPARE' | 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  warehouse: string;
  currentQty: number;
  reservedQty: number;
  availableQty: number;
  safetyStock: number;
  reorderPoint: number;
  unit: string;
  leadTime: number; // days
  supplier: string;
}

interface AgentLog {
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'warn' | 'success' | 'alert';
}

interface SCMDecision {
  id: string;
  title: string;
  category: 'Reorder' | 'Stock Transfer' | 'Emergency direct' | 'Supplier Substitution';
  recommendation: string;
  confidence: number;
  evidence: { label: string; urn: string }[];
  risks: string[];
  alternatives: { option: string; cost: string; timeline: string; risk: string }[];
  approved: boolean;
  signer?: string;
  date?: string;
}

export default function InventoryHub({ onAskCopilot }: { onAskCopilot: (prompt: string) => void }) {
  // Navigation states (Matches secondary sidebar layout of uploaded mockup)
  const [activeSubTab, setActiveSubTab] = useState<string>('command-center');
  
  // Interactive global SCM state variables (Simulation dynamic deltas)
  const [simImpact, setSimImpact] = useState<{
    costDelta: number;
    delayDays: number;
    activeEscalations: number;
    scenario: string;
  }>({ costDelta: 0, delayDays: 0, activeEscalations: 23, scenario: 'None' });

  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  
  // Chat input
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([]);
  
  // PPADA approval credential modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [signaturePin, setSignaturePin] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [signingSuccess, setSigningSuccess] = useState(false);

  // Simulation controls state
  const [activeScenario, setActiveScenario] = useState<string>('None');
  const [isSimulating, setIsSimulating] = useState(false);

  // Search input and palette state
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Dynamic real-time events state that appends items
  const [events, setEvents] = useState<AgentLog[]>([
    { timestamp: '14:30 EAT', agent: 'ERP Reconciliation', message: 'Transformer Unit T-123 received at Central Warehouse', type: 'success' },
    { timestamp: '14:27 EAT', agent: 'Risk Agent', message: 'XLPE Cable 132kV below reorder point (1,250 left)', type: 'warn' },
    { timestamp: '14:20 EAT', agent: 'Forecast Agent', message: 'Reorder recommendation generated for 3 XLPE item variants', type: 'info' },
    { timestamp: '14:14 EAT', agent: 'Compliance Agent', message: 'Emergency procurement under Section 103 flagged for execution review', type: 'alert' },
  ]);

  // Append a live event periodically to look event-driven & operational
  useEffect(() => {
    const timer = setInterval(() => {
      const liveEvents: { msg: string; agent: string; type: 'info' | 'warn' | 'success' | 'alert' }[] = [
        { msg: 'Scheduled material batch sync completed for plant 1010', agent: 'ERP Reconciliation', type: 'success' },
        { msg: 'Consumption vector spiked at Suswa Lot 4 gantry site', agent: 'Demand Planning', type: 'info' },
        { msg: 'Mariakani warehouse capacity reached 82%', agent: 'Warehouse Intelligence', type: 'warn' },
        { msg: 'CDC Replay buffer caught up with Oracle ECC stream', agent: 'ERP Reconciliation', type: 'success' },
        { msg: 'Critical safety buffer breach predicted on earthing kits', agent: 'Critical Spare Parts', type: 'alert' }
      ];
      
      const choose = liveEvents[Math.floor(Math.random() * liveEvents.length)];
      setEvents(prev => [
        { 
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' EAT',
          agent: choose.agent,
          message: choose.msg,
          type: choose.type
        },
        ...prev.slice(0, 9)
      ]);

      // Pop trigger notifications occasionally
      if (Math.random() > 0.4) {
        setShowNotification(`Event Stream: [${choose.agent}] - ${choose.msg}`);
        setTimeout(() => setShowNotification(null), 4000);
      }
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  // Material data mapping section 1 (Ontology standard)
  const [materials, setMaterials] = useState<InventoryItem[]>([
    { id: 'MAT-402830', name: 'XLPE Insulated Conductor 132kV', category: 'Conductors', materialGroup: 'SG-08-CABLES', criticality: 'CRITICAL_SPARE', location: 'BAY-04-C', warehouse: 'Mombasa Port Depot', currentQty: 1250, reservedQty: 800, availableQty: 450, safetyStock: 1500, reorderPoint: 1500, unit: 'Meters', leadTime: 42, supplier: 'Shanghai Grid Metal Corp' },
    { id: 'MAT-293810', name: 'High-Capacity EHV Transformer 220kV', category: 'Transformers', materialGroup: 'SG-11-TRANS', criticality: 'CRITICAL_SPARE', location: 'B-BAY-01', warehouse: 'Central Warehouse Nairobi', currentQty: 3, reservedQty: 2, availableQty: 1, safetyStock: 2, reorderPoint: 2, unit: 'Units', leadTime: 120, supplier: 'ABB Grid Systems Ltd' },
    { id: 'MAT-884029', name: 'Polymer Insulator Suspension Clamps', category: 'Insulators', materialGroup: 'SG-14-INSUL', criticality: 'HIGH', location: 'BAY-12-D', warehouse: 'Isinya Transformer Yard', currentQty: 320, reservedQty: 300, availableQty: 20, safetyStock: 100, reorderPoint: 150, unit: 'Units', leadTime: 30, supplier: 'Deccan India Insulators Ltd' },
    { id: 'MAT-102930', name: 'Sulfur Hexafluoride Gas Circuit Breaker', category: 'Circuit Breakers', materialGroup: 'SG-03-SWITCH', criticality: 'MEDIUM', location: 'A-BAY-05', warehouse: 'Central Warehouse Nairobi', currentQty: 142, reservedQty: 60, availableQty: 82, safetyStock: 50, reorderPoint: 60, unit: 'Kits', leadTime: 75, supplier: 'Schneider Electric SAS' },
    { id: 'MAT-504928', name: 'Earthing Connection Copper Rods 3m', category: 'Earthing Kits', materialGroup: 'SG-01-EARTH', criticality: 'HIGH', location: 'BAY-09', warehouse: 'Isinya Transformer Yard', currentQty: 450, reservedQty: 400, availableQty: 50, safetyStock: 200, reorderPoint: 300, unit: 'Units', leadTime: 15, supplier: 'Metals East Africa Ltd' },
  ]);

  // Decisions list section 7
  const [decisions, setDecisions] = useState<SCMDecision[]>([
    {
      id: 'DEC-INV-001',
      title: 'EmergencyXLPE Conductor Reorder Authorization',
      category: 'Emergency direct',
      recommendation: 'Authorize immediate direct award protocol for 3,000 meters of double-circuit conductor cable under PPADA Section 103 due to Isinya depot buffer deficit.',
      confidence: 94.2,
      evidence: [
        { label: 'Mariakani Warehouse Active Stock (0 Kits)', urn: 'urn:atlas:salience:mariakani:xlpe-zero' },
        { label: 'Suswa Lot 4 active line alignment testing schedule', urn: 'urn:atlas:salience:suswa-lot4:timeline-critical' }
      ],
      risks: [
        { risk: 'Supplier price mark-up (+12% for emergency delivery)', severity: 'Medium' }
      ] as any,
      alternatives: [
        { option: 'Air-freight Direct Sourcing (Shanghai)', cost: 'KES 24.8M', timeline: '4 Days (Immediate)', risk: 'Low Grid Risk' },
        { option: 'Restricted Tenders (East Africa pre-qual)', cost: 'KES 19.2M', timeline: '45 Days', risk: 'High Blackout Threat' }
      ],
      approved: false
    },
    {
      id: 'DEC-INV-002',
      title: 'Mariakani Over-Buffer Stock Allocation Shift',
      category: 'Stock Transfer',
      recommendation: 'Reallocate 12 Heavy Circuit Breakers from Mariakani Port Zone to Nairobi Gantry Depot. Balancing storage utilization factors.',
      confidence: 88.5,
      evidence: [
        { label: 'Mariakani Bay Space capacity saturation (91%)', urn: 'urn:atlas:salience:mariakani:space-limit' }
      ],
      risks: [
        { risk: 'In-transit flatbed transit risk', severity: 'Low' }
      ] as any,
      alternatives: [
        { option: 'Road Transfer Allocation Shift', cost: 'KES 420K', timeline: '2 Days', risk: 'Low' },
        { option: 'Construct temporary yard cover', cost: 'KES 3.2M', timeline: '20 Days', risk: 'High Capital Waste' }
      ],
      approved: true,
      signer: 'Eng. J. Kamau (Admin)',
      date: '2026-06-22 11:30'
    }
  ]);

  // Active item in the Decisions screen
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>('DEC-INV-001');

  // =========================================================
  // ENTERPRISE INTELLIGENCE STATE EXTENSIONS
  // =========================================================
  const [ledgerTransactions, setLedgerTransactions] = useState([
    { id: 'TX-9382', timestamp: '2026-06-23 04:15 EAT', type: 'RECEIPT', materialCode: 'MAT-402830', quantity: 2000, warehouseId: 'Mombasa Port Depot', operatorId: 'OPERATOR-04', hash: 'sha256_e10a66f', projectRef: 'N/A' },
    { id: 'TX-8921', timestamp: '2026-06-23 04:30 EAT', type: 'ISSUE', materialCode: 'MAT-293810', quantity: 1, warehouseId: 'Central Warehouse Nairobi', operatorId: 'OPERATOR-08', hash: 'sha256_b34c990', projectRef: 'Nairobi Infill' },
    { id: 'TX-7231', timestamp: '2026-06-22 17:00 EAT', type: 'TRANSFER', materialCode: 'MAT-884029', quantity: 150, warehouseId: 'Isinya Transformer Yard', operatorId: 'OPERATOR-01', hash: 'sha256_fa830ce', projectRef: 'Suswa Lot-4' },
    { id: 'TX-6124', timestamp: '2026-06-22 10:20 EAT', type: 'ADJUSTMENT', materialCode: 'MAT-102930', quantity: -3, warehouseId: 'Central Warehouse Nairobi', operatorId: 'AUDITOR-SYS', hash: 'sha256_d1e84aa', projectRef: 'Sys audit' },
    { id: 'TX-5021', timestamp: '2026-06-21 09:12 EAT', type: 'RETURN', materialCode: 'MAT-504928', quantity: 45, warehouseId: 'Isinya Transformer Yard', operatorId: 'OPERATOR-11', hash: 'sha256_0ca1a8b', projectRef: 'Line excavation' }
  ]);

  const [receivingContracts, setReceivingContracts] = useState([
    { id: 'REC-001', poReference: 'PO-602930', materialCode: 'MAT-402830', expectedQty: 3000, receivedQty: 3000, inspectionPassed: true, varianceDetected: false, qualityStatus: 'PASSED', approvalStatus: 'APPROVED', step: 'LEDGER_UPDATE' },
    { id: 'REC-002', poReference: 'PO-718290', materialCode: 'MAT-293810', expectedQty: 2, receivedQty: 2, inspectionPassed: true, varianceDetected: false, qualityStatus: 'PASSED', approvalStatus: 'PENDING', step: 'QUALITY_ACCEPTANCE' },
    { id: 'REC-003', poReference: 'PO-882031', materialCode: 'MAT-884029', expectedQty: 500, receivedQty: 480, inspectionPassed: true, varianceDetected: true, qualityStatus: 'PENDING', approvalStatus: 'PENDING', step: 'TECHNICAL_INSPECTION' }
  ]);

  const [issuingRequests, setIssuingRequests] = useState([
    { id: 'ISS-011', requestId: 'REQ-SCM-112', materialCode: 'MAT-402830', requestedQty: 400, projectRef: 'Suswa Lot-4 Link', purpose: 'CONSTRUCTION_PROJECT', step: 'LEDGER_UPDATE', status: 'Completed', authorizedSigner: 'Eng. J. Kamau' },
    { id: 'ISS-012', requestId: 'REQ-SCM-119', materialCode: 'MAT-102930', requestedQty: 12, projectRef: 'Nairobi Gantry Depot', purpose: 'MAINTENANCE', step: 'PICKING', status: 'Approved', authorizedSigner: 'Eng. J. Kamau' },
    { id: 'ISS-013', requestId: 'REQ-SCM-122', materialCode: 'MAT-504928', requestedQty: 150, projectRef: 'Mariakani Line', purpose: 'OPERATIONS', step: 'APPROVAL', status: 'Draft', authorizedSigner: undefined }
  ]);

  // Master details
  const [viewingSkuCode, setViewingSkuCode] = useState<string>('MAT-402830');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('central-wh');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('ALL');
  const [activeSortOrder, setActiveSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [activeGroupField, setActiveGroupField] = useState<'NONE' | 'CATEGORY' | 'CRITICALITY'>('NONE');
  
  // Custom SKU Creation forms
  const [showAddSkuModal, setShowAddSkuModal] = useState(false);
  const [newSkuData, setNewSkuData] = useState({
    code: '', name: '', category: 'Conductors' as any, criticality: 'MEDIUM' as any,
    safetyStock: '100', reorderPoint: '150', uom: 'Units', supplier: ''
  });

  // ERP Synced Status Logs
  const [erpSyncLogs, setErpSyncLogs] = useState([
    { timestamp: '14:30 EAT', action: 'INBOUND_SYNC', status: 'Success', records: 142, system: 'SAP ECC Gateway' },
    { timestamp: '13:00 EAT', action: 'OUTBOUND_WRITEBACK', status: 'Success', records: 3, system: 'Oracle ERP Adapter' },
    { timestamp: '11:15 EAT', action: 'RECONCILIATION_RUN', status: 'Success', records: 5, system: 'Dynamics 365 Sync' }
  ]);

  // Interactive warehouse node points map coordinates
  const warehouseNodes = [
    { id: 'central-wh', name: 'CENTRAL WAREHOUSE', label: 'Main Gantry Storage', x: 25, y: 55, util: '68%', status: 'optimal', details: 'Nairobi Infill Hub. Holds all high tension breakers.' },
    { id: 'cable-depot', name: 'HV CABLE DEPOT', label: 'Mombasa Port Hub', x: 44, y: 32, util: '82%', status: 'high', details: 'Marine atmosphere. Contains salt-insulated conductors.' },
    { id: 'transformer-yard', name: 'TRANSFORMER YARD', label: 'Isinya Terminal', x: 62, y: 45, util: '74%', status: 'optimal', details: 'Continuous nitrogen charging substation vault.' },
    { id: 'project-a', name: 'PROJECT SITE A', label: 'Suswa Lot-4 Link', x: 74, y: 64, util: '35%', status: 'normal', details: 'Active transmission assembly. Gantry steel construction.' },
    { id: 'project-b', name: 'PROJECT SITE B', label: 'Mariakani Line', x: 50, y: 78, util: '22%', status: 'low', details: 'Auxiliary grounding installation. Line excavation phase.' },
  ];

  // Execute interactive command chats section 5 & 6 (Agentic OS standard)
  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatLog(prev => [...prev, `User: ${userText}`]);
    setChatInput('');

    // Simulated parsing of agent actions
    setTimeout(() => {
      let reply = '';
      const promptLower = userText.toLowerCase();

      if (promptLower.includes('sim') || promptLower.includes('scenario') || promptLower.includes('shock')) {
        reply = 'Commander Agent: Intercepted simulation directive. Triggering simulation logic for Scenario [SUPPLIER_FAILURE]. Running stress analysis across connected contract nodes. Calculated lead delay = +45 days. Impact delta compiled.';
        handleRunScenario('supplier_failure');
      } else if (promptLower.includes('stock') || promptLower.includes('cable') || promptLower.includes('quantity')) {
        reply = 'Inventory Commander Agent: Active query detected on MAT-402830 XLPE Conductor. Currently, Central Warehouse has 1,250 meters. Reserved quantity is 800. Expected depletion rate suggests safety buffer trigger in 11 days. Generating reorder draft: 3,000 recommended.';
      } else if (promptLower.includes('approve') || promptLower.includes('sign') || promptLower.includes('ppada')) {
        reply = 'Compliance Agent: Evaluating PPADA Section authorization rules. Current critical reorder requires Level 5 pin. Directing user input field to approvals modal interface.';
        setShowApprovalModal(true);
      } else {
        reply = `Inventory Commander Agent: Command logged within KETRACO SCM Context. Query: "${userText}". All sub-agents (Risk, demand planning, compliance) remain synchronized with SAP ECC core adapter. System health nominal. Let me know if you would like to run scenario stress models.`;
      }
      setChatLog(prev => [...prev, `${reply}`]);
      onAskCopilot(`Simulate Inventory Command Center query responses for KETRACO project buffers. Prompt: "${userText}"`);
    }, 1000);
  };

  // Run Scenario Simulation section 8
  const handleRunScenario = (scenarioId: string) => {
    setIsSimulating(true);
    setActiveScenario(scenarioId);
    
    setTimeout(() => {
      setIsSimulating(false);
      if (scenarioId === 'supplier_failure') {
        setSimImpact({
          costDelta: 140000,
          delayDays: 14,
          activeEscalations: 342,
          scenario: 'Shanghai Grid Metal Corp Port Deficit Strike'
        });
        setMaterials(prev => prev.map(m => {
          if (m.id === 'MAT-402830') {
            return { ...m, leadTime: 95, currentQty: 450, availableQty: 50 }; // drastically decrease stocks & raise lead time
          }
          return m;
        }));
        setEvents(prev => [
          { timestamp: 'Just now', agent: 'Simulation Engine', message: 'CRITICAL SHOCK APPLIED: Lead-time on cable imports delayed to 95 days', type: 'alert' },
          ...prev
        ]);
        setShowNotification('SYSTEM ALERT: Shanghai Port Supplier Failure Shock Simulated successfully.');
      } else if (scenarioId === 'demand_spike') {
        setSimImpact({
          costDelta: 45000,
          delayDays: 3,
          activeEscalations: 255,
          scenario: 'Monsoon grounding overcurrent surge'
        });
        setMaterials(prev => prev.map(m => {
          if (m.category === 'Earthing Kits') {
            return { ...m, reservedQty: 440, reorderPoint: 400 }; // raise thresholds
          }
          return m;
        }));
        setEvents(prev => [
          { timestamp: 'Just now', agent: 'Simulation Engine', message: 'DEMAND SHOCK APPLIED: Regional earthing kit safety threshold raised by 33%', type: 'warn' },
          ...prev
        ]);
        setShowNotification('SYSTEM TRIGGER: Heavy Monsoon weather model demand spikes loaded.');
      } else {
        // Reset
        setSimImpact({ costDelta: 0, delayDays: 0, activeEscalations: 23, scenario: 'None' });
        setMaterials(prev => [
          { id: 'MAT-402830', name: 'XLPE Insulated Conductor 132kV', category: 'Conductors', materialGroup: 'SG-08-CABLES', criticality: 'CRITICAL_SPARE', location: 'BAY-04-C', warehouse: 'Mombasa Port Depot', currentQty: 1250, reservedQty: 800, availableQty: 450, safetyStock: 1500, reorderPoint: 1500, unit: 'Meters', leadTime: 42, supplier: 'Shanghai Grid Metal Corp' },
          { id: 'MAT-293810', name: 'High-Capacity EHV Transformer 220kV', category: 'Transformers', materialGroup: 'SG-11-TRANS', criticality: 'CRITICAL_SPARE', location: 'B-BAY-01', warehouse: 'Central Warehouse Nairobi', currentQty: 3, reservedQty: 2, availableQty: 1, safetyStock: 2, reorderPoint: 2, unit: 'Units', leadTime: 120, supplier: 'ABB Grid Systems Ltd' },
          { id: 'MAT-884029', name: 'Polymer Insulator Suspension Clamps', category: 'Insulators', materialGroup: 'SG-14-INSUL', criticality: 'HIGH', location: 'BAY-12-D', warehouse: 'Isinya Transformer Yard', currentQty: 320, reservedQty: 300, availableQty: 20, safetyStock: 100, reorderPoint: 150, unit: 'Units', leadTime: 30, supplier: 'Deccan India Insulators Ltd' },
          { id: 'MAT-102930', name: 'Sulfur Hexafluoride Gas Circuit Breaker', category: 'Circuit Breakers', materialGroup: 'SG-03-SWITCH', criticality: 'MEDIUM', location: 'A-BAY-05', warehouse: 'Central Warehouse Nairobi', currentQty: 142, reservedQty: 60, availableQty: 82, safetyStock: 50, reorderPoint: 60, unit: 'Kits', leadTime: 75, supplier: 'Schneider Electric SAS' },
          { id: 'MAT-504928', name: 'Earthing Connection Copper Rods 3m', category: 'Earthing Kits', materialGroup: 'SG-01-EARTH', criticality: 'HIGH', location: 'BAY-09', warehouse: 'Isinya Transformer Yard', currentQty: 450, reservedQty: 400, availableQty: 50, safetyStock: 200, reorderPoint: 300, unit: 'Units', leadTime: 15, supplier: 'Metals East Africa Ltd' },
        ]);
        setEvents(prev => [
          { timestamp: 'Just now', agent: 'Simulation Engine', message: 'SYSTEM PARAMETERS RESTORED: Sandbox buffers normalized.', type: 'info' },
          ...prev
        ]);
      }
    }, 1800);
  };

  // Sign Decision via cryptographic PIN section 11
  const handleExecuteConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signaturePin) return;

    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setSigningSuccess(true);
      setDecisions(prev => prev.map(d => {
        if (d.id === selectedDecisionId) {
          return {
            ...d,
            approved: true,
            signer: 'Admin (MND/SCM/L5 Signed)',
            date: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' EAT'
          };
        }
        return d;
      }));
      setEvents(prev => [
        { timestamp: 'Just now', agent: 'Compliance Gatekeeper', message: `CRYPTOGRAPHIC SIGNATURE WRITTEN: Decision ${selectedDecisionId} committed. Write registered in SAP queue buffer.`, type: 'success' },
        ...prev
      ]);
      onAskCopilot(`Committed high-value PPADA signature on local Salience Ledger. Reference: ${selectedDecisionId}. Explanatory rationale: "${approvalComment}"`);
      setTimeout(() => {
        setShowApprovalModal(false);
        setSigningSuccess(false);
        setSignaturePin('');
        setApprovalComment('');
      }, 1500);
    }, 1600);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col font-sans bg-[#02040b] text-slate-100" id="inventory-intelligence-hub-root">
      
      {/* 1. TOP NAV WORKSPACE BAR (Mockup design alignment) */}
      <div className="p-4 bg-slate-950/70 border-b border-indigo-950/40 flex flex-wrap justify-between items-center gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-950 to-slate-900 border border-cyan-500/30 rounded-xl">
            <Warehouse className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">SALIENCE ATLAS V2</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[9px] font-mono text-cyan-400">LEDGER_SYNC_ONLINE</span>
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-white uppercase">Inventory Intelligence Hub</h1>
          </div>
        </div>

        {/* Workspace Central Search bar with shortcut indicator */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Ask Atlas or search anything... (e.g. XLPE safety margin)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500/45 rounded-xl pl-10 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          <kbd className="absolute right-3 top-2.5 px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-[9px] font-mono text-slate-400 rounded">⌘K</kbd>
        </div>

        {/* Administrator Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right leading-none hidden xl:block">
            <span className="text-xs font-bold text-slate-200 block">Eng. John Kamau</span>
            <span className="text-[9px] font-mono text-slate-400 block mt-1">System Administrator</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 border border-cyan-400/20 flex items-center justify-center font-bold text-xs text-white">
            JK
          </div>
        </div>
      </div>

      {/* Dynamic Pop notification toast */}
      {showNotification && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,217,255,0.15)] rounded-2xl p-4.5 max-w-sm flex items-start gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white block">Event Broker Update</span>
            <p className="text-slate-350 mt-1 leading-snug">{showNotification}</p>
          </div>
        </div>
      )}

      {/* 2. MAIN SUB-METRICS TICKER (Section 13 Observability) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 p-4 border-b border-indigo-950/40 bg-[#040815]/30">
        
        {/* Metric Card 1 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-1 hover:border-slate-800/80 transition-all">
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">TOTAL INVENTORY VALUE</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-mono font-bold text-white">KES 24.8B</span>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center">↑ 8.4%</span>
          </div>
          <p className="text-[9px] text-slate-500 font-sans">Active asset pool value</p>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-1 hover:border-slate-800/80 transition-all">
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">AVAILABLE STOCK</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-mono font-bold text-white">KES 16.4B</span>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center">↑ 6.7%</span>
          </div>
          <p className="text-[9px] text-slate-500 font-sans">Uncommitted free spares</p>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-1 hover:border-slate-800/80 transition-all">
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">AT RISK STOCK</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-mono font-bold text-rose-500">KES 3.2B</span>
            <span className="text-[9px] font-mono text-rose-400 flex items-center">↑ 12.3%</span>
          </div>
          <p className="text-[9px] text-slate-500 font-sans">Inside active threat sectors</p>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-1 hover:border-slate-800/80 transition-all">
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">CRITICAL ITEMS</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-mono font-bold text-amber-500">{simImpact.activeEscalations}</span>
            <span className="text-[9px] font-mono text-amber-500 flex items-center">Require attention</span>
          </div>
          <p className="text-[9px] text-slate-500 font-sans">EHV transformers & lines</p>
        </div>

        {/* Metric Card 5 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-1 hover:border-slate-800/80 transition-all">
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">PENDING APPROVALS</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-mono font-bold text-white">18</span>
            <span className="text-[9px] font-mono text-cyan-400 flex items-center">6 escalated</span>
          </div>
          <p className="text-[9px] text-slate-500 font-sans">Requires Level 5 PIN credentials</p>
        </div>

        {/* Metric Card 6 */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4.5 space-y-1 hover:border-slate-800/80 transition-all">
          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-wider">ACTIVE AGENTS</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-mono font-bold text-emerald-400">14</span>
            <span className="text-[9px] font-mono text-emerald-400 font-semibold">Nominal Health</span>
          </div>
          <p className="text-[9px] text-slate-500 font-sans">SCM Agent OS running</p>
        </div>
      </div>

      {/* 3. MULTI-PANEL SPLIT VIEW */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 xl:grid-cols-12">
        
        {/* ==================== LEFT COLLAPSIBLE SUB-NAVIGATION SIDEBAR ==================== */}
        <div className="xl:col-span-2 border-r border-indigo-950/40 flex flex-col justify-between bg-slate-950/60 overflow-y-auto">
          <div className="p-3 space-y-4">
            <span className="text-[9px] font-mono text-slate-505 block tracking-widest pl-2">INVENTORY DOMAIN</span>
            <div className="space-y-1">
              {[
                { tabId: 'command-center', label: 'Command Center', icon: Warehouse },
                { tabId: 'items', label: 'Items (Master SKU)', icon: Layers },
                { tabId: 'warehouses', label: 'Warehouses Network', icon: Map },
                { tabId: 'ledger', label: 'Immutable Ledger', icon: History },
                { tabId: 'receiving', label: 'Goods Receiving', icon: CheckCircle },
                { tabId: 'issuing', label: 'Material Issuing', icon: Send },
                { tabId: 'forecasting', label: 'Demand Forecasting', icon: TrendingUp },
                { tabId: 'optimization', label: 'Stock Optimization', icon: Sliders },
                { tabId: 'ai-agents', label: 'AI Cognitive Agents', icon: Cpu },
                { tabId: 'audit', label: 'SCM Governance (PPADA)', icon: ShieldCheck }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = activeSubTab === item.tabId;
                return (
                  <button
                    key={item.tabId}
                    onClick={() => setActiveSubTab(item.tabId)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-cyan-500/20 text-[#00D9FF] shadow-[0_0_12px_rgba(0,217,255,0.06)]' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#00D9FF]' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core System Health meter at the bottom of the sidebar */}
          <div className="p-4 border-t border-indigo-950/40 space-y-3.5 bg-[#030610]/40">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">SYSTEM HEALTH</span>
            <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="22" cy="22" r="18" fill="transparent" stroke="#0f172a" strokeWidth="3" />
                  <circle cx="22" cy="22" r="18" fill="transparent" stroke="#00d9ff" strokeWidth="3" strokeDasharray="113" strokeDashoffset="4" className="animate-pulse" />
                </svg>
                <span className="absolute text-[10px] font-mono font-bold text-[#00D9FF]">96%</span>
              </div>
              <div className="leading-tight">
                <span className="text-[11px] font-bold text-white block">OPERATIONAL</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">All Systems Nominal</span>
              </div>
            </div>
            <div className="text-[9px] font-mono text-slate-600 text-center uppercase tracking-widest">
              SALIENCE ATLAS V2
            </div>
          </div>
        </div>

        {/* ==================== CENTER OPERATIONAL PANEL (10 columns) ==================== */}
        <div className="xl:col-span-10 flex flex-col justify-between overflow-y-auto bg-[#020308]/60">
          
          {/* DYNAMIC TAB CONTROLLERS */}

          {/* TAB 1: COMMAND CENTER (Matches primary mockup view) */}
          {activeSubTab === 'command-center' && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* 1. MAP VIEW COMPONENT: Digital Twin abstract mesh (Left: 8 cols) */}
                <div className="lg:col-span-8 bg-slate-950/40 border border-slate-905 rounded-3xl p-5 space-y-4 relative flex flex-col justify-between min-h-[440px] shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)]">
                  
                  {/* Map Header details */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase font-bold">INVENTORY DIGITAL TWIN // LIVE STATE VIEW</span>
                      </div>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-sans">
                        Regional substation spares storage and capacity vectors. Click any node point to read deep structural data logs.
                      </p>
                    </div>

                    {/* Filter controls */}
                    <div className="flex items-center gap-1.5">
                      <select className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-350 pr-8 pl-3.5 py-1.5 rounded-lg focus:outline-none">
                        <option>All Warehouses</option>
                        <option>Central Warehouse</option>
                        <option>Mombasa Port Depot</option>
                      </select>
                      <select className="bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-350 pr-8 pl-3.5 py-1.5 rounded-lg focus:outline-none">
                        <option>Risk View</option>
                        <option>Capacity view</option>
                      </select>
                    </div>
                  </div>

                  {/* ABSTRACT NEON BLUEPRINT MAP BACKGROUND GRID */}
                  <div className="flex-1 min-h-[280px] relative border border-slate-900/60 rounded-2xl bg-[#030614]/70 overflow-hidden flex items-center justify-center p-4">
                    {/* Perspective grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_100%,transparent_120%)]"></div>
                    
                    {/* Visual wire frame link vectors */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="25%" y1="55%" x2="44%" y2="32%" stroke="rgba(0,217,255,0.25)" strokeWidth="1.5" strokeDasharray="3,3" />
                      <line x1="44%" y1="32%" x2="62%" y2="45%" stroke="rgba(0,217,255,0.25)" strokeWidth="1.5" strokeDasharray="3,3" />
                      <line x1="62%" y1="45%" x2="74%" y2="64%" stroke="rgba(0,217,255,0.25)" strokeWidth="1.5" strokeDasharray="3,3" />
                      <line x1="62%" y1="45%" x2="50%" y2="78%" stroke="rgba(0,217,255,0.25)" strokeWidth="1.5" strokeDasharray="3,3" />
                    </svg>

                    {/* Interactive depot node points */}
                    {warehouseNodes.map(node => (
                      <button
                        key={node.id}
                        onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                        className="absolute group text-left transition-all active:scale-95"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      >
                        {/* Dynamic status ring */}
                        <div className="relative flex items-center justify-center">
                          <span className={`absolute inline-flex h-7 w-7 rounded-full opacity-35 ${
                            node.status === 'optimal' ? 'bg-emerald-405/30 border border-emerald-500' :
                            node.status === 'high' ? 'bg-amber-505/30 border border-amber-500' :
                            node.status === 'normal' ? 'bg-cyan-505/30 border border-cyan-500' : 'bg-red-505/30 border border-red-500'
                          } animate-ping`}></span>
                          
                          <div className={`w-3.5 h-3.5 rounded-full border border-slate-950 flex items-center justify-center font-black ${
                            node.status === 'optimal' ? 'bg-emerald-400' :
                            node.status === 'high' ? 'bg-amber-500' :
                            node.status === 'normal' ? 'bg-[#00D9FF]' : 'bg-red-500'
                          }`}></div>
                        </div>

                        {/* Interactive floating descriptive info card */}
                        <div className="absolute left-5 -top-4 w-44 bg-slate-950/90 border border-slate-900 rounded-lg p-2.5 shadow-xl pointer-events-none group-hover:opacity-100 opacity-90 transition-opacity z-10 leading-normal">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">{node.name}</span>
                          <div className="flex justify-between items-baseline mt-0.5">
                            <span className="text-[10px] font-bold text-white">{node.label}</span>
                            <span className="text-[9px] font-mono text-cyan-400">{node.util} Util</span>
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* Node Detailed Projection Panel Overlay */}
                    {activeNode && (
                      <div className="absolute bottom-5 left-5 right-5 bg-slate-950/95 border border-[#00D9FF]/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.8)] z-10 animate-fade-in animate-slide-up">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-[#00D9FF]/20 uppercase">
                              SELECTED TWIN INSTANCE
                            </span>
                            <span className="text-xs font-bold text-white">
                              {warehouseNodes.find(n => n.id === activeNode)?.name}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            {warehouseNodes.find(n => n.id === activeNode)?.details}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onAskCopilot(`Explain active stock capacity and outstanding work orders for ${activeNode}`)}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-[10px] font-mono rounded-lg hover:text-white"
                          >
                            QUERY LOGS
                          </button>
                          <button 
                            onClick={() => setActiveSubTab('twin-viewer')}
                            className="px-3 py-1.5 bg-gradient-to-r from-cyan-950 to-indigo-950 text-[10px] font-mono text-cyan-405 border border-[#00D9FF]/20 rounded-lg"
                          >
                            OPEN TWIN VIEWER
                          </button>
                          <button 
                            onClick={() => setActiveNode(null)}
                            className="text-slate-550 hover:text-white text-xs pl-2.5 font-sans"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status legends at the bottom */}
                  <div className="flex flex-wrap justify-between items-center gap-3 border-t border-slate-900/60 pt-3 text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Optimal
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00D9FF]"></span> Normal
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> High Risk
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span>Auto Rotate</span>
                      <div className="w-7 h-4 bg-cyan-950 border border-cyan-500/20 rounded-full relative cursor-pointer flex items-center justify-end px-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. SIDEBAR RIGHT PANELS GRID (AI Recommendation & Risk matrix) (Right: 4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  
                  {/* Panel A: AI RECO REALLOCATION CARD */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-4.5 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute left-0 bottom-0 w-24 h-24 bg-cyan-600/5 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#c084fc] font-bold block tracking-wider uppercase">AI RECOMMENDATION</span>
                        <h3 className="text-sm font-bold text-slate-150">Reorder Recommendation</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-950/50 border border-amber-900/40 text-[9px] font-mono text-amber-500 rounded uppercase font-bold tracking-wider">
                        HIGH PRIORITY
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-sans">
                      Critical Spare: <strong className="text-white">XLPE Cable 132kV</strong>
                    </p>

                    {/* Stock parameters row */}
                    <div className="grid grid-cols-3 gap-2.5 py-1">
                      <div className="bg-slate-900/40 border border-slate-900/80 p-2 rounded-xl text-center leading-tight">
                        <span className="text-[8px] font-mono text-slate-500 block">CURRENT STOCK</span>
                        <span className="text-xs font-mono font-bold text-white block mt-0.5">1,250 m</span>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-900/80 p-2 rounded-xl text-center leading-tight">
                        <span className="text-[8px] font-mono text-slate-500 block">REORDER POINT</span>
                        <span className="text-xs font-mono font-bold text-[#00D9FF] block mt-0.5">1,500 m</span>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-900/80 p-2 rounded-xl text-center leading-tight">
                        <span className="text-[8px] font-mono text-slate-500 block">RECOMMENDED</span>
                        <span className="text-xs font-mono font-bold text-purple-400 block mt-0.5">3,000 m</span>
                      </div>
                    </div>

                    {/* Cable SVG cross section visual */}
                    <div className="flex items-center gap-4 bg-slate-900/30 p-3 rounded-2xl border border-slate-900 leading-normal">
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">REASONING TRACE</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                          Stock index fell 17% below critical line buffers. Monsoon thunderstorm predictions show elevated substation grounding stress over Q3.
                        </p>
                      </div>
                      
                      {/* High-tech CSS Wireframe vector representation (CABLE INSULATION SEGMENT CROSS SECTION) */}
                      <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Inner core */}
                          <circle cx="50" cy="50" r="14" fill="none" stroke="#a78bfa" strokeWidth="2.5" />
                          <circle cx="50" cy="50" r="8" fill="#818cf8" />
                          {/* Conductor mesh segments */}
                          <circle cx="50" cy="50" r="26" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6,4" />
                          {/* Outer armor */}
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#00d9ff" strokeWidth="3" className="animate-pulse" />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pb-1">
                      <button 
                        onClick={() => setActiveSubTab('intelligence')}
                        className="py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white rounded-xl text-[10px] font-mono font-bold border border-slate-800 transition-colors"
                      >
                        VIEW ANALYSIS
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedDecisionId('DEC-INV-001');
                          setShowApprovalModal(true);
                        }}
                        className="py-2.5 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 text-cyan-300 border border-cyan-500/20 rounded-xl text-[10px] font-mono font-bold"
                      >
                        START APPROVAL
                      </button>
                    </div>
                  </div>

                  {/* Panel B: RISK ANALYSIS DONUT */}
                  <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-3 shadow-xl">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">INVENTORY RISK OVERVIEW</h4>
                      <button 
                        onClick={() => setActiveSubTab('risk-resilience')}
                        className="text-[10px] font-mono text-cyan-400 hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    <div className="flex items-center gap-6 py-1 bg-slate-900/20 p-3 rounded-2xl border border-slate-900/80">
                      {/* SVG donut chart */}
                      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          {/* Critical - Red (20%) */}
                          <circle cx="48" cy="48" r="34" fill="transparent" stroke="#ef4444" strokeWidth="9" strokeDasharray="213" strokeDashoffset="170.4" />
                          {/* High - Yellow (28%) */}
                          <circle cx="48" cy="48" r="34" fill="transparent" stroke="#f59e0b" strokeWidth="9" strokeDasharray="213" strokeDashoffset="110.7" className="transform origin-center rotate-[72deg]" />
                          {/* Medium - Blue (33%) */}
                          <circle cx="48" cy="48" r="34" fill="transparent" stroke="#00d9ff" strokeWidth="9" strokeDasharray="213" strokeDashoffset="40.2" className="transform origin-center rotate-[172deg]" />
                        </svg>
                        <div className="absolute text-center leading-none">
                          <span className="text-xs font-mono font-black text-white block">342</span>
                          <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">Risks</span>
                        </div>
                      </div>

                      {/* Legends */}
                      <div className="space-y-1.5 flex-1 font-mono text-[9px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical
                          </span>
                          <span className="text-white ml-2">68 (20%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> High
                          </span>
                          <span className="text-white ml-2">96 (28%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00D9FF]"></span> Medium
                          </span>
                          <span className="text-white ml-2">112 (33%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-650"></span> Low
                          </span>
                          <span className="text-white ml-2">66 (19%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. ROW 3: AGENT WORKFORCE CORE CONTAINER & REAL-TIME LOG FEED PANEL SPLIT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Agent Workforce display (Left: 8 cols) */}
                <div className="lg:col-span-8 bg-slate-950/40 border border-slate-905 rounded-3xl p-5 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black tracking-wider uppercase text-slate-300">INVENTORY AGENT WORKFORCE</h4>
                      <p className="text-[10px] text-slate-505 leading-none">
                        Active autonomous intelligence controllers validating SCM thresholds.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveSubTab('agent-workforce')}
                      className="text-[10px] font-mono text-[#00D9FF] hover:underline"
                    >
                      Audit OS Terminal
                    </button>
                  </div>

                  {/* Active Agent row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
                    {[
                      { id: 'com', name: 'Commander', role: 'Domain orchestrator', avatarBg: 'from-blue-600 to-indigo-600' },
                      { id: 'for', name: 'Forecast Agent', role: 'Demand planning analytics', avatarBg: 'from-purple-600 to-indigo-600' },
                      { id: 'risk', name: 'Risk Agent', role: 'Vulnerability monitors', avatarBg: 'from-amber-600 to-red-600' },
                      { id: 'opt', name: 'Optimization', role: 'Safety replenishment', avatarBg: 'from-cyan-600 to-blue-600' },
                      { id: 'comply', name: 'Compliance', role: 'PPADA statute checker', avatarBg: 'from-emerald-600 to-teal-600' },
                      { id: 'recon', name: 'ERP Sync', role: 'SAP live bridge reconciler', avatarBg: 'from-teal-600 to-indigo-600' },
                    ].map(agent => (
                      <div 
                        key={agent.id} 
                        className="bg-slate-900/40 border border-slate-900 rounded-2xl p-3 text-center flex flex-col justify-between items-center space-y-3 hover:border-slate-800 transition-all"
                      >
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${agent.avatarBg} border border-white/10 flex items-center justify-center font-black text-xs text-white`}>
                          {agent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="leading-tight">
                          <span className="text-[11px] font-bold text-slate-100 block">{agent.name}</span>
                          <span className="text-[9px] text-slate-500 block truncate max-w-[90px] mt-1">{agent.role}</span>
                        </div>
                        <button
                          onClick={() => setActiveAgent(agent.name)}
                          className="w-full py-1 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg text-[9px] font-mono font-medium transition-colors"
                        >
                          Interact
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Logistics & Feed component (Right: 4 cols) */}
                <div className="lg:col-span-4 bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-3.5 flex flex-col justify-between">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-black tracking-wider uppercase text-slate-350">INVENTORY INTELLIGENCE FEED</h4>
                    <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-405">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span> Live updates
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
                    {events.map((ev, idx) => (
                      <div key={idx} className="flex gap-2.5 text-[11px] leading-relaxed border-b border-indigo-950/20 pb-2">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          ev.type === 'success' ? 'bg-emerald-420 text-emerald-420' :
                          ev.type === 'warn' ? 'bg-amber-420 text-amber-500' :
                          ev.type === 'alert' ? 'bg-rose-500 text-rose-500' : 'bg-[#00D9FF]'
                        }`}></span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold">{ev.timestamp} // {ev.agent}</span>
                          <p className="text-slate-300 font-sans">{ev.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setActiveSubTab('audit-compliance')}
                    className="w-full py-2 bg-slate-900/60 border border-slate-800 hover:text-white text-xs font-mono font-bold text-slate-350 rounded-xl transition-colors"
                  >
                    View All Events
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: ITEMS (Item Specifications Catalog) */}
          {activeSubTab === 'items' && (
            <ItemMasterPanel
              materials={materials}
              setMaterials={setMaterials}
              viewingSkuCode={viewingSkuCode}
              setViewingSkuCode={setViewingSkuCode}
              onAskCopilot={onAskCopilot}
            />
          )}

          {/* TAB 3: WAREHOUSES (Warehouse Network mapping) */}
          {activeSubTab === 'warehouses' && (
            <WarehouseMapPanel
              selectedWarehouseId={selectedWarehouseId}
              setSelectedWarehouseId={setSelectedWarehouseId}
              onAskCopilot={onAskCopilot}
            />
          )}

          {/* TAB 4: LEDGER (Immutable ledger audit trail) */}
          {activeSubTab === 'ledger' && (
            <LedgerEnginePanel
              ledgerTransactions={ledgerTransactions}
              setLedgerTransactions={setLedgerTransactions}
              onAskCopilot={onAskCopilot}
            />
          )}

          {/* TAB 5: RECEIVING (Goods Inbound workflow) */}
          {activeSubTab === 'receiving' && (
            <ReceivingIntelPanel
              receivingContracts={receivingContracts}
              setReceivingContracts={setReceivingContracts}
              materials={materials}
              setLedgerTransactions={setLedgerTransactions}
              onAskCopilot={onAskCopilot}
            />
          )}

          {/* TAB 6: ISSUING (Material consumption dispatching gateway) */}
          {activeSubTab === 'issuing' && (
            <IssuingIntelPanel
              issuingRequests={issuingRequests}
              setIssuingRequests={setIssuingRequests}
              materials={materials}
              setMaterials={setMaterials}
              setLedgerTransactions={setLedgerTransactions}
              onAskCopilot={onAskCopilot}
            />
          )}

          {/* TAB 7: FORECASTING (Demand and Shortage projection curves) */}
          {activeSubTab === 'forecasting' && (
            <ForecastingPanel
              onAskCopilot={onAskCopilot}
            />
          )}

          {/* TAB 8: OPTIMIZATION (Safety stock & EOQ model algorithms) */}
          {activeSubTab === 'optimization' && (
            <OptimizationPanel
              onAskCopilot={onAskCopilot}
            />
          )}

          {/* TAB 9: AI AGENTS (Workforce telemetry profiles) */}
          {activeSubTab === 'ai-agents' && (
            <AiAgentsPanel
              onAskCopilot={onAskCopilot}
              setActiveAgent={setActiveAgent}
            />
          )}

          {/* TAB 10: AUDIT (SCM Governance and PPADA authorization) */}
          {activeSubTab === 'audit' && (
            <AuditGovernancePanel
              decisions={decisions}
              setDecisions={setDecisions}
              selectedDecisionId={selectedDecisionId}
              setSelectedDecisionId={setSelectedDecisionId}
              onAskCopilot={onAskCopilot}
              onOpenApprovalModal={(id) => {
                setSelectedDecisionId(id);
                setShowApprovalModal(true);
              }}
            />
          )}

          {/* =========================================================
              4. BOTTOM GLOWING NATURAL DIALOGUE INPUT CONTROLLER
          ========================================================= */}
          <div className="p-4.5 bg-slate-950/80 border-t border-indigo-950/40 shrink-0">
            <form onSubmit={handleSendCommand} className="max-w-4xl mx-auto flex items-center gap-3 relative">
              <div className="absolute left-4.5 top-3 w-2 h-2 rounded-full bg-cyan-405 animate-pulse"></div>
              
              <input 
                type="text" 
                placeholder="Ask Atlas anything about inventory... (e.g. Run simulation of Shanghai supplier failure)"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full bg-slate-900/40 border border-[#00D9FF]/25 focus:border-[#00D9FF]/50 rounded-2xl pl-10 pr-24 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-[0_0_15px_rgba(0,217,255,0.04)]"
              />

              <div className="absolute right-4 top-2.5 flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => onAskCopilot("Draft a detailed procurement advisory memorandum comparing the options and compliance safeguards of the critical spares reorder.")}
                  title="Speak voice prompt"
                  className="p-1 px-2.5 bg-slate-955 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="submit"
                  className="p-1 px-3 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 text-cyan-405 border border-cyan-500/25 rounded-lg text-[10.5px] font-mono font-bold"
                >
                  SEND
                </button>
              </div>
            </form>

            <div className="max-w-4xl mx-auto mt-2.5 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span className="truncate">Nairobi, Kenya // Overcast // Temp: 24°C</span>
              <span className="shrink-0">May 11, 2025 14:32 EAT</span>
            </div>
          </div>

        </div>

      </div>

      {/* ==================== INTERACTIVE COGNITIVE AGENT OVERLAY DRAWER ==================== */}
      {activeAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900/95 border border-[#00D9FF]/30 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-[0_0_30px_rgba(0,217,255,0.15)] animate-slide-up leading-relaxed">
            <div className="flex justify-between items-baseline border-b border-indigo-950/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-mono text-xs text-cyan-400 font-extrabold uppercase">COGNITIVE AGENT MIND CONNECTED</span>
              </div>
              <h3 className="text-sm font-extrabold text-white">{activeAgent} Monitor</h3>
            </div>

            <p className="text-xs text-slate-300">
              Logged inside KETRACO SCM Context. This agent is actively monitoring the inventory and projects standard variables.
            </p>

            <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-900 font-mono text-[10.5px] text-slate-100 space-y-1.5 h-44 overflow-y-auto scrollbar-thin">
              <p className="text-[#00D9FF]">&gt; [REASONING TRACE STARTED FOR {activeAgent.toUpperCase()}]</p>
              <p>&gt; Indexing active warehouse capacity variables...</p>
              <p>&gt; Validating against PPADA 2015 statutory boundaries...</p>
              <p>&gt; Connecting SAP ECC materials buffer caches...</p>
              <p className="text-emerald-400">&gt; Status: Synchronized with SCM ledger pipeline balances.</p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  onAskCopilot(`Explain active reasoning logic parameters and rules set for the ${activeAgent}`);
                  setActiveAgent(null);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 text-cyan-300 border border-cyan-500/20 rounded-xl text-xs font-mono font-bold"
              >
                REQUEST COGNITIVE BLUEPRINT
              </button>
              <button
                type="button"
                onClick={() => setActiveAgent(null)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-mono"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECURE PPADA MULTI-SIGNATURE MODAL GATEWAY ==================== */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in">
          <div className="bg-slate-950/95 border border-[#00D9FF]/20 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-[0_0_25px_rgba(0,217,255,0.1)] animate-slide-up">
            <div className="flex justify-between items-baseline border-b border-indigo-950/30 pb-3">
              <span className="text-[10px] font-mono text-[#00D9FF] uppercase tracking-wider font-extrabold block">
                STATUTORY HANDSHAKE LEDGER
              </span>
              <h2 className="text-xs font-extrabold text-white">LEVEL 5 PROCUREMENT APPROVAL</h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              You are applying your Level 5 compliance key to authorize draft decision <strong className="text-white">{selectedDecisionId}</strong>.
            </p>

            <form onSubmit={handleExecuteConsent} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Compliance Justification Statement</label>
                <input 
                  type="text" 
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="e.g. Critical spare stock depleted, grid failure risk in Isinya"
                  required
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-[#00D9FF]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold">Secure Security credential PIN</label>
                <input 
                  type="password" 
                  value={signaturePin}
                  onChange={(e) => setSignaturePin(e.target.value)}
                  placeholder="Enter credential PIN (e.g., 7788)"
                  required
                  className="w-full text-center bg-slate-900 border border-slate-800 text-sm font-mono tracking-widest text-[#00D9FF] rounded-lg p-2.5 focus:outline-none focus:border-[#00D9FF]/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSigning || !signaturePin}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 text-cyan-300 border border-cyan-500/25 rounded-xl text-xs font-mono font-bold cursor-pointer disabled:opacity-45"
                >
                  {isSigning ? 'COMMITTING LEDGER BLOCK...' : 'SIGN & COMMIT TRANS'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-sans"
                >
                  Cancel
                </button>
              </div>

              {signingSuccess && (
                <p className="text-xs font-mono text-emerald-400 text-center uppercase animate-pulse pt-1">
                  ✓ Success! Signed blockchain record committed to the SAP cache queue.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
