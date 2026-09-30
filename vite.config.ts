import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const isExplicitlyTrue = (value?: string) =>
  String(value ?? '').trim().toLowerCase() === 'true';

const requestedAtlasDemoMode =
  isExplicitlyTrue(process.env.ATLAS_DEMO_MODE) ||
  isExplicitlyTrue(process.env.VITE_ATLAS_DEMO_MODE);
const atlasDemoModeEnabled =
  requestedAtlasDemoMode &&
  process.env.CONTEXT !== 'production';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_'],
  define: {
    'process.env.DEV_AUTH_BYPASS': JSON.stringify(process.env.DEV_AUTH_BYPASS || ''),
    'process.env.ATLAS_DEMO_MODE': JSON.stringify(process.env.ATLAS_DEMO_MODE || 'false'),
    'import.meta.env.VITE_ATLAS_DEMO_MODE': JSON.stringify(String(atlasDemoModeEnabled)),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    hmr: false,
  },
});
