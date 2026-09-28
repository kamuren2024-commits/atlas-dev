# RELEASE GUIDE — KETRACO SCM Intelligence Nexus

This guide defines the release process, versioning strategies, promotion paths, and rollback gates.

---

## 1. Release Lifecycle Phases

```
 [ DEVELOPMENT ] ── (tsc, lint checks)
         │
         ▼
    [ STAGING ]  ── (simulation runs, budget reviews)
         │
         ▼
  [ PRODUCTION ] ── (container deployment, health check)
```

### Staging Verification Phase
Staging releases undergo daily mock-up simulations of power grids, verifying coordinate loads and ensuring cost controls hold.

### Production Promotion Phase
Promotion to production requires passing all **Quality Gates (QG-01 to QG-06)**.

---

## 2. Release Promotion Playbook

### Step 1: Push release branch to origin
```bash
git checkout -b release/v3.0.0
git push origin release/v3.0.0
```

### Step 2: Trigger CD Build Pipeline
The CD platform builds the Docker container, validates configuration matrices, compiles TS, and publishes the image.

### Step 3: Run Post-Deploy Sanity check
Verify `/api/health` response and examine stdout for zero credential-exposure alerts.
