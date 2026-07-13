/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_SCHEMA_IMPLEMENTATION_URL: string;
  readonly VITE_SCHEMA_STATES_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
