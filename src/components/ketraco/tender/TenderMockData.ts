// Enterprise SCM Tender Intelligence Mock Datasets and Types
export interface TenderCriteria {
  id: string;
  name: string;
  weight: number;
}

export interface SCMBid {
  id: string;
  supplierName: string;
  pricingUSD: number;
  technicalCapabilities: number; // 0-100
  pastPerformance: number; // 0-100
  localCompliance: number; // 0-100
  missingDocCheck: boolean;
  collusionScore: number; // 0-100
  capacityRating: number; // 0-100
  timelineFeasibility: number; // 0-100
}

export interface ProcurementPlanItem {
  id: string;
  department: string;
  projectName: string;
  category: string;
  budgetUSD: number;
  readinessScore: number; // 0-100
  suggestedMethod: string;
  timelineQuarter: string;
  status: 'Draft' | 'Approved' | 'Deferred';
}

export interface SCMTender {
  id: string;
  title: string;
  scopeOfWork: string;
  budgetUSD: number;
  procurementMethod: string;
  status: 'Draft' | 'Review' | 'Published' | 'Submission' | 'Evaluation' | 'Award' | 'Contract' | 'Completed' | 'Cancelled';
  complianceStatus: 'PENDING' | 'PASS' | 'FAIL';
  riskScore: number; // 0-100
  timelineWeeks: number;
  bidsReceivedCount: number;
  category: string;
  department: string;
  officerInCharge: string;
  auditTrail: { timestamp: string; action: string; actor: string }[];
}

export interface SCMSupplier {
  id: string;
  name: string;
  overview: string;
  categories: string[];
  regions: string[];
  trustScore: number; // 0-100
  financialRisk: 'Low' | 'Medium' | 'High';
  deliveryConfidence: number; // 0-100
  qualityIndex: number; // 0-100
  dependencyScore: number; // 0-100
  activeContractsCount: number;
  esgScore: number; // 0-100
  litigationRisk: 'None' | 'Minor' | 'Significant';
  certifications: string[];
}

export interface SCMContract {
  id: string;
  tenderId: string;
  title: string;
  supplierName: string;
  valueUSD: number;
  milestones: { id: string; name: string; progress: number; status: 'Pending' | 'In Progress' | 'Completed' }[];
  payments: { id: string; amountUSD: number; status: 'Paid' | 'Processing' | 'Delayed' | 'Pending' }[];
  variationsUSD: number;
  claimsCount: number;
  riskEscalation: 'Low' | 'Moderate' | 'High';
  progressPercent: number;
}

export interface SCMKnowledgeNode {
  id: string;
  label: string;
  type: 'Supplier' | 'Tender' | 'Contract' | 'Asset' | 'Budget' | 'Risk' | 'Officer' | 'Committee';
  details: Record<string, any>;
}

export interface SCMKnowledgeEdge {
  from: string;
  to: string;
  relation: string;
}

export const INITIAL_PLAN_ITEMS: ProcurementPlanItem[] = [
  {
    id: "PLN-001",
    department: "Substations Engineering",
    projectName: "Suswa Substation Expansion Phase 2",
    category: "Electrical Switchgear",
    budgetUSD: 2400000,
    readinessScore: 92,
    suggestedMethod: "Open International Tender",
    timelineQuarter: "Q3 2026",
    status: "Approved"
  },
  {
    id: "PLN-002",
    department: "Transmission Grid Development",
    projectName: "Mariakani Static Compensator (SVC) Link",
    category: "Heavy Power Lines",
    budgetUSD: 4100000,
    readinessScore: 88,
    suggestedMethod: "Restricted National Tender",
    timelineQuarter: "Q4 2026",
    status: "Approved"
  },
  {
    id: "PLN-003",
    department: "Logistics & Fleet",
    projectName: "Turnkey Regional Logistics Warehousing Hub",
    category: "Supply Chain",
    budgetUSD: 1200000,
    readinessScore: 64,
    suggestedMethod: "Direct Procurement (Patented Tech)",
    timelineQuarter: "Q2 2026",
    status: "Draft"
  },
  {
    id: "PLN-004",
    department: "Strategic Communications",
    projectName: "Fiber Optic OPGW Cable Rollout",
    category: "Information Technology",
    budgetUSD: 850000,
    readinessScore: 78,
    suggestedMethod: "Request for Proposals (RFP)",
    timelineQuarter: "Q1 2027",
    status: "Approved"
  }
];

