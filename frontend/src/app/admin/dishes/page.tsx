"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAdminStore } from "@/stores/useAdminStore";
import { menuService, type Dish, type DishCategory } from "@/services/menu.service";
import { showToast } from "@/components/ui/toast";

const CATEGORIES: DishCategory[] = ["Entrada", "Fondo", "Postre", "Bebestible"];

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
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-2xl font-bold">Catálogo maestro</h1>
        <Button onClick={openCreate}>Nuevo plato</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dishes.map((d) => (
          <div key={d.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex h-20 items-center justify-center rounded-lg bg-stone-100 font-sans text-sm text-stone-400">
              {d.image_url ? "Imagen" : "Sin imagen · placeholder"}
            </div>
            <p className="mt-3 font-sans text-base font-semibold">{d.name}</p>
            <p className="font-sans text-sm text-stone-500">{d.description}</p>
            <p className="mt-2 font-sans text-xs text-stone-500">{d.category}</p>
            <p className="font-mono text-lg font-bold text-[#E65100]">
              ${d.base_price.toLocaleString("es-CL")}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => openEdit(d)}>
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
