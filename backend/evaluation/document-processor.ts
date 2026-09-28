import crypto from 'crypto';
import { DocumentStorageService, documentStorage } from './document-storage';

export interface DocumentProcessingResult {
  documentId: string;
  text: string;
  pageCount: number;
  method: 'digital_pdf' | 'plain_text';
  scanned: boolean;
  processedAt: string;
  sha256: string;
  warnings: string[];
}

export class DocumentProcessor {
  constructor(private readonly storage: DocumentStorageService = documentStorage) {}

  async process(documentId: string): Promise<DocumentProcessingResult> {
    const content = await this.storage.retrieve(documentId);
    const metadata = await this.storage.readMetadata(documentId);
    const text = metadata.contentType === 'application/pdf'
      ? this.extractPdfText(content)
      : content.toString('utf8');
    const scanned = metadata.contentType === 'application/pdf' && text.trim().length === 0;
    const result: DocumentProcessingResult = {
      documentId,
      text,
      pageCount: metadata.contentType === 'application/pdf' ? this.countPages(content) : 1,
      method: metadata.contentType === 'application/pdf' ? 'digital_pdf' : 'plain_text',
      scanned,
      processedAt: new Date().toISOString(),
      sha256: crypto.createHash('sha256').update(content).digest('hex'),
      warnings: scanned ? ['PDF contains no extractable text; OCR provider is not configured.'] : []
    };
    await this.storage.writeArtifact(documentId, 'processing-result', JSON.stringify(result, null, 2));
    await this.storage.writeArtifact(documentId, 'extracted-text', result.text);
    return result;
  }

  private extractPdfText(content: Buffer): string {
    const source = content.toString('latin1');
    const chunks: string[] = [];
    const textBlock = /BT([\s\S]*?)ET/g;
    for (const block of source.matchAll(textBlock)) {
      for (const match of block[1].matchAll(/\(([^()]*)\)\s*T[Jj]/g)) {
        chunks.push(match[1].replace(/\\([\\()])/g, '$1'));
      }
    }
    return chunks.join(' ').replace(/\s+/g, ' ').trim();
  }

  private countPages(content: Buffer): number {
    return Math.max(1, (content.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length);
  }
}

export const documentProcessor = new DocumentProcessor();
