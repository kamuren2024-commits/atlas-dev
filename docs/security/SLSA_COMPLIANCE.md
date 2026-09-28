# SLSA LEVEL COMPLIANCE ASSURANCE

This document defines KETRACO's SLSA (Source-to-service Link for Software Artifacts) level compliance matrices.

---

## 1. SLSA Level 3 Targets

We target and enforce **SLSA Level 3** (Build L3) compliance for all software promotion paths:

```
  [ Source Code ] ◄── Verified commit history (signed git tags)
        │
        ▼
  [ Build Environment ] ◄── Hosted runners with isolated compute (immutable)
        │
        ▼
  [ Provenance Document ] ◄── Attestation files signed with KMS keys
```

---

## 2. Provenance Generation

Every build generates an immutable provenance document detailing:
1. **Source URI**: The exact Git commit hash of the release.
2. **Build Tool**: The specific compiler and build systems used (e.g. Node v20, esbuild v0.19).
3. **Output Hash**: SHA-256 hash of the generated Docker image, ensuring tamper-proof delivery.
