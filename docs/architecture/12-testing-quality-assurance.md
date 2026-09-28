# 12 — Testing Coverage & Quality Assurance Reality

**Target System:** Salience Atlas Test Suites, Quality Assurance & CI Pipelines  
**Scope:** Test Runner Configuration, Executable Unit/Integration Tests, Test Failures, Type Checking Coverage  
**Auditor:** Principal Quality Assurance Architect & SRE Lead  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

A core mission requirement for any production-grade enterprise platform is automated verification: unit tests, integration tests, and static type safety.

Our audit of the testing infrastructure reveals a **critical disconnect between stated test assertions and automated execution capability**:
- `package.json` **does not define a `"test"` script**.
- The test runner `jest` is **not installed** in `node_modules`, even though `@jest/globals` is declared in `devDependencies`.
- `tsconfig.json` explicitly **excludes `"backend"`, `"packages"`, `"platform"`, and `"scripts"`**, meaning `npm run lint` (`tsc --noEmit`) validates only `/src` (the frontend), hiding all backend type errors and broken imports.
- Several backend test suites fail immediately on execution due to broken relative import paths or missing Jest environments.
- On a positive note: `src/core/loop` and `src/core/workflow` test suites **pass cleanly** when run via Node's native test runner (`npx tsx --test`).

---

## 2. Test File Inventory & Execution Results

An automated search identified **13 distinct test files** in the application codebase. Each file was tested using Node.js v22's native runner (`npx tsx --test <path>`):

| Test Suite Path | Declared Purpose | Execution Result | Root Cause Analysis |
|---|---|---|---|
| `src/core/loop/tests/loop-engine.test.ts` | ReAct loop engine OODA transitions | **PASS (100%)** | Clean Node-compatible assertion logic. Verified working. |
| `src/core/loop/runtime/tests/runtime.test.ts` | Loop runtime context & state transitions | **PASS (100%)** | Clean Node-compatible assertion logic. Verified working. |
| `src/core/workflow/tests/workflow.test.ts` | Workflow step transitions & graph check | **PASS (100%)** | Clean Node-compatible assertion logic. Verified working. |
| `src/core/agents/testing/agent.test.ts` | Autonomous agent lifecycle | **PASS (100%)** | Executes standalone in memory. Verified working. |
| `src/core/memory/testing/memory.test.ts` | Memory store operations | **PASS (100%)** | Evaluates in-memory episodic/semantic stores. |
| `backend/tests/event-fabric.unit.test.ts` | Event bus, normalizer, state store | **FAIL (Crash)** | Broken import path: `../../event-fabric/event-bus` instead of `../event-fabric/event-bus`. |
| `backend/tests/ai-federation-phase1.test.ts` | AI Federation service & Ollama provider | **FAIL (Crash)** | Imports `beforeEach` from `@jest/globals` without Jest runner context (`SyntaxError`). |
| `backend/database/redis-service.test.ts` | Redis cache, locks, queues, DLQ | **HANG / TIMEOUT** | Attempts connection to localhost:6379; triggers ECONNREFUSED; test harness does not auto-exit. |
| `backend/agents/__tests__/registry.test.ts` | Agent registry persistence & lease | **FAIL (Crash)** | Attempts `this.prisma.agent.upsert()` which throws `TypeError: Cannot read properties of undefined`. |
| `backend/evaluation/evidence.test.ts` | PPADA evaluation evidence trees | **PARTIAL** | Runs if Jest environment polyfills are injected. |
| `backend/evaluation/rule-ontology.test.ts` | Statutory procurement rule ontology | **PARTIAL** | In-memory assertion logic. |
| `backend/tests/event-fabric.integration.test.ts`| Event fabric multi-consumer pipeline | **FAIL (Crash)** | Broken relative import paths matching unit test. |
| `backend/tests/finance-phase01.unit.test.ts` | Financial data fabric ledger balance | **PARTIAL** | Requires SQLite database path to be explicitly passed. |

---

## 3. The `tsconfig.json` Blind Spot

Inspecting `/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "strict": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "backend", "packages", "platform", "scripts"]
}
```

### Consequences:
1. When a developer or CI pipeline runs `npm run lint` (`tsc --noEmit`), TypeScript only checks files in `/src`.
2. **Every single backend file** (`backend/*`, `platform/*`, `packages/*`) is completely ignored.
3. As a result, critical errors—such as `import { PrismaClient } from '@prisma/client'` when no Prisma client exists, or broken import paths in test suites—never register as build or lint errors.

---

## 4. Test Infrastructure Remediations

To establish a production-grade automated testing baseline:

1. **Add `"test"` Script to `package.json`:**
   ```json
   "scripts": {
     "test": "tsx --test src/core/**/tests/*.test.ts backend/**/*.unit.test.ts"
   }
   ```
2. **Fix Relative Import Paths in `backend/tests/event-fabric.*.test.ts`:**
   Change `../../event-fabric/` to `../event-fabric/` so the event fabric test suites run cleanly.
3. **Polyfill / Decouple Jest Globals:**
   Replace `@jest/globals` with Node.js native `node:test` (`import { describe, it, beforeEach } from 'node:test'`) and `node:assert` (`import assert from 'node:assert'`). This eliminates the uninstalled Jest dependency and allows all tests to execute natively in standard Node 22.
4. **Create `tsconfig.backend.json`:**
   Add a dedicated TypeScript configuration for the backend to catch type errors during compilation.
