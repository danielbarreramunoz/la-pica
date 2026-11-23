"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useOrderStore } from "@/stores/useOrderStore";
import { menuService, type Dish, type DishCategory } from "@/services/menu.service";
import { inventoryService, type InventoryItem } from "@/services/inventory.service";
import { orderService, type OrderItemInput } from "@/services/order.service";
import { showToast } from "@/components/ui/toast";
import { PageHero } from "@/components/layout/page-hero";

const TABLES = Array.from({ length: 12 }, (_, index) => index + 1);
const CATEGORIES: { id: string; label: string; category?: DishCategory }[] = [
  { id: "ALL", label: "Todo" },
  { id: "DAILY", label: "Menú de hoy" },
  { id: "Entrada", label: "Entradas", category: "Entrada" },
  { id: "Fondo", label: "Fondos", category: "Fondo" },
  { id: "Trago", label: "Tragos", category: "Trago" },
  { id: "Bebestible", label: "Bebestibles", category: "Bebestible" },
  { id: "Postre", label: "Postres", category: "Postre" },
];
export default function WaiterPage() {
  const { orders, startRealtime } = useOrderStore();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [todayDishIds, setTodayDishIds] = useState<string[]>([]);
  const [table, setTable] = useState<number | null>(null);
  const [seatCount, setSeatCount] = useState(2);
  const [seatCounts, setSeatCounts] = useState<Record<number, number>>({});
  const [seat, setSeat] = useState(1);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");

  useEffect(() => {
    const stop = startRealtime();
    menuService.listDishes().then((menu) => setDishes(menu.filter((dish) => dish.is_active)))
      .catch(() => showToast.error("No se pudo cargar el catálogo"));
    menuService.getDailyMenu().then((menu) => setTodayDishIds(menu.items.map((item) => item.dish_id)))
      .catch(() => undefined);
    inventoryService.listItems().then(setInventory)
      .catch(() => showToast.error("Inventario no disponible; confirma que esté aplicada la migración 003"));
    return stop;
  }, [startRealtime]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.table_number > 0 && order.status !== "PAID"),
    [orders]
  );
  const occupiedSeats = useMemo(
    () => new Set(activeOrders.map((order) => `${order.table_number}-${order.seat_number ?? 1}`)),
    [activeOrders]
  );
  const filteredDishes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return dishes.filter((dish) => {
      const matchesCategory = category === "ALL"
        || (category === "DAILY" ? todayDishIds.includes(dish.id) : dish.category === category);
      const matchesQuery = !normalizedQuery || `${dish.name} ${dish.description}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, dishes, query, todayDishIds]);

  function selectTable(tableNumber: number) {
    const recordedPartySize = activeOrders.find((order) => order.table_number === tableNumber)?.party_size;
    const count = seatCounts[tableNumber] ?? recordedPartySize ?? 2;
    setTable(tableNumber);
    setSeatCount(count);
    setSeat(1);
    setCart({});
    setNotes("");
    setQuery("");
    setCategory("ALL");
  }

  function changeSeatCount(value: number) {
    const safeCount = Math.max(1, Math.min(20, value));
    setSeatCount(safeCount);
    setSeat((current) => Math.min(current, safeCount));
    if (table !== null) {
      const updated = { ...seatCounts, [table]: safeCount };
      setSeatCounts(updated);
    }
  }

  function changeQty(dish: Dish, delta: number) {
    setCart((current) => {
      const next = Math.max(0, (current[dish.id] ?? 0) + delta);
      const tracked = inventory.find((item) => item.kind === "UNIT" && item.dish_id === dish.id);
      if (delta > 0 && tracked && next > tracked.quantity) {
        showToast.error(`Stock insuficiente de ${dish.name}`);
        return current;
      }
      const copy = { ...current };
      if (next === 0) delete copy[dish.id];
      else copy[dish.id] = next;
      return copy;
    });
  }

  async function handleSend() {
    if (table === null) return;
    const items: OrderItemInput[] = Object.entries(cart).flatMap(([dishId, qty]) => {
      const dish = dishes.find((candidate) => candidate.id === dishId);
      return dish ? [{ dish_id: dish.id, dish_name: dish.name, qty, unit_price: dish.base_price }] : [];
    });
    if (items.length === 0) {
      showToast.error("Agrega al menos un producto");
      return;
    }
    try {
      await orderService.createOrder(table, items, notes.trim() || undefined, { seat_number: seat, party_size: seatCount });
      showToast.success(`Comanda del puesto ${seat} · mesa ${table} enviada a cocina`);
      setCart({});
      setNotes("");
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Error al enviar la comanda");
    }
  }

  const activeForSelectedSeat = table === null
    ? []
    : activeOrders.filter((order) => order.table_number === table && (order.seat_number ?? 1) === seat);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [dishId, qty]) => {
    const dish = dishes.find((candidate) => candidate.id === dishId);
    return sum + (dish?.base_price ?? 0) * qty;
  }, 0);

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Servicio · Piso"
        title="Mesas y comandas"
        description="Elige una mesa, define cuántas personas se sientan y toma el pedido de cada puesto por separado."
      >
        <span className="picada-chip">{activeOrders.length} comandas activas</span>
        <span className="picada-chip">12 mesas</span>
      </PageHero>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {TABLES.map((tableNumber) => {
          const tableOrders = activeOrders.filter((order) => order.table_number === tableNumber);
          const count = seatCounts[tableNumber] ?? tableOrders[0]?.party_size ?? 2;
          const busySeats = new Set(tableOrders.map((order) => order.seat_number ?? 1)).size;
          return (
            <Button
              key={tableNumber}
              variant="ghost"
              onClick={() => selectTable(tableNumber)}
              className={`picada-card min-h-32 flex-col items-start justify-between bg-[#fffdf7] p-4 text-left hover:-translate-y-0.5 hover:border-[#e65100]/50 dark:bg-[#201814] ${
                tableOrders.length ? "border-l-4 border-l-[#2E7D32]" : ""
              }`}
            >
              <span className="flex w-full items-start justify-between">
                <span>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Mesa</span>
                  <span className="font-display text-3xl tracking-tight text-stone-900 dark:text-stone-50">{tableNumber}</span>
                </span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${tableOrders.length ? "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200" : "bg-[#f6efe1] text-stone-600 dark:bg-stone-800 dark:text-stone-300"}`}>
                  {tableOrders.length ? "En servicio" : "Libre"}
                </span>
              </span>
              <span className="flex w-full items-end justify-between text-xs font-semibold text-stone-600 dark:text-stone-300">
                <span>{count} puestos · {tableOrders.length ? `${busySeats} con pedido` : "sin comandas"}</span>
                <span className="font-bold text-[#E65100]">Abrir →</span>
              </span>
            </Button>
          );
        })}
      </div>

      <section className="picada-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Comandas por puesto</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">Cada persona mantiene su cuenta separada.</p>
          </div>
          <span className="rounded-full bg-[#edf5ee] px-3 py-1.5 font-mono text-sm font-bold text-[#2E7D32] dark:bg-green-950/50 dark:text-green-200">{activeOrders.length} activas</span>
        </div>
        {activeOrders.length ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="picada-ticket flex items-center justify-between gap-3 px-3 py-2.5">
                <div>
                  <p className="font-bold">
                    Mesa {order.table_number} · Puesto {order.seat_number ?? 1}
                    {order.party_size ? ` de ${order.party_size}` : ""}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{order.items.length} productos · ${order.total.toLocaleString("es-CL")}</p>
                </div>
                <Badge status={order.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">Todavía no hay comandas activas en las mesas.</p>
        )}
      </section>

      <Modal open={table !== null} onClose={() => setTable(null)} title={table ? `Mesa ${table} · tomar pedido` : "Pedido"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-xs font-bold text-stone-600 dark:text-stone-400">Personas en la mesa</p>
              <Select value={String(seatCount)} onChange={(event) => changeSeatCount(Number(event.target.value))} aria-label="Cantidad de personas">
                {Array.from({ length: 20 }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>{count} {count === 1 ? "persona" : "personas"}</option>
                ))}
              </Select>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-stone-600 dark:text-stone-400">Puesto que pide</p>
              <Select value={String(seat)} onChange={(event) => setSeat(Number(event.target.value))} aria-label="Puesto de la persona">
                {Array.from({ length: seatCount }, (_, index) => index + 1).map((number) => (
                  <option key={number} value={number}>Puesto {number}{occupiedSeats.has(`${table}-${number}`) ? " · con pedido" : ""}</option>
                ))}
              </Select>
            </div>
          </div>

          {activeForSelectedSeat.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
              <p className="text-sm font-bold">Este puesto ya tiene una comanda activa</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {activeForSelectedSeat.map((order) => <Badge key={order.id} status={order.status} />)}
              </div>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">Este envío creará una comanda adicional para el mismo puesto.</p>
            </div>
          ) : null}

          <Input placeholder="Buscar platos, tragos y postres…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar en el menú" />
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={category === item.id ? "primary" : "ghost"}
                onClick={() => setCategory(item.id)}
                className="shrink-0"
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="max-h-[38vh] space-y-2 overflow-y-auto pr-1">
            {filteredDishes.map((dish) => {
              const tracked = inventory.find((item) => item.kind === "UNIT" && item.dish_id === dish.id);
              const qty = cart[dish.id] ?? 0;
              const unavailable = tracked ? tracked.quantity <= qty : false;
              return (
                <div key={dish.id} className={`picada-ticket flex items-center justify-between gap-3 p-3 ${qty ? "border-[#e65100]/60 bg-[#fff6ea] dark:bg-[#2a1c14]" : ""}`}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{dish.name}</p>
                    <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                      {todayDishIds.includes(dish.id) ? "Menú de hoy · " : ""}{dish.description || dish.category}
                    </p>
                    <p className="font-mono text-sm font-bold text-[#2E7D32] dark:text-[#7cc47f]">${dish.base_price.toLocaleString("es-CL")}</p>
                    {tracked ? <p className="text-[11px] text-stone-500">Quedan {tracked.quantity} {tracked.unit}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#e7d5bb] bg-[#fffdf7] p-1 dark:border-stone-700 dark:bg-stone-900">
                    <Button size="sm" variant="ghost" onClick={() => changeQty(dish, -1)} aria-label={`Quitar ${dish.name}`} className="h-8 min-h-8 w-8 rounded-full px-0">−</Button>
                    <span className="w-5 text-center font-mono text-sm font-bold">{qty}</span>
                    <Button size="sm" variant="ghost" onClick={() => changeQty(dish, 1)} disabled={unavailable} aria-label={`Agregar ${dish.name}`} className="h-8 min-h-8 w-8 rounded-full px-0">+</Button>
                  </div>
                </div>
              );
            })}
            {!filteredDishes.length ? <p className="py-5 text-center text-sm text-stone-500">No hay resultados en esta categoría.</p> : null}
          </div>
          <Input placeholder="Notas para Cocina (ej. sin sal, poca papa…)" value={notes} onChange={(event) => setNotes(event.target.value)} />
          {cartCount > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-[#edf5ee] px-3 py-2.5 text-sm dark:bg-green-950/40">
              <span className="font-bold text-green-900 dark:text-green-100">{cartCount} productos en el puesto {seat}</span>
              <span className="font-mono text-base font-black text-[#2E7D32] dark:text-[#7cc47f]">${cartTotal.toLocaleString("es-CL")}</span>
            </div>
          ) : null}
          <Button onClick={handleSend} size="lg" className="w-full text-base">
            Enviar puesto {seat} a Cocina
          </Button>
        </div>
      </Modal>
    </div>
  );
}
