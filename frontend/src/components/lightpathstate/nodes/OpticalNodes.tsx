import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

const NODE_WIDTH = 200;

const nodeStyle = {
  border: "2px solid #333",
  borderRadius: "8px",
  padding: "10px",
  width: `${NODE_WIDTH}px`,
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  fontFamily: "sans-serif",
  fontSize: "12px",
};

const NodeHeader: React.FC<{ title: string; id: string }> = ({ title, id }) => (
  <div style={{ textAlign: "center", marginBottom: "8px" }}>
    <div style={{ fontWeight: "bold", fontSize: "14px" }}>{title}</div>
    <div style={{ fontSize: "10px", color: "#888", wordBreak: "break-all" }}>
      ID: {id.slice(0, 8)}...
    </div>
  </div>
);

export const IlluminationNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{ ...nodeStyle, background: "#fff3cd" }}>
      <NodeHeader title="Illumination" id={data.kube_id as string} />
      <div style={{ textAlign: "center", color: "#555" }}>
        Intensity: {data.intensity}%
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export const ObjectiveNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{ ...nodeStyle, background: "#cce5ff" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Objective" id={data.kube_id as string} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export const FilterNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{ ...nodeStyle, background: "#f8d7da" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Filter" id={data.kube_id as string} />
      <div style={{ textAlign: "center", color: "#555" }}>
        {data.wavelength} nm
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export const DetectorNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{ ...nodeStyle, background: "#d4edda" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Detector" id={data.kube_id as string} />
      <div style={{ textAlign: "center", color: "#555" }}>
        Exp: {data.exposure_time}ms | Gain: {data.gain}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export const GenericNode: React.FC<NodeProps> = ({ data }) => {
  // Narrowing the unknown data typing to safely access object keys
  const metadataKeys = Object.keys((data.other_metadata as object) || {});
  return (
    <div style={{ ...nodeStyle, background: "#e2e3e5" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Optical Element" id={data.kube_id as string} />
      {metadataKeys.length > 0 && (
        <div style={{ textAlign: "center", color: "#555", fontSize: "10px" }}>
          {metadataKeys.length} Metadata Fields
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// Maps the runtime schema brands to the React flow custom nodes
export const nodeTypes: Record<string, React.FC<NodeProps>> = {
  illumination_kube_state: IlluminationNode,
  objective_kube_state: ObjectiveNode,
  filter_kube_state: FilterNode,
  detector_kube_state: DetectorNode,
  generic_kube_state: GenericNode,
};
