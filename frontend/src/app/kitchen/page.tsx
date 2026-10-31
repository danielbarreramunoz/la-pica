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
    <div className="min-h-screen bg-stone-900 px-4 py-6">
      <h1 className="font-sans text-3xl font-bold text-white">Cocina · KDS</h1>
      <p className="font-mono text-sm text-stone-300">{active.length} órdenes activas</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {active.map((o) => (
          <div key={o.id} className="rounded-xl bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="font-mono text-2xl font-bold">M{o.table_number}</p>
              <Badge status={o.status} />
            </div>
            <p className="font-mono text-sm text-stone-600">⏱ {elapsed(o.created_at, now)}</p>
            <div className="mt-2 space-y-1">
              {o.items.map((it, i) => (
                <p key={i} className="font-sans text-base font-medium">
                  <span className="font-mono font-bold">{it.qty}x </span>
                  {it.dish_name}
                  {it.notes ? <span className="text-stone-500"> · {it.notes}</span> : null}
                </p>
              ))}
              {o.notes ? <p className="font-sans text-sm text-amber-700">Nota: {o.notes}</p> : null}
            </div>
            <Button
              variant={o.status === "READY" ? "secondary" : "primary"}
              onClick={() => advance(o.id, o.status)}
              className="mt-4 w-full h-12 text-base"
            >
              {ACTION_LABEL[o.status] ?? "Avanzar"}
            </Button>
          </div>
        ))}
      </div>
      {active.length === 0 ? <p className="mt-8 font-sans text-white">Sin órdenes pendientes.</p> : null}
    </div>
  );
}
