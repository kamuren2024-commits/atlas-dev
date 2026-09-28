// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — EVIDENCE PROVENANCE
// Tracks the lineage and custody of all evidence used in AI decisions
// ============================================================================

import { Evidence, EvidenceProvenance as EvidenceProvenanceType } from '../federation/types';
import { generateId } from '../../../src/core/shared/crypto';
import crypto from 'crypto';

export interface EvidenceChain {
  id: string;
  inferenceRequestId: string;
  evidenceItems: Evidence[];
  verifiedBy?: string;
  verifiedAt?: string;
  integrityValid: boolean;
  createdAt: string;
}

export class EvidenceProvenance {
  private static instance: EvidenceProvenance;
  private chains: Map<string, EvidenceChain> = new Map();

  private constructor() {}

  public static getInstance(): EvidenceProvenance {
    if (!EvidenceProvenance.instance) {
      EvidenceProvenance.instance = new EvidenceProvenance();
    }
    return EvidenceProvenance.instance;
  }

  /**
   * Create a new evidence chain for an inference request
   */
  createChain(inferenceRequestId: string): string {
    const chainId = generateId('evc');
    this.chains.set(chainId, {
      id: chainId,
      inferenceRequestId,
      evidenceItems: [],
      integrityValid: true,
      createdAt: new Date().toISOString(),
    });
    return chainId;
  }

  /**
   * Add evidence to a chain
   */
  addEvidence(
    chainId: string,
    evidence: Omit<Evidence, 'provenance'>,
    handler: string
  ): Evidence {
    const chain = this.chains.get(chainId);
    if (!chain) throw new Error(`Evidence chain ${chainId} not found`);

    const fullEvidence: Evidence = {
      ...evidence,
      provenance: {
        collectedBy: handler,
        collectedAt: new Date().toISOString(),
        chainOfCustody: [{
          handler,
          action: 'COLLECTED',
          timestamp: new Date().toISOString(),
          hash: this.hashEvidence(evidence),
        }],
      },
    };

    chain.evidenceItems.push(fullEvidence);
    return fullEvidence;
  }

  /**
   * Verify evidence in a chain
   */
  verifyEvidence(
    chainId: string,
    evidenceIndex: number,
    verifier: string
  ): boolean {
    const chain = this.chains.get(chainId);
    if (!chain) return false;

    const evidence = chain.evidenceItems[evidenceIndex];
    if (!evidence) return false;

    evidence.provenance.verifiedBy = verifier;
    evidence.provenance.verifiedAt = new Date().toISOString();
    evidence.provenance.chainOfCustody.push({
      handler: verifier,
      action: 'VERIFIED',
      timestamp: new Date().toISOString(),
      hash: this.hashEvidence(evidence),
    });

    return true;
  }

  /**
   * Get the full evidence chain for an inference request
   */
  getChainForRequest(inferenceRequestId: string): EvidenceChain | undefined {
    return Array.from(this.chains.values()).find(
      c => c.inferenceRequestId === inferenceRequestId
    );
  }

  /**
   * Get a specific evidence chain
   */
  getChain(chainId: string): EvidenceChain | undefined {
    return this.chains.get(chainId);
  }

  /**
   * Verify integrity of an evidence chain
   */
  verifyChainIntegrity(chainId: string): boolean {
    const chain = this.chains.get(chainId);
    if (!chain) return false;

    for (const evidence of chain.evidenceItems) {
      const expectedHash = this.hashEvidence({
        sourceId: evidence.sourceId,
        sourceType: evidence.sourceType,
        timestamp: evidence.timestamp,
        content: evidence.content,
        confidence: evidence.confidence,
      });

      if (evidence.hash !== expectedHash) {
        chain.integrityValid = false;
        return false;
      }
    }

    chain.integrityValid = true;
    return true;
  }

  /**
   * Generate a claim that requires evidence backing
   */
  createClaim(
    chainId: string,
    claim: string,
    supportingEvidenceIndices: number[]
  ): { claim: string; evidence: Evidence[]; verified: boolean } {
    const chain = this.chains.get(chainId);
    if (!chain) {
      return { claim, evidence: [], verified: false };
    }

    const evidence = supportingEvidenceIndices
      .map(i => chain.evidenceItems[i])
      .filter(Boolean);

    return {
      claim,
      evidence,
      verified: evidence.length > 0 && evidence.every(e => e.confidence > 0.5),
    };
  }

  private hashEvidence(evidence: Partial<Evidence>): string {
    const data = JSON.stringify({
      sourceId: evidence.sourceId,
      sourceType: evidence.sourceType,
      timestamp: evidence.timestamp,
      content: evidence.content,
      confidence: evidence.confidence,
    });
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }
}
