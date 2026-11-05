"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useOrderStore } from "@/stores/useOrderStore";
import { orderService } from "@/services/order.service";
import { showToast } from "@/components/ui/toast";

export default function CashierPage() {
  const { orders, startRealtime } = useOrderStore();
  const [tipOn, setTipOn] = useState(true);

  useEffect(() => {
    const stop = startRealtime();
    return stop;
  }, [startRealtime]);

  const byTable = useMemo(() => {
    const map = new Map<number, typeof orders>();
    orders
      .filter((o) => o.status !== "PAID")
      .forEach((o) => {
        const list = map.get(o.table_number) ?? [];
        list.push(o);
        map.set(o.table_number, list);
      });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [orders]);

  async function closeTable(table: number) {
    try {
      const list = byTable.find(([t]) => t === table)?.[1] ?? [];
      for (const o of list) {
        if (o.status === "SERVED") await orderService.updateOrderStatus(o.id, "PAID");
        else if (o.status === "READY") {
          await orderService.updateOrderStatus(o.id, "SERVED");
          await orderService.updateOrderStatus(o.id, "PAID");
        } else if (o.status !== "PAID") {
          // Avance lineal forzado PENDING->…->PAID para caja
          const chain = ["IN_PREPARATION", "READY", "SERVED", "PAID"] as const;
          for (const s of chain) {
            try {
              await orderService.updateOrderStatus(o.id, s);
            } catch {
              break;
            }
          }
        }
      }
      showToast.success(`Mesa ${table} pagada y liberada`);
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Error al cerrar");
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
      <div className="flex items-end justify-between gap-3 border-b border-stone-200 pb-4 dark:border-stone-700">
        <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#2E7D32] dark:text-[#7cc47f]">
          Panel operativo · Cobro
        </p>
        <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight">Caja · Cierre de mesa</h1>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800">
        <span className="font-sans text-sm font-medium text-stone-800 dark:text-stone-200">Propina 10%</span>
        <Switch checked={tipOn} onChange={setTipOn} label="Propina" />
      </div>
      {byTable.map(([table, list]) => {
        const subtotal = list.reduce((s, o) => s + o.total, 0);
        const tip = tipOn ? Math.round(subtotal * 0.1) : 0;
        const total = subtotal + tip;
        return (
          <div key={table} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-xl font-bold tabular-nums text-stone-900 dark:text-stone-100">Mesa {table}</p>
              <div className="flex gap-2">
                {list.map((o) => (
                  <Badge key={o.id} status={o.status} />
                ))}
              </div>
            </div>
            <div className="mt-2 space-y-1 border-t border-stone-100 pt-2 dark:border-stone-700">
              {list.flatMap((o) =>
                o.items.map((it, i) => (
                  <p key={`${o.id}-${i}`} className="flex justify-between gap-3 font-sans text-sm text-stone-800 dark:text-stone-200">
                    <span>
                      {it.qty}x {it.dish_name}
                    </span>
                    <span className="font-mono font-semibold tabular-nums">${(it.qty * it.unit_price).toLocaleString("es-CL")}</span>
                  </p>
                ))
              )}
            </div>
            <p className="mt-2 flex justify-between font-sans text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>Subtotal</span>
              <span className="font-mono font-semibold tabular-nums">${subtotal.toLocaleString("es-CL")}</span>
            </p>
            <p className="flex justify-between font-sans text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>Propina 10%</span>
              <span className="font-mono font-semibold tabular-nums">${tip.toLocaleString("es-CL")}</span>
            </p>
            <p className="mt-1 flex justify-between border-t border-stone-100 pt-2 font-sans text-base font-bold text-stone-900 dark:border-stone-700 dark:text-stone-100">
              <span>Total</span>
              <span className="font-mono tabular-nums text-[#2E7D32] dark:text-[#7cc47f]">${total.toLocaleString("es-CL")}</span>
            </p>
            <Button variant="secondary" onClick={() => closeTable(table)} size="lg" className="mt-4 w-full text-base">
              Registrar Pago & Liberar Mesa
            </Button>
          </div>
        );
      })}
      {byTable.length === 0 ? <p className="rounded-xl border border-stone-200 bg-white p-4 font-sans text-sm text-stone-600 shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">Sin consumo activo.</p> : null}
      </div>
    </div>
  );
}
