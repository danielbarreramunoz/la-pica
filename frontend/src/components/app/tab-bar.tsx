"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSessionStore } from "@/stores/useSessionStore";

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 14.25l6-6m-6 0l6 6m-9.75 2.25h9.375c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H5.625c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125v-1.125c0-.621.504-1.125 1.125-1.125h1.125v-1.125c0-.621.504-1.125 1.125-1.125H9V16.5z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

const tabClass = (on: boolean) =>
  `flex flex-col items-center justify-center gap-1 font-sans text-xs font-semibold ${on ? "text-[#E65100]" : "text-stone-500 dark:text-stone-400"}`;

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Menú cliente"
        className="fixed inset-x-0 bottom-0 z-[1100] border-t border-stone-200 bg-white/95 backdrop-blur dark:border-stone-700 dark:bg-stone-900/95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-3">
          <Link href="/app" aria-current={pathname === "/app" ? "page" : undefined} className={tabClass(pathname === "/app")}>
            <PinIcon />
            Buscar
          </Link>
          <Link
            href="/app/checkout"
            aria-current={pathname.startsWith("/app/checkout") || pathname.startsWith("/app/restaurant") ? "page" : undefined}
            className={tabClass(pathname.startsWith("/app/checkout") || pathname.startsWith("/app/restaurant"))}
          >
            <ReceiptIcon />
            Pedido
          </Link>
          <button type="button" onClick={() => setAccountOpen(true)} className={tabClass(accountOpen)} aria-haspopup="dialog">
            <UserIcon />
            Cuenta
          </button>
        </div>
      </nav>

      <BottomSheet open={accountOpen} onClose={() => setAccountOpen(false)} title="Mi cuenta">
        <div className="space-y-4 pb-2">
          {user ? (
            <div>
              <p className="font-sans text-base font-bold text-stone-900 dark:text-stone-100">{user.name}</p>
              <p className="font-mono text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">{user.role}</p>
            </div>
          ) : (
            <p className="font-sans text-sm text-stone-600 dark:text-stone-400">Sesión de invitado.</p>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="font-sans text-sm font-semibold">Apariencia</span>
            <ThemeToggle />
          </div>
          {user ? (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                logout();
                setAccountOpen(false);
                router.replace("/");
              }}
            >
              Cerrar sesión
            </Button>
          ) : (
            <Button className="w-full" onClick={() => router.replace("/")}>
              Elegir usuario
            </Button>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
