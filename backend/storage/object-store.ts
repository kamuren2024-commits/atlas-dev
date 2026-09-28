import crypto from 'crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export type ObjectLockStatus = 'UNLOCKED' | 'GOVERNANCE_LOCKED' | 'LEGAL_HOLD';
export type ScanStatus = 'PENDING' | 'CLEAN' | 'INFECTED' | 'UNAVAILABLE';

export interface StoredObjectVersion {
  documentId: string;
  versionId: string;
  sha256: string;
  mimeType: string;
  size: number;
  storageLocation: string;
  classification: string;
  uploadedBy: string;
  uploadedAt: string;
  virusScanStatus: ScanStatus;
  integrityStatus: 'UNVERIFIED' | 'VERIFIED' | 'FAILED';
  ocrStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'NOT_REQUIRED';
  extractionStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'NOT_REQUIRED';
  lockStatus: ObjectLockStatus;
}

export interface ObjectStore {
  putImmutable(
    metadata: Omit<StoredObjectVersion, 'sha256'>,
    content: Buffer
  ): Promise<StoredObjectVersion>;
  get(storageLocation: string, versionId?: string): Promise<Buffer>;
}

export interface S3ObjectStoreConfig {
  endpoint?: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  objectLockEnabled: boolean;
  versioningEnabled: boolean;
  retentionConfigured: boolean;
}

export class S3ObjectStore implements ObjectStore {
  private readonly client: S3Client;

  constructor(private readonly config: S3ObjectStoreConfig) {
    if (!config.bucket || !config.region || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error('S3 bucket, region, access key, and secret key are required.');
    }
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint || undefined,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
  }

  public async putImmutable(
    metadata: Omit<StoredObjectVersion, 'sha256'>,
    content: Buffer
  ): Promise<StoredObjectVersion> {
    const sha256 = S3ObjectStoreConfiguration.hash(content);
    const objectKey = metadata.storageLocation;
    const result = await this.client.send(new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: objectKey,
      Body: content,
      ContentType: metadata.mimeType,
      ContentLength: content.length,
      Metadata: {
        documentid: metadata.documentId,
        versionid: metadata.versionId,
        sha256,
        classification: metadata.classification,
        virusScanStatus: metadata.virusScanStatus,
        integrityStatus: metadata.integrityStatus
      },
      ...(this.config.objectLockEnabled && this.config.retentionConfigured
        ? { ObjectLockMode: 'GOVERNANCE', ObjectLockRetainUntilDate: new Date(Date.now() + 86400000) }
        : {})
    }));

    if (this.config.versioningEnabled && !result.VersionId) {
      throw new Error('S3 object versioning is required but the upload returned no version ID.');
    }
    const stored = await this.head(objectKey, result.VersionId);
    if (stored.sha256 !== sha256) {
      throw new Error('INTEGRITY_FAILURE: stored object hash does not match uploaded content.');
    }
    return {
      ...metadata,
      sha256,
      versionId: result.VersionId || metadata.versionId,
      integrityStatus: 'VERIFIED'
    };
  }

  public async get(storageLocation: string, versionId?: string): Promise<Buffer> {
    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: storageLocation,
      VersionId: versionId
    }));
    if (!response.Body) throw new Error('Object store returned an empty body.');
    return this.toBuffer(response.Body);
  }

  public async head(objectKey: string, versionId?: string): Promise<StoredObjectVersion> {
    const response = await this.client.send(new HeadObjectCommand({
      Bucket: this.config.bucket,
      Key: objectKey,
      VersionId: versionId
    }));
    const metadata = response.Metadata || {};
    return {
      documentId: metadata.documentid || '',
      versionId: versionId || response.VersionId || '',
      sha256: metadata.sha256 || '',
      mimeType: response.ContentType || 'application/octet-stream',
      size: response.ContentLength || 0,
      storageLocation: objectKey,
      classification: metadata.classification || 'UNCLASSIFIED',
      uploadedBy: metadata.uploadedby || '',
      uploadedAt: response.LastModified?.toISOString() || new Date(0).toISOString(),
      virusScanStatus: (metadata.virusscanstatus as ScanStatus) || 'PENDING',
      integrityStatus: (metadata.integritystatus as StoredObjectVersion['integrityStatus']) || 'UNVERIFIED',
      ocrStatus: 'PENDING',
      extractionStatus: 'PENDING',
      lockStatus: this.config.objectLockEnabled ? 'GOVERNANCE_LOCKED' : 'UNLOCKED'
    };
  }

  public async delete(objectKey: string, versionId?: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: objectKey,
      VersionId: versionId
    }));
  }

  private async toBuffer(body: Readable | AsyncIterable<Uint8Array> | Blob): Promise<Buffer> {
    if (body instanceof Blob) return Buffer.from(await body.arrayBuffer());
    const chunks: Buffer[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}

export class S3ObjectStoreConfiguration {
  public static fromEnvironment(): {
    endpoint: string;
    bucket: string;
    configured: boolean;
    objectLockEnabled: boolean;
    versioningEnabled: boolean;
    retentionConfigured: boolean;
  } {
    const endpoint = process.env.S3_ENDPOINT || process.env.OBJECT_STORE_ENDPOINT || '';
    const bucket = process.env.S3_BUCKET || process.env.OBJECT_STORE_BUCKET || '';
    return {
      endpoint,
      bucket,
      configured: Boolean(endpoint && bucket),
      objectLockEnabled: process.env.OBJECT_LOCK_ENABLED === 'true',
      versioningEnabled: process.env.OBJECT_VERSIONING_ENABLED === 'true',
      retentionConfigured: process.env.RETENTION_CONFIGURED === 'true'
    };
  }

  public static hash(content: Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
