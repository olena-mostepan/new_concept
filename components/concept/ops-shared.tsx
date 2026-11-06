import { SERVICES, type ServiceId, type SolutionId } from "@/lib/concept/model";
import { cn } from "@/lib/utils";
import { Icon } from "./ui";

export const SOLUTION_OPTIONS: Array<{ id: SolutionId; label: string }> = [
  { id: "solar", label: "Solar PV" },
  { id: "ev", label: "EV charging" },
  { id: "ashp", label: "Air source heat pump" },
  { id: "led", label: "LED" },
  { id: "generic", label: "Generic" },
];

export const solutionLabel = (id: SolutionId) =>
  SOLUTION_OPTIONS.find((item) => item.id === id)?.label ?? id;

export const SERVICE_LINES: Record<ServiceId, string> = {
  indicative: "From CQuel data",
  scope: "Surveys and checks",
  tender: "Find and compare suppliers",
  pricing: "Network or incumbent supplier",
  delivery: "Start to handover",
};

export const filledBtn =
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-black-7 px-4 h8 text-white disabled:pointer-events-none disabled:opacity-50";
/** Shared field chrome; pair {@link fieldInputClass} with inputs/selects for 40px height. */
export const fieldClass =
  "w-full rounded-md border border-border-dark bg-white px-3 py-2 p6 font-sans text-text-primary outline-none focus:border-black-7 focus:shadow-[inset_0_0_0_1px_var(--black-7)]";
/** Use with {@link fieldClass} on single-line inputs and month fields (not textareas). */
export const fieldInputClass = "h-10 py-0";
export const labelClass = "mb-1 block h9 text-text-title";

export function workstreamName(
  solution: SolutionId,
  serviceId: ServiceId,
  existing: Array<{ name: string; service: ServiceId }>,
) {
  const base = solutionLabel(solution);
  const serviceName =
    SERVICES.find((item) => item.id === serviceId)?.label ?? serviceId;
  const clash = existing.some(
    (item) => item.name === base && item.service === serviceId,
  );
  return clash ? `${base} · ${serviceName}` : base;
}

export function Stepper({ step }: { step: 1 | 2 }) {
  const items = [
    {
      n: 1 as const,
      title: "Properties",
      text: "Choose the buildings in the batch",
    },
    {
      n: 2 as const,
      title: "Name and goal",
      text: "Name the batch and set its goal",
    },
  ];
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {items.map((item, index) => {
        const done = step > item.n;
        const current = step === item.n;
        return (
          <li key={item.n} className="flex min-w-0 flex-1 items-start gap-3">
            {index === 1 && (
              <span
                className={cn(
                  "mt-3.5 hidden h-px w-10 shrink-0 sm:block",
                  step > 1 ? "bg-black-7" : "bg-black-3",
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full h9",
                done && "bg-black-7 text-white",
                current && "border-2 border-black-7 bg-white text-text-primary",
                !done &&
                  !current &&
                  "border border-border-dark bg-white text-text-tertiary",
              )}
            >
              {done ? (
                <Icon name="check" size={14} />
              ) : (
                item.n
              )}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "h8",
                  current || done ? "text-text-primary" : "text-text-tertiary",
                )}
              >
                {item.title}
              </p>
              <p className="p6 text-text-secondary">{item.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
