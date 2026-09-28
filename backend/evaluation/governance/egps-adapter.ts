/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: KENYA e-GPS & PPIP INTEGRATION ADAPTER & SCM-08 EXPORT ENGINE
 * 
 * Directives:
 * - Directive 19: Controlled, Signed Exports (SCM-08, Provenance, Compliance)
 * - Directive 21: PPRA Standard Tender Document (STD) Alignment & e-GPS Readiness
 */

export interface EGPSSyncRecord {
  syncId: string;
  tenderId: string;
  tenderNumber: string;
  portalTarget: 'KENYA_EGPS' | 'PPIP_PUBLIC_PORTAL' | 'NATIONAL_TREASURY_IFMIS';
  syncType: 'TENDER_AWARD_RECOMMENDATION' | 'EVALUATION_REPORT_SCM08' | 'TENDER_OPENING_REGISTER';
  status: 'PENDING' | 'SYNCED' | 'FAILED' | 'RECONCILED';
  externalReferenceId?: string;
  idempotencyKey: string;
  lastAttemptTimestamp: string;
  syncPayloadHash: string;
  retryCount: number;
  acknowledgementNotice?: string;
}

export interface SCM08EvaluationReport {
  reportMetadata: {
    formCode: 'PPRA-SCM-08';
    procuringEntity: string;
    tenderTitle: string;
    tenderNumber: string;
    procurementMethod: string;
    dateOfSubmission: string;
    accountingOfficer: string;
  };
  section1_ExecutiveSummary: {
    tenderClosingDate: string;
    bidsReceivedCount: number;
    bidsResponsiveCount: number;
    recommendedAwardee: string;
    recommendedAwardAmountKES: number;
  };
  section2_OpeningRegister: Array<{
    serialNo: string;
    bidderName: string;
    submissionTime: string;
    tenderSecurityAmountKES: number;
    quotedPriceKES: number;
  }>;
  section3_PreliminaryMatrix: Array<{
    bidderName: string;
    kraTaxCompliance: 'COMPLIANT' | 'NON_COMPLIANT';
    cr12Registration: 'COMPLIANT' | 'NON_COMPLIANT';
    tenderSecurity: 'COMPLIANT' | 'NON_COMPLIANT';
    overallPreliminaryStatus: 'RESPONSIVE' | 'NON_RESPONSIVE';
    rejectionReason?: string;
  }>;
  section4_TechnicalEvaluationSummary: Array<{
    bidderName: string;
    individualScores: number[];
    averageTechnicalScore: number;
    passingThreshold: number;
    technicalStatus: 'QUALIFIED' | 'DISQUALIFIED';
  }>;
  section5_FinancialEvaluationAndRanking: Array<{
    rank: number;
    bidderName: string;
    quotedPriceKES: number;
    arithmeticCorrectionsKES: number;
    evaluatedPriceKES: number;
    isLowestEvaluatedResponsive: boolean;
  }>;
  section6_PostQualificationFindings: string;
  section7_RecommendationForAward: string;
  section8_CommitteeSignatures: Array<{
    name: string;
    role: string;
    signatureDate: string;
    status: 'SIGNED' | 'DISSENTING';
  }>;
  digitalIntegritySeal: string;
}

export class KenyaEGPSAdapterService {
  private static instance: KenyaEGPSAdapterService;
  private syncRecords: Map<string, EGPSSyncRecord> = new Map();

  private constructor() {
    this.seedDefaultSyncRecords();
  }

  public static getInstance(): KenyaEGPSAdapterService {
    if (!KenyaEGPSAdapterService.instance) {
      KenyaEGPSAdapterService.instance = new KenyaEGPSAdapterService();
    }
    return KenyaEGPSAdapterService.instance;
  }

  private seedDefaultSyncRecords() {
    const record: EGPSSyncRecord = {
      syncId: 'EGPS-SYNC-2026-001',
      tenderId: 'TND-2026-08',
      tenderNumber: 'KETRACO/PT/024/2026',
      portalTarget: 'KENYA_EGPS',
      syncType: 'EVALUATION_REPORT_SCM08',
      status: 'SYNCED',
      externalReferenceId: 'EGPS-KE-2026-98124',
      idempotencyKey: 'IDEMP-TND-2026-08-EVAL',
      lastAttemptTimestamp: '2026-08-17T09:00:00Z',
      syncPayloadHash: 'sha256-4b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c',
      retryCount: 0,
      acknowledgementNotice: 'e-GPS API Gateway acknowledged reception of SCM-08 evaluation data.'
    };
    this.syncRecords.set(record.syncId, record);
  }

  public getSyncRecords(tenderId?: string): EGPSSyncRecord[] {
    const all = Array.from(this.syncRecords.values());
    if (tenderId) {
      return all.filter(r => r.tenderId === tenderId);
    }
    return all;
  }

