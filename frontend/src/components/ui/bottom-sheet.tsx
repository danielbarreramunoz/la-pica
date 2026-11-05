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
      className={`${shown ? "animate-fade" : "animate-fade-out"} fixed inset-0 z-[1200] bg-black/50`}
      onClick={close}
    >
      <div
        className={`${shown ? "animate-sheet" : "animate-sheet-out"} absolute inset-x-0 bottom-0 mx-auto max-h-[80dvh] w-full max-w-5xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl dark:bg-stone-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-600" aria-hidden="true" />
        <h2 className="font-sans text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
