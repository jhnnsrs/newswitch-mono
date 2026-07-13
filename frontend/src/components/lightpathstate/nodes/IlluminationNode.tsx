import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { type z } from "zod";
import type { IlluminationKubeStateSchema } from "@/apps/default/hooks/states/ExpanseState";
import { NodeHeader } from "./NodeHeader";
import { nodeStyle } from "./styles";

type IlluminationData = z.infer<typeof IlluminationKubeStateSchema>;
type CustomNodeProps = NodeProps<Node<IlluminationData>>;

export const IlluminationNode: React.FC<CustomNodeProps> = ({ data }) => {
  return (
    <div style={{ ...nodeStyle, background: "#fff3cd" }}>
      <NodeHeader title="Illumination" id={data.kube_id} />
      <div style={{ textAlign: "center", color: "#555" }}>
        Intensity: {data.intensity}%
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
