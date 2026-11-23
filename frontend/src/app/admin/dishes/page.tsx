"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAdminStore } from "@/stores/useAdminStore";
import { menuService, type Dish, type DishCategory } from "@/services/menu.service";
import { showToast } from "@/components/ui/toast";
import { PageHero } from "@/components/layout/page-hero";

const CATEGORIES: DishCategory[] = ["Entrada", "Fondo", "Postre", "Bebestible", "Trago"];

const emptyForm = { name: "", description: "", category: "Fondo" as DishCategory, base_price: "", image_url: "" };

export default function DishesPage() {
  const { dishes, setDishes, addDish, patchDish, setLoading } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setDishes(await menuService.listDishes());
      setLoading(false);
    })();
  }, [setDishes, setLoading]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(dish: Dish) {
    setEditing(dish);
    setForm({
      name: dish.name,
      description: dish.description,
      category: dish.category,
      base_price: String(dish.base_price),
      image_url: dish.image_url ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      showToast.error("El nombre es obligatorio");
      return;
    }
    const price = Number(form.base_price);
    if (!Number.isFinite(price) || price < 0) {
      showToast.error("Precio base inválido");
      return;
    }
    try {
      if (editing) {
        const updated = await menuService.updateDish(editing.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          base_price: price,
          image_url: form.image_url.trim() || undefined,
        });
        patchDish(editing.id, updated);
        showToast.success("Plato actualizado");
      } else {
        const created = await menuService.createDish({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          base_price: price,
          image_url: form.image_url.trim() || undefined,
          is_active: true,
        });
        addDish(created);
        showToast.success("Plato creado");
      }
      setOpen(false);
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  }

  async function toggleActive(dish: Dish) {
    const updated = await menuService.updateDish(dish.id, { is_active: !dish.is_active });
    patchDish(dish.id, updated);
    showToast.success(updated.is_active ? "Plato activado" : "Plato desactivado");
  }

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Catálogo · Platos"
        title="Catálogo maestro"
        description="Administra precios, categorías y disponibilidad de todo lo que ofrece la picada."
      >
        <Button onClick={openCreate} size="lg">Nuevo plato</Button>
      </PageHero>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dishes.map((d) => (
          <div key={d.id} className="picada-card p-4">
            <div className="picada-grid-lines flex h-20 items-center justify-center rounded-lg border border-dashed border-[#e7d5bb] bg-[#f6efe1] font-sans text-sm font-bold text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
              {d.image_url ? "Imagen del plato" : "Foto pendiente"}
            </div>
            <div className="mt-3 flex items-start justify-between gap-2">
              <p className="font-sans text-base font-extrabold text-stone-900 dark:text-stone-100">{d.name}</p>
              <span className="shrink-0 rounded-full bg-[#fff3e6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9a3e1a] dark:bg-orange-950/60 dark:text-orange-200">{d.category}</span>
            </div>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{d.description}</p>
            <p className="mt-2 font-mono text-lg font-black text-[#2E7D32] dark:text-[#7cc47f]">
              ${d.base_price.toLocaleString("es-CL")}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(d)}>
                Editar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleActive(d)}>
                {d.is_active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar plato" : "Nuevo plato"}>
        <div className="space-y-3">
          <Input
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as DishCategory })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Precio base"
            inputMode="decimal"
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: e.target.value })}
          />
          <Input
            placeholder="URL imagen (opcional)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          <Button onClick={handleSubmit} className="w-full">
            Guardar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
