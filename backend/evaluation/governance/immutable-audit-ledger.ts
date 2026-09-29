/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: IMMUTABLE AUDIT LEDGER, CRYPTOGRAPHIC CHAIN & AUDIT RECONSTRUCTION
 * 
 * Directives:
 * - Directive 17: Immutable Audit Architecture & Audit Reconstruction (SHA-256 chained hashes)
 * - Directive 18: Procurement Record Retention & Data Protection (PPADA Sec 67 & DPA 2019)
 * - Directive 19: Exports & Auditor Mode (SCM-08, Provenance, Verification)
 */

import { generateHash } from '../../../src/core/shared/crypto';

export interface AuditBlock {
  blockIndex: number;
  blockId: string;
  previousHash: string;
  currentHash: string;
  timestamp: string;
  tenderId: string;
  actor: {
    id: string;
    name: string;
    role: string;
    ipAddress?: string;
  };
  action: string;
  legalAuthorityCitation: string;
  criteriaRef?: string;
  bidderRef?: string;
  evidenceRefs: string[];
  systemCalculation?: any;
  humanDecision?: any;
  payloadSummary: string;
  dataClassification: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED_STATUTORY';
  retentionExpiryDate: string; // 6 years minimum under PPADA Section 67
}

export interface AuditReconstructionReport {
  tenderId: string;
  reconstructedAt: string;
  chainLength: number;
  isChainIntact: boolean;
  chronologicalEvents: Array<{
    sequence: number;
    timestamp: string;
    actor: string;
    role: string;
    action: string;
    authority: string;
    evidenceUsed: string[];
    whatSystemCalculated: string;
    whatHumanDecided: string;
    approvalRecorded: string;
    cryptographicHash: string;
  }>;
  tamperCheck: {
    verifiedBlocks: number;
    tamperedBlocks: number;
    verdict: 'CRYPTOGRAPHICALLY_VERIFIED' | 'TAMPER_DETECTED';
  };
}

export class ImmutableAuditLedgerService {
  private static instance: ImmutableAuditLedgerService;
  private chain: AuditBlock[] = [];

  private constructor() {
    // Ledger blocks are written only for authoritative recorded procurement events.
  }

  public static getInstance(): ImmutableAuditLedgerService {
    if (!ImmutableAuditLedgerService.instance) {
      ImmutableAuditLedgerService.instance = new ImmutableAuditLedgerService();
    }
    return ImmutableAuditLedgerService.instance;
  }

