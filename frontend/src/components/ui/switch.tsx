"use client";

import { Button } from "./button";

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      aria-pressed={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`h-8 w-14 shrink-0 rounded-full border p-1 ${
        checked
          ? "justify-end border-[#2E7D32] bg-[#2E7D32] hover:bg-[#276a2b] dark:border-[#2E7D32] dark:bg-[#2E7D32]"
          : "justify-start border-[#d9c5a9] bg-[#e9dcc9] hover:bg-[#dccbb2] dark:border-stone-600 dark:bg-stone-700"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm" aria-hidden="true" />
    </Button>
  );
}
