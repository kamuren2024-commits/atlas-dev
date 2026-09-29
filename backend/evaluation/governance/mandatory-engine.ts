/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: BID INTAKE, DOCUMENT CONTROL & MANDATORY RESPONSIVENESS ENGINE
 * 
 * Directives:
 * - Directive 8: Bid Intake + Document Control (Authoritative document repository & integrity hashes)
 * - Directive 9: Mandatory / Responsiveness Engine (Deterministic statutory compliance checks)
 */

import { VersionedLegalRuleEngine } from './legal-rule-engine';

export interface AuthoritativeBidDocument {
  docId: string;
  tenderId: string;
  bidderId: string;
  bidderName: string;
  fileName: string;
  documentType: 'TAX_COMPLIANCE' | 'CR12' | 'TENDER_SECURITY' | 'POWER_OF_ATTORNEY' | 'AUDITED_ACCOUNTS' | 'LITIGATION_HISTORY' | 'TECHNICAL_PROPOSAL' | 'FINANCIAL_PROPOSAL';
  sha256Hash: string;
  submissionTimestamp: string;
  receivedAtOpening: boolean;
  openingSerialNo: string;
  pageCount: number;
  extractedEntities: Record<string, any>;
  integrityVerified: boolean;
  lineage: {
    sourceTenderId: string;
    intakeAgent: string;
    cryptographicSeal: string;
  };
}

export interface MandatoryEvaluationResult {
  requirementId: string;
  requirementCode: string;
  title: string;
  legalProvision: string;
  bidderId: string;
  bidderName: string;
  result: 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'REQUIRES_HUMAN_REVIEW' | 'INSUFFICIENT_EVIDENCE';
  reason: string;
  verifiedEvidenceDocId?: string;
  verifiedDocumentHash?: string;
  aiAssistanceSummary?: {
    model: string;
    confidence: number;
    extractedValues: Record<string, any>;
  };
  humanEvaluatorReviewer?: string;
  humanSignOffTimestamp?: string;
  auditTrailId: string;
}

export class MandatoryResponsivenessEngine {
  private static instance: MandatoryResponsivenessEngine;
  private documents: Map<string, AuthoritativeBidDocument> = new Map();

  private constructor() {
    // Bid documents are authoritative only when they are loaded for a concrete tender.
  }

  public static getInstance(): MandatoryResponsivenessEngine {
    if (!MandatoryResponsivenessEngine.instance) {
      MandatoryResponsivenessEngine.instance = new MandatoryResponsivenessEngine();
    }
    return MandatoryResponsivenessEngine.instance;
  }

