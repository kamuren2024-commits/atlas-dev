/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: TENDER-SPECIFIC EVALUATION CONTRACT & PRE-EVALUATION CONTROL GATE
 * 
 * Directives:
 * - Directive 4: Tender-Specific Evaluation Contract (Immutable/Versioned Configuration)
 * - Directive 5: Pre-Evaluation Control Gate (Readiness Validation before Scoring)
 */

export interface EvaluationCriterion {
  id: string;
  code: string;
  title: string;
  description: string;
  weight: number;
  maxScore: number;
  threshold: number; // e.g., 70% of maxScore
  requiredEvidenceTypes: string[];
  scoringMethodology: 'OBJECTIVE_FORMULA' | 'RUBRIC_SCALE' | 'BINARY_PASS_FAIL';
  subcriteria: Array<{
    id: string;
    name: string;
    maxPoints: number;
    description: string;
  }>;
}

export interface MandatoryRequirement {
  id: string;
  code: string;
  title: string;
  legalBasis: string;
  expectedDocument: string;
  isMandatory: boolean;
  validationRuleId: string;
}

export interface AppointedCommitteeMember {
  memberId: string;
  name: string;
  email: string;
  role: 'COMMITTEE_CHAIR' | 'SECRETARY' | 'TECHNICAL_MEMBER' | 'FINANCIAL_MEMBER' | 'LEGAL_MEMBER';
  appointmentLetterRef: string;
  appointmentDate: string;
  conflictDeclared: boolean;
  conflictStatus: 'NONE' | 'DISCLOSED_AND_CLEARED' | 'RECUSED';
  declarationTimestamp?: string;
  digitalSignatureRegistered: boolean;
}

export interface ContractAmendmentHistory {
  amendmentId: string;
  version: number;
  actorId: string;
  actorName: string;
  approvedBy: string;
  timestamp: string;
  reason: string;
  previousConfigHash: string;
  newConfigHash: string;
  changesSummary: string[];
  auditEventId: string;
}

export interface TenderEvaluationContract {
  contractId: string;
  tenderId: string;
  tenderTitle: string;
  tenderNumber: string;
  procurementMethod: 'OPEN_NATIONAL_TENDER' | 'OPEN_INTERNATIONAL_TENDER' | 'RESTRICTED_TENDER' | 'REQUEST_FOR_PROPOSALS';
  tenderDocumentVersion: string;
  approvalReference: string;
  version: number;
  isLocked: boolean;
  lockedAt: string | null;
  lockedBy: string | null;
  totalWeight: number; // Must equal 100
  minimumTechnicalPassingScore: number; // Typically 70 or 80
  mandatoryRequirements: MandatoryRequirement[];
  technicalCriteria: EvaluationCriterion[];
  financialCriteria: {
    weight: number;
    formula: string; // e.g. "Sf = 100 * Fm / F"
    arithmeticCorrectionAllowed: boolean;
    currency: string;
  };
  committee: AppointedCommitteeMember[];
  delegatedAuthority: {
    accountingOfficer: string;
    headOfProcurement: string;
    delegationInstrumentRef: string;
  };
  applicableLegalRules: string[];
  stages: string[];
  amendments: ContractAmendmentHistory[];
  checksum: string;
}

export interface PreEvaluationGateCheckResult {
  overallStatus: 'EVALUATION_READY' | 'EVALUATION_BLOCKED';
  gateTimestamp: string;
  checkedBy: string;
  scoreableTenderId: string;
  passedChecksCount: number;
  totalChecksCount: number;
  checks: Array<{
    checkId: string;
    checkName: string;
    category: 'CONFIGURATION' | 'COMMITTEE' | 'CONFLICTS' | 'LEGAL_COMPLIANCE' | 'RECORDS';
    status: 'PASSED' | 'FAILED';
    details: string;
    remediationAction?: string;
  }>;
  blockingReasons: string[];
  auditEvidenceRef: string;
}

export class EvaluationContractManager {
  private static instance: EvaluationContractManager;
  private contracts: Map<string, TenderEvaluationContract> = new Map();

  private constructor() {
    this.seedDefaultKetracoContract();
  }

  public static getInstance(): EvaluationContractManager {
    if (!EvaluationContractManager.instance) {
      EvaluationContractManager.instance = new EvaluationContractManager();
    }
    return EvaluationContractManager.instance;
  }