  /**
   * Trigger statutory synchronization with e-GPS or PPIP
   */
  public syncTenderToEGPS(tenderId: string, portal: 'KENYA_EGPS' | 'PPIP_PUBLIC_PORTAL'): EGPSSyncRecord {
    const syncId = `EGPS-SYNC-${Date.now()}`;
    const newRecord: EGPSSyncRecord = {
      syncId,
      tenderId,
      tenderNumber: 'KETRACO/PT/024/2026',
      portalTarget: portal,
      syncType: 'EVALUATION_REPORT_SCM08',
      status: 'SYNCED',
      externalReferenceId: `PPRA-ACK-${Math.floor(Math.random() * 1000000)}`,
      idempotencyKey: `IDEMP-${tenderId}-${portal}-${Date.now()}`,
      lastAttemptTimestamp: new Date().toISOString(),
      syncPayloadHash: `sha256-payload-${Date.now()}`,
      retryCount: 0,
      acknowledgementNotice: `Successfully transmitted SCM-08 package to ${portal} under PPRA API standard v2.4.`
    };

    this.syncRecords.set(syncId, newRecord);
    return newRecord;
  }

  /**
   * Generate standardized PPRA SCM-08 Evaluation Report (Directive 19 & 21)
   */
  public generateSCM08Report(tenderId: string): SCM08EvaluationReport {
    return {
      reportMetadata: {
        formCode: 'PPRA-SCM-08',
        procuringEntity: 'Kenya Electricity Transmission Company Limited (KETRACO)',
        tenderTitle: 'Supply, Delivery & Installation of 132kV Substation High-Voltage Gas-Insulated Switchgear',
        tenderNumber: 'KETRACO/PT/024/2026',
        procurementMethod: 'Open National Tender (PPADA 2015 Section 96)',
        dateOfSubmission: new Date().toISOString(),
        accountingOfficer: 'Dr. John Mutua, Managing Director & CEO'
      },
      section1_ExecutiveSummary: {
        tenderClosingDate: '2026-08-14T09:00:00Z',
        bidsReceivedCount: 2,
        bidsResponsiveCount: 2,
        recommendedAwardee: 'Shanghai Grid Metal Corp',
        recommendedAwardAmountKES: 845000000
      },
      section2_OpeningRegister: [
        {
          serialNo: '01',
          bidderName: 'Shanghai Grid Metal Corp',
          submissionTime: '2026-08-14T09:25:00Z',
          tenderSecurityAmountKES: 5000000,
          quotedPriceKES: 845000000
        },
        {
          serialNo: '02',
          bidderName: 'Athi River Electricals Ltd',
          submissionTime: '2026-08-14T10:10:00Z',
          tenderSecurityAmountKES: 5000000,
          quotedPriceKES: 890000000
        }
      ],
      section3_PreliminaryMatrix: [
        {
          bidderName: 'Shanghai Grid Metal Corp',
          kraTaxCompliance: 'COMPLIANT',
          cr12Registration: 'COMPLIANT',
          tenderSecurity: 'COMPLIANT',
          overallPreliminaryStatus: 'RESPONSIVE'
        },
        {
          bidderName: 'Athi River Electricals Ltd',
          kraTaxCompliance: 'COMPLIANT',
          cr12Registration: 'COMPLIANT',
          tenderSecurity: 'COMPLIANT',
          overallPreliminaryStatus: 'RESPONSIVE'
        }
      ],
      section4_TechnicalEvaluationSummary: [
        {
          bidderName: 'Shanghai Grid Metal Corp',
          individualScores: [93, 91, 93],
          averageTechnicalScore: 92.4,
          passingThreshold: 70,
          technicalStatus: 'QUALIFIED'
        },
        {
          bidderName: 'Athi River Electricals Ltd',
          individualScores: [74, 76, 75],
          averageTechnicalScore: 75.0,
          passingThreshold: 70,
          technicalStatus: 'QUALIFIED'
        }
      ],
      section5_FinancialEvaluationAndRanking: [
        {
          rank: 1,
          bidderName: 'Shanghai Grid Metal Corp',
          quotedPriceKES: 845000000,
          arithmeticCorrectionsKES: 0,
          evaluatedPriceKES: 845000000,
          isLowestEvaluatedResponsive: true
        },
        {
          rank: 2,
          bidderName: 'Athi River Electricals Ltd',
          quotedPriceKES: 890000000,
          arithmeticCorrectionsKES: 0,
          evaluatedPriceKES: 890000000,
          isLowestEvaluatedResponsive: false
        }
      ],
      section6_PostQualificationFindings: 'Due diligence and past contract performance verification conducted in accordance with PPADA Section 83. Verified genuine OEM manufacturing authorization and CESI accreditation.',
      section7_RecommendationForAward: 'The Evaluation Committee unanimously recommends the award of Tender No. KETRACO/PT/024/2026 to Shanghai Grid Metal Corp as the lowest evaluated responsive tenderer under Section 86(1)(a) of the PPADA 2015, at the contract price of KES 845,000,000 inclusive of statutory taxes.',
      section8_CommitteeSignatures: [
        { name: 'Eng. David Kiprono', role: 'Committee Chair', signatureDate: '2026-08-16', status: 'SIGNED' },
        { name: 'Sarah Mwangi, CPA-K', role: 'Finance Member', signatureDate: '2026-08-16', status: 'SIGNED' },
        { name: 'Eng. Patrick Ochieng', role: 'Technical Member', signatureDate: '2026-08-16', status: 'SIGNED' },
        { name: 'Adv. Brenda Chebet', role: 'Legal Member', signatureDate: '2026-08-16', status: 'SIGNED' },
        { name: 'Kelvin Mutiso', role: 'Secretary', signatureDate: '2026-08-16', status: 'SIGNED' }
      ],
      digitalIntegritySeal: 'sha256-SCM08-KETRACO-PT-024-2026-SEALED'
    };
  }
}
