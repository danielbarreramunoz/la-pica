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
      <h1 className="font-sans text-2xl font-bold">Dashboard general</h1>
      {loading ? <p className="font-sans text-sm text-stone-500">Cargando…</p> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="font-sans text-sm text-stone-500">Menú activo hoy</p>
          <p className="mt-1 font-mono text-3xl font-bold text-[#E65100]">{selectedDishIds.length}</p>
          <p className="mt-1 font-sans text-xs text-stone-500">platos programados</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="font-sans text-sm text-stone-500">Platos disponibles</p>
          <p className="mt-1 font-mono text-3xl font-bold text-[#2E7D32]">{disponibles}</p>
          <p className="mt-1 font-sans text-xs text-stone-500">de {dishes.length} en catálogo</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="font-sans text-sm text-stone-500">Estado cocina</p>
          <div className="mt-2 flex gap-2">
            <Badge status="PENDING" />
            <Badge status="IN_PREPARATION" />
            <Badge status="READY" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/menu-builder">
          <Button>Programar menú de hoy</Button>
        </Link>
        <Link href="/admin/dishes">
          <Button variant="secondary">Gestionar platos</Button>
        </Link>
      </div>
    </div>
  );
}
