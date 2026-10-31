"use client";

import { useEffect, useMemo, useState } from "react";import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrderStore } from "@/stores/useOrderStore";
import { menuService, type Dish } from "@/services/menu.service";
import { orderService, type OrderItemInput } from "@/services/order.service";
import { showToast } from "@/components/ui/toast";

const TABLES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function WaiterPage() {
  const { orders, startRealtime } = useOrderStore();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [table, setTable] = useState<number | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const stop = startRealtime();
    menuService.listDishes().then((l) => setDishes(l.filter((d) => d.is_active)));
    return stop;
  }, [startRealtime]);

  const occupied = useMemo(() => new Set(orders.filter((o) => o.status !== "PAID").map((o) => o.table_number)), [orders]);
  const menuToday = useMemo(() => dishes, [dishes]);

  function changeQty(id: string, delta: number) {
    setCart((c) => {
      const next = Math.max(0, (c[id] ?? 0) + delta);
      const copy = { ...c };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  }

  async function handleSend() {
    if (table === null) return;
    const items: OrderItemInput[] = Object.entries(cart).map(([dish_id, qty]) => {
      const d = dishes.find((x) => x.id === dish_id) as Dish;
      return { dish_id, dish_name: d.name, qty, unit_price: d.base_price };
    });
    if (items.length === 0) {
      showToast.error("Agrega al menos un plato");
      return;
    }
    try {
      await orderService.createOrder(table, items, notes.trim() || undefined);
      showToast.success("Comanda enviada a Cocina");
      setCart({});
      setNotes("");
      setTable(null);
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Error al enviar");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
      <h1 className="font-sans text-2xl font-bold">Mesero · Mesas</h1>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {TABLES.map((t) => {
          const busy = occupied.has(t);
          return (
            <Button
              key={t}
              variant={busy ? "secondary" : "primary"}
              onClick={() => {
                setTable(t);
                setCart({});
                setNotes("");
              }}
              className="h-20 flex-col"
            >
              <span className="font-mono text-xl font-bold">M{t}</span>
              <span className="font-sans text-xs">{busy ? "Ocupada" : "Libre"}</span>
            </Button>
          );
        })}
      </div>

      <Modal open={table !== null} onClose={() => setTable(null)} title={table ? `Mesa ${table} · Menú de hoy` : "Menú"}>
        <div className="space-y-2">
          {menuToday.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2">
              <div>
                <p className="font-sans text-sm font-semibold">{d.name}</p>
                <p className="font-mono text-sm text-stone-600">${d.base_price.toLocaleString("es-CL")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => changeQty(d.id, -1)}>
                  −
                </Button>
                <span className="w-6 text-center font-mono text-sm font-bold">{cart[d.id] ?? 0}</span>
                <Button size="sm" variant="ghost" onClick={() => changeQty(d.id, 1)}>
                  +
                </Button>
              </div>
            </div>
          ))}
          <Input placeholder="Observaciones: sin sal, poca papa…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button onClick={handleSend} className="w-full bg-[#E65100]">
            Enviar a Cocina
          </Button>
          {orders.filter((o) => o.table_number === table && o.status !== "PAID").length > 0 ? (
            <div className="flex gap-2">
              <Badge status="PENDING" />
              <span className="font-sans text-xs text-stone-500">Mesa con comanda activa</span>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
