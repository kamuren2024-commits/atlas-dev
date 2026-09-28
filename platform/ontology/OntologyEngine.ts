import { ObservabilityEngine } from '../observability/Observability';
import { OntologyStore } from '../persistence';

export interface PropertyDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
}

export interface EntityDefinition {
  typeId: string;
  displayName: string;
  properties: Record<string, PropertyDefinition>;
}

export interface OntologyEntity {
  id: string;
  typeId: string;
  properties: Record<string, any>;
}

export interface OntologyRelationship {
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  relationshipName: 'awarded' | 'funds' | 'affects' | 'supplies' | 'monitors' | 'contains';
}

export class OntologyEngine {
  private static instance: OntologyEngine;
  private schemaDefinitions = new Map<string, EntityDefinition>();
  private activeEntities = new Map<string, OntologyEntity>();
  private activeRelationships: OntologyRelationship[] = [];

  private constructor() {
    this.bootstrapStandardOntology();
  }

  public static getInstance(): OntologyEngine {
    if (!OntologyEngine.instance) {
      OntologyEngine.instance = new OntologyEngine();
    }
    return OntologyEngine.instance;
  }

  /**
   * Register a new Entity Schema Type
   */
  public registerSchema(def: EntityDefinition): void {
    this.schemaDefinitions.set(def.typeId, def);
    // Persist schema to database
    OntologyStore.saveSchema(def.typeId, def.displayName, def.typeId, def.properties as any).catch(
      err => console.error('[Ontology] Failed to persist schema:', err.message)
    );
  }

  /**
   * Upsert a physical entity instance into the state store
   */
  public createEntity(id: string, typeId: string, properties: Record<string, any>): OntologyEntity {
    const schema = this.schemaDefinitions.get(typeId);
    if (!schema) {
      throw new Error(`Ontology schema for entity type [${typeId}] is not defined.`);
    }

    // Validate properties
    for (const [propName, propDef] of Object.entries(schema.properties)) {
      if (propDef.required && properties[propName] === undefined) {
        throw new Error(`Ontology constraint violation: Expected property [${propName}] on SCM entity [${id}] of type [${typeId}].`);
      }
    }

    const entity: OntologyEntity = { id, typeId, properties };
    this.activeEntities.set(`${typeId}:${id}`, entity);

    // Persist entity to database
    OntologyStore.saveEntity(id, typeId, properties).catch(
      err => console.error('[Ontology] Failed to persist entity:', err.message)
    );

    return entity;
  }

  /**
   * Establish ontological links between nodes
   */
  public createRelationship(rel: OntologyRelationship): void {
    // Basic verification of endpoints
    const sourceKey = `${rel.sourceType}:${rel.sourceId}`;
    const targetKey = `${rel.targetType}:${rel.targetId}`;

    if (!this.activeEntities.has(sourceKey)) {
      console.warn(`Ontology warning: Link created out of non-existent entity [${sourceKey}].`);
    }
    if (!this.activeEntities.has(targetKey)) {
      console.warn(`Ontology warning: Link created into non-existent entity [${targetKey}].`);
    }

    // Check for duplicate relationships
    const exists = this.activeRelationships.some(
      r => r.sourceId === rel.sourceId && r.targetId === rel.targetId && r.relationshipName === rel.relationshipName
    );

    if (!exists) {
      this.activeRelationships.push(rel);

      // Persist relationship to database
      OntologyStore.saveRelationship(rel.sourceId, rel.targetId, rel.relationshipName, {
        sourceType: rel.sourceType,
        targetType: rel.targetType,
      }).catch(err => console.error('[Ontology] Failed to persist relationship:', err.message));
    }
  }

  public getEntity(typeId: string, id: string): OntologyEntity | undefined {
    return this.activeEntities.get(`${typeId}:${id}`);
  }

  public getEntitiesByType(typeId: string): OntologyEntity[] {
    return Array.from(this.activeEntities.values()).filter(e => e.typeId === typeId);
  }

  public getRelationships(): OntologyRelationship[] {
    return this.activeRelationships;
  }

