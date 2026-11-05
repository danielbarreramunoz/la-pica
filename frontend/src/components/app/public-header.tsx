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
  const query = useCustomerStore((s) => s.query);
  const setQuery = useCustomerStore((s) => s.setQuery);
  const isMap = pathname === "/app";

  if (isMap) {
    return (
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[1100] px-4 pt-4" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div className="pointer-events-auto mx-auto flex max-w-5xl items-center gap-2">
          <Link href="/app" aria-label="La Picá — buscar picadas" className="shrink-0 rounded-full">
            <Logo size={40} priority />
          </Link>
          <Input
            placeholder="Buscar picada por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar restaurante"
            className="shadow-md"
          />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95">
      <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
        <Link href="/app" aria-label="La Picá — buscar picadas">
          <Logo size={38} priority />
        </Link>
      </div>
    </header>
  );
}
