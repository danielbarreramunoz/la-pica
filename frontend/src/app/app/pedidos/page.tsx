"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCustomerStore } from "@/stores/useCustomerStore";

const statusLabels: Record<string, string> = {
  PENDING: "Recibido",
  IN_PREPARATION: "En preparación",
  READY: "Listo",
  SERVED: "Entregado",
  PAID: "Pagado",
};

export default function CustomerOrdersPage() {
  const orders = useCustomerStore((state) => state.orderHistory);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 pb-28">
      <div className="picada-hero rounded-3xl p-6">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#f3b62c]">Guardados en tu dispositivo</p>
        <h1 className="mt-1.5 text-4xl text-[#fff8eb]">Mis pedidos</h1>
        <p className="mt-2 text-sm text-[#ffe9ce]/85">Revisa tus pre-pedidos y sus detalles.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="picada-chip">{orders.length} pedidos</span>
          <span className="picada-chip">{orders.filter((order) => order.status !== "PAID").length} en curso</span>
        </div>
      </div>
      {orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="picada-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-stone-500 dark:text-stone-400">
                    {new Date(order.createdAt).toLocaleString("es-CL")}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black text-[#2E7D32] dark:text-[#7cc47f]">${order.total.toLocaleString("es-CL")}</p>
                </div>
                <span className="rounded-full border border-[#e7d5bb] bg-[#fff3e6] px-3 py-1.5 text-xs font-bold text-[#9a3e1a] dark:border-stone-700 dark:bg-orange-950/50 dark:text-orange-200">
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <div className="mt-3 divide-y divide-dashed divide-[#e7d5bb] border-y border-dashed border-[#e7d5bb] py-1 dark:divide-stone-700 dark:border-stone-700">
                {order.items.map((item, index) => (
                  <p key={`${item.dish_id}-${index}`} className="flex justify-between gap-3 py-2 text-sm">
                    <span><b className="font-mono">{item.qty}×</b> {item.dish_name}{item.notes ? ` · ${item.notes}` : ""}</span>
                    <span className="font-mono">${(item.qty * item.unit_price).toLocaleString("es-CL")}</span>
                  </p>
                ))}
              </div>
              <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
                A nombre de {order.customerName} · llegada estimada {order.eta}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="picada-card p-8 text-center">
          <p className="text-4xl" aria-hidden="true">🧾</p>
          <h2 className="mt-2 text-lg font-extrabold">Todavía no tienes pedidos</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Busca una picada y arma tu primer pre-pedido.</p>
          <Link href="/app" className="mt-4 inline-flex">
            <Button>Buscar picadas</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
