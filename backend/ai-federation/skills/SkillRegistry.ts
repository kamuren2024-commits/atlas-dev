import { createHash } from 'node:crypto';
import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export type SkillStatus =
  | 'DISCOVERED'
  | 'VALIDATED'
  | 'EVALUATED'
  | 'ACTIVE'
  | 'RESTRICTED'
  | 'DISABLED'
  | 'REVOKED';

export interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  requiresCapabilities: string[];
}

export interface SkillRecord {
  id: string;
  directory: string;
  metadata: SkillMetadata;
  status: SkillStatus;
  sha256: string;
  source: string;
  discoveredAt: string;
}

export interface SkillEvaluationProfile {
  skillId: string;
  version: string;
  contentHash: string;
  testSuite: string;
  functionalStatus: 'PASS' | 'FAIL' | 'UNEVALUATED';
  securityStatus: 'PASS' | 'FAIL' | 'UNEVALUATED';
  compatibility: string[];
  knownFailures: string[];
  lastEvaluatedAt?: string;
}

export interface LoadedSkill {
  metadata: SkillMetadata;
  instructions: string;
  sha256: string;
  source: string;
}

export type SkillAuthorizer = (skill: SkillRecord, tenantId: string) => Promise<boolean>;

export class SkillRegistry {
  private readonly records = new Map<string, SkillRecord>();
  private readonly evaluations = new Map<string, SkillEvaluationProfile>();
  private rootRealPath?: string;

  constructor(private readonly rootDirectory: string) {}

  async discover(): Promise<SkillRecord[]> {
    this.rootRealPath = await realpath(resolve(this.rootDirectory));
    const entries = await readdir(this.rootRealPath, { withFileTypes: true });
    const discovered: SkillRecord[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const directory = resolve(this.rootRealPath, entry.name);
      await this.assertWithinRoot(directory);
      const skillFile = resolve(directory, 'SKILL.md');
      const content = await readFile(skillFile, 'utf8');
      const metadata = parseSkillMetadata(content, entry.name);
      const digest = await this.hashDirectory(directory);
      const existing = this.records.get(metadata.name);
      if (existing && existing.sha256 !== digest) this.evaluations.delete(metadata.name);
      const record: SkillRecord = {
        id: metadata.name,
        directory,
        metadata,
        status: existing?.sha256 === digest ? existing.status : 'DISCOVERED',
        sha256: digest,
        source: directory,
        discoveredAt: new Date().toISOString(),
      };
      this.records.set(record.id, record);
      discovered.push({ ...record });
    }

    return discovered;
  }

  list(): SkillRecord[] {
    return Array.from(this.records.values(), record => ({ ...record, metadata: { ...record.metadata } }));
  }

  get(skillId: string): SkillRecord | undefined {
    const record = this.records.get(skillId);
    return record ? { ...record, metadata: { ...record.metadata } } : undefined;
  }

  validate(skillId: string): SkillRecord {
    const record = this.requireRecord(skillId);
    if (record.status !== 'DISCOVERED' && record.status !== 'VALIDATED' && record.status !== 'RESTRICTED') {
      throw new Error(`Skill ${skillId} cannot be validated from state ${record.status}`);
    }
    record.status = 'VALIDATED';
    return { ...record };
  }

  recordEvaluation(profile: SkillEvaluationProfile): SkillRecord {
    const record = this.requireRecord(profile.skillId);
    if (record.status !== 'VALIDATED' && record.status !== 'EVALUATED') {
      throw new Error(`Skill ${profile.skillId} must be validated before evaluation`);
    }
    if (record.metadata.version !== profile.version) {
      throw new Error(`Evaluation version does not match skill ${profile.skillId}`);
    }
    if (record.sha256 !== profile.contentHash) {
      throw new Error(`Evaluation content hash does not match skill ${profile.skillId}`);
    }
    this.evaluations.set(profile.skillId, { ...profile });
    if (profile.functionalStatus === 'PASS' && profile.securityStatus === 'PASS') {
      record.status = 'EVALUATED';
    } else if (profile.securityStatus === 'FAIL') {
      record.status = 'RESTRICTED';
    }
    return { ...record };
  }

  deprecate(skillId: string): SkillRecord {
    const record = this.requireRecord(skillId);
    if (record.status === 'REVOKED') throw new Error(`Revoked skill ${skillId} cannot be deprecated`);
    record.status = 'RESTRICTED';
    return { ...record };
  }

  disable(skillId: string): SkillRecord {
    const record = this.requireRecord(skillId);
    if (record.status === 'REVOKED') throw new Error(`Revoked skill ${skillId} cannot be re-enabled`);
    record.status = 'DISABLED';
    return { ...record };
  }

  revoke(skillId: string): SkillRecord {
    const record = this.requireRecord(skillId);
    record.status = 'REVOKED';
    this.evaluations.delete(skillId);
    return { ...record };
  }