  private seedDefaultKetracoContract() {
    const ketracoContract: TenderEvaluationContract = {
      contractId: 'EVAL-CONTRACT-2026-0873',
      tenderId: 'TND-2026-08',
      tenderTitle: 'Supply, Delivery & Installation of 132kV Substation High-Voltage Gas-Insulated Switchgear',
      tenderNumber: 'KETRACO/PT/024/2026',
      procurementMethod: 'OPEN_NATIONAL_TENDER',
      tenderDocumentVersion: 'v2.4-APPROVED-PPRA-2026',
      approvalReference: 'KETRACO/SCM/APP/2026/089',
      version: 1,
      isLocked: true,
      lockedAt: '2026-08-10T14:30:00Z',
      lockedBy: 'Head of Supply Chain Management (Ag. Dr. J. Mutua)',
      totalWeight: 100,
      minimumTechnicalPassingScore: 70,
      mandatoryRequirements: [
        {
          id: 'MAND-01',
          code: 'MR-TAX',
          title: 'Valid Tax Compliance Certificate (TCC) from Kenya Revenue Authority',
          legalBasis: 'PPADA 2015 Section 71(1)(d)',
          expectedDocument: 'KRA Tax Compliance Certificate',
          isMandatory: true,
          validationRuleId: 'RULE-PRELIMINARY-CHECK-PPADR-74'
        },
        {
          id: 'MAND-02',
          code: 'MR-CR12',
          title: 'Certificate of Incorporation & Certified CR12 within last 12 months',
          legalBasis: 'PPADA 2015 Section 71(1)(a) & PPADR 2020 Reg. 74(1)(d)',
          expectedDocument: 'Registrar of Companies CR12 / BN Search',
          isMandatory: true,
          validationRuleId: 'RULE-PRELIMINARY-CHECK-PPADR-74'
        },
        {
          id: 'MAND-03',
          code: 'MR-SEC',
          title: 'Valid Tender Security of KES 5,000,000 from an approved commercial bank',
          legalBasis: 'PPADA 2015 Section 74(1)(b) & PPADR 2020 Reg. 74(1)(b)',
          expectedDocument: 'Bank Guarantee / Tender Bond',
          isMandatory: true,
          validationRuleId: 'RULE-PRELIMINARY-CHECK-PPADR-74'
        },
        {
          id: 'MAND-04',
          code: 'MR-POA',
          title: 'Power of Attorney registered with the Registrar of Documents',
          legalBasis: 'PPADR 2020 Regulation 74(1)(a)',
          expectedDocument: 'Registered Power of Attorney',
          isMandatory: true,
          validationRuleId: 'RULE-PRELIMINARY-CHECK-PPADR-74'
        },
        {
          id: 'MAND-05',
          code: 'MR-DEBAR',
          title: 'Written declaration that bidder is not debarred by PPRA under Section 41',
          legalBasis: 'PPADA 2015 Section 41 & Section 71(1)',
          expectedDocument: 'Non-debarment sworn affidavit',
          isMandatory: true,
          validationRuleId: 'RULE-PRELIMINARY-CHECK-PPADR-74'
        }
      ],
      technicalCriteria: [
        {
          id: 'TECH-01',
          code: 'TC-EXPERIENCE',
          title: 'Specific Experience in 132kV+ GIS Substation Deployments',
          description: 'Minimum 5 similar contracts completed in the last 7 years of comparable complexity.',
          weight: 30,
          maxScore: 30,
          threshold: 21,
          requiredEvidenceTypes: ['COMPLETION_CERTIFICATES', 'CLIENT_REFERENCE_LETTERS'],
          scoringMethodology: 'RUBRIC_SCALE',
          subcriteria: [
            { id: 'SUB-01-A', name: 'Contract value exceeding $10M', maxPoints: 15, description: '3 points per verified project up to 5' },
            { id: 'SUB-01-B', name: 'Substation operational lifetime > 3 years without failure', maxPoints: 15, description: 'Performance certificates' }
          ]
        },
        {
          id: 'TECH-02',
          code: 'TC-TECHNICAL-SPECS',
          title: 'Technical Specifications Compliance (IEC 62271-203 Standard)',
          description: 'Detailed compliance schedule against KETRACO technical schedule.',
          weight: 40,
          maxScore: 40,
          threshold: 30,
          requiredEvidenceTypes: ['TYPE_TEST_REPORTS', 'MANUFACTURER_AUTHORIZATION', 'DATA_SHEETS'],
          scoringMethodology: 'RUBRIC_SCALE',
          subcriteria: [
            { id: 'SUB-02-A', name: 'KEMA / CESI accredited Type Test Reports', maxPoints: 25, description: 'Short-circuit and temperature rise tests' },
            { id: 'SUB-02-B', name: 'Original Equipment Manufacturer (OEM) authorization', maxPoints: 15, description: 'Direct manufacturer commitment' }
          ]
        },
        {
          id: 'TECH-03',
          code: 'TC-PERSONNEL',
          title: 'Qualifications of Key Engineering Personnel',
          description: 'Registered Professional Electrical Engineers with valid EBK licenses.',
          weight: 20,
          maxScore: 20,
          threshold: 14,
          requiredEvidenceTypes: ['STAFF_CVS', 'EBK_LICENSES', 'ACADEMIC_DEGREES'],
          scoringMethodology: 'RUBRIC_SCALE',
          subcriteria: [
            { id: 'SUB-03-A', name: 'Lead Project Manager (15+ yrs, EBK registered)', maxPoints: 10, description: 'Experience in GIS installations' },
            { id: 'SUB-03-B', name: 'Commissioning Specialist (10+ yrs experience)', maxPoints: 10, description: 'Commissioning certifications' }
          ]
        },
        {
          id: 'TECH-04',
          code: 'TC-METHODOLOGY',
          title: 'Work Methodology, Environmental & Safety Management (QMS/EMS)',
          description: 'ISO 9001 and ISO 14001 certification and detailed site execution schedule.',
          weight: 10,
          maxScore: 10,
          threshold: 7,
          requiredEvidenceTypes: ['ISO_CERTIFICATES', 'SITE_WORK_PLAN_GANTT'],
          scoringMethodology: 'RUBRIC_SCALE',
          subcriteria: [
            { id: 'SUB-04-A', name: 'Valid ISO 9001 / ISO 14001 Quality & Environmental Certs', maxPoints: 5, description: 'Accredited certs' },
            { id: 'SUB-04-B', name: 'Gantt chart and environmental remediation plan', maxPoints: 5, description: 'Execution timeline' }
          ]
        }
      ],
      financialCriteria: {
        weight: 30,
        formula: 'Sf = 100 * Fm / F (Fm = lowest responsive price, F = evaluated price)',
        arithmeticCorrectionAllowed: true,
        currency: 'USD'
      },
      committee: [
        {
          memberId: 'COMM-01',
          name: 'Eng. David Kiprono',
          email: 'dkiprono@ketraco.co.ke',
          role: 'COMMITTEE_CHAIR',
          appointmentLetterRef: 'KETRACO/HR/APP/2026/041',
          appointmentDate: '2026-08-01T08:00:00Z',
          conflictDeclared: true,
          conflictStatus: 'NONE',
          declarationTimestamp: '2026-08-02T09:15:00Z',
          digitalSignatureRegistered: true
        },
        {
          memberId: 'COMM-02',
          name: 'Sarah Mwangi, CPA-K',
          email: 'smwangi@ketraco.co.ke',
          role: 'FINANCIAL_MEMBER',
          appointmentLetterRef: 'KETRACO/HR/APP/2026/042',
          appointmentDate: '2026-08-01T08:00:00Z',
          conflictDeclared: true,
          conflictStatus: 'NONE',
          declarationTimestamp: '2026-08-02T10:00:00Z',
          digitalSignatureRegistered: true
        },
        {
          memberId: 'COMM-03',
          name: 'Eng. Patrick Ochieng',
          email: 'pochieng@ketraco.co.ke',
          role: 'TECHNICAL_MEMBER',
          appointmentLetterRef: 'KETRACO/HR/APP/2026/043',
          appointmentDate: '2026-08-01T08:00:00Z',
          conflictDeclared: true,
          conflictStatus: 'NONE',
          declarationTimestamp: '2026-08-02T11:30:00Z',
          digitalSignatureRegistered: true
        },
        {
          memberId: 'COMM-04',
          name: 'Adv. Brenda Chebet',
          email: 'bchebet@ketraco.co.ke',
          role: 'LEGAL_MEMBER',
          appointmentLetterRef: 'KETRACO/HR/APP/2026/044',
          appointmentDate: '2026-08-01T08:00:00Z',
          conflictDeclared: true,
          conflictStatus: 'NONE',
          declarationTimestamp: '2026-08-02T14:00:00Z',
          digitalSignatureRegistered: true
        },
        {
          memberId: 'COMM-05',
          name: 'Kelvin Mutiso',
          email: 'kmutiso@ketraco.co.ke',
          role: 'SECRETARY',
          appointmentLetterRef: 'KETRACO/HR/APP/2026/045',
          appointmentDate: '2026-08-01T08:00:00Z',
          conflictDeclared: true,
          conflictStatus: 'NONE',
          declarationTimestamp: '2026-08-02T15:20:00Z',
          digitalSignatureRegistered: true
        }
      ],
      delegatedAuthority: {
        accountingOfficer: 'Dr. John Mutua, Managing Director & CEO',
        headOfProcurement: 'Ag. Head of SCM, KETRACO',
        delegationInstrumentRef: 'KETRACO/SEC/DELEGATION/2026/01'
      },
      applicableLegalRules: [
        'RULE-LOCKED-CRITERIA-PPADA-80',
        'RULE-CONFLICT-OF-INTEREST-PPADA-66',
        'RULE-PRELIMINARY-CHECK-PPADR-74',
        'RULE-SCORE-VARIANCE-PPADR-77',
        'RULE-COMMITTEE-SIGNATURE-PPADA-84',
        'RULE-AI-DECISION-BOUNDARY'
      ],
      stages: [
        'DRAFT', 'READY', 'BID_OPENING', 'PRELIMINARY',
        'TECHNICAL', 'FINANCIAL', 'CLARIFICATION', 'CONSENSUS',
        'COMMITTEE_REVIEW', 'APPROVAL', 'AWARD_RECOMMENDATION', 'ARCHIVED'
      ],
      amendments: [],
      checksum: 'sha256-8a7f9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4'
    };

    this.contracts.set(ketracoContract.tenderId, ketracoContract);
    this.contracts.set(ketracoContract.contractId, ketracoContract);
  }

