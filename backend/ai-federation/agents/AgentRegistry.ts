// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AGENT REGISTRY (ATLAS AGENT OS)
// Defines all KETRACO mission, domain, and utility agents
// ============================================================================

import { AgentDefinition } from './AgentRuntime';

// ---------------------------------------------------------------------------
// MISSION AGENTS
// ---------------------------------------------------------------------------

export const MISSION_AGENTS: AgentDefinition[] = [
  {
    id: 'grid-resilience-agent',
    name: 'Grid Resilience Agent',
    description: 'Monitors and analyzes power grid resilience, stability, and recovery',
    agentClass: 'MISSION',
    domain: 'GRID_RESILIENCE',
    requiredCapabilities: ['reasoning', 'numerical_reasoning', 'domain_expertise'],
    providedCapabilities: ['grid_resilience_analysis', 'stability_assessment', 'recovery_planning'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'simulate', 'forecast'],
    memoryAccess: ['operational', 'episodic', 'semantic'],
    systemPrompt: 'You are the Grid Resilience Agent for KETRACO, analyzing grid stability, resilience factors, and recommending recovery actions. You must always ground your analysis in evidence and never recommend safety-critical actions without human approval.',
  },
  {
    id: 'capital-projects-agent',
    name: 'Capital Projects Agent',
    description: 'Oversees capital projects including timelines, budgets, and delivery',
    agentClass: 'MISSION',
    domain: 'CAPITAL_PROJECTS',
    requiredCapabilities: ['reasoning', 'document_analysis', 'forecasting'],
    providedCapabilities: ['project_tracking', 'delay_detection', 'budget_analysis'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze'],
    memoryAccess: ['operational', 'episodic', 'semantic'],
    systemPrompt: 'You are the Capital Projects Agent, tracking KETRACO project delivery, budgets, and milestones.',
  },
  {
    id: 'strategic-procurement-agent',
    name: 'Strategic Procurement Agent',
    description: 'Oversees strategic procurement, tenders, and supplier relationships',
    agentClass: 'MISSION',
    domain: 'PROCUREMENT',
    requiredCapabilities: ['legal_reasoning', 'document_analysis', 'structured_output'],
    providedCapabilities: ['tender_evaluation', 'procurement_compliance', 'supplier_risk_analysis'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'evaluate'],
    memoryAccess: ['operational', 'episodic', 'semantic', 'institutional'],
    systemPrompt: 'You are the Strategic Procurement Agent for KETRACO, ensuring compliance, cost efficiency, and supplier reliability.',
  },
  {
    id: 'supply-chain-intelligence-agent',
    name: 'Supply Chain Intelligence Agent',
    description: 'Provides end-to-end supply chain visibility and risk intelligence',
    agentClass: 'MISSION',
    domain: 'SUPPLY_CHAIN',
    requiredCapabilities: ['reasoning', 'data_analysis', 'forecasting'],
    providedCapabilities: ['supply_chain_visibility', 'logistics_risk', 'inventory_optimization'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'forecast', 'simulate'],
    memoryAccess: ['operational', 'episodic', 'semantic'],
    systemPrompt: 'You are the Supply Chain Intelligence Agent, providing visibility into KETRACO supply chains.',
  },
  {
    id: 'asset-intelligence-agent',
    name: 'Asset Intelligence Agent',
    description: 'Monitors and manages critical infrastructure assets',
    agentClass: 'MISSION',
    domain: 'ASSET_MANAGEMENT',
    requiredCapabilities: ['reasoning', 'data_analysis', 'domain_expertise'],
    providedCapabilities: ['asset_health', 'maintenance_forecast', 'failure_prediction'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'forecast'],
    memoryAccess: ['operational', 'episodic', 'semantic'],
    systemPrompt: 'You are the Asset Intelligence Agent, monitoring KETRACO transformers, breakers, and substations.',
  },
  {
    id: 'risk-intelligence-agent',
    name: 'Risk Intelligence Agent',
    description: 'Identifies, assesses, and mitigates enterprise risks',
    agentClass: 'MISSION',
    domain: 'RISK_MANAGEMENT',
    requiredCapabilities: ['reasoning', 'data_analysis', 'legal_reasoning'],
    providedCapabilities: ['risk_assessment', 'compliance_checking', 'mitigation_planning'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'evaluate'],
    memoryAccess: ['operational', 'episodic', 'semantic', 'institutional'],
    systemPrompt: 'You are the Risk Intelligence Agent, identifying and mitigating risks across KETRACO operations.',
  },
  {
    id: 'regulatory-compliance-agent',
    name: 'Regulatory Compliance Agent',
    description: 'Ensures compliance with regulatory frameworks and standards',
    agentClass: 'MISSION',
    domain: 'COMPLIANCE',
    requiredCapabilities: ['legal_reasoning', 'document_analysis', 'citation'],
    providedCapabilities: ['compliance_checking', 'regulatory_analysis', 'audit_trail'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'evaluate'],
    memoryAccess: ['semantic', 'institutional'],
    systemPrompt: 'You are the Regulatory Compliance Agent, ensuring KETRACO operations comply with all regulations.',
  },
];

// ---------------------------------------------------------------------------
// DOMAIN AGENTS
// ---------------------------------------------------------------------------

export const DOMAIN_AGENTS: AgentDefinition[] = [
  {
    id: 'tender-evaluation-agent',
    name: 'Tender Evaluation Agent',
    description: 'Evaluates procurement tenders against compliance criteria',
    agentClass: 'DOMAIN',
    domain: 'PROCUREMENT',
    requiredCapabilities: ['structured_output', 'legal_reasoning', 'document_analysis'],
    providedCapabilities: ['tender_scoring', 'compliance_checking'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'evaluate'],
    memoryAccess: ['semantic', 'episodic'],
    systemPrompt: 'You are the Tender Evaluation Agent, scoring bids against PPADA and KETRACO criteria.',
  },
  {
    id: 'supplier-risk-agent',
    name: 'Supplier Risk Agent',
    description: 'Assesses supplier reliability and risk factors',
    agentClass: 'DOMAIN',
    domain: 'SUPPLY_CHAIN',
    requiredCapabilities: ['data_analysis', 'reasoning'],
    providedCapabilities: ['supplier_risk_analysis'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze'],
    memoryAccess: ['semantic', 'episodic'],
    systemPrompt: 'You are the Supplier Risk Agent, evaluating KETRACO supplier reliability and risk.',
  },
  {
    id: 'inventory-optimization-agent',
    name: 'Inventory Optimization Agent',
    description: 'Optimizes inventory levels and replenishment strategies',
    agentClass: 'DOMAIN',
    domain: 'SUPPLY_CHAIN',
    requiredCapabilities: ['data_analysis', 'forecasting'],
    providedCapabilities: ['inventory_optimization'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'forecast'],
    memoryAccess: ['operational', 'semantic'],
    systemPrompt: 'You are the Inventory Optimization Agent, managing KETRACO warehouse stock and replenishment.',
  },
  {
    id: 'substation-asset-agent',
    name: 'Substation Asset Agent',
    description: 'Monitors substation assets and health',
    agentClass: 'DOMAIN',
    domain: 'ASSET_MANAGEMENT',
    requiredCapabilities: ['reasoning', 'data_analysis'],
    providedCapabilities: ['substation_health', 'asset_monitoring'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['retrieve', 'analyze'],
    memoryAccess: ['operational'],
    systemPrompt: 'You are the Substation Asset Agent, monitoring KETRACO substation equipment health.',
  },
  {
    id: 'project-delay-agent',
    name: 'Project Delay Agent',
    description: 'Detects and analyzes project delivery delays',
    agentClass: 'DOMAIN',
    domain: 'CAPITAL_PROJECTS',
    requiredCapabilities: ['forecasting', 'data_analysis'],
    providedCapabilities: ['delay_detection'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'forecast'],
    memoryAccess: ['operational', 'episodic'],
    systemPrompt: 'You are the Project Delay Agent, detecting and analyzing KETRACO project delays.',
  },
  {
    id: 'contract-compliance-agent',
    name: 'Contract Compliance Agent',
    description: 'Verifies contract terms and compliance',
    agentClass: 'DOMAIN',
    domain: 'PROCUREMENT',
    requiredCapabilities: ['legal_reasoning', 'document_analysis', 'citation'],
    providedCapabilities: ['contract_compliance'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze'],
    memoryAccess: ['semantic', 'institutional'],
    systemPrompt: 'You are the Contract Compliance Agent, verifying KETRACO contracts against regulations.',
  },
  {
    id: 'maintenance-forecast-agent',
    name: 'Maintenance Forecast Agent',
    description: 'Forecasts maintenance needs for critical assets',
    agentClass: 'DOMAIN',
    domain: 'ASSET_MANAGEMENT',
    requiredCapabilities: ['forecasting', 'data_analysis', 'domain_expertise'],
    providedCapabilities: ['maintenance_forecast'],
    autonomyLevel: 'L1_RECOMMEND',
    allowedTools: ['retrieve', 'analyze', 'forecast'],
    memoryAccess: ['operational', 'semantic'],
    systemPrompt: 'You are the Maintenance Forecast Agent, predicting KETRACO maintenance requirements.',
  },
  {
    id: 'demand-forecast-agent',
    name: 'Demand Forecast Agent',
    description: 'Forecasts energy demand patterns',
    agentClass: 'DOMAIN',
    domain: 'GRID_RESILIENCE',
    requiredCapabilities: ['forecasting', 'data_analysis'],
    providedCapabilities: ['demand_forecast'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['retrieve', 'forecast'],
    memoryAccess: ['operational', 'semantic'],
    systemPrompt: 'You are the Demand Forecast Agent, predicting energy demand for KETRACO.',
  },
];

// ---------------------------------------------------------------------------
// UTILITY AGENTS
// ---------------------------------------------------------------------------

export const UTILITY_AGENTS: AgentDefinition[] = [
  {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Performs multi-source research and gathers information',
    agentClass: 'UTILITY',
    domain: 'RESEARCH',
    requiredCapabilities: ['reasoning', 'document_analysis', 'citation'],
    providedCapabilities: ['research', 'evidence_gathering'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['retrieve', 'search'],
    memoryAccess: ['semantic', 'episodic'],
    systemPrompt: 'You are the Research Agent, gathering and synthesizing evidence from multiple sources.',
  },
  {
    id: 'document-extraction-agent',
    name: 'Document Extraction Agent',
    description: 'Extracts structured data from documents',
    agentClass: 'UTILITY',
    domain: 'DOCUMENT_PROCESSING',
    requiredCapabilities: ['structured_output', 'document_analysis'],
    providedCapabilities: ['entity_extraction', 'data_extraction'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['retrieve', 'extract'],
    memoryAccess: ['semantic'],
    systemPrompt: 'You are the Document Extraction Agent, extracting structured data from KETRACO documents.',
  },
  {
    id: 'data-quality-agent',
    name: 'Data Quality Agent',
    description: 'Assesses and improves data quality',
    agentClass: 'UTILITY',
    domain: 'DATA_MANAGEMENT',
    requiredCapabilities: ['data_analysis', 'reasoning'],
    providedCapabilities: ['data_validation', 'quality_assessment'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['retrieve', 'analyze'],
    memoryAccess: ['operational'],
    systemPrompt: 'You are the Data Quality Agent, validating the quality of KETRACO data.',
  },
  {
    id: 'graph-query-agent',
    name: 'Graph Query Agent',
    description: 'Queries and reasons over knowledge graphs',
    agentClass: 'UTILITY',
    domain: 'KNOWLEDGE_GRAPH',
    requiredCapabilities: ['reasoning', 'structured_output'],
    providedCapabilities: ['graph_query', 'relationship_analysis'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['graph_query'],
    memoryAccess: ['semantic'],
    systemPrompt: 'You are the Graph Query Agent, querying the KETRACO knowledge graph.',
  },
  {
    id: 'simulation-agent',
    name: 'Simulation Agent',
    description: 'Runs scenarios and simulations',
    agentClass: 'UTILITY',
    domain: 'SIMULATION',
    requiredCapabilities: ['reasoning', 'domain_expertise'],
    providedCapabilities: ['scenario_simulation', 'impact_analysis'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['simulate'],
    memoryAccess: ['operational', 'semantic'],
    systemPrompt: 'You are the Simulation Agent, running scenarios for KETRACO operations.',
  },
  {
    id: 'report-agent',
    name: 'Report Agent',
    description: 'Generates structured reports and summaries',
    agentClass: 'UTILITY',
    domain: 'REPORTING',
    requiredCapabilities: ['summarization', 'structured_output'],
    providedCapabilities: ['report_generation', 'executive_briefing'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['retrieve', 'generate'],
    memoryAccess: ['semantic', 'episodic'],
    systemPrompt: 'You are the Report Agent, generating reports for KETRACO stakeholders.',
  },
  {
    id: 'forecasting-agent',
    name: 'Forecasting Agent',
    description: 'Generates forecasts for various operational domains',
    agentClass: 'UTILITY',
    domain: 'FORECASTING',
    requiredCapabilities: ['forecasting', 'data_analysis'],
    providedCapabilities: ['time_series_forecasting'],
    autonomyLevel: 'L0_AUTONOMOUS',
    allowedTools: ['retrieve', 'forecast'],
    memoryAccess: ['operational', 'semantic'],
    systemPrompt: 'You are the Forecasting Agent, generating accurate forecasts for KETRACO.',
  },
];

// ---------------------------------------------------------------------------
// FULL AGENT REGISTRY
// ---------------------------------------------------------------------------

export const ENTERPRISE_AGENTS: AgentDefinition[] = [
  ...MISSION_AGENTS,
  ...DOMAIN_AGENTS,
  ...UTILITY_AGENTS,
];

export function findAgentById(agentId: string): AgentDefinition | undefined {
  return ENTERPRISE_AGENTS.find(a => a.id === agentId);
}

export function findAgentsByClass(agentClass: AgentDefinition['agentClass']): AgentDefinition[] {
  return ENTERPRISE_AGENTS.filter(a => a.agentClass === agentClass);
}

export function findAgentsByCapability(capabilityId: string): AgentDefinition[] {
  return ENTERPRISE_AGENTS.filter(
    a => a.providedCapabilities.includes(capabilityId) || a.requiredCapabilities.includes(capabilityId)
  );
}
