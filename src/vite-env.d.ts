/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ATLAS_DEMO_MODE?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
