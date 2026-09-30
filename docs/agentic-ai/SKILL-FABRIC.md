# Atlas Skill Fabric

## Skill lifecycle

```text
DISCOVERED -> VALIDATED -> EVALUATED -> ACTIVE
                         -> RESTRICTED / DISABLED / REVOKED
```

`SkillRegistry` binds evaluations to both the skill version and SHA-256
content hash. Skill instructions cannot grant tool permissions or override
Atlas policy.

## Runtime requirements

Each skill declares required capabilities. Before loading, Atlas must verify:

- tenant authorization;
- active skill state;
- unchanged content hash;
- model capability and eligibility;
- required tools and approval mode;
- context and multimodal requirements.

## Evaluation triggers

Skill changes, referenced tool changes, model changes, policy changes, and
knowledge-source changes invalidate affected evaluations. The skill must be
reevaluated before autonomous activation.

