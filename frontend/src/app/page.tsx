import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const links = [
  { href: "/app", label: "Buscar picadas", desc: "Mapa, menú del día y pre-pedido", primary: true },
  { href: "/waiter", label: "Mesero", desc: "Mesas 1-12 y comandas", primary: true },
  { href: "/kitchen", label: "Cocina KDS", desc: "Pedidos en tiempo real", primary: false },
  { href: "/cashier", label: "Caja", desc: "Cuentas, propina y cierre", primary: false },
  { href: "/admin", label: "Admin", desc: "Platos y menú del día", primary: false },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-stone-50 font-sans text-stone-900">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16">
        <Logo size={72} priority className="flex-col gap-3 text-center" />
        <h1 className="mt-4 text-4xl font-bold tracking-tight">La Picá</h1>
        <p className="mt-2 text-center text-sm font-medium text-stone-600">
          POS + Menú del Día + comandas en tiempo real
        </p>
        <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
                l.primary
                  ? "border-[#E65100] bg-[#E65100] text-white hover:bg-[#BF4300]"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <span className="text-base font-bold">{l.label}</span>
              <span className={`block text-xs ${l.primary ? "text-white/85" : "text-stone-600"}`}>
                {l.desc}
              </span>
              <span className={`mt-2 block font-mono text-xs tabular-nums ${l.primary ? "text-white" : "text-[#2E7D32]"}`}>
                {l.href}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
