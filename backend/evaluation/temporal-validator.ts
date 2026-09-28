/**
 * PHASE 02: EETF EVIDENCE MODEL - TEMPORAL VALIDATOR
 * 
 * Specialized validator for date-based evidence:
 * - Certificate/certificate expiry validation
 * - Document dating consistency
 * - Temporal order validation
 * - Certificate renewal tracking
 * 
 * Status: IMPLEMENTATION
 * Date: 2026-08-31
 */

import { EvidenceAtom, EvidenceConflict } from './evidence-schema';

/**
 * Temporal Validity Result
 */
export interface TemporalValidity {
  valid: boolean;
  expired: boolean;
  expiry_date?: Date;
  days_until_expiry?: number;
  issues: string[];
}

/**
 * TemporalValidator - Validates date-based evidence
 */
export class TemporalValidator {
  /**
   * Validate certificate expiry
   * 
   * Checks:
   * - Certificate is not expired
   * - Has sufficient validity remaining
   * - Renewal is available if needed
   */
  static validateCertificateExpiry(
    expiryDate: Date,
    documentDate: Date,
    minimumDaysValid: number = 90
  ): TemporalValidity {
    const now = new Date();
    const issues: string[] = [];
    let daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Check if expired
    if (expiryDate < now) {
      issues.push(`Certificate expired ${Math.abs(daysUntilExpiry)} days ago on ${expiryDate.toISOString()}`);
      return {
        valid: false,
        expired: true,
        expiry_date: expiryDate,
        days_until_expiry: daysUntilExpiry,
        issues
      };
    }

    // Check minimum validity
    if (daysUntilExpiry < minimumDaysValid) {
      issues.push(`Certificate expires in ${daysUntilExpiry} days (minimum required: ${minimumDaysValid})`);
    }

    // Check if issued before tender (sanity check)
    if (documentDate && documentDate > expiryDate) {
      issues.push('Certificate issued after expiry date (data inconsistency)');
    }

    return {
      valid: issues.length === 0,
      expired: false,
      expiry_date: expiryDate,
      days_until_expiry: daysUntilExpiry,
      issues
    };
  }

