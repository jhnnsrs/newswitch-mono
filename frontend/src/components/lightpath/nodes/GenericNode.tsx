import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { type z } from "zod";
import type { GenericKubeStateSchema } from "@/apps/default/hooks/states/ExpanseState";
import { NodeHeader, nodeStyle } from "./NodeHeader";
import type { GenericKubeSchema } from "@/apps/default/hooks/states";

type GenericData = z.infer<typeof GenericKubeSchema>;
type CustomNodeProps = NodeProps<Node<GenericData>>;

export const GenericNode: React.FC<CustomNodeProps> = ({ data }) => {
  const metadataKeys = Object.keys(data.other_metadata || {});
  return (
    <div style={{ ...nodeStyle, background: "#e2e3e5" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Optical Element" id={data.kube_id} />
      {metadataKeys.length > 0 && (
        <div style={{ textAlign: "center", color: "#555", fontSize: "10px" }}>
          {metadataKeys.length} Metadata Fields
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