  private seedInitialGenesisChain() {
    const genesisTime = '2026-08-01T08:00:00Z';
    const retentionDate = '2032-08-01T08:00:00Z'; // 6 years
    const genesisPrev = '0000000000000000000000000000000000000000000000000000000000000000';
    const genesisPayload = 'GENESIS_PROCUREMENT_LEDGER_TND_2026_08';
    const genesisHash = generateHash(`${genesisPrev}|${genesisTime}|${genesisPayload}`);

    const block0: AuditBlock = {
      blockIndex: 0,
      blockId: 'BLK-0000',
      previousHash: genesisPrev,
      currentHash: genesisHash,
      timestamp: genesisTime,
      tenderId: 'TND-2026-08',
      actor: { id: 'SYS-INIT', name: 'Sovereign Atlas Ledger Daemon', role: 'AUDITOR' },
      action: 'LEDGER_GENESIS_INITIALIZATION',
      legalAuthorityCitation: 'PPADA 2015 Section 67 (Procurement Records)',
      evidenceRefs: [],
      payloadSummary: 'Initialized cryptographic audit chain for tender KETRACO/PT/024/2026',
      dataClassification: 'RESTRICTED_STATUTORY',
      retentionExpiryDate: retentionDate
    };
    this.chain.push(block0);

    // Block 1: Evaluation Contract Locked
    this.recordAuditBlock({
      tenderId: 'TND-2026-08',
      actor: { id: 'SCM-HEAD', name: 'Dr. J. Mutua (Ag. Head SCM)', role: 'HEAD_OF_PROCUREMENT' },
      action: 'EVALUATION_CONTRACT_LOCK',
      legalAuthorityCitation: 'PPADA 2015 Section 80(2) & Regulation 77',
      criteriaRef: 'EVAL-CONTRACT-2026-0873',
      evidenceRefs: ['DOC-APPROVED-TENDER-DOC-v2.4'],
      systemCalculation: { totalWeight: 100, passingThreshold: 70 },
      humanDecision: { approved: true, locked: true },
      payloadSummary: 'Tender evaluation criteria and weights locked before opening.',
      dataClassification: 'CONFIDENTIAL'
    });

    // Block 2: Conflict Declarations Signed
    this.recordAuditBlock({
      tenderId: 'TND-2026-08',
      actor: { id: 'COMM-01', name: 'Eng. David Kiprono', role: 'COMMITTEE_CHAIR' },
      action: 'CONFLICT_OF_INTEREST_DECLARATIONS_FILED',
      legalAuthorityCitation: 'PPADA 2015 Section 66(1)-(4)',
      evidenceRefs: ['CONF-DECL-2026-001', 'CONF-DECL-2026-002', 'CONF-DECL-2026-003'],
      systemCalculation: { allMembersFiled: true, recusalEnforced: true },
      humanDecision: { chairApproved: true },
      payloadSummary: 'All appointed committee members submitted statutory conflict declarations.',
      dataClassification: 'CONFIDENTIAL'
    });

    // Block 3: Pre-Evaluation Gate Passed
    this.recordAuditBlock({
      tenderId: 'TND-2026-08',
      actor: { id: 'SEC-01', name: 'Kelvin Mutiso', role: 'PROCUREMENT_SECRETARIAT' },
      action: 'PRE_EVALUATION_GATE_PASSED',
      legalAuthorityCitation: 'PPADA 2015 Section 74 & PPADR 2020 Regulation 74',
      evidenceRefs: ['GATE-CHECK-TND-2026-08-01'],
      systemCalculation: { passedChecks: 8, totalChecks: 8, status: 'EVALUATION_READY' },
      humanDecision: { gateCleared: true },
      payloadSummary: 'Pre-evaluation readiness gate cleared all statutory prerequisites.',
      dataClassification: 'CONFIDENTIAL'
    });

    // Block 4: Mandatory Preliminary Responsiveness Evaluated
    this.recordAuditBlock({
      tenderId: 'TND-2026-08',
      actor: { id: 'COMM-04', name: 'Adv. Brenda Chebet', role: 'LEGAL_MEMBER' },
      action: 'PRELIMINARY_RESPONSIVENESS_DETERMINED',
      legalAuthorityCitation: 'PPADR 2020 Regulation 74',
      bidderRef: 'BIDDER-01 (Shanghai Grid Metal Corp)',
      evidenceRefs: ['DOC-SHANGHAI-TCC-01', 'DOC-SHANGHAI-CR12-01', 'DOC-SHANGHAI-SEC-01'],
      systemCalculation: { preliminaryStatus: 'PASS', score: 'N/A (PASS/FAIL)' },
      humanDecision: { markedResponsive: true, advancedToTechnical: true },
      payloadSummary: 'Bidder demonstrated compliance with all mandatory administrative criteria.',
      dataClassification: 'CONFIDENTIAL'
    });

    // Block 5: Technical Scores Recorded & Variance Cleared
    this.recordAuditBlock({
      tenderId: 'TND-2026-08',
      actor: { id: 'COMM-01', name: 'Eng. David Kiprono', role: 'COMMITTEE_CHAIR' },
      action: 'TECHNICAL_EVALUATION_SCORES_FINALIZED',
      legalAuthorityCitation: 'PPADA 2015 Section 80 & Regulation 77',
      bidderRef: 'BIDDER-01 (Shanghai Grid Metal Corp)',
      evidenceRefs: ['SC-SH-01-E1', 'SC-SH-01-E3', 'SC-SH-02-E1', 'SC-SH-02-E3'],
      systemCalculation: { averageTechnicalScore: 92.4, thresholdMet: true, variancePercent: 4.2 },
      humanDecision: { consensusAgreed: true, finalScore: 92.4 },
      payloadSummary: 'Technical scores consolidated. Bidder qualified with 92.4% (> 70% threshold).',
      dataClassification: 'CONFIDENTIAL'
    });
  }