  public getContract(tenderOrContractId: string): TenderEvaluationContract | undefined {
    return this.contracts.get(tenderOrContractId);
  }

  /**
   * Run the Pre-Evaluation Control Gate (Directive 5)
   */
  public runPreEvaluationGate(tenderId: string, actor: string): PreEvaluationGateCheckResult {
    const contract = this.contracts.get(tenderId);
    const checks: PreEvaluationGateCheckResult['checks'] = [];
    const blockingReasons: string[] = [];

    if (!contract) {
      return {
        overallStatus: 'EVALUATION_BLOCKED',
        gateTimestamp: new Date().toISOString(),
        checkedBy: actor,
        scoreableTenderId: tenderId,
        passedChecksCount: 0,
        totalChecksCount: 1,
        checks: [{
          checkId: 'CHK-00',
          checkName: 'Evaluation Contract Existence',
          category: 'CONFIGURATION',
          status: 'FAILED',
          details: `No evaluation contract registered for tender ${tenderId}`,
          remediationAction: 'Initialize and approve a formal evaluation contract before evaluating.'
        }],
        blockingReasons: [`No evaluation contract found for tender ${tenderId}`],
        auditEvidenceRef: `GATE-CHECK-FAIL-${Date.now()}`
      };
    }

    // Check 1: Approved Tender Document Version
    const chk1Passed = Boolean(contract.tenderDocumentVersion && contract.approvalReference);
    checks.push({
      checkId: 'CHK-01',
      checkName: 'Approved Tender Document Verification',
      category: 'CONFIGURATION',
      status: chk1Passed ? 'PASSED' : 'FAILED',
      details: chk1Passed ? `Version ${contract.tenderDocumentVersion} verified with approval ref ${contract.approvalReference}.` : 'Tender document has no formal approval reference.',
      remediationAction: chk1Passed ? undefined : 'Upload signed and approved tender document specification.'
    });
    if (!chk1Passed) blockingReasons.push('Tender document version has not been formally approved by Accounting Officer.');

    // Check 2: Technical Weights Sum to 100%
    const totalWeight = contract.technicalCriteria.reduce((sum, c) => sum + c.weight, 0);
    const chk2Passed = totalWeight === 100;
    checks.push({
      checkId: 'CHK-02',
      checkName: 'Criteria Weights Mathematical Integrity',
      category: 'CONFIGURATION',
      status: chk2Passed ? 'PASSED' : 'FAILED',
      details: chk2Passed ? 'Technical criteria weights exactly sum to 100%.' : `Technical criteria weights sum to ${totalWeight}%, expected 100%.`,
      remediationAction: chk2Passed ? undefined : 'Adjust subcriteria weights to sum to exactly 100%.'
    });
    if (!chk2Passed) blockingReasons.push(`Criteria weights sum to ${totalWeight}%, which violates PPADA Section 80.`);

    // Check 3: Minimum Technical Threshold Specified
    const chk3Passed = contract.minimumTechnicalPassingScore > 0 && contract.minimumTechnicalPassingScore <= 100;
    checks.push({
      checkId: 'CHK-03',
      checkName: 'Minimum Passing Threshold Declaration',
      category: 'CONFIGURATION',
      status: chk3Passed ? 'PASSED' : 'FAILED',
      details: `Minimum technical passing threshold is declared at ${contract.minimumTechnicalPassingScore}%.`,
      remediationAction: chk3Passed ? undefined : 'Define statutory passing threshold (e.g. 70%).'
    });
    if (!chk3Passed) blockingReasons.push('Minimum technical passing threshold is undefined.');

    // Check 4: Criteria Lock Status
    const chk4Passed = contract.isLocked;
    checks.push({
      checkId: 'CHK-04',
      checkName: 'Criteria Immutable Lock Post-Opening',
      category: 'CONFIGURATION',
      status: chk4Passed ? 'PASSED' : 'FAILED',
      details: chk4Passed ? `Criteria locked at ${contract.lockedAt} by ${contract.lockedBy}.` : 'Criteria configuration is currently UNLOCKED (silent modification risk).',
      remediationAction: chk4Passed ? undefined : 'Formally lock evaluation criteria before admitting evaluators.'
    });
    if (!chk4Passed) blockingReasons.push('Evaluation criteria must be locked before evaluators are admitted to score.');

    // Check 5: Committee Appointment & Quorum
    const appointedCount = contract.committee.length;
    const chk5Passed = appointedCount >= 3;
    checks.push({
      checkId: 'CHK-05',
      checkName: 'Statutory Committee Quorum (Minimum 3 Members)',
      category: 'COMMITTEE',
      status: chk5Passed ? 'PASSED' : 'FAILED',
      details: `${appointedCount} committee members formally appointed with appointment letters.`,
      remediationAction: chk5Passed ? undefined : 'Appoint at least 3 committee members including Chair and Secretary.'
    });
    if (!chk5Passed) blockingReasons.push('Statutory committee quorum under PPADA Section 46 requires minimum 3 members.');

    // Check 6: Conflict of Interest Declarations
    const allDeclared = contract.committee.every(m => m.conflictDeclared);
    const anyDisqualifying = contract.committee.some(m => m.conflictStatus === 'RECUSED');
    const chk6Passed = allDeclared;
    checks.push({
      checkId: 'CHK-06',
      checkName: 'Conflict of Interest Declarations Registered',
      category: 'CONFLICTS',
      status: chk6Passed ? 'PASSED' : 'FAILED',
      details: chk6Passed ? 'All appointed members have filed signed conflict declarations.' : 'One or more committee members have not filed conflict declarations.',
      remediationAction: chk6Passed ? undefined : 'Collect signed statutory conflict declarations from all members before opening scoring.'
    });
    if (!chk6Passed) blockingReasons.push('Evaluation blocked: Not all committee members have completed statutory conflict declarations.');

    // Check 7: Mandatory Administrative Requirements Defined
    const chk7Passed = contract.mandatoryRequirements.length >= 3;
    checks.push({
      checkId: 'CHK-07',
      checkName: 'Mandatory Administrative Checklist Definition',
      category: 'LEGAL_COMPLIANCE',
      status: chk7Passed ? 'PASSED' : 'FAILED',
      details: `${contract.mandatoryRequirements.length} mandatory statutory requirements configured with legal bases.`,
      remediationAction: chk7Passed ? undefined : 'Attach standard preliminary criteria (KRA TCC, CR12, Tender Security).'
    });
    if (!chk7Passed) blockingReasons.push('Insufficient mandatory criteria defined for preliminary examination.');

    // Check 8: Delegated Authority Instrument
    const chk8Passed = Boolean(contract.delegatedAuthority.accountingOfficer && contract.delegatedAuthority.delegationInstrumentRef);
    checks.push({
      checkId: 'CHK-08',
      checkName: 'Delegated Authority Instrument Verification',
      category: 'RECORDS',
      status: chk8Passed ? 'PASSED' : 'FAILED',
      details: `Authority instrument: ${contract.delegatedAuthority.delegationInstrumentRef}, Accounting Officer: ${contract.delegatedAuthority.accountingOfficer}.`,
      remediationAction: chk8Passed ? undefined : 'Record formal delegation instrument from Accounting Officer.'
    });
    if (!chk8Passed) blockingReasons.push('Delegated authority instrument missing.');

    const passedCount = checks.filter(c => c.status === 'PASSED').length;
    const overallStatus = blockingReasons.length === 0 ? 'EVALUATION_READY' : 'EVALUATION_BLOCKED';

    return {
      overallStatus,
      gateTimestamp: new Date().toISOString(),
      checkedBy: actor,
      scoreableTenderId: tenderId,
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      checks,
      blockingReasons,
      auditEvidenceRef: `GATE-CHECK-${tenderId}-${Date.now()}`
    };
  }
}
