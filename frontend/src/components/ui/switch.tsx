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
      variant={checked ? "secondary" : "ghost"}
      size="sm"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="min-w-[72px]"
    >
      {checked ? `ON · ${label}` : `OFF · ${label}`}
    </Button>
  );
}
