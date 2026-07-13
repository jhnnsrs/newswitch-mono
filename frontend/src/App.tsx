import "./App.css";
import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AppNavigationChrome } from "./components/navigation/AppNavigationChrome";
import { createScopedProvider } from "./lib/rekuest";
import { IndexPage, ReplayPage } from "./pages";
import { appsDefinition } from "./apps";
import { LocalStoreProvider } from "./store";

// The backend API URL is either injected into the global scope by the
// electron app or taken from environment variables, allowing for flexibility in different deployment scenarios.
const BACKEND_API = window.__agent_url__ || import.meta.env.VITE_BACKEND_URL;
const BACKEND_WS =
  window.__agent_ws_url__ || import.meta.env.VITE_WEBSOCKET_URL;

const ScopedAppsProvider = createScopedProvider({
  definition: appsDefinition,
  config: {
    default: {
      apiEndpoint: BACKEND_API,
      wsEndpoint: BACKEND_WS,
    },
  },
  debug: true,
  instanceId: "microscope-control-panel",
});

function ScopedRoute({
  children,
  scope,
}: {
  children: ReactNode;
  scope: string;
}) {
  return (
    <ScopedAppsProvider scope={scope}>
      <LocalStoreProvider scope={scope}>
        <AppNavigationChrome>{children}</AppNavigationChrome>
      </LocalStoreProvider>
    </ScopedAppsProvider>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ScopedRoute scope="index">
              <IndexPage />
            </ScopedRoute>
          }
        />
        <Route
          path="/replay"
          element={
            <ScopedRoute scope="replay">
              <ReplayPage />
            </ScopedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </>
  );
}

export default App;
