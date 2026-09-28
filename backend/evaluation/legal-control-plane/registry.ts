import { AUTHORITATIVE_LEGAL_SOURCES } from '../governance/authoritative-sources';
import {
  ControlDefinition,
  LegalFramework,
  LegalVersion,
  RequirementControl,
  legalVersionFromSource
} from './contracts';

export class LegalRegistry {
  private readonly frameworks = new Map<string, LegalFramework>();
  private readonly versions = new Map<string, LegalVersion>();
  private readonly controls = new Map<string, ControlDefinition>();
  private readonly mappings = new Map<string, RequirementControl>();

  public static createKenyaProcurementRegistry(): LegalRegistry {
    const registry = new LegalRegistry();
    const sources = AUTHORITATIVE_LEGAL_SOURCES;
    registry.registerFramework({
      frameworkId: 'KENYA_PUBLIC_PROCUREMENT',
      name: 'Kenya public procurement control framework',
      jurisdiction: 'KE',
      sourceIds: sources.map(source => source.sourceId),
      version: 'source-catalogue-1',
      effectiveFrom: '2010-08-27T00:00:00Z',
      status: 'ACTIVE'
    });
    for (const source of sources) {
      registry.registerVersion(legalVersionFromSource(source));
    }
    return registry;
  }

  public registerFramework(framework: LegalFramework): void {
    if (this.frameworks.has(framework.frameworkId)) throw new Error(`LEGAL_FRAMEWORK_DUPLICATE:${framework.frameworkId}`);
    this.frameworks.set(framework.frameworkId, framework);
  }

  public registerVersion(version: LegalVersion): void {
    if (!this.frameworks.has(version.frameworkId)) throw new Error(`LEGAL_FRAMEWORK_NOT_FOUND:${version.frameworkId}`);
    if (this.versions.has(version.versionId)) throw new Error(`LEGAL_VERSION_DUPLICATE:${version.versionId}`);
    this.versions.set(version.versionId, version);
  }

  public registerControl(control: ControlDefinition): void {
    const version = [...this.versions.values()].find(
      candidate => candidate.sourceId === control.legalSourceId && candidate.version === control.legalVersion
    );
    if (!version) throw new Error(`LEGAL_VERSION_NOT_FOUND:${control.legalSourceId}:${control.legalVersion}`);
    if (this.controls.has(control.controlId)) throw new Error(`CONTROL_DUPLICATE:${control.controlId}`);
    this.controls.set(control.controlId, control);
  }

  public mapRequirement(mapping: RequirementControl): void {
    if (!this.controls.has(mapping.controlId)) throw new Error(`CONTROL_NOT_FOUND:${mapping.controlId}`);
    if (this.mappings.has(mapping.requirementId)) throw new Error(`REQUIREMENT_MAPPING_DUPLICATE:${mapping.requirementId}`);
    this.mappings.set(mapping.requirementId, mapping);
  }

  public getFramework(frameworkId: string): LegalFramework {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) throw new Error(`LEGAL_FRAMEWORK_NOT_FOUND:${frameworkId}`);
    return framework;
  }

  public getVersion(versionId: string): LegalVersion {
    const version = this.versions.get(versionId);
    if (!version) throw new Error(`LEGAL_VERSION_NOT_FOUND:${versionId}`);
    return version;
  }

  public getControl(controlId: string): ControlDefinition {
    const control = this.controls.get(controlId);
    if (!control) throw new Error(`CONTROL_NOT_FOUND:${controlId}`);
    return control;
  }

  public getMapping(requirementId: string): RequirementControl {
    const mapping = this.mappings.get(requirementId);
    if (!mapping) throw new Error(`REQUIREMENT_MAPPING_NOT_FOUND:${requirementId}`);
    return mapping;
  }

  public listControls(): ControlDefinition[] {
    return [...this.controls.values()];
  }
}
