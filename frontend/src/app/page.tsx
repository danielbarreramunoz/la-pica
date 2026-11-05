"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MOCK_USERS, useSessionStore, type Role } from "@/stores/useSessionStore";
import { showToast } from "@/components/ui/toast";

const links: { href: string; label: string; desc: string; primary: boolean; roles: Role[] }[] = [
  { href: "/app", label: "Buscar picadas", desc: "Mapa, menú del día y pre-pedido", primary: true, roles: ["cliente", "mesero", "cocina", "caja", "admin"] },
  { href: "/waiter", label: "Mesero", desc: "Mesas 1-12 y comandas", primary: true, roles: ["mesero", "admin"] },
  { href: "/kitchen", label: "Cocina KDS", desc: "Pedidos en tiempo real", primary: false, roles: ["cocina", "admin"] },
  { href: "/cashier", label: "Caja", desc: "Cuentas, propina y cierre", primary: false, roles: ["caja", "admin"] },
  { href: "/admin", label: "Admin", desc: "Platos y menú del día", primary: false, roles: ["admin"] },
];

export default function Home() {
  const user = useSessionStore((s) => s.user);
  const login = useSessionStore((s) => s.login);
  const logout = useSessionStore((s) => s.logout);
  const [id, setId] = useState(MOCK_USERS[0].id);
  const visible = user ? links.filter((l) => l.roles.includes(user.role)) : [];
  const router = useRouter();

  // Un solo destino (ej. cliente → /app): entrar directo, una sola vez
  const single = visible.length === 1 ? visible[0].href : null;
  const didRedirect = useRef(false);
  useEffect(() => {
    if (!user) {
      didRedirect.current = false;
      return;
    }
    if (single && !didRedirect.current) {
      didRedirect.current = true;
      router.replace(single);
    }
  }, [user, single, router]);

  const submit = () => {
    login(id);
    const u = MOCK_USERS.find((x) => x.id === id)!;
    showToast.success(`Sesión: ${u.name}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-stone-50 font-sans text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16">
        <Logo size={120} priority showText={false} className="justify-center" />
        <p className="mt-2 text-center text-sm font-medium text-stone-600">
          {user ? `Sesión: ${user.name} (${user.role})` : "Elige usuario para ver su menú"}
        </p>

        {!user ? (
          <div className="mt-4 flex w-full max-w-sm flex-col gap-2">
            <Select value={id} onChange={(e) => setId(e.target.value)} aria-label="Usuario">
              {MOCK_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role}
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="primary" onClick={submit} className="flex-1">
                Entrar
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button variant="ghost" onClick={logout}>
              Salir
            </Button>
          </div>
        )}

        <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
          {visible.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
                l.primary
                  ? "border-[#E65100] bg-[#E65100] text-white hover:bg-[#BF4300]"
                  : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-600"
              }`}
            >
              <span className="text-base font-bold">{l.label}</span>
              <span className={`block text-xs ${l.primary ? "text-white/85" : "text-stone-600 dark:text-stone-400"}`}>
                {l.desc}
              </span>
              <span className={`mt-2 block font-mono text-xs tabular-nums ${l.primary ? "text-white" : "text-[#2E7D32] dark:text-[#7cc47f]"}`}>
                {l.href}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
