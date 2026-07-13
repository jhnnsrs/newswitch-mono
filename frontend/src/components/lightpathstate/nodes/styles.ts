// Kept out of NodeHeader.tsx so that file only exports components - mixing constants and
// components in one module breaks Fast Refresh (react-refresh/only-export-components).

export const NODE_WIDTH = 200;

export const nodeStyle = {
  border: "2px solid #333",
  borderRadius: "8px",
  padding: "10px",
  width: `${NODE_WIDTH}px`,
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  fontFamily: "sans-serif",
  fontSize: "12px",
};
