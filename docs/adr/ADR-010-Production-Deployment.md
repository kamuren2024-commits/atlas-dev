# ADR-010: Production Deployment Architecture

* **Status**: ✅ Approved
* **Owner**: Lead DevOps SRE
* **Review Date**: 2026-07-28
* **Related Components**: `package.json`, Build Pipeline

---

## 1. Context & Problem Statement

Production environments like Cloud Run require rapid startup, low filesystem footprint, and absolute immunity to ES Module path resolution errors.

## 2. Alternatives Considered

* **Option A: Runtime TS Compilation (`ts-node`/`tsx`)**: High cold-start latency, large memory usage, and dependency overhead.
* **Option B: Dynamic ESM Exports**: Direct deployment of raw JS files. Prone to ES Module relative path resolution failures on standard Node.
* **Option C: Bundle to Single CommonJS File (Selected)**: Compile and bundle backend TypeScript files into a single, optimized `dist/server.cjs` via `esbuild`.

## 3. Decision

We configured the build script in `package.json` to compile and bundle `server.ts` into a self-contained, minimized CommonJS file `dist/server.cjs` using `esbuild`. All external libraries (Express, etc.) are safely marked as external.

## 4. Consequences & Tradeoffs

### Pros:
* **Zero ESM Errors**: CommonJS output completely avoids Node's strict runtime ES Module path constraints.
* **Instant Startups**: Reduces container file I/O, speeding up container cold starts on Cloud Run.

### Cons:
* **Build Step**: Requires running a compile command (`npm run build`) before deployment (integrated into standard pipelines).
