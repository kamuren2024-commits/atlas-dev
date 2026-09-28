# DEPLOYMENT PIPELINE SCHEMA

This document details the CI/CD pipeline configurations, job runs, and automation gates.

---

## 1. CI/CD Lifecycle Phases

Our release pipelines are divided into three sequential workflows:

```
  [ BUILD STAGE ] ──► [ TEST STAGE ] ──► [ PROMOTE STAGE ]
  - Compile TS        - Unit tests       - Docker tag bump
  - Bundler (esbuild) - Security scans   - Git commit to infra repo
```

---

## 2. Pipeline Stage Specifications

### A. Build Stage
* **Tasks**: Installs NPM packages, compiles TypeScript, and runs `npm run build`.
* **Output**: Compiled web assets in `/dist/` and bundled backend in `dist/server.cjs`.

### B. Test Stage
* **Tasks**: Runs ESLint, executes unit tests, scans for raw credentials, and performs dependency security audits.
* **Failure Actions**: Pipeline halts instantly if any check fails, preventing artifacts from publishing.

### C. Promote Stage
* **Tasks**: Builds the Docker container, signs the image with a KMS key, and commits the updated tag to the infrastructure repo.
* **ArgoCD Trigger**: ArgoCD detects the change in the infrastructure repository and synchronizes the cluster state.
