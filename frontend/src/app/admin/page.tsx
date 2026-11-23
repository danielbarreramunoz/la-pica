"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/stores/useAdminStore";
import { useOrderStore } from "@/stores/useOrderStore";
import { menuService } from "@/services/menu.service";
import { PageHero } from "@/components/layout/page-hero";

export default function AdminDashboard() {
  const { dishes, setDishes, selectedDishIds, hydrateMenu, loading, setLoading } = useAdminStore();
  const { orders, startRealtime } = useOrderStore();

  useEffect(() => {
    const stop = startRealtime();
    (async () => {
      setLoading(true);
      const list = await menuService.listDishes();
      setDishes(list);
      const menu = await menuService.getDailyMenu();
      hydrateMenu(menu.items.map((item) => item.dish_id));
      setLoading(false);
    })();
    return stop;
  }, [setDishes, hydrateMenu, setLoading, startRealtime]);

  const disponibles = dishes.filter((dish) => dish.is_active).length;
  const activeOrders = orders.filter((order) => ["PENDING", "IN_PREPARATION", "READY"].includes(order.status));

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Administración · La Picá"
        title="Todo el local, de un vistazo"
        description="Menú del día, catálogo, cocina, caja e inventario en un mismo lugar."
      >
        <Link href="/admin/menu-builder"><Button>Programar menú de hoy</Button></Link>
        <Link href="/inventory"><Button variant="ghost" className="border border-[#f4d7b8]/30 text-[#fff7ea] hover:bg-[#fff7ea]/15 hover:text-[#fff7ea] dark:text-[#fff7ea] dark:hover:bg-[#fff7ea]/15">Inventario</Button></Link>
      </PageHero>

      {loading ? <p className="text-sm text-stone-600 dark:text-stone-400">Cargando…</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="picada-card border-l-4 border-l-[#E65100] p-5">
          <p className="picada-eyebrow">Menú activo hoy</p>
          <p className="mt-1 font-mono text-4xl font-black tabular-nums text-[#E65100]">{selectedDishIds.length}</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">platos programados</p>
        </div>
        <div className="picada-card border-l-4 border-l-[#2E7D32] p-5">
          <p className="picada-eyebrow">Platos disponibles</p>
          <p className="mt-1 font-mono text-4xl font-black tabular-nums text-[#2E7D32] dark:text-[#7cc47f]">{disponibles}</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">de {dishes.length} en catálogo</p>
        </div>
        <div className="picada-card border-l-4 border-l-[#f3b62c] p-5">
          <p className="picada-eyebrow">Comandas activas</p>
          <p className="mt-1 font-mono text-4xl font-black tabular-nums text-[#b47a00] dark:text-[#f3b62c]">{activeOrders.length}</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">en cocina y servicio</p>
        </div>
        <div className="picada-card p-5">
          <p className="picada-eyebrow">Estado cocina</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge status="PENDING" />
            <Badge status="IN_PREPARATION" />
            <Badge status="READY" />
          </div>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Actualización en tiempo real</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/dishes" className="picada-card group p-5 transition hover:-translate-y-0.5 hover:border-[#e65100]/40">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Catálogo</p>
          <h2 className="mt-1 text-xl font-extrabold">Gestionar platos</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Precios, categorías, descripciones y disponibilidad.</p>
          <span className="mt-3 inline-block text-sm font-bold text-[#E65100] group-hover:underline">Abrir catálogo →</span>
        </Link>
        <Link href="/admin/menu-builder" className="picada-card group p-5 transition hover:-translate-y-0.5 hover:border-[#e65100]/40">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Menú del día</p>
          <h2 className="mt-1 text-xl font-extrabold">Programar el menú</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Elige los platos que estarán disponibles hoy.</p>
          <span className="mt-3 inline-block text-sm font-bold text-[#E65100] group-hover:underline">Abrir programador →</span>
        </Link>
        <Link href="/kitchen" className="picada-card group p-5 transition hover:-translate-y-0.5 hover:border-[#e65100]/40">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Cocina</p>
          <h2 className="mt-1 text-xl font-extrabold">Comandas en vivo</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Revisa el avance de cada mesa y puesto.</p>
          <span className="mt-3 inline-block text-sm font-bold text-[#E65100] group-hover:underline">Abrir cocina →</span>
        </Link>
        <Link href="/inventory" className="picada-card group p-5 transition hover:-translate-y-0.5 hover:border-[#e65100]/40">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Bodega</p>
          <h2 className="mt-1 text-xl font-extrabold">Inventario y compras</h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Existencias, mínimos y lista de reposición.</p>
          <span className="mt-3 inline-block text-sm font-bold text-[#E65100] group-hover:underline">Abrir inventario →</span>
        </Link>
      </section>
    </div>
  );
}
