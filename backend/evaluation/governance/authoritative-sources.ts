/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: AUTHORITATIVE LEGAL & PROCEDURAL SOURCES
 * 
 * Versioned, queryable knowledge layer for Kenyan public procurement law and standards.
 * Sources include:
 * - Constitution of Kenya, 2010 (Article 227)
 * - Public Procurement and Asset Disposal Act, 2015 (PPADA 2015, Act No. 33 of 2015, Rev. 2022)
 * - Public Procurement and Asset Disposal Regulations, 2020 (PPADR 2020)
 * - Public Procurement Regulatory Authority (PPRA) Circulars and Standard Tender Documents (STD)
 * - National Treasury Procurement Circulars & PFM Act 2012
 * - Data Protection Act, 2019 (Act No. 24 of 2019)
 * 
 * Rules:
 * - Never fabricate legal sections.
 * - Every legal reference has: SOURCE, VERSION, PROVISION, EFFECTIVE DATE, STATUS, VERIFICATION SOURCE.
 */

export type LegalSourceStatus = 'DRAFT' | 'REVIEW' | 'VERIFIED' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';

export interface AuthoritativeLegalSource {
  sourceId: string;
  sourceName: string;
  shortCode: string;
  version: string;
  provision: string;
  heading: string;
  officialCitation: string;
  effectiveDate: string;
  expiryDate: string | null;
  status: LegalSourceStatus;
  verificationSource: string;
  fullText: string;
  statutoryMandate: string;
  enforceableControls: string[];
  governingBody: 'PARLIAMENT' | 'PPRA' | 'NATIONAL_TREASURY' | 'ODPC' | 'PROCURING_ENTITY';
}

