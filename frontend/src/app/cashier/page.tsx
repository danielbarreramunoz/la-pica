"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useOrderStore } from "@/stores/useOrderStore";
import { orderService, type Order } from "@/services/order.service";
import { showToast } from "@/components/ui/toast";
import { PageHero } from "@/components/layout/page-hero";

export default function CashierPage() {
  const { orders, startRealtime } = useOrderStore();
  const [view, setView] = useState<"active" | "history">("active");
  const [tipChoice, setTipChoice] = useState("10");
  const [customTip, setCustomTip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");

  useEffect(() => startRealtime(), [startRealtime]);

  const byTable = useMemo(() => {
    const map = new Map<string, { key: string; table: number; list: Order[] }>();
    orders.filter((order) => order.status !== "PAID").forEach((order) => {
      const key = order.table_number > 0 ? `table-${order.table_number}` : `preorder-${order.id}`;
      const group = map.get(key) ?? { key, table: order.table_number, list: [] };
      group.list.push(order);
      map.set(key, group);
    });
    return [...map.values()].sort((a, b) => a.table - b.table || a.list[0].created_at.localeCompare(b.list[0].created_at));
  }, [orders]);
  const paidOrders = useMemo(
    () => orders.filter((order) => order.status === "PAID").sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [orders]
  );
  const totalCollected = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const totalTips = paidOrders.reduce((sum, order) => sum + (order.tip_amount ?? 0), 0);

  function getTip(subtotal: number) {
    if (tipChoice === "custom") return Math.max(0, Number(customTip) || 0);
    return Math.round(subtotal * Number(tipChoice) / 100);
  }

  async function closeTable(groupKey: string) {
    const group = byTable.find((item) => item.key === groupKey);
    if (!group) return;
    const { table, list } = group;
    const subtotal = list.reduce((sum, order) => sum + order.total, 0);
    const tip = getTip(subtotal);
    let allocatedTip = 0;
    try {
      for (const [index, order] of list.entries()) {
        const orderTip = index === list.length - 1
          ? tip - allocatedTip
          : subtotal ? Math.round(tip * order.total / subtotal) : 0;
        allocatedTip += orderTip;
        const payment = { tip_amount: orderTip, payment_method: paymentMethod };
        if (order.status === "SERVED") {
          await orderService.updateOrderStatus(order.id, "PAID", payment);
        } else {
          const chain = order.status === "PENDING"
            ? ["IN_PREPARATION", "READY", "SERVED", "PAID"] as const
            : order.status === "IN_PREPARATION"
              ? ["READY", "SERVED", "PAID"] as const
              : order.status === "READY"
                ? ["SERVED", "PAID"] as const
                : ["PAID"] as const;
          for (const status of chain) {
            try {
              await orderService.updateOrderStatus(order.id, status, status === "PAID" ? payment : undefined);
            } catch {
              break;
            }
          }
        }
      }
      showToast.success(`${table === 0 ? "Pre-pedido" : `Mesa ${table}`} pagado · propina $${tip.toLocaleString("es-CL")}`);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Error al registrar el pago");
    }
  }

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Caja · Cobros"
        title="Cobros e historial"
        description="Cierra cuentas por mesa o por puesto, agrega propina y revisa todo lo recaudado en el turno."
      >
        <span className="picada-chip">{byTable.length} cuentas por cobrar</span>
        <span className="picada-chip">{paidOrders.length} pagos registrados</span>
      </PageHero>

      <div className="inline-flex w-full gap-1 rounded-2xl border border-[#e7d5bb] bg-[#fffdf7] p-1 shadow-sm dark:border-stone-700 dark:bg-stone-900 sm:w-auto">
        <Button variant={view === "active" ? "primary" : "ghost"} onClick={() => setView("active")} className="flex-1 sm:flex-none">Por cobrar</Button>
        <Button variant={view === "history" ? "primary" : "ghost"} onClick={() => setView("history")} className="flex-1 sm:flex-none">Historial ({paidOrders.length})</Button>
      </div>

      {view === "active" ? (
        <>
          <section className="grid gap-3 picada-card p-4 sm:grid-cols-[1fr_1fr_1fr]">
            <div>
              <p className="picada-eyebrow mb-1.5">Propina sugerida</p>
              <Select value={tipChoice} onChange={(event) => setTipChoice(event.target.value)} aria-label="Porcentaje de propina">
                <option value="0">Sin propina · 0%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
                <option value="custom">Monto personalizado</option>
              </Select>
            </div>
            <div>
              <p className="picada-eyebrow mb-1.5">Forma de pago</p>
              <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} aria-label="Forma de pago">
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Transferencia</option>
              </Select>
            </div>
            {tipChoice === "custom" ? (
              <div>
                <p className="picada-eyebrow mb-1.5">Propina en pesos</p>
                <Input type="number" min="0" step="100" placeholder="$ monto" value={customTip} onChange={(event) => setCustomTip(event.target.value)} />
              </div>
            ) : (
              <div className="flex items-center rounded-xl bg-[#edf5ee] px-4 text-sm font-semibold text-green-900 dark:bg-green-950/40 dark:text-green-200">
                Se calcula sobre el consumo de cada cuenta.
              </div>
            )}
          </section>

          <div className="space-y-4">
            {byTable.map(({ key, table, list }) => {
              const subtotal = list.reduce((sum, order) => sum + order.total, 0);
              const tip = getTip(subtotal);
              return (
                <article key={key} className="picada-card overflow-hidden">
                  <div className="h-1.5 bg-[#2E7D32]" aria-hidden="true" />
                  <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-2xl tracking-tight">
                        {table > 0 ? `Mesa ${table}` : `Pre-pedido · ${list[0].customer_name ?? "Cliente"}`}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{list.length} {table > 0 ? "cuentas separadas" : "pedido"}</p>
                    </div>
                    <span className="rounded-full bg-[#fff3e6] px-3 py-1.5 font-mono text-sm font-black text-[#E65100] dark:bg-orange-950/50 dark:text-orange-200">
                      ${subtotal.toLocaleString("es-CL")}
                    </span>
                  </div>
                  <div className="mt-3 divide-y divide-dashed divide-[#e7d5bb] border-y border-dashed border-[#e7d5bb] dark:divide-stone-700 dark:border-stone-700">
                    {list.map((order) => (
                      <div key={order.id} className="py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold">
                            {table > 0
                              ? `Puesto ${order.seat_number ?? 1}${order.party_size ? ` de ${order.party_size}` : ""}`
                              : `Llegada ${order.eta ?? "—"}`}
                          </p>
                          <Badge status={order.status} />
                        </div>
                        {order.items.map((item, index) => (
                          <p key={`${order.id}-${index}`} className="mt-1 flex justify-between gap-3 text-sm text-stone-700 dark:text-stone-300">
                            <span>{item.qty}× {item.dish_name}</span>
                            <span className="font-mono">${(item.qty * item.unit_price).toLocaleString("es-CL")}</span>
                          </p>
                        ))}
                        <p className="mt-1 text-right font-mono text-sm font-bold">${order.total.toLocaleString("es-CL")}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="flex justify-between text-stone-600 dark:text-stone-400"><span>Consumo</span><span className="font-mono">${subtotal.toLocaleString("es-CL")}</span></p>
                    <p className="flex justify-between text-stone-600 dark:text-stone-400"><span>Propina</span><span className="font-mono">${tip.toLocaleString("es-CL")}</span></p>
                    <p className="flex justify-between border-t border-dashed border-[#e7d5bb] pt-2 font-extrabold dark:border-stone-700"><span>Total a cobrar</span><span className="font-mono text-[#2E7D32] dark:text-[#7cc47f]">${(subtotal + tip).toLocaleString("es-CL")}</span></p>
                  </div>
                  <Button variant="secondary" onClick={() => closeTable(key)} size="lg" className="mt-4 w-full">
                    Registrar pago · {paymentMethod}
                  </Button>
                  </div>
                </article>
              );
            })}
          </div>
          {byTable.length === 0 ? (
            <div className="picada-card picada-grid-lines p-8 text-center">
              <p className="text-4xl" aria-hidden="true">🧾</p>
              <h2 className="mt-2 text-xl font-extrabold">No hay cuentas pendientes</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Las nuevas comandas aparecerán aquí automáticamente.</p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="picada-card border-l-4 border-l-[#2E7D32] p-4">
              <p className="picada-eyebrow">Ventas registradas</p>
              <p className="mt-1 font-mono text-3xl font-black text-[#2E7D32] dark:text-[#7cc47f]">${totalCollected.toLocaleString("es-CL")}</p>
            </div>
            <div className="picada-card border-l-4 border-l-[#E65100] p-4">
              <p className="picada-eyebrow">Propinas</p>
              <p className="mt-1 font-mono text-3xl font-black text-[#E65100]">${totalTips.toLocaleString("es-CL")}</p>
            </div>
          </section>
          {paidOrders.length ? (
            <section className="picada-card overflow-hidden">
              {paidOrders.map((order) => (
                <article key={order.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#e7d5bb] p-4 last:border-0 dark:border-stone-700">
                  <div>
                    <p className="font-bold">{order.table_number > 0 ? `Mesa ${order.table_number} · Puesto ${order.seat_number ?? 1}` : `Pre-pedido · ${order.customer_name ?? "Cliente"}`}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {new Date(order.created_at).toLocaleString("es-CL")} · {order.payment_method ?? "Pago"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{order.items.map((item) => `${item.qty}× ${item.dish_name}`).join(" · ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-black">${(order.total + (order.tip_amount ?? 0)).toLocaleString("es-CL")}</p>
                    <p className="text-xs text-green-700 dark:text-green-300">Propina ${(order.tip_amount ?? 0).toLocaleString("es-CL")}</p>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <div className="picada-card p-8 text-center">
              <p className="text-4xl" aria-hidden="true">🗒️</p>
              <h2 className="mt-2 text-xl font-extrabold">Historial vacío</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Todavía no hay pagos registrados en este turno.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
