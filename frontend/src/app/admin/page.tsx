"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminStore } from "@/stores/useAdminStore";
import { menuService } from "@/services/menu.service";

export default function AdminDashboard() {
  const { dishes, setDishes, selectedDishIds, hydrateMenu, loading, setLoading } = useAdminStore();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await menuService.listDishes();
      setDishes(list);
      const menu = await menuService.getDailyMenu();
      hydrateMenu(menu.items.map((i) => i.dish_id));
      setLoading(false);
    })();
  }, [setDishes, hydrateMenu, setLoading]);

  const disponibles = dishes.filter((d) => d.is_active).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-5">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#E65100]">
          Panel operativo · La Picá
        </p>
        <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-stone-900">
          Dashboard general
        </h1>
        <p className="mt-1 font-sans text-sm text-stone-600">
          Resumen del menú del día, catálogo y estado de cocina en tiempo real.
        </p>
      </div>
      {loading ? <p className="font-sans text-sm text-stone-600">Cargando…</p> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="h-1.5 bg-[#E65100]" aria-hidden="true" />
          <div className="p-5">
            <p className="font-sans text-sm font-medium text-stone-600">Menú activo hoy</p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-[#E65100]">
              {selectedDishIds.length}
            </p>
            <p className="mt-1 font-sans text-xs text-stone-600">platos programados</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="h-1.5 bg-[#2E7D32]" aria-hidden="true" />
          <div className="p-5">
            <p className="font-sans text-sm font-medium text-stone-600">Platos disponibles</p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-[#2E7D32]">
              {disponibles}
            </p>
            <p className="mt-1 font-sans text-xs text-stone-600">de {dishes.length} en catálogo</p>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="font-sans text-sm font-medium text-stone-600">Estado cocina</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge status="PENDING" />
            <Badge status="IN_PREPARATION" />
            <Badge status="READY" />
          </div>
          <p className="mt-2 font-sans text-xs text-stone-600">Comandas en curso (KDS)</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/menu-builder">
          <Button size="lg">Programar menú de hoy</Button>
        </Link>
        <Link href="/admin/dishes">
          <Button variant="secondary" size="lg">
            Gestionar platos
          </Button>
        </Link>
      </div>
    </div>
  );
}
