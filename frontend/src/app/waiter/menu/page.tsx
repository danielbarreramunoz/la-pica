"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { menuService, type Dish } from "@/services/menu.service";
import { PageHero } from "@/components/layout/page-hero";

const filters = [
  { value: "ALL", label: "Todo" },
  { value: "DAILY", label: "Menú de hoy" },
  { value: "Entrada", label: "Entradas" },
  { value: "Fondo", label: "Fondos" },
  { value: "Trago", label: "Tragos" },
  { value: "Bebestible", label: "Bebestibles" },
  { value: "Postre", label: "Postres" },
];

export default function WaiterMenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dailyIds, setDailyIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([menuService.listDishes(), menuService.getDailyMenu()])
      .then(([catalog, dailyMenu]) => {
        if (!active) return;
        setDishes(catalog.filter((dish) => dish.is_active));
        setDailyIds(dailyMenu.items.map((item) => item.dish_id));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return dishes.filter((dish) => {
      const categoryMatch = filter === "ALL" || (filter === "DAILY" ? dailyIds.includes(dish.id) : dish.category === filter);
      const searchMatch = !normalized || `${dish.name} ${dish.description} ${dish.category}`.toLowerCase().includes(normalized);
      return categoryMatch && searchMatch;
    });
  }, [dailyIds, dishes, filter, query]);

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Atención · Carta local"
        title="Menú y productos"
        description="Busca platos, tragos, bebidas y postres para responder rápido a las mesas."
      >
        <span className="picada-chip">{dishes.length} productos activos</span>
        <span className="picada-chip">{dailyIds.length} en el menú de hoy</span>
      </PageHero>
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en la carta…" aria-label="Buscar en la carta" />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <Button key={item.value} size="sm" variant={filter === item.value ? "primary" : "ghost"} onClick={() => setFilter(item.value)} className="shrink-0">
            {item.label}
          </Button>
        ))}
      </div>
      {loading ? <p className="text-sm text-stone-500">Cargando carta…</p> : null}
      {!loading && !visible.length ? (
        <div className="picada-card p-7 text-center text-sm text-stone-600 dark:text-stone-400">
          No hay productos para mostrar en este filtro.
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((dish) => (
          <article key={dish.id} className="picada-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-[#fff3e6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#9a3e1a] dark:bg-orange-950/60 dark:text-orange-200">{dish.category}</span>
                <h2 className="mt-2 text-lg font-extrabold">{dish.name}</h2>
              </div>
              {dailyIds.includes(dish.id) ? <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase text-green-900 dark:bg-green-950 dark:text-green-200">Hoy</span> : null}
            </div>
            <p className="mt-2 min-h-10 text-sm text-stone-600 dark:text-stone-400">{dish.description || "Preparación de la casa."}</p>
            <p className="mt-3 font-mono text-xl font-black text-[#2E7D32] dark:text-[#7cc47f]">${dish.base_price.toLocaleString("es-CL")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