  /**
   * Scans forward and evaluates SCM topological downstream impacts
   */
  public performImpactAnalysis(startEntityId: string, startEntityType: string): {
    visitedIds: string[];
    affectedSubstations: string[];
    affectedContracts: string[];
  } {
    const visited = new Set<string>();
    const affectedSubstations: string[] = [];
    const affectedContracts: string[] = [];

    const queue: Array<{ id: string; type: string }> = [{ id: startEntityId, type: startEntityType }];
    visited.add(`${startEntityType}:${startEntityId}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.type === 'Substation') {
        affectedSubstations.push(current.id);
      }
      if (current.type === 'Contract') {
        affectedContracts.push(current.id);
      }

      // Check all neighbors
      const neighbors = this.activeRelationships.filter(
        rel => rel.sourceId === current.id && rel.sourceType === current.type
      );

      for (const edge of neighbors) {
        const neighborKey = `${edge.targetType}:${edge.targetId}`;
        if (!visited.has(neighborKey)) {
          visited.add(neighborKey);
          queue.push({ id: edge.targetId, type: edge.targetType });
        }
      }
    }

    return {
      visitedIds: Array.from(visited),
      affectedSubstations,
      affectedContracts
    };
  }

  /**
   * Seeds KETRACO Ontology Layer schemas and structures on startup
   */
  private bootstrapStandardOntology(): void {
    // 1. Supplier Schema
    this.registerSchema({
      typeId: 'Supplier',
      displayName: 'SCM Vendor/Provider',
      properties: {
        vendorName: { name: 'vendorName', type: 'string', required: true },
        jurisdiction: { name: 'jurisdiction', type: 'string', required: true },
        riskProfileRating: { name: 'riskProfileRating', type: 'number', required: true },
        isSOPCompliant: { name: 'isSOPCompliant', type: 'boolean', required: true }
      }
    });

    // 2. Contract Schema
    this.registerSchema({
      typeId: 'Contract',
      displayName: 'SCM Engineering Contract (EPC)',
      properties: {
        tenderCode: { name: 'tenderCode', type: 'string', required: true },
        awardValueUsd: { name: 'awardValueUsd', type: 'number', required: true },
        liquidatedPenaltyPct: { name: 'liquidatedPenaltyPct', type: 'number', required: true },
        forceMajeureAllowanceDays: { name: 'forceMajeureAllowanceDays', type: 'number', required: true }
      }
    });

    // 3. Project Schema
    this.registerSchema({
      typeId: 'Project',
      displayName: 'Grid Construction Project Lot',
      properties: {
        lotIdentifier: { name: 'lotIdentifier', type: 'string', required: true },
        targetCompletionDate: { name: 'targetCompletionDate', type: 'string', required: true },
        substationLocation: { name: 'substationLocation', type: 'string', required: true }
      }
    });

    // 4. Substation Schema
    this.registerSchema({
      typeId: 'Substation',
      displayName: 'High-Voltage Substation Infrastructure',
      properties: {
        stationName: { name: 'stationName', type: 'string', required: true },
        capacityMVA: { name: 'capacityMVA', type: 'number', required: true },
        operatingVoltageKV: { name: 'operatingVoltageKV', type: 'number', required: true }
      }
    });

    // Bootstrap Instances
    this.createEntity('shanghai-cable-corp', 'Supplier', {
      vendorName: 'Shanghai Electrical Cable Corporation',
      jurisdiction: 'China',
      riskProfileRating: 44,
      isSOPCompliant: true
    });

    this.createEntity('siemens-energy-ag', 'Supplier', {
      vendorName: 'Siemens Energy AG',
      jurisdiction: 'Germany',
      riskProfileRating: 12,
      isSOPCompliant: true
    });

    this.createEntity('contract-susp-l4', 'Contract', {
      tenderCode: 'TEND-SUSWA-LOT4',
      awardValueUsd: 14500000,
      liquidatedPenaltyPct: 15,
      forceMajeureAllowanceDays: 14
    });

    this.createEntity('project-suswa-expansion', 'Project', {
      lotIdentifier: 'Lot-4-Interconnector',
      targetCompletionDate: '2026-12-31',
      substationLocation: 'Suswa Substation'
    });

    this.createEntity('substation-suswa', 'Substation', {
      stationName: 'Suswa Main Multi-Terminal Hub',
      capacityMVA: 400,
      operatingVoltageKV: 220
    });

    // Seed Links (Supplier -> awarded -> Contract -> funds -> Project -> affects -> Substation)
    this.createRelationship({
      sourceId: 'shanghai-cable-corp',
      sourceType: 'Supplier',
      targetId: 'contract-susp-l4',
      targetType: 'Contract',
      relationshipName: 'awarded'
    });

    this.createRelationship({
      sourceId: 'contract-susp-l4',
      sourceType: 'Contract',
      targetId: 'project-suswa-expansion',
      targetType: 'Project',
      relationshipName: 'funds'
    });

    this.createRelationship({
      sourceId: 'project-suswa-expansion',
      sourceType: 'Project',
      targetId: 'substation-suswa',
      targetType: 'Substation',
      relationshipName: 'affects'
    });
  }
}
