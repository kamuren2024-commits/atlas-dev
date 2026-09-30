import { spawn } from 'node:child_process';

const child = spawn(
  process.execPath,
  ['--import', 'tsx', 'server.ts'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      ATLAS_DEMO_MODE: 'true',
      VITE_ATLAS_DEMO_MODE: 'true',
      CONTEXT: 'demo',
      NODE_ENV: 'development',
    },
  },
);

child.on('error', (error) => {
  console.error('[DEMO] Unable to start the Atlas demo server:', error);
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  const signalExitCode = signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1;
  process.exitCode = code ?? signalExitCode;
});
