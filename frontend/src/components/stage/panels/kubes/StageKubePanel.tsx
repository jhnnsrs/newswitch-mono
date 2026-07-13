import type { StageKubeStateSchema } from "@/apps/default/hooks/states";
import { type z } from "zod";
import { KubePanelLayout } from "./KubePanelLayout";

type StageData = z.infer<typeof StageKubeStateSchema>;

export const StageKubePanel = ({ data }: { data: StageData }) => {
  return (
    <KubePanelLayout
      title="Stage"
      kubeId={data.kube_id}
      rows={[
        { label: "Model", value: data.model_name ?? "—" },
        { label: "Model File", value: data.model_file ?? "—" },
      ]}
    />
  );
};
