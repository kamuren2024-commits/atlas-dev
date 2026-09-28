// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — SEMANTIC MEMORY
// Organizational knowledge — relationships, ontology, policies
// ============================================================================

import { generateId } from '../../../src/core/shared/crypto';

export interface KnowledgeEntity {
  id: string;
  type: string;
  name: string;
  attributes: Record<string, any>;
  embedding?: number[];
  confidence: number;
  sourceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  weight: number;
  attributes: Record<string, any>;
  createdAt: string;
}

export class SemanticMemory {
  private static instance: SemanticMemory;
  private entities: Map<string, KnowledgeEntity> = new Map();
  private relations: KnowledgeRelation[] = [];

  private constructor() {}

  public static getInstance(): SemanticMemory {
    if (!SemanticMemory.instance) {
      SemanticMemory.instance = new SemanticMemory();
    }
    return SemanticMemory.instance;
  }

  /**
   * Add a knowledge entity
   */
  addEntity(entity: Omit<KnowledgeEntity, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = generateId('kge');
    const now = new Date().toISOString();
    const fullEntity: KnowledgeEntity = {
      ...entity,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.entities.set(id, fullEntity);
    return id;
  }

  /**
   * Update an entity
   */
  updateEntity(id: string, updates: Partial<KnowledgeEntity>): boolean {
    const entity = this.entities.get(id);
    if (!entity) return false;
    Object.assign(entity, updates, { updatedAt: new Date().toISOString() });
    return true;
  }

  /**
   * Add a relation between entities
   */
  addRelation(relation: Omit<KnowledgeRelation, 'id' | 'createdAt'>): string {
    const id = generateId('kgr');
    this.relations.push({
      ...relation,
      id,
      createdAt: new Date().toISOString(),
    });
    return id;
  }

  /**
   * Query entities by type
   */
  queryEntities(type: string, limit?: number): KnowledgeEntity[] {
    const results = Array.from(this.entities.values()).filter(e => e.type === type);
    if (limit) return results.slice(0, limit);
    return results;
  }

  /**
   * Get related entities
   */
  getRelated(entityId: string, relationType?: string): Array<{
    entity: KnowledgeEntity;
    relation: KnowledgeRelation;
  }> {
    const results: Array<{ entity: KnowledgeEntity; relation: KnowledgeRelation }> = [];

    for (const rel of this.relations) {
      if (rel.sourceId === entityId || rel.targetId === entityId) {
        if (relationType && rel.type !== relationType) continue;
        const targetId = rel.sourceId === entityId ? rel.targetId : rel.sourceId;
        const entity = this.entities.get(targetId);
        if (entity) {
          results.push({ entity, relation: rel });
        }
      }
    }

    return results;
  }

  /**
   * Search entities by name (substring match)
   */
  search(query: string): KnowledgeEntity[] {
    const lower = query.toLowerCase();
    return Array.from(this.entities.values()).filter(
      e => e.name.toLowerCase().includes(lower) ||
           e.type.toLowerCase().includes(lower) ||
           JSON.stringify(e.attributes).toLowerCase().includes(lower)
    );
  }

  /**
   * Get entity by ID
   */
  getEntity(id: string): KnowledgeEntity | undefined {
    return this.entities.get(id);
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    totalEntities: number;
    totalRelations: number;
    entityTypes: Record<string, number>;
    relationTypes: Record<string, number>;
  } {
    const entityTypes: Record<string, number> = {};
    const relationTypes: Record<string, number> = {};

    for (const entity of this.entities.values()) {
      entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
    }
    for (const rel of this.relations) {
      relationTypes[rel.type] = (relationTypes[rel.type] || 0) + 1;
    }

    return {
      totalEntities: this.entities.size,
      totalRelations: this.relations.length,
      entityTypes,
      relationTypes,
    };
  }
}
