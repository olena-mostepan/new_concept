"use client";

import { useState, type ReactNode } from "react";
import { WORDS } from "@/lib/concept/words";
import { FactsRow, type FactItem, IconButton } from "./ui";

export function useDetailsOpen(initial = true) {
  const [open, setOpen] = useState(initial);
  return { open, toggle: () => setOpen((value) => !value) };
}

export function DetailsToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <IconButton
      type="secondary"
      icon={open ? "chevron-up" : "chevron-down"}
      label={
        open ? `Hide ${WORDS.package} details` : `Show ${WORDS.package} details`
      }
      expanded={open}
      onClick={onToggle}
    />
  );
}

export function DetailTags({
  label,
  tags,
}: {
  label?: string;
  tags: string[];
}) {
  if (!tags.length) return null;
  return (
    <div>
      {label && <p className="text-text-secondary s3">{label}</p>}
      <ul className={`flex flex-wrap gap-2 ${label ? "mt-3" : ""}`}>
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border-dark bg-white px-3 py-1 p6 text-text-primary"
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DetailsGrid({
  items,
  tags,
  tagLabel,
}: {
  items: FactItem[];
  tags?: string[];
  tagLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <FactsRow facts={items} />
      <DetailTags label={tagLabel} tags={tags ?? []} />
    </div>
  );
}