export const INITIAL_TENDERS: SCMTender[] = [
  {
    id: "TND-2026-001",
    title: "KETRACO Suswa-Olkaria II 132kV Interconnector Cable Kit",
    scopeOfWork: "Turnkey supply, deployment, and structural engineering of standard double-circuit steel towers and accessory insulation modules in Naivasha corridor.",
    budgetUSD: 2400000,
    procurementMethod: "Open International Tender",
    status: "Evaluation",
    complianceStatus: "PASS",
    riskScore: 28,
    timelineWeeks: 12,
    bidsReceivedCount: 3,
    category: "Transmission Cable",
    department: "Substations Engineering",
    officerInCharge: "Eng. Moses Kosgei",
    auditTrail: [
      { timestamp: "2026-06-10 09:00", action: "Tender Core Workspace Created", actor: "SCM_SYSTEM" },
      { timestamp: "2026-06-12 14:30", action: "Specifications Draft Generated", actor: "AI_AUTHOR_AGENT" },
      { timestamp: "2026-06-15 11:15", action: "Technical Specifications Approved", actor: "Tender Committee" },
      { timestamp: "2026-06-20 17:00", action: "Published on PPIP public gateway", actor: "SCM_PUBLISH_SERVICE" }
    ]
  },
  {
    id: "TND-2026-002",
    title: "Mombasa Substation Power Transformers Replacement",
    scopeOfWork: "Manufacturing, testing, and shipping of 3x 150MVA grid-coupling transformers with digital telemetry terminal systems.",
    budgetUSD: 3500000,
    procurementMethod: "Open International Tender",
    status: "Published",
    complianceStatus: "PASS",
    riskScore: 45,
    timelineWeeks: 16,
    bidsReceivedCount: 1,
    category: "Heavy Electrical Transformers",
    department: "Operations & Maintenance",
    officerInCharge: "Eng. Caroline Wangari",
    auditTrail: [
      { timestamp: "2026-06-18 10:00", action: "Tender Init", actor: "Caroline Wangari" },
      { timestamp: "2026-06-21 16:22", action: "Compliance Checklist Cleared", actor: "AI_COMPLIANCE_AGENT" }
    ]
  },
  {
    id: "TND-2026-003",
    title: "Nanyuki Substation Perimeter Security Fencing",
    scopeOfWork: "Design and deployment of military-grade physical fence, laser barrier intrusion alarms, and redundant CCTV network.",
    budgetUSD: 450000,
    procurementMethod: "Request for Quotations",
    status: "Draft",
    complianceStatus: "PENDING",
    riskScore: 15,
    timelineWeeks: 6,
    bidsReceivedCount: 0,
    category: "Physical Security Infrastructure",
    department: "Security Services",
    officerInCharge: "Col. Julius Ruto",
    auditTrail: [
      { timestamp: "2026-06-25 15:45", action: "Drafting begun", actor: "Julius Ruto" }
    ]
  }
];

export const INITIAL_SUPPLIERS: SCMSupplier[] = [
  {
    id: "SPL-001",
    name: "Shanghai Grid Metal Corp",
    overview: "Global heavy-metallurgy manufacturer and conductor wire distributor with global supply chains.",
    categories: ["Transmission Cable", "Conductor Wire", "Towers"],
    regions: ["Asia Pacific", "East Africa", "Middle East"],
    trustScore: 82,
    financialRisk: "Low",
    deliveryConfidence: 78,
    qualityIndex: 94,
    dependencyScore: 65,
    activeContractsCount: 2,
    esgScore: 81,
    litigationRisk: "None",
    certifications: ["ISO-9001", "IEC-Standardizer", "NCA-Grade1"]
  },
  {
    id: "SPL-002",
    name: "Siemens Energy Ltd Nairobi",
    overview: "German heavy industrial SCM partner with premium electrical engineering local division.",
    categories: ["GIS Switchgears", "Substations", "Transformers"],
    regions: ["Global", "Sub-Saharan Africa"],
    trustScore: 96,
    financialRisk: "Low",
    deliveryConfidence: 94,
    qualityIndex: 98,
    dependencyScore: 40,
    activeContractsCount: 3,
    esgScore: 92,
    litigationRisk: "Minor",
    certifications: ["ISO-14001", "IEEE-Registered", "NCA-Heavy"]
  },
  {
    id: "SPL-003",
    name: "East African Cables Ltd",
    overview: "Leading regional manufacturer of sub-station wiring and low-voltage auxiliary line assets.",
    categories: ["Transmission Cable", "Substation Earthing", "Auxiliary Wire"],
    regions: ["East Africa", "Central Africa"],
    trustScore: 89,
    financialRisk: "Medium",
    deliveryConfidence: 85,
    qualityIndex: 88,
    dependencyScore: 75,
    activeContractsCount: 1,
    esgScore: 87,
    litigationRisk: "None",
    certifications: ["KEBS-Approved", "ISO-9001", "PPRA-InCountry"]
  }
];