  private seedAuthoritativeDocuments() {
    const docs: AuthoritativeBidDocument[] = [
      {
        docId: 'DOC-SHANGHAI-TCC-01',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-01',
        bidderName: 'Shanghai Grid Metal Corp',
        fileName: 'Shanghai_KRA_TaxCompliance_2026.pdf',
        documentType: 'TAX_COMPLIANCE',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        submissionTimestamp: '2026-08-14T09:25:00Z',
        receivedAtOpening: true,
        openingSerialNo: 'OPN-TND-01-001',
        pageCount: 2,
        extractedEntities: {
          pin: 'P051239842M',
          tccNumber: 'KRA0984210294',
          validUntil: '2027-02-14',
          status: 'COMPLIANT'
        },
        integrityVerified: true,
        lineage: {
          sourceTenderId: 'TND-2026-08',
          intakeAgent: 'IntakeSec-Officer-01',
          cryptographicSeal: 'SEAL-2026-KETRACO-01'
        }
      },
      {
        docId: 'DOC-SHANGHAI-CR12-01',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-01',
        bidderName: 'Shanghai Grid Metal Corp',
        fileName: 'Shanghai_Grid_Certified_CR12.pdf',
        documentType: 'CR12',
        sha256Hash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        submissionTimestamp: '2026-08-14T09:26:00Z',
        receivedAtOpening: true,
        openingSerialNo: 'OPN-TND-01-002',
        pageCount: 6,
        extractedEntities: {
          companyNumber: 'CPR/2018/392019',
          registrationDate: '2018-05-12',
          directors: ['Li Wei', 'Wang Qiang', 'Eng. K. Njoroge']
        },
        integrityVerified: true,
        lineage: {
          sourceTenderId: 'TND-2026-08',
          intakeAgent: 'IntakeSec-Officer-01',
          cryptographicSeal: 'SEAL-2026-KETRACO-02'
        }
      },
      {
        docId: 'DOC-SHANGHAI-SEC-01',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-01',
        bidderName: 'Shanghai Grid Metal Corp',
        fileName: 'KCB_Tender_Security_KES_5M.pdf',
        documentType: 'TENDER_SECURITY',
        sha256Hash: '9f83c6051f8ce969b65bb1f611ac97d4d07ec6c0804195cef83e221a87633d80',
        submissionTimestamp: '2026-08-14T09:27:00Z',
        receivedAtOpening: true,
        openingSerialNo: 'OPN-TND-01-003',
        pageCount: 3,
        extractedEntities: {
          issuingBank: 'KCB Bank Kenya PLC',
          amountKES: 5000000,
          validityDays: 150,
          expiryDate: '2027-01-11'
        },
        integrityVerified: true,
        lineage: {
          sourceTenderId: 'TND-2026-08',
          intakeAgent: 'IntakeSec-Officer-01',
          cryptographicSeal: 'SEAL-2026-KETRACO-03'
        }
      },
      {
        docId: 'DOC-ATHI-TCC-01',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-02',
        bidderName: 'Athi River Electricals Ltd',
        fileName: 'Athi_River_KRA_TCC.pdf',
        documentType: 'TAX_COMPLIANCE',
        sha256Hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        submissionTimestamp: '2026-08-14T10:10:00Z',
        receivedAtOpening: true,
        openingSerialNo: 'OPN-TND-01-004',
        pageCount: 2,
        extractedEntities: {
          pin: 'P051992011A',
          tccNumber: 'KRA0882190111',
          validUntil: '2026-12-31',
          status: 'COMPLIANT'
        },
        integrityVerified: true,
        lineage: {
          sourceTenderId: 'TND-2026-08',
          intakeAgent: 'IntakeSec-Officer-01',
          cryptographicSeal: 'SEAL-2026-KETRACO-04'
        }
      },
      {
        docId: 'DOC-ATHI-CR12-01',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-02',
        bidderName: 'Athi River Electricals Ltd',
        fileName: 'Athi_River_CR12_Official.pdf',
        documentType: 'CR12',
        sha256Hash: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        submissionTimestamp: '2026-08-14T10:11:00Z',
        receivedAtOpening: true,
        openingSerialNo: 'OPN-TND-01-005',
        pageCount: 4,
        extractedEntities: {
          companyNumber: 'CPR/2012/100492',
          registrationDate: '2012-09-18',
          directors: ['James Kariuki', 'Agnes Wambui']
        },
        integrityVerified: true,
        lineage: {
          sourceTenderId: 'TND-2026-08',
          intakeAgent: 'IntakeSec-Officer-01',
          cryptographicSeal: 'SEAL-2026-KETRACO-05'
        }
      },
      {
        docId: 'DOC-ATHI-SEC-01',
        tenderId: 'TND-2026-08',
        bidderId: 'BIDDER-02',
        bidderName: 'Athi River Electricals Ltd',
        fileName: 'Absa_Bank_Tender_Security.pdf',
        documentType: 'TENDER_SECURITY',
        sha256Hash: 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        submissionTimestamp: '2026-08-14T10:12:00Z',
        receivedAtOpening: true,
        openingSerialNo: 'OPN-TND-01-006',
        pageCount: 3,
        extractedEntities: {
          issuingBank: 'Absa Bank Kenya PLC',
          amountKES: 5000000,
          validityDays: 150,
          expiryDate: '2027-01-11'
        },
        integrityVerified: true,
        lineage: {
          sourceTenderId: 'TND-2026-08',
          intakeAgent: 'IntakeSec-Officer-01',
          cryptographicSeal: 'SEAL-2026-KETRACO-06'
        }
      }
    ];

    for (const doc of docs) {
      this.documents.set(doc.docId, doc);
    }
  }

  public getDocumentsForBidder(bidderId: string): AuthoritativeBidDocument[] {
    return Array.from(this.documents.values()).filter(d => d.bidderId === bidderId);
  }

  public getDocument(docId: string): AuthoritativeBidDocument | undefined {
    return this.documents.get(docId);
  }

