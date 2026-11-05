import { cn } from "@/lib/utils";
import { SERVICES, type Batch, type ServiceId } from "@/lib/concept/model";
import { short } from "@/lib/concept/derive";

export function ProjectRoute({
  batch,
  serviceId,
  workstreamName,
  presentedOn,
  captions,
}: {
  batch: Batch;
  serviceId: ServiceId;
  workstreamName: string;
  presentedOn?: string;
  captions?: Partial<
    Record<
      ServiceId,
      {
        state: "done" | "now" | "planned" | "skip";
        title: string;
        detail?: string;
      }
    >
  >;
}) {
  const cols = SERVICES.map((s) => {
    const custom = captions?.[s.id];
    if (!batch.route.includes(s.id))
      return {
        id: s.id,
        label:
          s.id === "tender" || s.id === "pricing" ? `or ${s.label}` : s.label,
        state: "skip" as const,
        title: "Not required",
        detail: undefined as string | undefined,
      };
    if (custom)
      return {
        id: s.id,
        label: s.label,
        state: custom.state,
        title: custom.title,
        detail: custom.detail,
      };
    if (s.id === serviceId)
      return {
        id: s.id,
        label: s.label,
        state: "now" as const,
        title: `Now · in ${workstreamName}`,
        detail: presentedOn
          ? `Estimate presented ${short(presentedOn)}`
          : undefined,
      };
    return {
      id: s.id,
      label: s.label,
      state: "planned" as const,
      title: "Planned",
      detail: undefined as string | undefined,
    };
  });
  return (
    <ol className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {cols.map((col) => (
        <li key={col.id}>
          <p
            className={cn(
              "p6",
              col.state === "skip" ? "text-text-tertiary" : "text-text-primary",
            )}
          >
            {col.label}
          </p>
          <div className="mt-2">
            {col.state === "now" ? (
              <div className="h-2 overflow-hidden rounded-full border border-black-7">
                <div className="h-full w-1/2 bg-black-7" />
              </div>
            ) : col.state === "done" ? (
              <div className="h-2 rounded-full bg-black-7" />
            ) : col.state === "skip" ? (
              <div className="h-2 rounded-full border border-dashed border-black-4" />
            ) : (
              <div className="h-2 rounded-full bg-black-2" />
            )}
          </div>
          <p
            className={cn(
              "mt-2 p7",
              col.state === "now" || col.state === "done"
                ? "font-semibold text-text-primary"
                : "text-text-secondary",
            )}
          >
            {col.title}
          </p>
          {col.detail && (
            <p className="mt-0.5 p7 text-text-secondary">{col.detail}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
