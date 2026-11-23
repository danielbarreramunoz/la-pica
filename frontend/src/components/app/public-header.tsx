"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { useCustomerStore } from "@/stores/useCustomerStore";

/**
 * Header público. En /app es flotante transparente (logo + buscador
 * siempre arriba, sobre el mapa). En el resto, barra sólida con logo.
 * La navegación vive en el TabBar.
 */
export function PublicHeader() {
  const pathname = usePathname();
  const query = useCustomerStore((state) => state.query);
  const setQuery = useCustomerStore((state) => state.setQuery);
  const isMap = pathname === "/app";

  if (isMap) {
    return (
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[1100] px-3 pt-3 sm:px-4 sm:pt-4"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="pointer-events-auto mx-auto flex max-w-5xl items-center gap-2 rounded-2xl border border-[#e7d5bb]/80 bg-[#fffaf0]/95 p-1.5 shadow-lg shadow-[#4b2416]/10 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95">
          <Link href="/app" aria-label="La Picá — buscar picadas" className="shrink-0 rounded-xl px-1">
            <Logo size={38} priority />
          </Link>
          <Input
            placeholder="¿Qué picada buscas?"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar restaurante"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e7d5bb] bg-[#fffaf0]/95 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <Link href="/app" aria-label="La Picá — buscar picadas" className="flex items-center gap-2">
          <Logo size={36} priority />
        </Link>
        <Link href="/app" className="rounded-full border border-[#e7d5bb] bg-[#fffdf7] px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-[#9a3e1a] dark:border-stone-700 dark:bg-stone-900 dark:text-orange-200">
          Mapa de picadas
        </Link>
      </div>
    </header>
  );
}
