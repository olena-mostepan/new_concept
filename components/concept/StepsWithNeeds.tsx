import { cn } from "@/lib/utils";
import type { StepColumn } from "@/lib/concept/derive";
import { Icon } from "./ui";

function Dot({ state }: { state: StepColumn["state"] }) {
  if (state === "passed")
    return <span className="h-3 w-3 rounded-full bg-black-7" aria-hidden />;
  if (state === "now") {
    return (
      <span
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-black-7"
        aria-hidden
      >
        <span className="h-1.5 w-1.5 rounded-full bg-black-7" />
      </span>
    );
  }
  return (
    <span
      className="h-3 w-3 rounded-full border border-black-4 bg-white"
      aria-hidden
    />
  );
}

function Mark({ mark }: { mark: "tick" | "you" | "other" }) {
  if (mark === "tick")
    return (
      <Icon name="check" size={14} className="mt-0.5 shrink-0 text-text-tertiary" />
    );
  if (mark === "you")
    return (
      <span
        className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-6"
        aria-hidden
      />
    );
  return (
    <span
      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-black-4"
      aria-hidden
    />
  );
}

export function StepsWithNeeds({ columns }: { columns: StepColumn[] }) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((col, i) => (
        <div key={col.label} className="min-w-0">
          <div className="flex items-center">
            <span
              className={cn(
                "h-px flex-1",
                i === 0 ? "bg-transparent" : "bg-black-3",
              )}
            />
            <Dot state={col.state} />
            <span
              className={cn(
                "h-px flex-1",
                i === columns.length - 1 ? "bg-transparent" : "bg-black-3",
              )}
            />
          </div>
          <p
            className={cn(
              "mt-3 p6",
              col.state === "now"
                ? "font-semibold text-text-primary"
                : " text-text-primary",
            )}
          >
            {col.label}
          </p>
          <p className="mt-0.5 p6 text-text-secondary">
            {col.countLabel ??
              `${col.count} ${col.count === 1 ? "project" : "projects"}`}
          </p>
          <p className="mt-2 p6 text-text-secondary">{col.happens}</p>
          {col.panel && (
            <div className="relative mt-1 pt-4">
              <span
                className={cn(
                  "absolute left-1/2 top-0 h-4 w-px -translate-x-1/2",
                  col.panel.tone === "dashed"
                    ? "border-l border-dashed border-black-4 bg-transparent"
                    : col.panel.tone === "solid"
                      ? "bg-black-7"
                      : "bg-black-3",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                  col.panel.tone === "solid" ? "bg-black-7" : "bg-black-4",
                )}
                aria-hidden
              />
              <div
                className={cn(
                  "rounded-md border p-3",
                  col.panel.tone === "solid" && "border-black-7 bg-white",
                  col.panel.tone === "dashed" &&
                    "border-dashed border-border-dark bg-white",
                  col.panel.tone === "muted" &&
                    "border-border-dark bg-bg-container-grey text-text-secondary",
                )}
              >
                <p className="text-text-secondary s3">{col.panel.heading}</p>
                <ul className="mt-2 space-y-2">
                  {col.panel.items.map((item) => (
                    <li key={item.text}>
                      <div className="flex gap-2">
                        <Mark mark={item.mark} />
                        <p
                          className={cn(
                            "p6",
                            item.mark === "you"
                              ? "font-semibold text-text-primary"
                              : col.panel?.tone === "muted"
                                ? "text-text-tertiary"
                                : "text-text-primary",
                          )}
                        >
                          {item.text}
                        </p>
                      </div>
                      {item.action === "email" && (
                        <a className="btn-link mt-2" href="mailto:">
                          Reply by email
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
