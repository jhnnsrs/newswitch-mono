import React from "react";

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

export const NodeHeader: React.FC<{ title: string; id: string }> = ({
  title,
  id,
}) => (
  <div style={{ textAlign: "center", marginBottom: "8px" }}>
    <div style={{ fontWeight: "bold", fontSize: "14px" }}>{title}</div>
    <div style={{ fontSize: "10px", color: "#888", wordBreak: "break-all" }}>
      ID: {id.slice(0, 8)}...
    </div>
  </div>
);
