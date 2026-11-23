"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { showToast } from "@/components/ui/toast";

export default function CuentaPage() {
  const customerName = useCustomerStore((state) => state.customerName);
  const phone = useCustomerStore((state) => state.phone);
  const eta = useCustomerStore((state) => state.eta);
  const setCustomer = useCustomerStore((state) => state.setCustomer);
  const orderHistory = useCustomerStore((state) => state.orderHistory);
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);
  const router = useRouter();
  const [name, setName] = useState(customerName);
  const [contactPhone, setContactPhone] = useState(phone);
  const recent = orderHistory.slice(0, 2);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setName(customerName);
      setContactPhone(phone);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [customerName, phone]);

  function saveProfile() {
    setCustomer(name.trim(), contactPhone.trim(), eta);
    showToast.success("Datos guardados en este dispositivo");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 pb-28">
      <div className="rounded-3xl bg-[#7a2e16] p-6 text-white shadow-lg shadow-orange-950/15">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Tu espacio</p>
        <h1 className="mt-1 text-3xl font-black">Mi cuenta</h1>
        <p className="mt-2 max-w-xl text-sm text-orange-50/85">
          Tus datos y pedidos se guardan solo en este dispositivo por ahora.
        </p>
      </div>

      <section className="picada-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Mis datos</h2>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
              {user?.role === "cliente" ? `Sesión de prueba: ${user.name}` : "Invitado"}
            </p>
          </div>
          <span className="rounded-full bg-[#fff3e6] px-3 py-1 font-mono text-xs font-bold text-[#9a3e1a] dark:bg-orange-950/50 dark:text-orange-200">
            {user ? "Sesión de prueba" : "Invitado"}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input aria-label="Nombre" placeholder="Tu nombre" value={name} onChange={(event) => setName(event.target.value)} />
          <Input aria-label="Teléfono" placeholder="Teléfono de contacto" inputMode="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
        </div>
        <Button variant="secondary" onClick={saveProfile} className="mt-3 w-full sm:w-auto">
          Guardar mis datos
        </Button>
        <p className="mt-3 text-xs leading-5 text-stone-500 dark:text-stone-400">
          No guardamos datos de pago. Cuando se habilite el inicio de sesión, podremos asociar tu historial a tu cuenta.
        </p>
      </section>

      <section className="picada-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Mis pedidos</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">{orderHistory.length} pedidos en este dispositivo</p>
          </div>
          <Link href="/app/pedidos" className="text-sm font-bold text-[#E65100] hover:underline">Ver historial</Link>
        </div>
        {recent.length ? (
          <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {recent.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-bold">{order.items.length} productos · ${order.total.toLocaleString("es-CL")}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{new Date(order.createdAt).toLocaleString("es-CL")}</p>
                </div>
                <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800 dark:bg-orange-950/50 dark:text-orange-200">
                  {order.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-stone-50 p-4 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            Cuando hagas un pre-pedido, aparecerá aquí.
          </p>
        )}
      </section>

      <section className="flex items-center justify-between picada-card p-5">
        <div>
          <h2 className="font-extrabold">Apariencia</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">Elige tema claro u oscuro</p>
        </div>
        <ThemeToggle />
      </section>

      <section className="picada-card p-5">
        <h2 className="font-extrabold">Sesión</h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {user ? `Sesión de prueba: ${user.name} · ${user.role}` : "Estás como invitado en este dispositivo."}
        </p>
        {user ? (
          <Button
            variant="secondary"
            className="mt-3 w-full sm:w-auto"
            onClick={() => {
              logout();
              showToast.success("Sesión cerrada");
              router.replace("/");
            }}
          >
            Cerrar sesión
          </Button>
        ) : (
          <Link href="/" className="mt-3 inline-flex">
            <Button variant="secondary">Elegir perfil de prueba</Button>
          </Link>
        )}
      </section>
    </div>
  );
}
