"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  formatShortDate,
  monthValueToIso,
  toMonthValue,
} from "@/lib/customer/delivery/dates";
import { IconButton } from "@/components/concept/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Precision = "day" | "month";

export function CustomerChangeDateModal({
  open,
  onOpenChange,
  title,
  subtitle,
  stageLabel,
  initialDate,
  onConfirm,
  reviewProgress,
  onSkip,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  stageLabel?: string | null;
  initialDate: string | null;
  onConfirm: (date: string) => void;
  reviewProgress?: { current: number; total: number } | null;
  onSkip?: () => void;
}) {
  const [precision, setPrecision] = React.useState<Precision>("day");
  const [actualDate, setActualDate] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setPrecision("day");
    setActualDate(initialDate ?? "");
  }, [open, initialDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border-border-dark p-0 sm:max-w-[480px]"
      >
        <DialogHeader className="border-b border-border-dark px-6 py-5 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-xl font-semibold text-text-primary">
                {title}
              </DialogTitle>
              <p className="p6 text-text-secondary">
                {reviewProgress
                  ? `${subtitle} · ${reviewProgress.current} of ${reviewProgress.total}`
                  : subtitle}
              </p>
            </div>
            <IconButton
              icon="cross"
              label="Close"
              onClick={() => onOpenChange(false)}
            />
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {stageLabel ? (
            <div className="rounded-md border border-border-dark bg-bg-container-grey px-3 py-2.5">
              <p className="h9 uppercase tracking-wide text-text-secondary">
                Stage
              </p>
              <p className="mt-0.5 h8 text-text-primary">{stageLabel}</p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <p className="p6 text-text-primary">
              What is the correct date for {stageLabel ?? "this stage"}?
            </p>
            <div className="inline-flex rounded-md border border-border-dark bg-bg-container-grey p-1">
              {(["day", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPrecision(mode);
                    if (mode === "month" && actualDate) {
                      setActualDate(
                        monthValueToIso(toMonthValue(actualDate), 15),
                      );
                    }
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 p6 capitalize transition-colors",
                    precision === mode
                      ? "bg-white text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="customer-change-date"
              className="p6 text-text-primary"
            >
              Date
            </label>
            <input
              id="customer-change-date"
              type={precision === "day" ? "date" : "month"}
              value={
                precision === "day"
                  ? actualDate.slice(0, 10)
                  : actualDate
                    ? toMonthValue(actualDate)
                    : ""
              }
              onChange={(e) => {
                const v = e.target.value;
                setActualDate(precision === "day" ? v : monthValueToIso(v, 15));
              }}
              className="w-full rounded-md border border-border-dark bg-white px-3 py-2 p6 text-text-primary outline-none focus:border-[var(--brand-6)]"
            />
            {actualDate ? (
              <p className="p7 text-text-secondary">
                Selected: {formatShortDate(actualDate)}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border-dark px-6 py-4 sm:justify-between">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <div className="flex flex-wrap justify-end gap-2">
            {onSkip ? (
              <button type="button" className="btn-secondary" onClick={onSkip}>
                Skip
              </button>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              disabled={!actualDate}
              onClick={() => onConfirm(actualDate)}
            >
              Confirm
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
