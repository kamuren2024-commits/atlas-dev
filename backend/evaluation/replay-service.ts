import crypto from 'crypto';

export interface EvaluationReplayManifest {
  evaluationId: string;
  tenderVersion: string;
  bidVersions: string[];
  criteriaVersion: string;
  legalFrameworkVersion: string;
  policyBundleVersion: string;
  evidenceVersions: string[];
  verificationVersions: string[];
  workflowVersion: string;
  modelVersions: string[];
  connectorVersions: string[];
  decisionVersions: string[];
}

export interface ReplayArtifact {
  versionId: string;
  contentHash: string;
  content: unknown;
}

export interface ReplayDiagnostics {
  replayable: boolean;
  missingArtifacts: string[];
  hashMismatches: string[];
  manifestHash: string;
}

export class EvaluationReplayService {
  public diagnose(
    manifest: EvaluationReplayManifest,
    artifacts: ReplayArtifact[]
  ): ReplayDiagnostics {
    const required = [
      manifest.tenderVersion,
      ...manifest.bidVersions,
      manifest.criteriaVersion,
      ...manifest.evidenceVersions,
      ...manifest.verificationVersions,
      ...manifest.decisionVersions
    ];
    const byId = new Map(artifacts.map(artifact => [artifact.versionId, artifact]));
    const missingArtifacts = required.filter(versionId => !byId.has(versionId));
    const hashMismatches = artifacts
      .filter(artifact => required.includes(artifact.versionId))
      .filter(artifact => crypto.createHash('sha256').update(JSON.stringify(artifact.content)).digest('hex') !== artifact.contentHash)
      .map(artifact => artifact.versionId);
    const manifestHash = crypto.createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
    return {
      replayable: missingArtifacts.length === 0 && hashMismatches.length === 0,
      missingArtifacts,
      hashMismatches,
      manifestHash
    };
  }
}
