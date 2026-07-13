import type { GenericKubeStateSchema } from "@/apps/default/hooks/states";
import { Badge } from "@/components/ui/badge";
import { type z } from "zod";
import { KubePanelLayout } from "./KubePanelLayout";

type GenericData = z.infer<typeof GenericKubeStateSchema>;

export const GenericKubePanel = ({ data }: { data: GenericData }) => {
  const metadata = Object.entries(data.other_metadata);

  return (
    <KubePanelLayout
      title="Generic Kube"
      kubeId={data.kube_id}
      rows={[{ label: "Metadata", value: metadata.length }]}
      extra={
        metadata.length > 0 ? (
          <div className="space-y-1.5">
            {metadata.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2"
              >
                <Badge variant="outline" className="font-normal">
                  {key}
                </Badge>
                <span className="text-xs font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No metadata</p>
        )
      }
    />
  );
};
