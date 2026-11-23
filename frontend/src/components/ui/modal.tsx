"use client";

import * as React from "react";
import { Button } from "./button";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-[#160d08]/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="picada-card max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-b-none rounded-t-3xl border-0 p-5 sm:rounded-3xl sm:border sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#d9c5a9] sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="picada-eyebrow">La Picá</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">{title}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar" className="h-9 w-9 shrink-0 rounded-full px-0 text-lg">
            ×
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
