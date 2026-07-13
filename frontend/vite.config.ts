import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import generateAppsPlugin from './plugins/generate-app';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  // Vitest shares this config, and the codegen plugin fetches schemas from a running
  // backend in buildStart. Under test there is no backend, so it would warn on every run
  // and rewrite generated sources as a side effect of running tests. Skip it.
  const isTest = mode === 'test' || process.env.VITEST === 'true';

  return {
    plugins: [
      react(),
      ...(isTest
        ? []
        : [
            generateAppsPlugin({
              apps: [
                {
                  key: 'default', // We could use Imswitch here, but "default" is more generic and doesn't tie us to a specific app name
                  hooksSchemaUrl: env.VITE_SCHEMA_IMPLEMENTATION_URL,
                  statesSchemaUrl: env.VITE_SCHEMA_STATES_URL,
                  locksSchemaUrl: env.VITE_SCHEMA_LOCKS_URL,
                },
              ],
              baseDir: path.resolve(__dirname, 'src/apps'),
              rekuestImportPath:
                env.VITE_REKUEST_IMPORT_PATH || '@/lib/rekuest',
            }),
          ]),
      tailwindcss(),
    ],
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
    // Listen on every interface and accept any Host header, so the dev server is reachable
    // by hostname / LAN IP / tailscale name, not just localhost. This turns off Vite's
    // DNS-rebinding protection - fine for a lab dev server, don't expose it to the internet.
    server: {
      host: true,
      allowedHosts: true,
    },
    preview: {
      host: true,
      allowedHosts: true,
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: path.resolve(__dirname, './src'),
        },
      ],
    },
  };
});
