import type { IlluminationKubeStateSchema } from "@/apps/default/hooks/states";
import { type z } from "zod";
import { KubePanelLayout } from "./KubePanelLayout";

type IlluminationData = z.infer<typeof IlluminationKubeStateSchema>;

export const IlluminationKubePanel = ({ data }: { data: IlluminationData }) => {
  return (
    <KubePanelLayout
      title="Illumination"
      kubeId={data.kube_id}
      rows={[
        { label: "Slot", value: data.slot_id },
        { label: "Wavelength", value: data.wavelength },
        { label: "Intensity", value: `${data.intensity}%` },
        { label: "Model", value: data.model_name ?? "—" },
      ]}
    />
  );
};
