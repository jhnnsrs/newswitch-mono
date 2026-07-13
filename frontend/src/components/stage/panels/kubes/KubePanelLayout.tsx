import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";

export type KubePanelRow = {
  label: string;
  value: ReactNode;
};

export const KubePanelLayout = ({
  title,
  kubeId,
  rows,
  extra,
}: {
  title: string;
  kubeId: string;
  rows: KubePanelRow[];
  extra?: ReactNode;
}) => {
  return (
    <div className="min-w-56 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold leading-none">{title}</p>
          <p className="text-[11px] text-muted-foreground">Kube State</p>
        </div>
        <Badge variant="secondary" className="max-w-36 truncate">
          {kubeId}
        </Badge>
      </div>

      <Separator />

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[auto,1fr] items-center gap-x-3 gap-y-1"
          >
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {row.label}
            </span>
            <span className="text-xs text-right font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {extra ? (
        <>
          <Separator />
          <div className="space-y-1">{extra}</div>
        </>
      ) : null}
    </div>
  );
};