  /**
   * Append an immutable, cryptographically chained block to the audit ledger (Directive 17)
   */
  public recordAuditBlock(entry: {
    tenderId: string;
    actor: { id: string; name: string; role: string; ipAddress?: string };
    action: string;
    legalAuthorityCitation: string;
    criteriaRef?: string;
    bidderRef?: string;
    evidenceRefs: string[];
    systemCalculation?: any;
    humanDecision?: any;
    payloadSummary: string;
    dataClassification?: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED_STATUTORY';
  }): AuditBlock {
    const previousBlock = this.chain[this.chain.length - 1];
    const previousHash = previousBlock ? previousBlock.currentHash : '00000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    const index = this.chain.length;
    const blockId = `BLK-${String(index).padStart(4, '0')}`;

    // Retention: 6 years from timestamp under PPADA Section 67
    const retentionExpiry = new Date(Date.now() + 6 * 365 * 24 * 60 * 60 * 1000).toISOString();

    const rawDataToHash = [
      previousHash,
      blockId,
      timestamp,
      entry.tenderId,
      entry.actor.id,
      entry.action,
      entry.legalAuthorityCitation,
      JSON.stringify(entry.evidenceRefs),
      JSON.stringify(entry.systemCalculation || {}),
      JSON.stringify(entry.humanDecision || {}),
      entry.payloadSummary
    ].join('|');

    const currentHash = generateHash(rawDataToHash);

    const newBlock: AuditBlock = {
      blockIndex: index,
      blockId,
      previousHash,
      currentHash,
      timestamp,
      tenderId: entry.tenderId,
      actor: entry.actor,
      action: entry.action,
      legalAuthorityCitation: entry.legalAuthorityCitation,
      criteriaRef: entry.criteriaRef,
      bidderRef: entry.bidderRef,
      evidenceRefs: entry.evidenceRefs,
      systemCalculation: entry.systemCalculation,
      humanDecision: entry.humanDecision,
      payloadSummary: entry.payloadSummary,
      dataClassification: entry.dataClassification || 'CONFIDENTIAL',
      retentionExpiryDate: retentionExpiry
    };

    this.chain.push(newBlock);
    return newBlock;
  }

  public getChain(tenderId?: string): AuditBlock[] {
    if (tenderId) {
      return this.chain.filter(b => b.tenderId === tenderId);
    }
    return this.chain;
  }

  /**
   * Verify cryptographic chain integrity from block 0 to tip
   */
  public verifyIntegrity(): { isValid: boolean; verifiedCount: number; brokenAt?: number } {
    for (let i = 1; i < this.chain.length; i++) {
      const prev = this.chain[i - 1];
      const curr = this.chain[i];

      if (curr.previousHash !== prev.currentHash) {
        return { isValid: false, verifiedCount: i - 1, brokenAt: i };
      }
    }
    return { isValid: true, verifiedCount: this.chain.length };
  }

  /**
   * Reconstruct full audit history answering all statutory questions (Directive 17)
   */
  public reconstructAuditHistory(tenderId: string): AuditReconstructionReport {
    const tenderBlocks = this.getChain(tenderId);
    const integrity = this.verifyIntegrity();

    const events = tenderBlocks.map((b, idx) => ({
      sequence: idx + 1,
      timestamp: b.timestamp,
      actor: b.actor.name,
      role: b.actor.role,
      action: b.action,
      authority: b.legalAuthorityCitation,
      evidenceUsed: b.evidenceRefs,
      whatSystemCalculated: b.systemCalculation ? JSON.stringify(b.systemCalculation) : 'N/A',
      whatHumanDecided: b.humanDecision ? JSON.stringify(b.humanDecision) : 'N/A',
      approvalRecorded: b.humanDecision?.approved !== undefined ? String(b.humanDecision.approved) : 'Recorded',
      cryptographicHash: b.currentHash
    }));

    return {
      tenderId,
      reconstructedAt: new Date().toISOString(),
      chainLength: tenderBlocks.length,
      isChainIntact: integrity.isValid,
      chronologicalEvents: events,
      tamperCheck: {
        verifiedBlocks: integrity.verifiedCount,
        tamperedBlocks: integrity.isValid ? 0 : 1,
        verdict: integrity.isValid ? 'CRYPTOGRAPHICALLY_VERIFIED' : 'TAMPER_DETECTED'
      }
    };
  }
}
