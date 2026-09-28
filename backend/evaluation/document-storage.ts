import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export interface StoredDocument {
  documentId: string;
  tenderId: string;
  bidderId?: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  location: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

const MAX_DOCUMENT_BYTES = 100 * 1024 * 1024;

export class DocumentStorageService {
  private readonly root: string;

  constructor(root = path.resolve(process.cwd(), 'data', 'documents')) {
    this.root = root;
  }

  async store(input: {
    documentId: string;
    tenderId: string;
    bidderId?: string;
    filename: string;
    contentType?: string;
    content: Buffer;
    metadata?: Record<string, unknown>;
  }): Promise<StoredDocument> {
    if (!input.content.length || input.content.length > MAX_DOCUMENT_BYTES) {
      throw new Error('Document must be between 1 byte and 100 MB');
    }
    const documentDir = this.documentDirectory(input.documentId);
    await fs.mkdir(documentDir, { recursive: true });
    const sha256 = crypto.createHash('sha256').update(input.content).digest('hex');
    const stored: StoredDocument = {
      documentId: input.documentId,
      tenderId: input.tenderId,
      bidderId: input.bidderId,
      filename: path.basename(input.filename),
      contentType: input.contentType || 'application/octet-stream',
      sizeBytes: input.content.length,
      sha256,
      location: path.join(documentDir, 'original'),
      createdAt: new Date().toISOString(),
      metadata: input.metadata || {}
    };
    await fs.writeFile(stored.location, input.content, { flag: 'wx' });
    await fs.writeFile(path.join(documentDir, 'metadata.json'), JSON.stringify(stored, null, 2), { flag: 'wx' });
    return stored;
  }

  async retrieve(documentId: string): Promise<Buffer> {
    return fs.readFile(path.join(this.documentDirectory(documentId), 'original'));
  }

  async writeArtifact(documentId: string, artifactType: string, content: string | Buffer): Promise<string> {
    if (!/^[a-z0-9_-]+$/i.test(artifactType)) throw new Error('Invalid artifact type');
    const file = path.join(this.documentDirectory(documentId), `${artifactType}.json`);
    await fs.writeFile(file, content);
    return file;
  }

  async readArtifact(documentId: string, artifactType: string): Promise<Buffer> {
    if (!/^[a-z0-9_-]+$/i.test(artifactType)) throw new Error('Invalid artifact type');
    return fs.readFile(path.join(this.documentDirectory(documentId), `${artifactType}.json`));
  }

  async readMetadata(documentId: string): Promise<StoredDocument> {
    const raw = await fs.readFile(path.join(this.documentDirectory(documentId), 'metadata.json'), 'utf8');
    return JSON.parse(raw) as StoredDocument;
  }

  async list(): Promise<StoredDocument[]> {
    await fs.mkdir(this.root, { recursive: true });
    const entries = await fs.readdir(this.root, { withFileTypes: true });
    const documents: StoredDocument[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        documents.push(await this.readMetadata(entry.name));
      } catch {
        // Ignore incomplete directories; a failed write must not appear as a document.
      }
    }
    return documents.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async exists(documentId: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.documentDirectory(documentId), 'original'));
      return true;
    } catch {
      return false;
    }
  }

  async remove(documentId: string): Promise<void> {
    await fs.rm(this.documentDirectory(documentId), { recursive: true, force: false });
  }

  private documentDirectory(documentId: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(documentId)) throw new Error('Invalid document ID');
    return path.join(this.root, documentId);
  }
}

export const documentStorage = new DocumentStorageService();
