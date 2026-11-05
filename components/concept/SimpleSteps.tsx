import { type StepColumn } from "@/lib/concept/derive";
import { nAssets } from "@/lib/concept/words";
import { cn } from "@/lib/utils";
import { Card } from "./ui";

type Look = "now" | "passed" | "upcoming";

/** A passed step with a current step still behind it was skipped, so it stays empty. */
function looks(columns: StepColumn[]): Look[] {
  return columns.map((column, index) => {
    if (column.state === "now") return "now";
    const earlierNow = columns
      .slice(0, index)
      .some((item) => item.state === "now");
    if (column.state === "passed" && !earlierNow) return "passed";
    return "upcoming";
  });
}

function lineFor(column: StepColumn, look: Look): string | null {
  if (look === "now" && column.count > 0) return nAssets(column.count);
  return null;
}

export function SimpleSteps({
  title,
  columns,
  right,
}: {
  title: string;
  columns: StepColumn[];
  right: string;
}) {
  const states = looks(columns);
  const n = Math.max(columns.length, 1);
  return (
    <Card title={title} right={right}>
      <div className="relative">
        {columns.length > 1 && (
          <div
            className="absolute top-[6px] h-0.5 bg-black-2"
            style={{ left: `${50 / n}%`, right: `${50 / n}%` }}
            aria-hidden
          />
        )}
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column, index) => {
            const look = states[index];
            return (
              <div
                key={column.label}
                className="flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-3.5 items-center justify-center">
                  <span
                    className={cn(
                      "rounded-full",
                      look === "now" &&
                        "h-2.5 w-2.5 bg-brand-6 ring-4 ring-[var(--bg-accent)]",
                      look === "passed" && "h-2.5 w-2.5 bg-black-4",
                      look === "upcoming" &&
                        "h-2.5 w-2.5 border border-border-dark bg-bg-container",
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "mt-2.5",
                    look === "now" && "h8 text-text-primary",
                    look === "passed" && "p6 text-text-title",
                    look === "upcoming" && "p6 text-text-tertiary",
                  )}
                >
                  {column.label}
                </p>
                {lineFor(column, look) && (
                  <p className="p7 text-text-primary">{lineFor(column, look)}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
