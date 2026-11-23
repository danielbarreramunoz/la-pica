"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { restaurantService, type RestaurantWithMenu } from "@/services/restaurant.service";
import type { Dish } from "@/services/menu.service";
import { showToast } from "@/components/ui/toast";

const SIDES = ["Arroz", "Papas fritas", "Ensalada", "Pebre extra"];
const CATEGORIES = ["Todo", "Entrada", "Fondo", "Postre", "Bebestible", "Trago"];

export default function RestaurantPage() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-3xl px-4 py-6 font-sans">Cargando local…</p>}>
      <RestaurantInner />
    </Suspense>
  );
}

function RestaurantInner() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { cart, addToCart, setRestaurant } = useCustomerStore();
  const [data, setData] = useState<RestaurantWithMenu | null>(null);
  const [selected, setSelected] = useState<Dish | null>(null);
  const [side, setSide] = useState(SIDES[0]);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const [category, setCategory] = useState("Todo");

  useEffect(() => {
    setRestaurant(id);
    restaurantService.getRestaurantWithDailyMenu(id).then(setData);
  }, [id, setRestaurant]);

  const total = cart.reduce((s, c) => s + c.qty * c.unit_price, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const visibleMenu = useMemo(
    () => (data?.menu ?? []).filter((dish) => category === "Todo" || dish.category === category),
    [category, data]
  );

  function openDish(d: Dish) {
    setSelected(d);
    setSide(SIDES[0]);
    setNotes("");
    setQty(1);
  }

  function handleAdd() {
    if (!selected) return;
    addToCart({
      dish_id: selected.id,
      dish_name: selected.name,
      unit_price: selected.base_price,
      qty,
      notes: `${side}${notes.trim() ? ` · ${notes.trim()}` : ""}`,
    });
    showToast.success(`${selected.name} agregado`);
    setSelected(null);
  }

  if (!data) return <p className="mx-auto max-w-3xl px-4 py-6 font-sans">Cargando local…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 pb-28">
      <section className="picada-hero rounded-3xl p-6">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#f3b62c]">Picada de barrio</p>
        <h1 className="mt-1.5 text-4xl text-[#fff8eb]">{data.name}</h1>
        <p className="mt-2 text-sm text-[#ffe9ce]/85">📍 {data.address}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="picada-chip">Colación {data.lunch_hours}</span>
          <span className="picada-chip">{data.menu.length} platos y productos</span>
        </div>
      </section>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={category === item ? "primary" : "outline"}
            onClick={() => setCategory(item)}
            className="shrink-0"
          >
            {item}
          </Button>
        ))}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="picada-eyebrow">Carta de hoy</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">Menú del día</h2>
        </div>
        <span className="font-mono text-xs font-bold text-stone-500 dark:text-stone-400">{visibleMenu.length} opciones</span>
      </div>
      <div className="space-y-2">
        {visibleMenu.map((dish) => (
          <div key={dish.id} className="picada-card flex items-center justify-between gap-3 p-3.5">
            <div className="min-w-0">
              <span className="rounded-full bg-[#fff3e6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9a3e1a] dark:bg-orange-950/60 dark:text-orange-200">{dish.category}</span>
              <p className="mt-1.5 font-sans text-sm font-bold">{dish.name}</p>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400">{dish.description}</p>
              <p className="mt-1 font-mono text-base font-black text-[#2E7D32] dark:text-[#7cc47f]">${dish.base_price.toLocaleString("es-CL")}</p>
            </div>
            <Button size="sm" onClick={() => openDish(dish)}>
              Agregar
            </Button>
          </div>
        ))}
        {visibleMenu.length === 0 ? (
          <div className="picada-card p-6 text-center text-sm text-stone-500 dark:text-stone-400">
            No hay productos en esta categoría hoy.
          </div>
        ) : null}
      </div>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? "Plato"}>
        <div className="space-y-3">
          <Select value={side} onChange={(e) => setSide(e.target.value)}>
            {SIDES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input placeholder="Notas: sin sal, poca papa…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </Button>
            <span className="font-mono font-bold">{qty}</span>
            <Button variant="ghost" size="sm" onClick={() => setQty((q) => q + 1)}>
              +
            </Button>
          </div>
          <Button onClick={handleAdd} className="w-full bg-[#E65100]">
            Agregar al pre-pedido
          </Button>
        </div>
      </Modal>

      {count > 0 ? (
        <div className="fixed inset-x-0 bottom-16 border-t border-stone-200 bg-white p-4 shadow-lg dark:border-stone-700 dark:bg-stone-900">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <p className="font-sans text-sm">
              {count} ítems · <span className="font-mono font-bold">${total.toLocaleString("es-CL")}</span>
            </p>
            <Link href="/app/checkout">
              <Button variant="secondary">Ver pre-pedido</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
