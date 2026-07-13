import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import generateAppsPlugin from "./plugins/generate-app";


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      generateAppsPlugin({
        apps: [
          {
            key: "default", // We could use Imswitch here, but "default" is more generic and doesn't tie us to a specific app name
            hooksSchemaUrl: env.VITE_SCHEMA_IMPLEMENTATION_URL,
            statesSchemaUrl: env.VITE_SCHEMA_STATES_URL,
            locksSchemaUrl: env.VITE_SCHEMA_LOCKS_URL,
          },
        ],
        baseDir: path.resolve(__dirname, "src/apps"),
        rekuestImportPath: env.VITE_REKUEST_IMPORT_PATH || "@/lib/rekuest",
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
  };
});
