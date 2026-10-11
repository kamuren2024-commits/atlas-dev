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
    'process.env.ATLAS_DEMO_MODE': JSON.stringify(process.env.ATLAS_DEMO_MODE || 'false'),
    'import.meta.env.VITE_ATLAS_DEMO_MODE': JSON.stringify(String(atlasDemoModeEnabled)),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  optimizeDeps: {
    force: true,
    entries: ['./src/main.tsx'],
    include: ['react', 'react-dom/client', 'motion/react', 'lucide-react'],
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('three') || id.includes('@react-three')) return 'three';
          if (id.includes('d3') || id.includes('recharts')) return 'charts';
          if (id.includes('motion')) return 'motion';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
          if (id.includes('@googlemaps') || id.includes('mapbox')) return 'maps';
          if (id.includes('gsap')) return 'animation';
          if (id.includes('tailwindcss') || id.includes('@tailwindcss')) return 'styles';
          return 'vendor';
        },
      },
    },
  },
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    hmr: false,
  },
});
