import type { FilterBankKubeStateSchema } from "@/apps/default/hooks/states";
import { type z } from "zod";
import { KubePanelLayout } from "./KubePanelLayout";

type FilterBankData = z.infer<typeof FilterBankKubeStateSchema>;

export const FilterBankKubePanel = ({ data }: { data: FilterBankData }) => {
  return (
    <KubePanelLayout
      title="Filter Bank"
      kubeId={data.kube_id}
      rows={[
        { label: "Center Wavelength", value: data.center_wavelength },
        { label: "Model", value: data.model_name ?? "—" },
      ]}
    />
  );
};
