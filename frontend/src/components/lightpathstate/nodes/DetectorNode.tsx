import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { type z } from "zod";
import type { DetectorKubeStateSchema } from "@/apps/default/hooks/states/ExpanseState";
import { NodeHeader } from "./NodeHeader";
import { nodeStyle } from "./styles";

type DetectorData = z.infer<typeof DetectorKubeStateSchema>;
type CustomNodeProps = NodeProps<Node<DetectorData>>;

export const DetectorNode: React.FC<CustomNodeProps> = ({ data }) => {
  return (
    <div style={{ ...nodeStyle, background: "#d4edda" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Detector" id={data.kube_id} />
      <div style={{ textAlign: "center", color: "#555" }}>
        Exp: {data.exposure_time}ms | Gain: {data.gain}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
