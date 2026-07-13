import type { DichroicKubeStateSchema } from "@/apps/default/hooks/states";
import { type z } from "zod";
import { KubePanelLayout } from "./KubePanelLayout";

type DichroicData = z.infer<typeof DichroicKubeStateSchema>;

export const DichroicKubePanel = ({ data }: { data: DichroicData }) => {
  return (
    <KubePanelLayout
      title="Dichroic Mirror"
      kubeId={data.kube_id}
      rows={[
        { label: "Model", value: data.model_name ?? "—" },
        { label: "Model File", value: data.model_file ?? "—" },
      ]}
    />
  );
};