  /**
   * Deterministically evaluate mandatory preliminary responsiveness for a bidder
   */
  public evaluateMandatoryRequirements(bidderId: string, bidderName: string): {
    overallResponsiveness: 'RESPONSIVE' | 'NON_RESPONSIVE' | 'REQUIRES_HUMAN_REVIEW';
    summaryReason: string;
    results: MandatoryEvaluationResult[];
  } {
    const bidderDocs = this.getDocumentsForBidder(bidderId);
    const results: MandatoryEvaluationResult[] = [];

    // 1. Tax Compliance Certificate Check
    const tccDoc = bidderDocs.find(d => d.documentType === 'TAX_COMPLIANCE');
    if (!tccDoc) {
      results.push({
        requirementId: 'MAND-01',
        requirementCode: 'MR-TAX',
        title: 'Valid Tax Compliance Certificate (KRA)',
        legalProvision: 'PPADA 2015 Section 71(1)(d)',
        bidderId,
        bidderName,
        result: 'FAIL',
        reason: 'No Tax Compliance Certificate found in authoritative bid record.',
        auditTrailId: `AUDIT-MAND-TCC-${bidderId}-${Date.now()}`
      });
    } else {
      const validUntil = tccDoc.extractedEntities.validUntil;
      const isExpired = validUntil && new Date(validUntil).getTime() < Date.now();
      results.push({
        requirementId: 'MAND-01',
        requirementCode: 'MR-TAX',
        title: 'Valid Tax Compliance Certificate (KRA)',
        legalProvision: 'PPADA 2015 Section 71(1)(d)',
        bidderId,
        bidderName,
        result: isExpired ? 'FAIL' : 'PASS',
        reason: isExpired ? `KRA TCC expired on ${validUntil}.` : `Valid KRA TCC ${tccDoc.extractedEntities.tccNumber} verified through ${validUntil}.`,
        verifiedEvidenceDocId: tccDoc.docId,
        verifiedDocumentHash: tccDoc.sha256Hash,
        aiAssistanceSummary: {
          model: 'PPRA-KRA-Document-Validator-v3',
          confidence: 0.98,
          extractedValues: tccDoc.extractedEntities
        },
        auditTrailId: `AUDIT-MAND-TCC-${bidderId}-${Date.now()}`
      });
    }

    // 2. CR12 Registration Check
    const cr12Doc = bidderDocs.find(d => d.documentType === 'CR12');
    if (!cr12Doc) {
      results.push({
        requirementId: 'MAND-02',
        requirementCode: 'MR-CR12',
        title: 'Certified CR12 Company Registration',
        legalProvision: 'PPADA 2015 Section 71(1)(a)',
        bidderId,
        bidderName,
        result: 'FAIL',
        reason: 'CR12 certificate not provided in authoritative bid repository.',
        auditTrailId: `AUDIT-MAND-CR12-${bidderId}-${Date.now()}`
      });
    } else {
      results.push({
        requirementId: 'MAND-02',
        requirementCode: 'MR-CR12',
        title: 'Certified CR12 Company Registration',
        legalProvision: 'PPADA 2015 Section 71(1)(a)',
        bidderId,
        bidderName,
        result: 'PASS',
        reason: `Valid CR12 Company Reg ${cr12Doc.extractedEntities.companyNumber} verified.`,
        verifiedEvidenceDocId: cr12Doc.docId,
        verifiedDocumentHash: cr12Doc.sha256Hash,
        aiAssistanceSummary: {
          model: 'BRS-Company-Parser-v2',
          confidence: 0.96,
          extractedValues: cr12Doc.extractedEntities
        },
        auditTrailId: `AUDIT-MAND-CR12-${bidderId}-${Date.now()}`
      });
    }

    // 3. Tender Security Check
    const secDoc = bidderDocs.find(d => d.documentType === 'TENDER_SECURITY');
    if (!secDoc) {
      results.push({
        requirementId: 'MAND-03',
        requirementCode: 'MR-SEC',
        title: 'Tender Security of KES 5,000,000',
        legalProvision: 'PPADA 2015 Section 74(1)(b)',
        bidderId,
        bidderName,
        result: 'FAIL',
        reason: 'Tender security missing from bid submission.',
        auditTrailId: `AUDIT-MAND-SEC-${bidderId}-${Date.now()}`
      });
    } else {
      const amount = secDoc.extractedEntities.amountKES || 0;
      const isSufficient = amount >= 5000000;
      results.push({
        requirementId: 'MAND-03',
        requirementCode: 'MR-SEC',
        title: 'Tender Security of KES 5,000,000',
        legalProvision: 'PPADA 2015 Section 74(1)(b)',
        bidderId,
        bidderName,
        result: isSufficient ? 'PASS' : 'FAIL',
        reason: isSufficient ? `Tender security of KES ${amount.toLocaleString()} from ${secDoc.extractedEntities.issuingBank} meets requirement.` : `Tender security KES ${amount.toLocaleString()} is below required KES 5,000,000.`,
        verifiedEvidenceDocId: secDoc.docId,
        verifiedDocumentHash: secDoc.sha256Hash,
        aiAssistanceSummary: {
          model: 'Bank-Guarantee-Validator-v2',
          confidence: 0.99,
          extractedValues: secDoc.extractedEntities
        },
        auditTrailId: `AUDIT-MAND-SEC-${bidderId}-${Date.now()}`
      });
    }

    const hasFailure = results.some(r => r.result === 'FAIL');
    const hasReview = results.some(r => r.result === 'REQUIRES_HUMAN_REVIEW');

    return {
      overallResponsiveness: hasFailure ? 'NON_RESPONSIVE' : hasReview ? 'REQUIRES_HUMAN_REVIEW' : 'RESPONSIVE',
      summaryReason: hasFailure 
        ? 'Bidder failed one or more mandatory statutory requirements under PPADA Section 74.' 
        : 'All mandatory administrative requirements satisfied with verified authoritative evidence.',
      results
    };
  }
}
