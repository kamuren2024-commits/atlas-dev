import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const vitestBin = path.join(repoRoot, 'node_modules', 'vitest', 'vitest.mjs');
const args = ['run', 'backend/tests/graph-phase0.test.ts', '--reporter=verbose'];

console.log('OBSERVE: starting graph phase-0 evaluation');
console.log(`TARGET: ${repoRoot}`);
console.log(`COMMAND: ${process.execPath} ${vitestBin} ${args.join(' ')}`);

const result = spawnSync(process.execPath, [vitestBin, ...args], {
  cwd: repoRoot,
  stdio: 'inherit',
});

if (result.error) {
  console.log('\nEVALUATION_STATUS=BLOCKED_BY_ENVIRONMENT');
  console.log(`TEST_NAME=backend/tests/graph-phase0.test.ts`);
  console.log(`EXIT_CODE=unknown`);
  console.log('DATABASE_SETUP=temp SQLite DB under OS temp directory');
  console.log('ARTIFACT_PATHS=backend/tests/graph-phase0.test.ts, docs/ontology/*.md');
  console.log('RESULT=graph baseline evaluation could not start due to environment issue');
  process.exit(2);
}

if (result.status === 0) {
  console.log('\nEVALUATION_STATUS=PASS');
  console.log('TEST_NAME=backend/tests/graph-phase0.test.ts');
  console.log('EXIT_CODE=0');
  console.log('DATABASE_SETUP=temp SQLite DB under OS temp directory');
  console.log('ARTIFACT_PATHS=backend/tests/graph-phase0.test.ts, docs/ontology/*.md');
  console.log('RESULT=graph baseline passed without regression');
  process.exit(0);
}

console.log('\nEVALUATION_STATUS=FAIL');
console.log('TEST_NAME=backend/tests/graph-phase0.test.ts');
console.log(`EXIT_CODE=${result.status ?? 'unknown'}`);
console.log('DATABASE_SETUP=temp SQLite DB under OS temp directory');
console.log('ARTIFACT_PATHS=backend/tests/graph-phase0.test.ts, docs/ontology/*.md');
console.log('RESULT=graph baseline reproduced with documented defects; no production fix applied in Phase 0');
process.exit(result.status ?? 1);
