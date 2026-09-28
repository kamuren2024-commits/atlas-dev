# Skills Architecture

Atlas skills use a portable `SKILL.md` plus optional `scripts/`, `resources/`, and `references/` layout. `SkillRegistry` discovers only immediate skill directories, parses metadata without a YAML package dependency, records a SHA-256 integrity hash, rejects symlinks, and exposes summary metadata without loading instructions.

Loading is progressive: discover metadata, validate, record independent functional and security evaluation bound to the exact content hash, activate, authorize tenant access, load `SKILL.md`, and separately request any needed relative resource. Scripts are inventoried as hashed files but are never executed by the registry.

The registry fails closed: a skill is not loadable until ACTIVE, both evaluation dimensions pass, tenant authorization succeeds, and the content hash still matches. A changed skill loses its previous evaluation and must be rediscovered and reevaluated. Skills can also be restricted, disabled, or irreversibly revoked. Skill instructions cannot grant tool permissions or override Atlas policy.

The initial library has two procedural seeds: `document-analysis` and `evidence-verification`. They are discovered but not implicitly validated, evaluated, or activated. Skill-specific tests and human governance are required before activation in an enterprise environment.
