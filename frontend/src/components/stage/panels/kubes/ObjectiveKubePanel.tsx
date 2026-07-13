import type { ObjectiveKubeStateSchema } from "@/apps/default/hooks/states";
import { type z } from "zod";
import { KubePanelLayout } from "./KubePanelLayout";

type ObjectiveData = z.infer<typeof ObjectiveKubeStateSchema>;

export const ObjectiveKubePanel = ({ data }: { data: ObjectiveData }) => {
  return (
    <KubePanelLayout
      title="Objective"
      kubeId={data.kube_id}
      rows={[
        { label: "Slot", value: data.slot_id },
        { label: "Model", value: data.model_name ?? "—" },
        { label: "Model File", value: data.model_file ?? "—" },
      ]}
    />
  );
};
