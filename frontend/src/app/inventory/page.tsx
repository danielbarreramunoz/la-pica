"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { showToast } from "@/components/ui/toast";
import { useSessionStore } from "@/stores/useSessionStore";
import { inventoryService, type InventoryItem, type InventoryKind, type InventoryMovement } from "@/services/inventory.service";
import { menuService, type Dish } from "@/services/menu.service";
import { PageHero } from "@/components/layout/page-hero";

const emptyItem = {
  name: "",
  kind: "INGREDIENT" as InventoryKind,
  quantity: "0",
  unit: "unidades",
  min_quantity: "0",
  dish_id: "",
};

export default function InventoryPage() {
  const user = useSessionStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | InventoryKind>("ALL");
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);
  const [adjustForm, setAdjustForm] = useState({ direction: "add", quantity: "", reason: "" });
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", unit: "", min_quantity: "", dish_id: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyItem);

  const refresh = useCallback(async () => {
    try {
      const [inventory, history] = await Promise.all([
        inventoryService.listItems(),
        inventoryService.listMovements(),
      ]);
      setItems(inventory);
      setMovements(history);
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "No se pudo cargar el inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([inventoryService.listItems(), inventoryService.listMovements()])
      .then(([inventory, history]) => {
        if (!active) return;
        setItems(inventory);
        setMovements(history);
      })
      .catch((error) => {
        if (active) showToast.error(error instanceof Error ? error.message : "No se pudo cargar el inventario");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    menuService.listDishes().then((list) => {
      if (active) setDishes(list);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => filter === "ALL" || item.kind === filter),
    [filter, items]
  );
  const lowStock = useMemo(() => items.filter((item) => item.quantity <= item.min_quantity), [items]);
  const unitItems = items.filter((item) => item.kind === "UNIT");
  const ingredients = items.filter((item) => item.kind === "INGREDIENT");

  function openAdjust(item: InventoryItem) {
    setAdjusting(item);
    setAdjustForm({ direction: "add", quantity: "", reason: "" });
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setEditForm({
      name: item.name,
      unit: item.unit,
      min_quantity: String(item.min_quantity),
      dish_id: item.dish_id ?? "",
    });
  }

  async function saveItemDetails() {
    if (!editing) return;
    const minQuantity = Number(editForm.min_quantity);
    if (!Number.isFinite(minQuantity) || minQuantity < 0) {
      showToast.error("El stock mínimo debe ser cero o mayor");
      return;
    }
    try {
      await inventoryService.updateItem(editing.id, {
        name: editForm.name.trim(),
        unit: editForm.unit.trim(),
        min_quantity: minQuantity,
        dish_id: editing.kind === "UNIT" ? editForm.dish_id : null,
      });
      showToast.success("Ficha de inventario actualizada");
      setEditing(null);
      await refresh();
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "No se pudo actualizar el artículo");
    }
  }

  async function saveAdjustment() {
    if (!adjusting) return;
    const quantity = Number(adjustForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0 || !adjustForm.reason.trim()) {
      showToast.error("Indica una cantidad y el motivo del ajuste");
      return;
    }
    try {
      const delta = adjustForm.direction === "add" ? quantity : -quantity;
      await inventoryService.adjustStock(adjusting.id, delta, adjustForm.reason.trim());
      showToast.success(`Stock actualizado: ${adjusting.name}`);
      setAdjusting(null);
      await refresh();
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "No se pudo ajustar el stock");
    }
  }

  async function createItem() {
    const quantity = Number(form.quantity);
    const minQuantity = Number(form.min_quantity);
    if (!form.name.trim() || !form.unit.trim() || !Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(minQuantity) || minQuantity < 0) {
      showToast.error("Revisa el nombre, unidad y cantidades");
      return;
    }
    if (form.kind === "UNIT" && !form.dish_id) {
      showToast.error("Vincula el producto a un plato del catálogo para descontarlo al vender");
      return;
    }
    try {
      await inventoryService.createItem({
        name: form.name.trim(),
        kind: form.kind,
        quantity,
        unit: form.unit.trim(),
        min_quantity: minQuantity,
        dish_id: form.kind === "UNIT" ? form.dish_id : null,
      });
      showToast.success("Artículo agregado al inventario");
      setForm(emptyItem);
      setCreateOpen(false);
      await refresh();
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "No se pudo crear el artículo");
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Bodega · La Picá"
        title="Inventario"
        description="Las bebidas y productos unitarios se descuentan al vender. Los ingredientes se ajustan a mano según lo que realmente entra a la cocina."
      >
        {isAdmin ? <Button variant="primary" onClick={() => setCreateOpen(true)}>Agregar artículo</Button> : <span className="picada-chip">Solo lectura</span>}
      </PageHero>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="picada-card border-l-4 border-l-[#E65100] p-4">
          <p className="picada-eyebrow">Productos por unidad</p>
          <p className="mt-1 font-mono text-3xl font-black text-[#E65100]">{unitItems.length}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Se descuentan al pagar</p>
        </div>
        <div className="picada-card border-l-4 border-l-[#2E7D32] p-4">
          <p className="picada-eyebrow">Ingredientes</p>
          <p className="mt-1 font-mono text-3xl font-black text-[#2E7D32] dark:text-[#7cc47f]">{ingredients.length}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Conteo y merma manual</p>
        </div>
        <div className={`picada-card border-l-4 p-4 ${lowStock.length ? "border-l-red-500" : "border-l-stone-300"}`}>
          <p className="picada-eyebrow">Por reponer</p>
          <p className={`mt-1 font-mono text-3xl font-black ${lowStock.length ? "text-red-700 dark:text-red-300" : "text-stone-900 dark:text-stone-100"}`}>{lowStock.length}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Bajo el mínimo definido</p>
        </div>
      </section>

      {lowStock.length > 0 ? (
        <section className="rounded-2xl border border-red-200 bg-[#fff1eb] p-4 dark:border-red-950 dark:bg-red-950/30">
          <h2 className="font-extrabold text-red-900 dark:text-red-200">Lista de compra sugerida</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <span key={item.id} className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-900 dark:border-red-900 dark:bg-stone-900 dark:text-red-200">
                {item.name} · quedan {item.quantity} {item.unit} (mínimo {item.min_quantity})
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="picada-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[#e7d5bb] p-4 dark:border-stone-700">
          <div>
            <h2 className="text-lg font-extrabold">Existencias</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">Todo el equipo puede consultar; solo administración modifica.</p>
          </div>
          <Select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} aria-label="Filtrar inventario" className="w-auto min-w-40">
            <option value="ALL">Todos los artículos</option>
            <option value="UNIT">Productos unitarios</option>
            <option value="INGREDIENT">Ingredientes</option>
          </Select>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-stone-500">Cargando inventario…</p>
        ) : visibleItems.length ? (
          <div className="divide-y divide-dashed divide-[#e7d5bb] dark:divide-stone-700">
            {visibleItems.map((item) => {
              const isLow = item.quantity <= item.min_quantity;
              return (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{item.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        item.kind === "UNIT"
                          ? "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200"
                          : "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200"
                      }`}>
                        {item.kind === "UNIT" ? "Unitario" : "Ingrediente"}
                      </span>
                      {isLow ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-800 dark:bg-red-950 dark:text-red-200">Reponer</span> : null}
                    </div>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {item.kind === "UNIT" ? "Descuento automático al pagar" : "Control manual"} · mínimo {item.min_quantity} {item.unit}
                    </p>
                  </div>
                  <p className={`font-mono text-xl font-black tabular-nums ${isLow ? "text-red-700 dark:text-red-300" : "text-[#2E7D32] dark:text-[#7cc47f]"}`}>
                    {item.quantity} <span className="text-xs font-semibold">{item.unit}</span>
                  </p>
                  {isAdmin ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>Editar</Button>
                      <Button variant="secondary" size="sm" onClick={() => openAdjust(item)}>Stock</Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-5 text-sm text-stone-500 dark:text-stone-400">No hay artículos en esta categoría.</p>
        )}
      </section>

      <section className="picada-card p-4 sm:p-5">
        <h2 className="text-lg font-extrabold">Últimos movimientos</h2>
        {movements.length ? (
          <div className="mt-2 divide-y divide-dashed divide-[#e7d5bb] dark:divide-stone-700">
            {movements.slice(0, 10).map((movement) => (
              <div key={movement.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                <span><b>{movement.item_name}</b> · {movement.reason}</span>
                <span className={`font-mono font-bold ${movement.delta < 0 ? "text-red-700 dark:text-red-300" : "text-[#2E7D32] dark:text-[#7cc47f]"}`}>
                  {movement.delta > 0 ? "+" : ""}{movement.delta}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Los ajustes y ventas aparecerán aquí.</p>
        )}
      </section>

      <Modal open={adjusting !== null} onClose={() => setAdjusting(null)} title={adjusting ? `Ajustar · ${adjusting.name}` : "Ajustar stock"}>
        <div className="space-y-3">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Existencia actual: <b>{adjusting?.quantity} {adjusting?.unit}</b>. Registra ingreso, merma o conteo físico.
          </p>
          <Select value={adjustForm.direction} onChange={(event) => setAdjustForm({ ...adjustForm, direction: event.target.value })} aria-label="Tipo de ajuste">
            <option value="add">Sumar al stock</option>
            <option value="remove">Descontar del stock</option>
          </Select>
          <Input type="number" min="0" step="0.001" placeholder={`Cantidad (${adjusting?.unit ?? ""})`} value={adjustForm.quantity} onChange={(event) => setAdjustForm({ ...adjustForm, quantity: event.target.value })} />
          <Input placeholder="Motivo: compra, merma, conteo…" value={adjustForm.reason} onChange={(event) => setAdjustForm({ ...adjustForm, reason: event.target.value })} />
          <Button onClick={saveAdjustment} className="w-full">Guardar ajuste</Button>
        </div>
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing ? `Editar · ${editing.name}` : "Editar artículo"}>
        <div className="space-y-3">
          <Input placeholder="Nombre" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
          {editing?.kind === "UNIT" ? (
            <Select value={editForm.dish_id} onChange={(event) => setEditForm({ ...editForm, dish_id: event.target.value })} aria-label="Producto del catálogo">
              <option value="">Vincular al catálogo</option>
              {dishes.filter((dish) => dish.is_active).map((dish) => (
                <option key={dish.id} value={dish.id}>{dish.name}</option>
              ))}
            </Select>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Unidad" value={editForm.unit} onChange={(event) => setEditForm({ ...editForm, unit: event.target.value })} />
            <Input type="number" min="0" step="0.001" placeholder="Mínimo para reponer" value={editForm.min_quantity} onChange={(event) => setEditForm({ ...editForm, min_quantity: event.target.value })} />
          </div>
          <Button onClick={saveItemDetails} className="w-full">Guardar cambios</Button>
        </div>
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Agregar al inventario">
        <div className="space-y-3">
          <Input placeholder="Nombre del producto o ingrediente" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as InventoryKind })} aria-label="Tipo de inventario">
            <option value="INGREDIENT">Ingrediente · ajuste manual</option>
            <option value="UNIT">Producto unitario · descuento por venta</option>
          </Select>
          {form.kind === "UNIT" ? (
            <Select value={form.dish_id} onChange={(event) => setForm({ ...form, dish_id: event.target.value })} aria-label="Plato relacionado">
              <option value="">Vincular al catálogo de platos</option>
              {dishes.filter((dish) => dish.is_active).map((dish) => (
                <option key={dish.id} value={dish.id}>{dish.name}</option>
              ))}
            </Select>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" min="0" step="0.001" placeholder="Existencia inicial" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
            <Input placeholder="Unidad: kg, ramos…" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
            <Input type="number" min="0" step="0.001" placeholder="Mínimo para reponer" value={form.min_quantity} onChange={(event) => setForm({ ...form, min_quantity: event.target.value })} />
          </div>
          <Button onClick={createItem} className="w-full">Guardar artículo</Button>
        </div>
      </Modal>
    </div>
  );
}
