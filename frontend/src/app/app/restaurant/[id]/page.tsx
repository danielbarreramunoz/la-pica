"use client";

import { Suspense, useEffect, useState } from "react";
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

  useEffect(() => {
    setRestaurant(id);
    restaurantService.getRestaurantWithDailyMenu(id).then(setData);
  }, [id, setRestaurant]);

  const total = cart.reduce((s, c) => s + c.qty * c.unit_price, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

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
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 pb-28">
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <p className="font-sans text-xl font-bold">{data.name}</p>
        <p className="font-sans text-sm text-stone-500">{data.address}</p>
        <p className="font-sans text-sm text-stone-500">Colación: {data.lunch_hours}</p>
      </div>

      <h2 className="font-sans text-lg font-bold text-[#2E7D32]">Menú del Día de Hoy</h2>
      <div className="space-y-2">
        {data.menu.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3">
            <div>
              <p className="font-sans text-sm font-semibold">{d.name}</p>
              <p className="font-sans text-xs text-stone-500">{d.description}</p>
              <p className="font-mono text-sm font-bold text-[#2E7D32]">${d.base_price.toLocaleString("es-CL")}</p>
            </div>
            <Button size="sm" onClick={() => openDish(d)}>
              Agregar
            </Button>
          </div>
        ))}
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
        <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white p-4 shadow-lg">
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
