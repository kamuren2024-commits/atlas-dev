import { spawn } from 'node:child_process';

const demoMode = process.env.ATLAS_DEMO_MODE ?? 'true';
const child = spawn(
  process.execPath,
  ['--import', 'tsx', 'server.ts'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      ATLAS_DEMO_MODE: demoMode,
      VITE_ATLAS_DEMO_MODE: process.env.VITE_ATLAS_DEMO_MODE ?? demoMode,
    },
  },
);

child.on('error', (error) => {
  console.error('[DEV] Unable to start the Atlas development server:', error);
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  const signalExitCode = signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1;
  process.exitCode = code ?? signalExitCode;
});
