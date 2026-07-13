import type { DetectorKubeStateSchema } from "@/apps/default/hooks/states";
import { type z } from "zod";
import { KubePanelLayout } from "./KubePanelLayout";

type DetectorData = z.infer<typeof DetectorKubeStateSchema>;

export const DetectorKubePanel = ({ data }: { data: DetectorData }) => {
  return (
    <KubePanelLayout
      title="Detector"
      kubeId={data.kube_id}
      rows={[
        { label: "Gain", value: data.gain },
        { label: "Exposure", value: data.exposure_time },
        { label: "Model", value: data.model_name ?? "—" },
      ]}
    />
  );
};
