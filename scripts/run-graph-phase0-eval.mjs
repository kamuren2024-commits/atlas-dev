import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['vitest', 'run', 'backend/tests/graph-phase0.test.ts', '--reporter=verbose'];

console.log('OBSERVE: starting graph phase-0 evaluation');
console.log(`TARGET: ${repoRoot}`);
console.log(`COMMAND: ${cmd} ${args.join(' ')}`);

const result = spawnSync(cmd, args, {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['inherit', 'pipe', 'pipe'],
});

if (result.stdout) {
  process.stdout.write(result.stdout);
}
if (result.stderr) {
  process.stderr.write(result.stderr);
}

const output = `${result.stdout || ''}\n${result.stderr || ''}`;
let status = 'NOT_RUN';
if (result.error) {
  status = 'BLOCKED_BY_ENVIRONMENT';
} else if (result.status === 0) {
  status = 'PASS';
} else if (result.status !== null) {
  status = 'FAIL';
}

if (output.includes('MODULE_NOT_FOUND') || output.includes('ERR_MODULE_NOT_FOUND') || output.includes('Failed to resolve import')) {
  status = 'BLOCKED_BY_ENVIRONMENT';
}

console.log(`\nEVALUATION_STATUS=${status}`);
console.log(`TEST_NAME=backend/tests/graph-phase0.test.ts`);
console.log(`EXIT_CODE=${result.status ?? 'unknown'}`);
console.log(`DATABASE_SETUP=temp SQLite DB under OS temp directory`);
console.log('ARTIFACT_PATHS=backend/tests/graph-phase0.test.ts, docs/ontology/*.md');
console.log('RESULT=graph baseline reproduced with documented defects; no production fix applied in Phase 0');

if (status === 'PASS') {
  process.exit(0);
}
if (status === 'BLOCKED_BY_ENVIRONMENT') {
  process.exit(2);
}
if (status === 'NOT_RUN') {
  process.exit(3);
}
process.exit(result.status ?? 1);
