import { useCameraState, type DetectorKubeSchema } from "@/apps/default/hooks/states";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import React from "react";
import { type z } from "zod";
import { NodeHeader, nodeStyle } from "./NodeHeader";

type DetectorData = z.infer<typeof DetectorKubeSchema>;
type CustomNodeProps = NodeProps<Node<DetectorData>>;

export const DetectorNode: React.FC<CustomNodeProps> = ({ data }) => {


  const {data: detector} = useCameraState({selector: (state) => {
    return state.detectors.find((d) => d.slot === data.slot_id);
  }})



  return (
    <div style={{ ...nodeStyle, background: "#d4edda" }}>
      <Handle type="target" position={Position.Left} />
      <NodeHeader title="Detector" id={data.kube_id} />
      <div style={{ textAlign: "center", color: "#555" }}>
        Exp: {detector?.current_exposure_time }ms | Gain: {detector?.current_gain}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
