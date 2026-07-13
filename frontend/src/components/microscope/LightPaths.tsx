import { useLightPathState } from "@/apps/default/hooks/states";

export const LightPaths = () => {
  const { data } = useLightPathState({ subscribe: true });

  return (
    <div className="flex justify-center">
      {data?.light_paths?.map((value) => (
        <div key={value.hash} className="border p-2 m-2">
          <h3 className="font-bold">Light Path: {value.hash}</h3>
          <p>Kubes:</p>
          <ul className="list-disc list-inside">
            {value.kubes.map((kube, index) => (
              <li key={index}>
                {kube.__brand === "objective_kube"
                  ? `Objective Kube: ${kube.kube_id}`
                  : `Detector Kube: ${kube.kube_id}`}
              </li>
            ))}
          </ul>
          <p>Edges:</p>
          <ul className="list-disc list-inside">
            {value.edges.map((edge, index) => (
              <li key={index}>
                {edge.source} → {edge.target} (Intensity:{" "}
                {edge.intensity !== null ? edge.intensity : "N/A"})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
