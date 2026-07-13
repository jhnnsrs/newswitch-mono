import type { FilterKubeStateSchema } from "@/apps/default/hooks/states";
import { type z } from "zod";
import { KubePanelLayout } from "./KubePanelLayout";

type FilterData = z.infer<typeof FilterKubeStateSchema>;

export const FilterKubePanel = ({ data }: { data: FilterData }) => {
  return (
    <KubePanelLayout
      title="Filter"
      kubeId={data.kube_id}
      rows={[
        { label: "Wavelength", value: data.wavelength },
        { label: "Model", value: data.model_name ?? "—" },
        { label: "Model File", value: data.model_file ?? "—" },
      ]}
    />
  );
};
