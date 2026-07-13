import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { type z } from "zod";
import type { ObjectiveKubeStateSchema } from "@/apps/default/hooks/states/ExpanseState";
import { NodeHeader, nodeStyle } from "./NodeHeader";

type ObjectiveData = z.infer<typeof ObjectiveKubeStateSchema>;
type CustomNodeProps = NodeProps<Node<ObjectiveData>>;

export const ObjectiveNode: React.FC<CustomNodeProps> = ({ data }) => {
  return (
    <div style={{ ...nodeStyle, background: "#cce5ff" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Objective" id={data.kube_id} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