  activate(skillId: string): SkillRecord {
    const record = this.requireRecord(skillId);
    const profile = this.evaluations.get(skillId);
    if (record.status !== 'EVALUATED' || !profile
      || profile.functionalStatus !== 'PASS' || profile.securityStatus !== 'PASS') {
      throw new Error(`Skill ${skillId} requires passing functional and security evaluations before activation`);
    }
    record.status = 'ACTIVE';
    return { ...record };
  }

  async load(
    skillId: string,
    tenantId: string,
    authorize: SkillAuthorizer,
    availableCapabilities: string[] = []
  ): Promise<LoadedSkill> {
    const record = this.requireRecord(skillId);
    if (record.status !== 'ACTIVE') throw new Error(`Skill ${skillId} is not active`);
    if (record.metadata.requiresCapabilities.some(capability => !availableCapabilities.includes(capability))) {
      throw new Error(`Runtime does not satisfy skill ${skillId} capability requirements`);
    }
    if (!await authorize({ ...record, metadata: { ...record.metadata } }, tenantId)) {
      throw new Error(`Tenant is not authorized to load skill ${skillId}`);
    }

    await this.ensureUnchanged(record);
    const content = await readFile(resolve(record.directory, 'SKILL.md'), 'utf8');
    return {
      metadata: { ...record.metadata },
      instructions: stripFrontmatter(content),
      sha256: record.sha256,
      source: record.source,
    };
  }

  async loadResource(skillId: string, relativePath: string, tenantId: string, authorize: SkillAuthorizer): Promise<string> {
    const record = this.requireRecord(skillId);
    if (record.status !== 'ACTIVE') throw new Error(`Skill ${skillId} is not active`);
    if (isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes('..')) {
      throw new Error('Skill resource path must be relative and cannot traverse directories');
    }
    if (!await authorize({ ...record, metadata: { ...record.metadata } }, tenantId)) {
      throw new Error(`Tenant is not authorized to load resources for skill ${skillId}`);
    }
    await this.ensureUnchanged(record);
    const target = resolve(record.directory, relativePath);
    await this.assertWithinRoot(target, record.directory);
    const targetStat = await stat(target);
    if (!targetStat.isFile()) throw new Error(`Skill resource is not a file: ${relativePath}`);
    return readFile(target, 'utf8');
  }

  private requireRecord(skillId: string): SkillRecord {
    const record = this.records.get(skillId);
    if (!record) throw new Error(`Skill ${skillId} has not been discovered`);
    return record;
  }

  private async hashDirectory(directory: string): Promise<string> {
    const hash = createHash('sha256');
    const visit = async (current: string): Promise<void> => {
      const entries = await readdir(current, { withFileTypes: true });
      entries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) {
        const fullPath = resolve(current, entry.name);
        if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in skills: ${fullPath}`);
        await this.assertWithinRoot(fullPath, directory);
        if (entry.isDirectory()) {
          await visit(fullPath);
        } else if (entry.isFile()) {
          const fileContent = await readFile(fullPath);
          hash.update(relative(directory, fullPath).split(sep).join('/'));
          hash.update(fileContent);
        }
      }
    };
    await visit(directory);
    return hash.digest('hex');
  }

  private async ensureUnchanged(record: SkillRecord): Promise<void> {
    const digest = await this.hashDirectory(record.directory);
    if (digest !== record.sha256) {
      record.status = 'RESTRICTED';
      throw new Error(`Skill ${record.id} changed after validation; rediscovery and evaluation are required`);
    }
  }

  private async assertWithinRoot(target: string, root = this.rootRealPath): Promise<void> {
    if (!root) throw new Error('Skill root has not been initialized');
    const resolvedTarget = await realpath(target);
    const pathFromRoot = relative(root, resolvedTarget);
    if (pathFromRoot === '..' || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot)) {
      throw new Error(`Skill path escapes its allowed directory: ${target}`);
    }
  }
}

function parseSkillMetadata(content: string, directoryName: string): SkillMetadata {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) throw new Error(`Skill ${directoryName} is missing YAML frontmatter`);
  const fields = new Map<string, string>();
  for (const line of frontmatter[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (field) fields.set(field[1], field[2].replace(/^(['"])(.*)\1$/, '$2'));
  }
  const name = fields.get('name');
  const description = fields.get('description');
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`Skill ${directoryName} has an invalid or missing name`);
  }
  if (!description) throw new Error(`Skill ${name} has an empty or missing description`);
  const requires = fields.get('requiresCapabilities') || '';
  const requiresCapabilities = requires
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(value => value.trim().replace(/^(['"])(.*)\1$/, '$2'))
    .filter(Boolean);
  return {
    name,
    description,
    version: fields.get('version') || '1.0.0',
    requiresCapabilities,
  };
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim();
}
