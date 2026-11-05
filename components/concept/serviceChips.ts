import { SERVICES, type ServiceId, type Workstream } from "@/lib/concept/model";

export function serviceChips(w: Workstream) {
  return SERVICES.flatMap((entry) => {
    const phase = w.phases.find((candidate) => candidate.service === entry.id);
    if (!phase || (phase.state !== "done" && phase.state !== "now")) return [];
    return [
      {
        label: entry.label,
        lead: phase.state === "now" ? ("now" as const) : ("done" as const),
      },
    ];
  });
}

export function phaseStarted(w: Workstream, id: ServiceId) {
  const phase = w.phases.find((item) => item.service === id);
  return Boolean(phase && phase.state !== "planned");
}
