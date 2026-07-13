import {
  Background,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useEffect } from "react";
import { type z } from "zod";

import type { LightPathStateSchema } from "@/apps/default/hooks/states/ExpanseState";
import { getLayoutedElements } from "./layoutUtils";
import { nodeTypes } from "./nodes";

export type LightPathState = z.infer<typeof LightPathStateSchema>;

interface OpticalPathViewerProps {
  path: LightPathState;
}

export const LightPathRender: React.FC<OpticalPathViewerProps> = ({
  path,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const kubes = path.kubes;
    const rawEdges = path.edges;

    // 1. Create initial React Flow Nodes, linking schema data and brand type
    const initialNodes: Node[] = kubes.map((kube) => ({
      id: kube.kube_id,
      type: kube.__brand,
      position: { x: 0, y: 0 }, // Dagre overwrites this instantly
      data: kube,
    }));

    // 2. Create initial React Flow Edges
    const initialEdges: Edge[] = rawEdges.map((e, index) => ({
      id: `edge-${e.source}-${e.target}-${index}`,
      source: e.source,
      target: e.target,
      label: e.polarization
        ? `Pol: ${e.polarization}`
        : e.intensity !== null
          ? `${e.intensity}%`
          : undefined,
      animated: true,
      style: { stroke: "#555", strokeWidth: 2 },
    }));

    // 3. Apply Dagre Layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      "LR",
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [path, setNodes, setEdges]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
};
