import React from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { type z } from "zod";
import type { FilterKubeStateSchema } from "@/apps/default/hooks/states/ExpanseState";
import { NodeHeader } from "./NodeHeader";
import { nodeStyle } from "./styles";

type FilterData = z.infer<typeof FilterKubeStateSchema>;
type CustomNodeProps = NodeProps<Node<FilterData>>;

export const FilterNode: React.FC<CustomNodeProps> = ({ data }) => {
  return (
    <div style={{ ...nodeStyle, background: "#f8d7da" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Filter" id={data.kube_id} />
      <div style={{ textAlign: "center", color: "#555" }}>
        {data.wavelength} nm
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