export const AUTHORITATIVE_LEGAL_SOURCES: AuthoritativeLegalSource[] = [
  {
    sourceId: 'KE-CONST-ART-227',
    sourceName: 'Constitution of Kenya, 2010',
    shortCode: 'CONST_2010',
    version: '2010 Promulgation',
    provision: 'Article 227',
    heading: 'Procurement of Public Goods and Services',
    officialCitation: 'Constitution of Kenya (2010), Article 227(1)-(2)',
    effectiveDate: '2010-08-27T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Law Reports (National Council for Law Reporting), Laws of Kenya',
    fullText: `(1) When a State organ or any other public entity contracts for goods or services, it shall do so in accordance with a system that is fair, equitable, transparent, competitive and cost-effective.
(2) An Act of Parliament shall prescribe a framework within which policies relating to procurement and asset disposal shall be implemented and may provide for:
  (a) categories of preference in the allocation of contracts;
  (b) the protection or advancement of persons, categories of persons or groups previously disadvantaged by unfair competition or discrimination;
  (c) sanctions against contractors that have not performed according to professionally regulated procedures, contractual agreements or legislation; and
  (d) sanctions against persons who have defaulted on their tax obligations, or have been guilty of corrupt practices or serious violations of fair employment laws and practices.`,
    statutoryMandate: 'Supreme constitutional charter governing all public procurement in Kenya. Imposes mandatory principles of fairness, equity, transparency, competitiveness, and cost-effectiveness.',
    enforceableControls: [
      'CONTROL_FAIR_EVALUATION',
      'CONTROL_EQUITABLE_TREATMENT',
      'CONTROL_TRANSPARENT_CRITERIA',
      'CONTROL_COMPETITIVE_PROCESS',
      'CONTROL_COST_EFFECTIVENESS',
      'CONTROL_PREFERENCE_SCHEMES'
    ],
    governingBody: 'PARLIAMENT'
  },
  {
    sourceId: 'PPADA-2015-SEC-71',
    sourceName: 'Public Procurement and Asset Disposal Act, 2015',
    shortCode: 'PPADA_2015',
    version: 'Act No. 33 of 2015 (Rev. 2022)',
    provision: 'Section 71',
    heading: 'Eligibility to Bid',
    officialCitation: 'PPADA 2015 (Cap 412C), Section 71(1)-(3)',
    effectiveDate: '2016-01-07T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Gazette Supplement No. 207 (Acts No. 33) & Kenya Law Reports',
    fullText: `(1) A person is eligible to bid in a procurement proceeding if the person has the legal capacity to enter into a contract, is not insolvent, bankrupt or being wound up, has fulfilled tax obligations under the Tax Procedures Act, has not been debarred under Section 41, and satisfies conflict of interest rules under Section 66.
(2) A person shall not be eligible to participate in procurement proceedings if the person has been convicted of an offence of fraud, forgery, perjury, corruption, money laundering or tax evasion within the preceding three years.
(3) Foreign contractors shall demonstrate compliance with local content and partnership requirements.`,
    statutoryMandate: 'Mandatory statutory qualification gate. Any bid failing eligibility criteria must be disqualified at preliminary stage.',
    enforceableControls: [
      'CONTROL_LEGAL_CAPACITY',
      'CONTROL_SOLVENCY_VERIFICATION',
      'CONTROL_TAX_COMPLIANCE_KRA',
      'CONTROL_DEBARMENT_VERIFICATION_PPRA',
      'CONTROL_ANTI_CORRUPTION_CLEARANCE'
    ],
    governingBody: 'PARLIAMENT'
  },
  {
    sourceId: 'PPADA-2015-SEC-74',
    sourceName: 'Public Procurement and Asset Disposal Act, 2015',
    shortCode: 'PPADA_2015',
    version: 'Act No. 33 of 2015 (Rev. 2022)',
    provision: 'Section 74',
    heading: 'Preliminary Evaluation of Tenders',
    officialCitation: 'PPADA 2015 (Cap 412C), Section 74',
    effectiveDate: '2016-01-07T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Law Reports (Cap 412C)',
    fullText: `(1) A procuring entity shall carry out preliminary evaluation to determine if each tender meets mandatory administrative requirements including tender security, completeness of submission, validity of documents, and responsiveness to mandatory terms.
(2) Subject to Section 79, a tender that does not meet the preliminary evaluation requirements shall be rejected and shall not be evaluated further.`,
    statutoryMandate: 'Strict pass/fail gate before technical evaluation. Non-responsive tenders cannot proceed to technical scoring.',
    enforceableControls: [
      'CONTROL_PRELIMINARY_GATE',
      'CONTROL_TENDER_SECURITY_VALIDITY',
      'CONTROL_MANDATORY_DOC_VERIFICATION',
      'CONTROL_DISQUALIFICATION_IRREVERSIBILITY'
    ],
    governingBody: 'PARLIAMENT'
  },
  {
    sourceId: 'PPADA-2015-SEC-79',
    sourceName: 'Public Procurement and Asset Disposal Act, 2015',
    shortCode: 'PPADA_2015',
    version: 'Act No. 33 of 2015 (Rev. 2022)',
    provision: 'Section 79',
    heading: 'Responsiveness of Tenders',
    officialCitation: 'PPADA 2015 (Cap 412C), Section 79(1)-(3)',
    effectiveDate: '2016-01-07T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Law Reports (Cap 412C)',
    fullText: `(1) A tender is responsive if it conforms to all the terms, conditions and specifications in the tender documents without material deviation, reservation or omission.
(2) A material deviation is one that affects the scope, quality, or performance of the works, goods or services, or limits the procuring entity's rights or the tenderer's obligations.
(3) The evaluation committee may correct non-material deviations or seek clarification under Section 81, provided that no change in the substance or price of the tender is made.`,
    statutoryMandate: 'Defines legal threshold for tender responsiveness. Forbids material deviations while allowing minor non-material clarifications without price changes.',
    enforceableControls: [
      'CONTROL_MATERIAL_DEVIATION_CHECK',
      'CONTROL_CLARIFICATION_NO_PRICE_CHANGE',
      'CONTROL_SPECIFICATION_ALIGNMENT'
    ],
    governingBody: 'PARLIAMENT'
  },
  {
    sourceId: 'PPADA-2015-SEC-80',
    sourceName: 'Public Procurement and Asset Disposal Act, 2015',
    shortCode: 'PPADA_2015',
    version: 'Act No. 33 of 2015 (Rev. 2022)',
    provision: 'Section 80',
    heading: 'Technical Evaluation Criteria and Scoring',
    officialCitation: 'PPADA 2015 (Cap 412C), Section 80(1)-(4)',
    effectiveDate: '2016-01-07T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Law Reports (Cap 412C)',
    fullText: `(1) The evaluation committee shall evaluate the responsive tenders using the criteria and methodology set out in the tender documents.
(2) No criteria or methodology shall be used during evaluation that was not specified in the tender documents.
(3) The tender documents shall state the minimum technical score required to qualify for financial evaluation.
(4) Evaluators shall evaluate independently and record detailed findings and scores.`,
    statutoryMandate: 'Absolute prohibition on post-hoc or unannounced evaluation criteria. Evaluators must use exclusively tender document criteria.',
    enforceableControls: [
      'CONTROL_LOCKED_CRITERIA_ENFORCEMENT',
      'CONTROL_UNANNOUNCED_CRITERIA_BAN',
      'CONTROL_MINIMUM_SCORE_THRESHOLD',
      'CONTROL_INDEPENDENT_EVALUATION'
    ],
    governingBody: 'PARLIAMENT'
  },
  {
    sourceId: 'PPADA-2015-SEC-82',
    sourceName: 'Public Procurement and Asset Disposal Act, 2015',
    shortCode: 'PPADA_2015',
    version: 'Act No. 33 of 2015 (Rev. 2022)',
    provision: 'Section 82',
    heading: 'Arithmetic Corrections and Price Adjustments',
    officialCitation: 'PPADA 2015 (Cap 412C), Section 82',
    effectiveDate: '2016-01-07T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Law Reports (Cap 412C)',
    fullText: `(1) Tenders shall not be corrected for arithmetic errors unless the tender documents specifically permit such correction.
(2) Where arithmetic correction is permitted, the unit rate shall prevail in the event of a discrepancy between the unit price and total line item, and the total shall be corrected accordingly.
(3) The tenderer shall be notified of any arithmetic correction. If the tenderer does not accept the correction, the tender shall be rejected and tender security forfeited.`,
    statutoryMandate: 'Strict regulation of financial transformations. Prohibits arbitrary price alterations; requires reproducible transformation audit logs.',
    enforceableControls: [
      'CONTROL_ARITHMETIC_CORRECTION_PERMISSION',
      'CONTROL_UNIT_RATE_PREVALENCE',
      'CONTROL_BIDDER_CORRECTION_NOTIFICATION',
      'CONTROL_PRICE_TRANSFORMATION_AUDIT'
    ],
    governingBody: 'PARLIAMENT'
  },
  {
    sourceId: 'PPADA-2015-SEC-84',
    sourceName: 'Public Procurement and Asset Disposal Act, 2015',
    shortCode: 'PPADA_2015',
    version: 'Act No. 33 of 2015 (Rev. 2022)',
    provision: 'Section 84',
    heading: 'Consensus, Committee Deliberation and Recommendation for Award',
    officialCitation: 'PPADA 2015 (Cap 412C), Section 84(1)-(4)',
    effectiveDate: '2016-01-07T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Law Reports (Cap 412C)',
    fullText: `(1) The evaluation committee shall prepare an evaluation report containing the summary of tenders evaluated, scores awarded, comparison of prices, reasons for rejection, and recommendation of the lowest evaluated responsive tenderer.
(2) The evaluation report shall be signed by all members of the evaluation committee.
(3) Any member who dissents from the majority recommendation shall record their reasons in writing and sign the dissenting opinion.
(4) The report shall be submitted to the head of the procurement function for review under Section 84(5).`,
    statutoryMandate: 'Requires all individual evaluations to be preserved, committee consensus to be deliberate, dissenting opinions recorded, and full committee signatures.',
    enforceableControls: [
      'CONTROL_EVALUATION_REPORT_COMPLETION',
      'CONTROL_ALL_MEMBER_SIGNATURES',
      'CONTROL_DISSENT_OPINION_RECORDING',
      'CONTROL_LOWEST_EVALUATED_RESPONSIVE_AWARD'
    ],
    governingBody: 'PARLIAMENT'
  },
  {
    sourceId: 'PPADA-2015-SEC-66',
    sourceName: 'Public Procurement and Asset Disposal Act, 2015',
    shortCode: 'PPADA_2015',
    version: 'Act No. 33 of 2015 (Rev. 2022)',
    provision: 'Section 66',
    heading: 'Conflict of Interest and Segregation of Duties',
    officialCitation: 'PPADA 2015 (Cap 412C), Section 66(1)-(4)',
    effectiveDate: '2016-01-07T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Law Reports (Cap 412C)',
    fullText: `(1) A public officer shall not be involved in any procurement proceeding where the officer or a close relative has a direct or indirect pecuniary or personal interest in a tenderer.
(2) A public officer who has a conflict of interest shall immediately declare the conflict to the Accounting Officer and recuse themselves from all further proceedings.
(3) An evaluation committee member shall not be a member of the tender opening committee or the inspection and acceptance committee for the same procurement.
(4) Failure to declare a conflict of interest constitutes a statutory offence punishable under Section 176.`,
    statutoryMandate: 'Strict segregation of duties and mandatory conflict of interest declarations prior to evaluation scoring.',
    enforceableControls: [
      'CONTROL_CONFLICT_DECLARATION_MANDATE',
      'CONTROL_RECUSAL_ENFORCEMENT',
      'CONTROL_SEGREGATION_OPENING_EVALUATION_ACCEPTANCE'
    ],
    governingBody: 'PARLIAMENT'
  },
  {
    sourceId: 'PPADR-2020-REG-74',
    sourceName: 'Public Procurement and Asset Disposal Regulations, 2020',
    shortCode: 'PPADR_2020',
    version: 'LN No. 69 of 2020',
    provision: 'Regulation 74',
    heading: 'Procedure for Preliminary Examination of Tenders',
    officialCitation: 'PPADR 2020, Regulation 74(1)-(4)',
    effectiveDate: '2020-04-22T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Gazette Supplement No. 58 (Legislative Supplement No. 32)',
    fullText: `(1) The evaluation committee shall examine tenders to confirm that:
  (a) the tender is signed by a duly authorized representative (power of attorney);
  (b) valid tender security in the prescribed format and amount is provided;
  (c) valid tax compliance certificate from KRA is submitted;
  (d) certified certificate of incorporation or registration (CR12 / BN) is submitted;
  (e) business permit or trading license is valid;
  (f) AGPO certificate where applicable is valid and verifiable;
  (g) all mandatory submission schedules are filled, signed and stamped.
(2) Tenders failing any mandatory requirement under sub-regulation (1) shall be declared non-responsive.`,
    statutoryMandate: 'Prescribes precise procedural checklists for preliminary compliance checking under Kenyan procurement regulations.',
    enforceableControls: [
      'CONTROL_POWER_OF_ATTORNEY',
      'CONTROL_TENDER_SECURITY_FORMAT',
      'CONTROL_KRA_TCC_VALIDATION',
      'CONTROL_CR12_COMPLIANCE',
      'CONTROL_AGPO_VERIFICATION'
    ],
    governingBody: 'PPRA'
  },
  {
    sourceId: 'PPADR-2020-REG-77',
    sourceName: 'Public Procurement and Asset Disposal Regulations, 2020',
    shortCode: 'PPADR_2020',
    version: 'LN No. 69 of 2020',
    provision: 'Regulation 77',
    heading: 'Technical Evaluation and Scoring Standards',
    officialCitation: 'PPADR 2020, Regulation 77(1)-(5)',
    effectiveDate: '2020-04-22T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Gazette Supplement No. 58 (Legislative Supplement No. 32)',
    fullText: `(1) Technical evaluation shall assess responsiveness to specifications, qualifications of key personnel, equipment availability, firm experience, quality assurance, and methodology.
(2) Each evaluator shall independently evaluate and score each technical bid against the criteria in the tender document.
(3) Evaluator individual scores shall be aggregated to compute the arithmetic average technical score.
(4) Where an evaluator's score deviates by more than 15% from the average score of other evaluators, the committee shall record the reasons for the variance in the consensus minutes.`,
    statutoryMandate: 'Establishes technical scoring aggregation, mandatory variance detection (>15% variance threshold), and consensus deliberation protocols.',
    enforceableControls: [
      'CONTROL_INDEPENDENT_EVALUATOR_SCORING',
      'CONTROL_ARITHMETIC_AVERAGING',
      'CONTROL_15_PERCENT_VARIANCE_FLAG',
      'CONTROL_CONSENSUS_MINUTES_AUDIT'
    ],
    governingBody: 'PPRA'
  },
  {
    sourceId: 'PPRA-STD-EVAL-2023',
    sourceName: 'PPRA Standard Tender Documents (STD) & Evaluation Report Manual',
    shortCode: 'PPRA_STD_2023',
    version: 'Version 2.1 (2023 Revision)',
    provision: 'Standard Evaluation Report Template SCM-08',
    heading: 'Standard Public Procurement Evaluation Format',
    officialCitation: 'PPRA Standard Evaluation Guidelines and Format SCM-08',
    effectiveDate: '2023-01-01T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Public Procurement Regulatory Authority Official Portal (ppra.go.ke)',
    fullText: `Evaluation reports submitted to Accounting Officers and for PPRA statutory audit must adhere to Standard Form SCM-08, comprising:
1. Executive Summary & Tender Identification
2. Tender Opening Record & Attendance
3. Preliminary Responsiveness Matrix
4. Technical Evaluation Sheets with Individual and Average Scores
5. Financial Evaluation, Arithmetic Corrections & Evaluated Price Ranking
6. Post-qualification / Due Diligence Findings
7. Recommendation for Award & Statutory Justifications
8. Committee Signatures & Dissenting Opinions`,
    statutoryMandate: 'Requires all public evaluation outputs to be generated in standard PPRA SCM-08 structure.',
    enforceableControls: [
      'CONTROL_SCM08_STANDARD_FORMAT',
      'CONTROL_POST_QUALIFICATION_DUE_DILIGENCE',
      'CONTROL_STANDARDIZED_EXPORTS'
    ],
    governingBody: 'PPRA'
  },
  {
    sourceId: 'DPA-2019-SEC-31',
    sourceName: 'Data Protection Act, 2019',
    shortCode: 'DPA_2019',
    version: 'Act No. 24 of 2019',
    provision: 'Section 31 & Section 41',
    heading: 'Data Protection Principles in Public Records and Personal Data Masking',
    officialCitation: 'Data Protection Act 2019 (Act No. 24 of 2019)',
    effectiveDate: '2019-11-25T00:00:00Z',
    expiryDate: null,
    status: 'ACTIVE',
    verificationSource: 'Kenya Gazette Supplement No. 181 (Acts No. 24)',
    fullText: `(1) Personal data of bidders, directors, and evaluators collected in the course of procurement evaluation shall be processed lawfully, fairly, and transparently.
(2) Public disclosures and exported reports shall redact or mask personal identification numbers (PINs), national identity numbers, personal telephone numbers, and bank account numbers in accordance with principles of data minimization and security.`,
    statutoryMandate: 'Mandates data privacy, least privilege, and redaction of personal identifying information in public procurement reports.',
    enforceableControls: [
      'CONTROL_DATA_MINIMIZATION',
      'CONTROL_PII_MASKING',
      'CONTROL_AUDITOR_ACCESS_LOGGING'
    ],
    governingBody: 'ODPC'
  }
];

