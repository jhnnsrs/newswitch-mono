import { useIlluminationState, type IlluminationKubeSchema } from "@/apps/default/hooks/states";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import React from "react";
import { type z } from "zod";
import { NodeHeader, nodeStyle } from "./NodeHeader";

type IlluminationData = z.infer<typeof IlluminationKubeSchema>;
type CustomNodeProps = NodeProps<Node<IlluminationData>>;

export const IlluminationNode: React.FC<CustomNodeProps> = ({ data }) => {

   const {data: illumination} = useIlluminationState({selector: (state) => {
      return state.illuminations.find((d) => d.slot === data.slot_id);
    }})


  return (
    <div style={{ ...nodeStyle, background: "#fff3cd" }}>
      <NodeHeader title="Illumination" id={data.kube_id} />
      <div style={{ textAlign: "center", color: "#555" }}>
        Intensity: {illumination?.intensity}%
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
