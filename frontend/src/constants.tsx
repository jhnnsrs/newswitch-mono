// The backend API URL is either injected into the global scope by the
// electron app or taken from environment variables, allowing for flexibility in different deployment scenarios.
export const BACKEND_API =
  window.__agent_url__ || import.meta.env.VITE_BACKEND_URL;
export const BACKEND_WS =
  window.__agent_ws_url__ || import.meta.env.VITE_WEBSOCKET_URL;

export const H264_STREAM_PATH = BACKEND_API + "/stream/h264";
export const ZSTD_STREAM_PATH = BACKEND_API + "/stream/zstd";
