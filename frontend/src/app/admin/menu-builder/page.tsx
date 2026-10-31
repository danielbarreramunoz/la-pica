"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdminStore } from "@/stores/useAdminStore";
import { menuService } from "@/services/menu.service";
import { showToast } from "@/components/ui/toast";

export default function MenuBuilderPage() {
  const {
    dishes,
    setDishes,
    selectedDate,
    setDate,
    selectedDishIds,
    toggleDishInMenu,
    hydrateMenu,
    featuredDishId,
    setFeatured,
    promoPrice,
    setPromoPrice,
    setLoading,
  } = useAdminStore();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await menuService.listDishes();
      setDishes(list);
      const menu = await menuService.getDailyMenu(selectedDate);
      const featured = menu.items.find((i) => i.is_featured)?.dish_id ?? null;
      const promo = menu.items.find((i) => i.is_featured)?.promo_price ?? null;
      hydrateMenu(
        menu.items.map((i) => i.dish_id),
        featured,
        typeof promo === "number" ? promo : null
      );
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  async function handleSave() {
    try {
      await menuService.saveDailyMenu(selectedDate, selectedDishIds, {
        featuredDishId,
        promoPrice,
      });
      showToast.success("Menú guardado");
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Error al guardar menú");
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-sans text-2xl font-bold">Programador de menú del día</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-52">
          <p className="mb-1 font-sans text-xs text-stone-500">Fecha</p>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={handleSave}>
          Guardado rápido
        </Button>
      </div>

      <div className="space-y-2">
        {dishes.map((d) => {
          const active = selectedDishIds.includes(d.id);
          return (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-sans text-sm font-semibold">{d.name}</p>
                <p className="font-mono text-sm text-[#E65100]">
                  ${d.base_price.toLocaleString("es-CL")} · {d.category}
                </p>
              </div>
              <Switch checked={active} onChange={() => toggleDishInMenu(d.id)} label={d.name} />
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#2E7D32]/30 bg-white p-4">
        <p className="font-sans text-sm font-semibold text-[#2E7D32]">Plato del día / Ejecutivo</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="min-w-52 flex-1">
            <Select value={featuredDishId ?? ""} onChange={(e) => setFeatured(e.target.value || null)}>
              <option value="">Sin destacado</option>
              {selectedDishIds.map((id) => {
                const d = dishes.find((x) => x.id === id);
                return d ? (
                  <option key={id} value={id}>
                    {d.name}
                  </option>
                ) : null;
              })}
            </Select>
          </div>
          <div className="w-44">
            <Input
              placeholder="Precio promo"
              inputMode="decimal"
              value={promoPrice === null ? "" : String(promoPrice)}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Number(e.target.value);
                setPromoPrice(v);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