  /**
   * Validate document date consistency
   * 
   * Checks:
   * - Document not dated in future
   * - Document not too old
   * - Document date makes sense relative to other evidence
   */
  static validateDocumentDate(
    documentDate: Date,
    maxAgeInDays: number = 365 * 3,  // 3 years default
    referenceDate: Date = new Date()
  ): TemporalValidity {
    const issues: string[] = [];

    // Cannot be in future
    if (documentDate > referenceDate) {
      issues.push(`Document dated in future: ${documentDate.toISOString()}`);
      return {
        valid: false,
        expired: false,
        issues
      };
    }

    // Check age
    const daysOld = Math.floor((referenceDate.getTime() - documentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysOld > maxAgeInDays) {
      issues.push(`Document is ${daysOld} days old (maximum allowed: ${maxAgeInDays})`);
    }

    return {
      valid: issues.length === 0,
      expired: false,
      issues,
      days_until_expiry: -daysOld
    };
  }

  /**
   * Validate temporal order (chronological consistency)
   * 
   * Ensures dates follow logical order:
   * - Certificate issued before expiry
   * - Document created before its effective date
   * - Evidence dates align with other documents
   */
  static validateTemporalOrder(
    evidence: EvidenceAtom[],
    requirementDate?: Date
  ): {
    valid: boolean;
    issues: string[];
    timeline: Array<{ date: Date; description: string }>;
  } {
    const issues: string[] = [];
    const timeline: Array<{ date: Date; description: string }> = [];

    // Collect all dates
    for (const atom of evidence) {
      if (atom.document_date) {
        timeline.push({
          date: atom.document_date,
          description: `Document "${atom.document_type}" dated`
        });
      }

      if (atom.effective_from) {
        timeline.push({
          date: atom.effective_from,
          description: `Evidence "${atom.evidence_type}" effective from`
        });
      }

      if (atom.effective_to) {
        timeline.push({
          date: atom.effective_to,
          description: `Evidence "${atom.evidence_type}" expires`
        });
      }
    }

    // Add requirement date
    if (requirementDate) {
      timeline.push({
        date: requirementDate,
        description: 'Tender deadline'
      });
    }

    // Sort chronologically
    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Check for logical inconsistencies
    for (let i = 0; i < evidence.length; i++) {
      const atom = evidence[i];

      // effective_from must be before effective_to
      if (atom.effective_from && atom.effective_to && atom.effective_from > atom.effective_to) {
        issues.push(`Invalid date range for ${atom.evidence_type}: from > to`);
      }

      // document_date should be before effective_from
      if (atom.document_date && atom.effective_from && atom.document_date > atom.effective_from) {
        issues.push(`${atom.evidence_type}: document dated after it became effective`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      timeline
    };
  }

  /**
   * Validate bidder submission timing
   * 
   * Ensures:
   * - Submission before deadline
   * - All evidence predates submission
   * - No "future-dated" or suspicious evidence
   */
  static validateSubmissionTiming(
    submissionDate: Date,
    evidenceCollection: EvidenceAtom[],
    tenderDeadline: Date
  ): {
    valid: boolean;
    ontime: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check submission before deadline
    if (submissionDate > tenderDeadline) {
      issues.push(`Submission on ${submissionDate.toISOString()} after deadline ${tenderDeadline.toISOString()}`);
    }

    // Check all evidence predates submission
    for (const atom of evidenceCollection) {
      if (atom.document_date && atom.document_date > submissionDate) {
        issues.push(`Evidence "${atom.evidence_type}" dated after submission`);
      }

      if (atom.created_at && atom.created_at > submissionDate) {
        issues.push(`Evidence "${atom.evidence_type}" created after submission`);
      }
    }

    return {
      valid: issues.length === 0,
      ontime: submissionDate <= tenderDeadline,
      issues
    };
  }

  /**
   * Detect temporal anomalies (suspicious patterns)
   */
  static detectAnomalies(evidence: EvidenceAtom[]): string[] {
    const anomalies: string[] = [];
    const now = new Date();

    for (const atom of evidence) {
      // Check for exact same expiry dates (suspicious bulk upload)
      const expiryCount = evidence.filter(e => 
        e.effective_to && 
        e.effective_to.toISOString().split('T')[0] === atom.effective_to?.toISOString().split('T')[0]
      ).length;

      if (expiryCount > 3) {
        anomalies.push(`Multiple certificates with identical expiry date: ${atom.effective_to?.toISOString()}`);
      }

      // Check for unrealistic expiry dates (too far in future)
      if (atom.effective_to) {
        const yearsUntilExpiry = (atom.effective_to.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (yearsUntilExpiry > 20) {
          anomalies.push(`Unrealistic expiry date far in future: ${atom.effective_to.toISOString()}`);
        }
      }

      // Check for very old documents (>10 years)
      if (atom.document_date) {
        const yearsOld = (now.getTime() - atom.document_date.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (yearsOld > 10) {
          anomalies.push(`Very old document (${yearsOld.toFixed(1)} years): ${atom.document_type}`);
        }
      }

      // Check for synchronized submission (all docs same date)
      const sameDateCount = evidence.filter(e => 
        e.document_date && 
        e.document_date.toISOString().split('T')[0] === atom.document_date.toISOString().split('T')[0]
      ).length;

      if (sameDateCount === evidence.length && evidence.length > 5) {
        anomalies.push(`All ${evidence.length} documents have identical date (likely auto-generated): ${atom.document_date?.toISOString()}`);
      }
    }

    // Remove duplicates
    return Array.from(new Set(anomalies));
  }

  /**
   * Calculate evidence "freshness" score
   * 
   * How current/relevant is the evidence?
   */
  static calculateFreshness(
    documentDate: Date,
    documentType: string = 'GENERAL',
    referenceDate: Date = new Date()
  ): {
    freshness_score: number;  // 0-1, higher is fresher
    interpretation: string;
  } {
    const daysOld = (referenceDate.getTime() - documentDate.getTime()) / (1000 * 60 * 60 * 24);

    // Different rules for different document types
    const maxAgeDays: Record<string, number> = {
      'FINANCIAL_STATEMENTS': 365,   // Must be current year
      'CERTIFICATE': 365 * 3,        // 3 years typical
      'REGISTRATION': 365 * 5,       // Registration less time-sensitive
      'EXPERIENCE': 365 * 10,        // Experience can be older
      'GENERAL': 365 * 3             // Default 3 years
    };

    const max = maxAgeDays[documentType] || maxAgeDays['GENERAL'];

    if (daysOld < 0) {
      return {
        freshness_score: 0,
        interpretation: 'Document dated in future (invalid)'
      };
    }

    if (daysOld > max * 2) {
      return {
        freshness_score: 0,
        interpretation: 'Document too old to be reliable'
      };
    }

    // Linear decay from 1.0 to 0.5 as we approach max age
    const freshness = Math.max(0.5, 1.0 - (daysOld / max));

    let interpretation = '';
    if (freshness >= 0.9) {
      interpretation = 'Very fresh (current)';
    } else if (freshness >= 0.7) {
      interpretation = 'Fresh (recent)';
    } else if (freshness >= 0.5) {
      interpretation = 'Acceptable (somewhat dated)';
    } else {
      interpretation = 'Questionable (outdated)';
    }

    return {
      freshness_score: freshness,
      interpretation
    };
  }

  /**
   * Detect certificate renewal needs
   * 
   * For certificates expiring soon, suggest renewal
   */
  static detectRenewalNeeds(
    evidence: EvidenceAtom[],
    warningThresholdDays: number = 60
  ): Array<{
    evidence_id: string;
    evidence_type: string;
    days_until_expiry: number;
    renewal_suggested: boolean;
  }> {
    const results: Array<{
      evidence_id: string;
      evidence_type: string;
      days_until_expiry: number;
      renewal_suggested: boolean;
    }> = [];

    const now = new Date();

    for (const atom of evidence) {
      if (atom.effective_to) {
        const daysUntilExpiry = Math.floor((atom.effective_to.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        results.push({
          evidence_id: atom.evidence_id,
          evidence_type: atom.evidence_type,
          days_until_expiry: daysUntilExpiry,
          renewal_suggested: daysUntilExpiry < warningThresholdDays && daysUntilExpiry > 0
        });
      }
    }

    return results.filter(r => r.renewal_suggested);
  }

  /**
   * Timeline visualization (for debugging/UI)
   */
  static generateTimeline(evidence: EvidenceAtom[]): string {
    const events: Array<{ date: Date; label: string }> = [];

    for (const atom of evidence) {
      if (atom.document_date) {
        events.push({
          date: atom.document_date,
          label: `📄 ${atom.document_type}`
        });
      }
      if (atom.effective_from) {
        events.push({
          date: atom.effective_from,
          label: `✓ ${atom.evidence_type} active`
        });
      }
      if (atom.effective_to) {
        events.push({
          date: atom.effective_to,
          label: `⏰ ${atom.evidence_type} expires`
        });
      }
    }

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Generate ASCII timeline
    const lines: string[] = ['Timeline:'];
    for (const event of events) {
      lines.push(`  ${event.date.toISOString().split('T')[0]}  ${event.label}`);
    }

    return lines.join('\n');
  }
}

/**
 * Temporal consistency report
 */
export interface TemporalConsistencyReport {
  collection_valid: boolean;
  age_distribution: {
    very_fresh: number;      // < 30 days
    fresh: number;           // 30-90 days
    acceptable: number;      // 90-365 days
    dated: number;           // 365-1095 days
    very_old: number;        // > 1095 days
  };
  expiry_distribution: {
    expired: number;
    expiring_soon: number;   // < 60 days
    expiring_later: number;  // 60-365 days
    no_expiry: number;
  };
  anomalies: string[];
}

/**
 * Generate temporal consistency report
 */
export function generateTemporalReport(evidence: EvidenceAtom[]): TemporalConsistencyReport {
  const now = new Date();

  const ageDistribution = {
    very_fresh: 0,
    fresh: 0,
    acceptable: 0,
    dated: 0,
    very_old: 0
  };

  const expiryDistribution = {
    expired: 0,
    expiring_soon: 0,
    expiring_later: 0,
    no_expiry: 0
  };

  for (const atom of evidence) {
    // Age distribution
    if (atom.document_date) {
      const daysOld = (now.getTime() - atom.document_date.getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld < 30) ageDistribution.very_fresh++;
      else if (daysOld < 90) ageDistribution.fresh++;
      else if (daysOld < 365) ageDistribution.acceptable++;
      else if (daysOld < 1095) ageDistribution.dated++;
      else ageDistribution.very_old++;
    }

    // Expiry distribution
    if (atom.effective_to) {
      const daysUntilExpiry = (atom.effective_to.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry < 0) expiryDistribution.expired++;
      else if (daysUntilExpiry < 60) expiryDistribution.expiring_soon++;
      else if (daysUntilExpiry < 365) expiryDistribution.expiring_later++;
    } else {
      expiryDistribution.no_expiry++;
    }
  }

  return {
    collection_valid: expiryDistribution.expired === 0,
    age_distribution: ageDistribution,
    expiry_distribution: expiryDistribution,
    anomalies: TemporalValidator.detectAnomalies(evidence)
  };
}
