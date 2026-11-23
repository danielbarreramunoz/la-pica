"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSessionStore, type Role } from "@/stores/useSessionStore";

const employeeRoles: Role[] = ["mesero", "cocina", "caja", "admin"];

const roleLabel: Record<Role, string> = {
  cliente: "Cliente",
  mesero: "Garzón",
  cocina: "Cocina",
  caja: "Caja",
  admin: "Administración",
};

const linksByRole: Record<Role, { href: string; label: string }[]> = {
  cliente: [{ href: "/app", label: "Buscar picadas" }],
  mesero: [
    { href: "/waiter", label: "Mesas" },
    { href: "/waiter/menu", label: "Carta" },
    { href: "/inventory", label: "Inventario" },
  ],
  cocina: [
    { href: "/kitchen", label: "Comandas" },
    { href: "/inventory", label: "Inventario" },
  ],
  caja: [
    { href: "/cashier", label: "Caja" },
    { href: "/inventory", label: "Inventario" },
  ],
  admin: [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/dishes", label: "Platos" },
    { href: "/admin/menu-builder", label: "Menú del día" },
    { href: "/inventory", label: "Inventario" },
    { href: "/waiter", label: "Garzón" },
    { href: "/kitchen", label: "Cocina" },
    { href: "/cashier", label: "Caja" },
  ],
};

export function EmployeeShell({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: Role[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);
  const visibleLinks = user && employeeRoles.includes(user.role) && (allow.includes(user.role) || user.role === "admin")
    ? linksByRole[user.role]
    : [];

  return (
    <div className="picada-paper min-h-screen font-sans text-stone-900 dark:text-stone-100">
      <header className="sticky top-0 z-40 border-b border-[#4b2416] bg-[#2b160d]/97 text-[#fff7ea] shadow-[0_10px_30px_-20px_rgba(34,15,6,0.9)] backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 sm:px-5">
          <div className="flex items-center gap-3 py-2.5">
            <Link
              href={user?.home ?? "/"}
              aria-label="La Picá · Inicio"
              className="shrink-0 rounded-xl border border-[#f4d7b8]/20 bg-[#fffaf0] px-2 py-1.5 shadow-sm"
            >
              <Logo size={30} priority />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">{user?.name ?? "Sin sesión"}</p>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#f3b62c]">
                {user ? roleLabel[user.role] : "Invitado"} · Turno activo
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.replace("/");
                }}
                aria-label="Cerrar sesión"
                className="border border-[#f4d7b8]/25 text-[#fff7ea] shadow-none hover:border-[#f3b62c]/70 hover:bg-[#fff7ea]/15 hover:text-[#fff7ea] dark:text-[#fff7ea] dark:hover:bg-[#fff7ea]/15"
              >
                Salir
              </Button>
            </div>
          </div>
          <nav aria-label="Navegación de empleado" className="flex gap-1 overflow-x-auto pb-2">
            {visibleLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#f3b62c] text-[#2b160d] shadow-sm"
                      : "text-[#f8e7d4]/80 hover:bg-[#fff7ea]/10 hover:text-[#fff7ea]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-5 sm:py-7">{children}</main>
    </div>
  );
}
