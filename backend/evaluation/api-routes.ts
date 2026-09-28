import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { documentProcessor } from './document-processor';
import { documentStorage } from './document-storage';

export const evaluationApiRouter = Router();

evaluationApiRouter.post('/documents/upload', async (req, res) => {
  try {
    const { filename, tenderId, bidderId, contentBase64, content, contentType, metadata } = req.body || {};
    if (!filename || !tenderId || (!contentBase64 && !content)) {
      return res.status(400).json({ error: 'filename, tenderId, and document content are required' });
    }
    const buffer = contentBase64 ? Buffer.from(contentBase64, 'base64') : Buffer.from(String(content), 'utf8');
    const documentId = `doc-${uuidv4()}`;
    const stored = await documentStorage.store({
      documentId, tenderId, bidderId, filename, contentType, content: buffer, metadata
    });
    const processing = await documentProcessor.process(documentId);
    return res.status(201).json({ document: stored, processing });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Document upload failed' });
  }
});

evaluationApiRouter.get('/documents', async (req, res) => {
  const documents = await documentStorage.list();
  const tenderId = typeof req.query.tenderId === 'string' ? req.query.tenderId : undefined;
  return res.json({ documents: tenderId ? documents.filter(document => document.tenderId === tenderId) : documents });
});

evaluationApiRouter.get('/documents/:documentId', async (req, res) => {
  try {
    const document = await documentStorage.readMetadata(req.params.documentId);
    let processing = null;
    try {
      processing = JSON.parse((await documentStorage.readArtifact(req.params.documentId, 'processing-result')).toString('utf8'));
    } catch { /* Processing is optional for legacy documents. */ }
    return res.json({ document, processing });
  } catch {
    return res.status(404).json({ error: 'Document not found' });
  }
});

evaluationApiRouter.get('/documents/:documentId/status', async (req, res) => {
  const exists = await documentStorage.exists(req.params.documentId);
  if (!exists) return res.status(404).json({ error: 'Document not found' });
  try {
    const result = JSON.parse((await documentStorage.readArtifact(req.params.documentId, 'processing-result')).toString('utf8'));
    return res.json({ status: 'TEXT_EXTRACTED', progress: 100, processing: result });
  } catch {
    return res.json({ status: 'STORED', progress: 25 });
  }
});

evaluationApiRouter.get('/documents/:documentId/extracted-text', async (req, res) => {
  try {
    const text = (await documentStorage.readArtifact(req.params.documentId, 'extracted-text')).toString('utf8');
    return res.json({ documentId: req.params.documentId, text });
  } catch {
    return res.status(404).json({ error: 'Extracted text not found' });
  }
});

evaluationApiRouter.post('/documents/:documentId/trigger', async (req, res) => {
  try {
    const processing = await documentProcessor.process(req.params.documentId);
    return res.json({ accepted: true, processing });
  } catch (error) {
    return res.status(422).json({ error: error instanceof Error ? error.message : 'Document processing failed' });
  }
});

evaluationApiRouter.delete('/documents/:documentId', async (req, res) => {
  try {
    await documentStorage.remove(req.params.documentId);
    return res.status(204).send();
  } catch {
    return res.status(404).json({ error: 'Document not found' });
  }
});
