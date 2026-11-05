"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSessionStore } from "@/stores/useSessionStore";

export default function CuentaPage() {
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 pb-24">
      <h1 className="font-sans text-2xl font-bold">Mi cuenta</h1>
      <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-sans text-base font-bold">Apariencia</h2>
          <ThemeToggle />
        </div>
        {user ? (
          <>
            <p className="font-sans text-base font-bold">{user.name}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">{user.role}</p>
            <Button variant="ghost" onClick={logout} className="mt-4">
              Cerrar sesión
            </Button>
          </>
        ) : (
          <>
            <p className="font-sans text-sm text-stone-600 dark:text-stone-400">Sesión de invitado.</p>
            <Link href="/">
              <Button className="mt-4">Elegir usuario</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
