"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrderStore } from "@/stores/useOrderStore";
import { NEXT_STATUS, orderService } from "@/services/order.service";
import { showToast } from "@/components/ui/toast";

function elapsed(created_at: string, now: number): string {
  if (!now) return "…";
  const mins = Math.max(0, Math.floor((now - new Date(created_at).getTime()) / 60000));
  return `${mins} min`;
}

const ACTION_LABEL: Record<string, string> = {
  PENDING: "Tomar · Cocinar",
  IN_PREPARATION: "Marcar lista",
  READY: "Entregar",
};

export default function KitchenPage() {
  const { orders, startRealtime } = useOrderStore();
  const [now, setNow] = useState(0);
  const known = useRef<Set<string>>(new Set());

  useEffect(() => {
    setNow(Date.now());
    const stop = startRealtime();
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      stop();
      clearInterval(t);
    };
  }, [startRealtime]);

  useEffect(() => {
    orders.forEach((o) => {
      if (!known.current.has(o.id)) {
        known.current.add(o.id);
        if (o.status === "PENDING") showToast.orderAlert(`Nueva comanda · Mesa ${o.table_number}`);
      }
    });
  }, [orders]);

  const active = orders.filter((o) => ["PENDING", "IN_PREPARATION", "READY"].includes(o.status));

  async function advance(id: string, status: string) {
    const next = NEXT_STATUS[status as keyof typeof NEXT_STATUS];
    if (!next) return;
    try {
      await orderService.updateOrderStatus(id, next);
      showToast.success(`Mesa actualizada → ${next}`);
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-6 font-sans">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-stone-400">
            Panel operativo · Tiempo real
          </p>
          <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-white">Cocina · KDS</h1>
        </div>
        <p className="rounded-full border border-stone-700 bg-stone-900 px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-stone-200">
          {active.length} órdenes activas
        </p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((o) => (
          <div key={o.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-md">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-2xl font-bold tabular-nums text-stone-900">M{o.table_number}</p>
              <Badge status={o.status} />
            </div>
            <p className="mt-1 font-mono text-sm font-medium tabular-nums text-stone-600">⏱ {elapsed(o.created_at, now)}</p>
            <div className="mt-2 space-y-1 border-t border-stone-100 pt-2">
              {o.items.map((it, i) => (
                <p key={i} className="font-sans text-base font-medium text-stone-900">
                  <span className="font-mono font-bold tabular-nums">{it.qty}x </span>
                  {it.dish_name}
                  {it.notes ? <span className="text-stone-600"> · {it.notes}</span> : null}
                </p>
              ))}
              {o.notes ? <p className="rounded-lg bg-amber-50 px-2 py-1 font-sans text-sm font-medium text-amber-800">Nota: {o.notes}</p> : null}
            </div>
            <Button
              variant={o.status === "READY" ? "secondary" : "primary"}
              onClick={() => advance(o.id, o.status)}
              size="lg"
              className="mt-4 w-full min-h-14 text-base"
            >
              {ACTION_LABEL[o.status] ?? "Avanzar"}
            </Button>
          </div>
        ))}
      </div>
      {active.length === 0 ? <p className="mt-8 font-sans text-base text-stone-300">Sin órdenes pendientes.</p> : null}
    </div>
  );
}