export const INITIAL_CONTRACTS: SCMContract[] = [
  {
    id: "CTR-2026-809",
    tenderId: "TND-2026-001",
    title: "Suswa-Olkaria 132kV Interconnector Execution Contract",
    supplierName: "East African Cables Ltd",
    valueUSD: 1350000,
    milestones: [
      { id: "M1", name: "Engineering Design and Soil Surveys", progress: 100, status: "Completed" },
      { id: "M2", name: "Manufacturing and Factory Performance Testing", progress: 100, status: "Completed" },
      { id: "M3", name: "Mombasa Port Logistics and Clearance", progress: 60, status: "In Progress" },
      { id: "M4", name: "On-site Erection & Commissioning", progress: 0, status: "Pending" }
    ],
    payments: [
      { id: "P1", amountUSD: 270000, status: "Paid" },
      { id: "P2", amountUSD: 405000, status: "Processing" },
      { id: "P3", amountUSD: 675000, status: "Pending" }
    ],
    variationsUSD: 120000, // Within 25% limit
    claimsCount: 1,
    riskEscalation: "Moderate",
    progressPercent: 65
  },
  {
    id: "CTR-2026-441",
    tenderId: "TND-2026-002",
    title: "Mombasa Transformer Logistics and Overhaul Framework",
    supplierName: "Siemens Energy Ltd Nairobi",
    valueUSD: 3150000,
    milestones: [
      { id: "M1", name: "Procurement of Silicon Steel Core Material", progress: 100, status: "Completed" },
      { id: "M2", name: "Transformer Assembly & QA Check", progress: 20, status: "In Progress" }
    ],
    payments: [
      { id: "P1", amountUSD: 945000, status: "Paid" }
    ],
    variationsUSD: 0,
    claimsCount: 0,
    riskEscalation: "Low",
    progressPercent: 40
  }
];

export const INITIAL_BIDS: SCMBid[] = [
  {
    id: "b1",
    supplierName: "Shanghai Grid Metal Corp",
    pricingUSD: 1420000,
    technicalCapabilities: 92,
    pastPerformance: 78,
    localCompliance: 40,
    missingDocCheck: false,
    collusionScore: 8,
    capacityRating: 95,
    timelineFeasibility: 85
  },
  {
    id: "b2",
    supplierName: "Siemens Energy Ltd Nairobi",
    pricingUSD: 1680000,
    technicalCapabilities: 96,
    pastPerformance: 94,
    localCompliance: 80,
    missingDocCheck: false,
    collusionScore: 12,
    capacityRating: 98,
    timelineFeasibility: 92
  },
  {
    id: "b3",
    supplierName: "East African Cables Consortium",
    pricingUSD: 1350000,
    technicalCapabilities: 74,
    pastPerformance: 82,
    localCompliance: 98,
    missingDocCheck: false,
    collusionScore: 4,
    capacityRating: 80,
    timelineFeasibility: 75
  }
];

export const KNOWLEDGE_GRAPH_DATA: { nodes: SCMKnowledgeNode[]; edges: SCMKnowledgeEdge[] } = {
  nodes: [
    { id: "S1", label: "Shanghai Grid Metal Corp", type: "Supplier", details: { Country: "China", TrustScore: "82%" } },
    { id: "S2", label: "Siemens Energy Ltd Nairobi", type: "Supplier", details: { Country: "Kenya/Germany", TrustScore: "96%" } },
    { id: "S3", label: "East African Cables Ltd", type: "Supplier", details: { Country: "Kenya", TrustScore: "89%" } },
    { id: "T1", label: "TND-2026-001 (Suswa Cables)", type: "Tender", details: { Status: "Evaluation", Budget: "$2.4M" } },
    { id: "T2", label: "TND-2026-002 (Mombasa Transformers)", type: "Tender", details: { Status: "Published", Budget: "$3.5M" } },
    { id: "C1", label: "CTR-2026-809 (Suswa Cables Contract)", type: "Contract", details: { Status: "Active", Value: "$1.35M" } },
    { id: "A1", label: "Suswa Substation Grid Expansion", type: "Asset", details: { Region: "Naivasha/Rift Valley", Criticality: "High" } },
    { id: "B1", label: "FY 2026 Grid Capex Budget", type: "Budget", details: { Total: "$12.5M", Allocated: "$8.4M" } },
    { id: "O1", label: "Eng. Moses Kosgei", type: "Officer", details: { Role: "Senior Procurement Officer", Credentials: "CIPS Certified" } },
    { id: "V1", label: "SCM Main Evaluation Panel", type: "Committee", details: { Quorum: "5 Members", Chair: "Eng. Kosgei" } }
  ],
  edges: [
    { from: "S3", to: "C1", relation: "Holds Awarded Contract" },
    { from: "C1", to: "T1", relation: "Originating Tender Link" },
    { from: "T1", to: "A1", relation: "Expanding Asset" },
    { from: "A1", to: "B1", relation: "Funded via Budget Block" },
    { from: "O1", to: "T1", relation: "Supervising Officer" },
    { from: "V1", to: "T1", relation: "Evaluating Body" },
    { from: "S1", to: "T1", relation: "Submitted Bidder" },
    { from: "S2", to: "T1", relation: "Submitted Bidder" },
    { from: "S2", to: "T2", relation: "Submitted Bidder" }
  ]
};
