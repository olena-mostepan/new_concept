"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomerPhaseNode } from "@/lib/customer/delivery/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CustomerPhaseStepperCompact({
  phases,
}: {
  phases: CustomerPhaseNode[];
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex min-w-[300px] items-center py-1">
        {phases.map((phase, i) => {
          const isLast = i === phases.length - 1;
          return (
            <div key={phase.id} className="flex items-center">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full outline-none h9",
                        phase.status === "done" && "bg-black-2 text-black-5",
                        phase.status === "current" &&
                          "border-[1.5px] border-black-7 bg-bg-container text-text-primary shadow-[var(--halo-current)]",
                        phase.status === "upcoming" &&
                          "border border-black-3 bg-bg-container text-text-tertiary",
                      )}
                      aria-label={phase.label}
                    >
                      {phase.status === "done" ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <span className="font-semibold">{i + 1}</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={6}
                    className="border border-border-dark bg-white px-2.5 py-1.5 p7 text-text-primary shadow-sm"
                  >
                    {phase.label}
                  </TooltipContent>
                </Tooltip>
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "mx-1 h-0.5 w-5 sm:w-7",
                    phase.status === "done" ? "bg-black-3" : "bg-black-2",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
