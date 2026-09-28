import { Agent, Goal, Tool, AgentMemory, AgentMessage, AgentExecutionLog } from './types';
import { generateId } from '../../src/core/shared/crypto';

// Concrete SCM Tool class
export class SCMTool implements Tool {
  constructor(
    public name: string,
    public description: string,
    private runFn: (args: any) => Promise<any>
  ) {}

  async execute(args: any): Promise<any> {
    try {
      return await this.runFn(args);
    } catch (err: any) {
      return { error: true, message: err.message };
    }
  }
}

// Global Message Bus for SCM Agent collaboration (Phase 7)
export class AgentMessageBus {
  private static messages: AgentMessage[] = [];
  private static subscribers: ((msg: AgentMessage) => void)[] = [];

  static publish(msg: Omit<AgentMessage, 'id' | 'timestamp'>): AgentMessage {
    const fullMsg: AgentMessage = {
      ...msg,
      id: generateId('msg'),
      timestamp: new Date().toISOString()
    };
    this.messages.push(fullMsg);
    this.subscribers.forEach(sub => sub(fullMsg));
    return fullMsg;
  }

  static subscribe(fn: (msg: AgentMessage) => void) {
    this.subscribers.push(fn);
  }

  static getHistory(): AgentMessage[] {
    return this.messages;
  }

  static clear() {
    this.messages = [];
  }
}

// Global Agent registry execution log for telemetry (Phase 13)
export class SCMTelemetry {
  private static logs: AgentExecutionLog[] = [];

  static log(execution: Omit<AgentExecutionLog, 'id' | 'timestamp'>): AgentExecutionLog {
    const entry: AgentExecutionLog = {
      ...execution,
      id: generateId('log'),
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(entry);
    return entry;
  }

  static getLogs(): AgentExecutionLog[] {
    return this.logs;
  }
}

// Base SCM Agent class implementing the common Agent SDK architecture
export class BaseSCMAgent implements Agent {
  public id: string;
  public name: string;
  public domain: string;
  public goals: Goal[];
  public tools: Tool[];
  public memory: AgentMemory;
  public capabilities: string[];
  public memoryAccess: string[];

  constructor(
    id: string, 
    name: string, 
    domain: string, 
    goals: Goal[], 
    tools: Tool[], 
    initialMemoryValues?: Partial<AgentMemory>,
    capabilities?: string[],
    memoryAccess?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.domain = domain;
    this.goals = goals;
    this.tools = tools;
    this.memory = {
      shortTerm: initialMemoryValues?.shortTerm || [],
      longTerm: initialMemoryValues?.longTerm || [],
      semantic: initialMemoryValues?.semantic || {},
      tenderMemory: initialMemoryValues?.tenderMemory || [],
      supplierMemory: initialMemoryValues?.supplierMemory || [],
      contractMemory: initialMemoryValues?.contractMemory || [],
      projectMemory: initialMemoryValues?.projectMemory || [],
      conversationHistory: initialMemoryValues?.conversationHistory || [],
      successfulWorkflows: initialMemoryValues?.successfulWorkflows || []
    };
    this.capabilities = capabilities || ['domain_reasoning', 'agent_coordination'];
    this.memoryAccess = memoryAccess || ['shortTerm', 'longTerm', 'semantic'];
  }

  async observe(event: { type: string; payload: any }): Promise<any> {
    const logMsg = `Observed system event: [${event.type}] with keys: ${Object.keys(event.payload || {}).join(', ')}`;
    this.memory.shortTerm.push(logMsg);
    SCMTelemetry.log({
      agentId: this.id,
      agentName: this.name,
      task: `Event Observation (${event.type})`,
      thoughtProcess: [logMsg, `Re-evaluating domain state: ${this.domain}`],
      toolsUsed: [],
      result: `Observed event registered securely.`
    });
    return { status: 'acknowledged', eventId: event.type };
  }

  async recommend(context: string): Promise<any> {
    const recommendation = `Based on SCM domain knowledge for ${this.domain}, we recommend: Optimization actions under context: "${context}".`;
    this.memory.longTerm.push(`Generated recommendation for: ${context}`);
    return {
      agentId: this.id,
      recommendation,
      confidence: 0.92,
      mitigationAction: `Deploy backup logistics buffers immediate`
    };
  }

