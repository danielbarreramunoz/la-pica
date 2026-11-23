"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCustomerStore } from "@/stores/useCustomerStore";

function PinIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 14.25l6-6m-6 0l6 6m-9.75 2.25h9.375c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H5.625c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125v-1.125c0-.621.504-1.125 1.125-1.125h1.125v-1.125c0-.621.504-1.125 1.125-1.125H9V16.5z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function Tab({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className="flex flex-col items-center justify-center gap-1 py-1">
      <span
        className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
          active
            ? "bg-[#E65100] text-white shadow-sm"
            : "text-stone-500 hover:bg-[#f1e6d6] dark:text-stone-400 dark:hover:bg-stone-800"
        }`}
      >
        {icon}
      </span>
      <span className={`font-sans text-[11px] font-bold ${active ? "text-[#E65100] dark:text-[#ffb27a]" : "text-stone-500 dark:text-stone-400"}`}>
        {label}
      </span>
    </Link>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const cart = useCustomerStore((state) => state.cart);
  const hasCart = cart.length > 0;
  const orderHref = hasCart ? "/app/checkout" : "/app/pedidos";
  const inOrderArea = pathname.startsWith("/app/checkout") || pathname.startsWith("/app/pedidos") || pathname.startsWith("/app/restaurant");

  return (
    <nav
      aria-label="Menú cliente"
      className="fixed inset-x-0 bottom-0 z-[1100] border-t border-[#e7d5bb] bg-[#fffaf0]/97 shadow-[0_-8px_30px_-24px_rgba(62,32,16,0.7)] backdrop-blur dark:border-stone-700 dark:bg-stone-900/97"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid h-[4.4rem] max-w-5xl grid-cols-3">
        <Tab href="/app" label="Buscar" active={pathname === "/app"} icon={<PinIcon />} />
        <Tab href={orderHref} label={hasCart ? `Pedido · ${cart.reduce((sum, line) => sum + line.qty, 0)}` : "Mis pedidos"} active={inOrderArea} icon={<ReceiptIcon />} />
        <Tab href="/app/cuenta" label="Cuenta" active={pathname === "/app/cuenta"} icon={<UserIcon />} />
      </div>
    </nav>
  );
}