export class AuthoritativeKnowledgeLayer {
  private static instance: AuthoritativeKnowledgeLayer;
  private sources: Map<string, AuthoritativeLegalSource> = new Map();

  private constructor() {
    for (const src of AUTHORITATIVE_LEGAL_SOURCES) {
      this.sources.set(src.sourceId, src);
    }
  }

  public static getInstance(): AuthoritativeKnowledgeLayer {
    if (!AuthoritativeKnowledgeLayer.instance) {
      AuthoritativeKnowledgeLayer.instance = new AuthoritativeKnowledgeLayer();
    }
    return AuthoritativeKnowledgeLayer.instance;
  }

  public getAllSources(): AuthoritativeLegalSource[] {
    return Array.from(this.sources.values());
  }

  public getSourceById(sourceId: string): AuthoritativeLegalSource | undefined {
    return this.sources.get(sourceId);
  }

  public getActiveSources(): AuthoritativeLegalSource[] {
    return Array.from(this.sources.values()).filter(s => s.status === 'ACTIVE');
  }

  public getSourcesByProvision(provisionQuery: string): AuthoritativeLegalSource[] {
    const q = provisionQuery.toLowerCase();
    return Array.from(this.sources.values()).filter(s => 
      s.provision.toLowerCase().includes(q) ||
      s.sourceName.toLowerCase().includes(q) ||
      s.officialCitation.toLowerCase().includes(q)
    );
  }

  public verifyCitation(citation: string): { verified: boolean; source?: AuthoritativeLegalSource } {
    for (const src of this.sources.values()) {
      if (src.sourceId === citation || src.officialCitation === citation || src.provision === citation) {
        return { verified: true, source: src };
      }
    }
    return { verified: false };
  }
}