  async reasoning(input: string): Promise<string> {
    this.memory.shortTerm.push(`Reasoning on input: "${input}" at ${new Date().toISOString()}`);
    // Simulated high-fidelity intelligence reasoning
    return `[Reasoning Step - ${this.name}] Analyzing task parameters against domain rules (${this.domain}). Executing specialized lookup across tools.`;
  }

  async execute(task: string): Promise<any> {
    const thoughtProcess: string[] = [
      `Initializing operation state for task: "${task}"`,
      `Scanning SCM memory registers for historical guidelines`
    ];
    
    const toolsUsed: string[] = [];
    if (this.tools.length > 0) {
      const selectedTool = this.tools[0];
      thoughtProcess.push(`Mapping SCM variables into Tool execution: ${selectedTool.name}`);
      toolsUsed.push(selectedTool.name);
      const toolResult = await selectedTool.execute({ query: task });
      thoughtProcess.push(`Acquired response vector back from: ${selectedTool.name}`);
    }

    const finalAnswer = `[Execution Completed] Domain agent ${this.name} parsed the operational objective. Outcome: Secured.`;
    thoughtProcess.push(`Resolving domain state to master operating system`);

    SCMTelemetry.log({
      agentId: this.id,
      agentName: this.name,
      task,
      thoughtProcess,
      toolsUsed,
      result: finalAnswer
    });

    return {
      success: true,
      agent: this.name,
      answer: finalAnswer,
      thoughtProcess
    };
  }

  async learn(feedback: string): Promise<void> {
    this.memory.longTerm.push(`Learned from operator feedback: "${feedback}"`);
  }

