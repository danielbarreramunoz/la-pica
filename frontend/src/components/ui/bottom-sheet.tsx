"use client";

import * as React from "react";

const EXIT_MS = 200;

/**
 * Bottom sheet móvil: panel que sube desde abajo sobre la misma pantalla.
 * Anima entrada y salida (desmontaje diferido tras `onClose`).
 * Cierra con fondo o tecla Escape.
 */
export function BottomSheet({
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
  const [prevOpen, setPrevOpen] = React.useState(open);
  const [leaving, setLeaving] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = React.useRef(onClose);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Patrón "estado del render anterior": resetea la salida si se reabre.
  if (open !== prevOpen) {
    setPrevOpen(open);
    setLeaving(false);
  }

  const close = React.useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setLeaving(true);
    timer.current = setTimeout(() => {
      setLeaving(false);
      onCloseRef.current();
    }, EXIT_MS);
  }, []);

  // Solo sincroniza con el DOM (bloqueo de scroll), sin setState.
  React.useEffect(() => {
    document.body.style.overflow = open || leaving ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, leaving]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [close]);

  if (!open && !leaving) return null;

  const shown = open && !leaving;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`${shown ? "animate-fade" : "animate-fade-out"} fixed inset-0 z-[1200] bg-[#160d08]/55 backdrop-blur-[2px]`}
      onClick={close}
    >
      <div
        className={`${shown ? "animate-sheet" : "animate-sheet-out"} absolute inset-x-0 bottom-0 mx-auto max-h-[82dvh] w-full max-w-5xl overflow-y-auto rounded-t-3xl border border-b-0 border-[#e7d5bb] bg-[#fffdf7] p-5 shadow-2xl dark:border-stone-700 dark:bg-stone-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d9c5a9] dark:bg-stone-600" aria-hidden="true" />
        <p className="picada-eyebrow">La Picá</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
