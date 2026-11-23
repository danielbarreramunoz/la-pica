"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrderStore } from "@/stores/useOrderStore";
import { NEXT_STATUS, orderService } from "@/services/order.service";
import { showToast } from "@/components/ui/toast";
import { PageHero } from "@/components/layout/page-hero";

function minutesSince(createdAt: string, now: number): number {
  if (!now) return 0;
  return Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60000));
}

const ACTION_LABEL: Record<string, string> = {
  PENDING: "Tomar y cocinar",
  IN_PREPARATION: "Marcar lista",
  READY: "Entregar a mesa",
};

const statusStripe: Record<string, string> = {
  PENDING: "bg-[#f3b62c]",
  IN_PREPARATION: "bg-sky-500",
  READY: "bg-[#2E7D32]",
};

export default function KitchenPage() {
  const { orders, startRealtime } = useOrderStore();
  const [now, setNow] = useState(() => Date.now());
  const known = useRef<Set<string>>(new Set());
  const didLoad = useRef(false);

  useEffect(() => {
    const stop = startRealtime();
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      stop();
      clearInterval(timer);
    };
  }, [startRealtime]);

  useEffect(() => {
    if (!didLoad.current && orders.length) {
      orders.forEach((order) => known.current.add(order.id));
      didLoad.current = true;
      return;
    }
    orders.forEach((order) => {
      if (!known.current.has(order.id)) {
        known.current.add(order.id);
        if (order.status === "PENDING") {
          showToast.orderAlert(order.table_number > 0
            ? `Nueva comanda · Mesa ${order.table_number}, puesto ${order.seat_number ?? 1}`
            : `Nuevo pre-pedido · ${order.customer_name ?? "Cliente"}`);
        }
      }
    });
  }, [orders]);

  const active = orders.filter((order) => ["PENDING", "IN_PREPARATION", "READY"].includes(order.status));
  const counts = {
    PENDING: active.filter((order) => order.status === "PENDING").length,
    IN_PREPARATION: active.filter((order) => order.status === "IN_PREPARATION").length,
    READY: active.filter((order) => order.status === "READY").length,
  };

  async function advance(id: string, status: string) {
    const next = NEXT_STATUS[status as keyof typeof NEXT_STATUS];
    if (!next) return;
    try {
      await orderService.updateOrderStatus(id, next);
      showToast.success(`Comanda actualizada: ${next.replaceAll("_", " ").toLowerCase()}`);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "No se pudo actualizar la comanda");
    }
  }

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Cocina · Tiempo real"
        title="Comandas en cocina"
        description="Las comandas entran solas. Toma la orden, marca cuando esté lista y entrégala a la mesa."
      >
        <span className="picada-chip">{counts.PENDING} por tomar</span>
        <span className="picada-chip">{counts.IN_PREPARATION} en cocina</span>
        <span className="picada-chip">{counts.READY} listas</span>
      </PageHero>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((order) => {
          const minutes = minutesSince(order.created_at, now);
          const late = minutes >= 20 && order.status !== "READY";
          return (
            <article key={order.id} className="picada-card overflow-hidden">
              <div className={`h-1.5 ${statusStripe[order.status] ?? "bg-stone-300"}`} aria-hidden="true" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                      {order.table_number > 0 ? "Mesa" : "Pre-pedido"}
                    </p>
                    <p className="font-display text-3xl tracking-tight text-stone-900 dark:text-stone-50">
                      {order.table_number > 0
                        ? `${order.table_number} · P${order.seat_number ?? 1}`
                        : "Express"}
                    </p>
                  </div>
                  <Badge status={order.status} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
                  <span className={`font-mono tabular-nums ${late ? "text-red-700 dark:text-red-300" : "text-stone-500 dark:text-stone-400"}`}>
                    ⏱ {minutes} min
                  </span>
                  {late ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800 dark:bg-red-950 dark:text-red-200">Atrasada</span> : null}
                  {order.party_size ? <span className="text-stone-500 dark:text-stone-400">Mesa de {order.party_size}</span> : null}
                </div>
                <div className="mt-3 space-y-1.5 border-t border-dashed border-[#e7d5bb] pt-3 dark:border-stone-700">
                  {order.items.map((item, index) => (
                    <p key={index} className="text-base font-semibold text-stone-900 dark:text-stone-100">
                      <span className="font-mono font-black text-[#E65100]">{item.qty}× </span>
                      {item.dish_name}
                      {item.notes ? <span className="block pl-6 text-sm font-normal text-stone-500 dark:text-stone-400">{item.notes}</span> : null}
                    </p>
                  ))}
                  {order.notes ? <p className="rounded-lg bg-amber-50 px-2 py-1 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">Nota: {order.notes}</p> : null}
                  {order.customer_name ? (
                    <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                      {order.customer_name} · llegada {order.eta ?? "—"}
                    </p>
                  ) : null}
                </div>
                <Button
                  variant={order.status === "READY" ? "secondary" : "primary"}
                  onClick={() => advance(order.id, order.status)}
                  size="lg"
                  className="mt-4 w-full text-base"
                >
                  {ACTION_LABEL[order.status] ?? "Avanzar"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {active.length === 0 ? (
        <div className="picada-card grid-lines p-10 text-center">
          <p className="text-4xl" aria-hidden="true">🍳</p>
          <h2 className="mt-2 text-xl font-extrabold">Cocina al día</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">No hay comandas pendientes. Las nuevas aparecerán aquí.</p>
        </div>
      ) : null}
    </div>
  );
}