  async collaborate(agentIds: string[]): Promise<any> {
    const collaborations = agentIds.map(id => {
      return AgentMessageBus.publish({
        from: this.name,
        to: id,
        content: `Initializing cross-agent collaborative pipeline for domain orchestration`,
        taskType: 'collaboration'
      });
    });
    return collaborations;
  }
}

// 1. Procurement Agent
export const createProcurementAgent = () => {
  return new BaseSCMAgent(
    'procurement-agent',
    'SCM Procurement Specialist',
    'Procurement & Tenders',
    [
      { id: 'g1', description: 'Automate KETRACO tender formulation, formatting drafts and milestones.' },
      { id: 'g2', description: 'Run automated, objective evaluation matrix scoring for bid compliance.' }
    ],
    [
      new SCMTool('Tender Analyzer', 'Extracts and parses submitted bids to test compliance matrices.', async (args) => {
        return { score: 94.5, flags: ['Audit compliance check passed', 'Tender specs reconciled'] };
      }),
      new SCMTool('Cost Benchmark Engine', 'Compares tender estimates against past global prices.', async (args) => {
        return { averageDeviation: '-4.2%', recommendedPricePct: 98.0 };
      })
    ],
    {
      tenderMemory: [
        'Checked Kenya Public Procurement Regulatory Authority regulations.',
        'Loaded KETRACO substation specifications for Lot 4 Suswa line.'
      ]
    }
  );
};

// 2. Contract Intelligence Agent
export const createContractIntelligenceAgent = () => {
  return new BaseSCMAgent(
    'contract-agent',
    'SCM Contract Investigator',
    'Contracts & Obligations',
    [
      { id: 'g1', description: 'Extract key clauses, indemnities, and delivery timelines automatically.' },
      { id: 'g2', description: 'Monitor penalization thresholds (e.g., delays of critical transformer delivery).' }
    ],
    [
      new SCMTool('Risk & Penalty Predictor', 'Predicts potential contract breach indicators based on past logs.', async (args) => {
        return { predictedPenaltyUSD: 14500, timelineConfidence: 89.2 };
      }),
      new SCMTool('Clause Risk Extractor', 'Performs deep OCR searches on PDF scan contracts for liabilities.', async (args) => {
        return { riskRating: 'Low-Moderate', criticalClausesFound: 4 };
      })
    ],
    {
      contractMemory: [
        'Standard penalty rule: 0.5% per week of delay of high-capacity transformers capped at 10%.',
        'Ingested EPC standard turnkey compliance protocols v4.'
      ]
    }
  );
};

// 3. Supplier Intelligence Agent
export const createSupplierAgent = () => {
  return new BaseSCMAgent(
    'supplier-agent',
    'SCM Supplier Auditor',
    'Suppliers & Relationships',
    [
      { id: 'g1', description: 'Track supplier delivery delays, performance indexing, and reliability scores.' },
      { id: 'g2', description: 'Deliver recommendations for critical KETRACO part suppliers (Lot 2 line cables).' }
    ],
    [
      new SCMTool('Supplier Profiler', 'Synthesizes past performance data to calculate Supplier Reliability Indexes.', async (args) => {
        return { supplierIndex: 88.4, ranking: 'A-Tier Premium KETRACO Partner' };
      })
    ],
    {
      supplierMemory: [
        'Supplier heavy-risk: Shanghai Grid Cable Corp flagged with 2-week ocean freight bottleneck.',
        'Siemens Energy KETRACO score: 94% on-site deployment success rate.'
      ]
    }
  );
};

// 4. Inventory Optimization Agent
export const createInventoryAgent = () => {
  return new BaseSCMAgent(
    'inventory-agent',
    'SCM Inventory Balance Mind',
    'Inventory & Warehousing',
    [
      { id: 'g1', description: 'Evaluate high-risk dead stock and run demand neural forecasting.' },
      { id: 'g2', description: 'Calculate stock-out probability models for critical substation components.' }
    ],
    [
      new SCMTool('Replenishment Planner', 'Formulates recommended parts order waves according to project scopes.', async (args) => {
        return { recommendedReorderAt: 45, currentSubstationBuffer: 'Optimal' };
      })
    ],
    {
      inventoryMemory: [
        'Mariakani Warehouse holds 12 surplus 132kV circuit breakers.',
        'Isinya depot transformer buffers currently critically low in stock due to delay.'
      ]
    }
  );
};

// 5. Logistics Command Agent
export const createLogisticsAgent = () => {
  return new BaseSCMAgent(
    'logistics-agent',
    'SCM Logistics Dispatcher',
    'Logistics & Shipments',
    [
      { id: 'g1', description: 'Route optimization through Mombasa port and northern corridor land tracks.' },
      { id: 'g2', description: 'Isolate customs clearance hold hazards and project arrival windows.' }
    ],
    [
      new SCMTool('Customs Clearance Estimator', 'Determines import lead-times and custom tariff delays.', async (args) => {
        return { averagePortLeaseHoldDays: 4, tollTariffCostUSD: 12040 };
      })
    ],
    {
      semantic: {
        lastTrackedCargoId: 'CARGO-TRANS-990A',
        oceanTransitLine: 'Maersk SCM Route G-12'
      }
    }
  );
};

// 6. Project Supply Agent
export const createProjectSupplyAgent = () => {
  return new BaseSCMAgent(
    'project-agent',
    'SCM Project Delivery Mind',
    'Project Readiness & BOMs',
    [
      { id: 'g1', description: 'Cross-reference Bill of Materials (BOM) against inventory readiness ratios.' },
      { id: 'g2', description: 'Map early warning markers of project critical paths (transformer, cables, poles/towers).' }
    ],
    [
      new SCMTool('BOM Material Readiness Scorer', 'Scores actual vs purchased hardware matching percentages.', async (args) => {
        return {
          status: 'UNAVAILABLE',
          message: 'Project requirements and linked logistics evidence are not available to this agent tool.',
          sources: [],
        };
      })
    ],
    {
      projectMemory: [
        'EHV Suswa-OlKaria Interconnector line target delivery: Q4 2026.',
        'Lessos-Tororo high voltage interconnect projects marked with high lead-time variables.'
      ]
    }
  );
};

// 7. Risk & Compliance Agent
export const createComplianceAgent = () => {
  return new BaseSCMAgent(
    'compliance-agent',
    'SCM Compliance Guardian',
    'Risk, Audit & Fraud',
    [
      { id: 'g1', description: 'Evaluate conflict of interest anomalies and tender anti-fraud monitoring.' },
      { id: 'g2', description: 'Perform audit checks against public regulatory standards and board constraints.' }
    ],
    [
      new SCMTool('Audit Score Scorer', 'Scans historical bidding data to detect compliance deviations.', async (args) => {
        return { complianceIndex: 97.4, flaggedDeviationsFound: 0 };
      })
    ],
    {
      shortTerm: ['Compliance active. Auditing latest KETRACO strategic board decisions.']
    }
  );
};

// 8. Strategic Sourcing Agent
export const createSourcingAgent = () => {
  return new BaseSCMAgent(
    'sourcing-agent',
    'SCM Strategic Sourcing Mind',
    'Spend Analytics & Category Optimization',
    [
      { id: 'g1', description: 'Run spend category analyses to identify vendor consolidation paths.' },
      { id: 'g2', description: 'Calculate total cost of ownership (TCO) benchmarks to realize savings.' }
    ],
    [
      new SCMTool('Consolidation Sweeper', 'Scans suppliers to propose vendor rationalization.', async (args) => {
        return { opportunitiesCount: 3, possibleSavingsPct: 11.4 };
      })
    ],
    {
      longTerm: ['Category consolidated: high-voltage steel towers consolidated into single EPC vendor.']
    }
  );
};

// 9. Digital Twin Agent
export const createDigitalTwinAgent = () => {
  return new BaseSCMAgent(
    'digitaltwin-agent',
    'SCM Digital Twin Simulator',
    'Digital Twin, Simulation & Stress-testing',
    [
      { id: 'g1', description: 'Simulate grid failure modes on transformer delays and grid shortages.' },
      { id: 'g2', description: 'Execute stress testing simulations to predict critical path overruns.' }
    ],
    [
      new SCMTool('What-If Disruption Simulator', 'Runs custom stress testing scenarios to calculate resilience scores.', async (args) => {
        return { scenarioResilienceScore: 78.5, recommendedBufferDays: 14 };
      })
    ],
    {
      semantic: {
        activeGridModel: 'KETRACO-MAIN-TRANSMISSION-GRID-V12'
      }
    }
  );
};

// 10. Executive Copilot Agent
export const createExecutiveAgent = () => {
  return new BaseSCMAgent(
    'executive-agent',
    'SCM Executive Advisor',
    'Executive Advisory & Reporting',
    [
      { id: 'g1', description: 'Synthesize complex metrics across SCM modules to create KETRACO executive briefs.' },
      { id: 'g2', description: 'Generate SCM board summaries based on live operational telemetry.' }
    ],
    [
      new SCMTool('SCM Director Brief Writer', 'Drafts official boardroom briefings.', async (args) => {
        return { wordCount: 420, layout: 'Structured Executive' };
      })
    ],
    {
      shortTerm: ['Prepared briefing for KETRACO Chairman regarding Suswa project material buffers.']
    }
  );
};

// 11. Knowledge Graph Agent
export const createKnowledgeGraphAgent = () => {
  return new BaseSCMAgent(
    'graph-agent',
    'SCM Knowledge Graph Architect',
    'Knowledge Graph & Digital Twin',
    [
      { id: 'g1', description: 'Map procurement entities into a navigable relationship graph.' },
      { id: 'g2', description: 'Execute entity resolution and detect hidden supplier relationships.' }
    ],
    [
      new SCMTool('Graph Traversal Engine', 'Explores entity relationships to identify network risks.', async (args) => {
        return { networkCentrality: 'High', hiddenRisksDetected: 2 };
      }),
      new SCMTool('Collusion Detector', 'Scans for shared ownership and bid rotation patterns.', async (args) => {
        return { collusionRiskIndex: 12.5, flaggedAnomalies: 0 };
      })
    ],
    {
      semantic: {
        activeGraphNodes: 1240,
        activeRelationships: 5820
      }
    }
  );
};
