import { getSupabase } from "@/lib/supabase/client";
import { useSessionStore } from "@/stores/useSessionStore";

export type InventoryKind = "UNIT" | "INGREDIENT";

export interface InventoryItem {
  id: string;
  tenant_id?: string;
  name: string;
  kind: InventoryKind;
  quantity: number;
  unit: string;
  min_quantity: number;
  dish_id?: string | null;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  inventory_item_id: string;
  item_name: string;
  delta: number;
  reason: string;
  order_id?: string;
  created_at: string;
}

type SoldItem = { dish_id: string; qty: number };

const ITEMS_KEY = "lapica-inventory-items";
const MOVEMENTS_KEY = "lapica-inventory-movements";
const seedItems: InventoryItem[] = [
  { id: "inv-mote", name: "Mote con huesillo", kind: "UNIT", quantity: 16, unit: "vasos", min_quantity: 5, dish_id: "mock-3", updated_at: new Date().toISOString() },
  { id: "inv-beer", name: "Cerveza en lata", kind: "UNIT", quantity: 24, unit: "unidades", min_quantity: 8, dish_id: "mock-5", updated_at: new Date().toISOString() },
  { id: "inv-soda", name: "Bebida cola", kind: "UNIT", quantity: 18, unit: "unidades", min_quantity: 6, dish_id: "mock-6", updated_at: new Date().toISOString() },
  { id: "inv-tomato", name: "Tomates", kind: "INGREDIENT", quantity: 4, unit: "kg", min_quantity: 2, updated_at: new Date().toISOString() },
  { id: "inv-onion", name: "Cebollas", kind: "INGREDIENT", quantity: 8, unit: "unidades", min_quantity: 3, updated_at: new Date().toISOString() },
  { id: "inv-cilantro", name: "Cilantro", kind: "INGREDIENT", quantity: 3, unit: "ramos", min_quantity: 2, updated_at: new Date().toISOString() },
];

let memoryItems = [...seedItems];
let memoryMovements: InventoryMovement[] = [];
let loaded = false;

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const items = window.localStorage.getItem(ITEMS_KEY);
    const movements = window.localStorage.getItem(MOVEMENTS_KEY);
    if (items) memoryItems = JSON.parse(items) as InventoryItem[];
    if (movements) memoryMovements = JSON.parse(movements) as InventoryMovement[];
  } catch {
    memoryItems = [...seedItems];
    memoryMovements = [];
  }
}

function persistMock() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ITEMS_KEY, JSON.stringify(memoryItems));
    window.localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(memoryMovements));
  } catch {
    // Fallback a memoria para entornos que bloqueen almacenamiento local.
  }
}

function makeMovement(item: InventoryItem, delta: number, reason: string, orderId?: string): InventoryMovement {
  return {
    id: `move-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    inventory_item_id: item.id,
    item_name: item.name,
    delta,
    reason,
    order_id: orderId,
    created_at: new Date().toISOString(),
  };
}

function assertAdmin() {
  if (useSessionStore.getState().user?.role !== "admin") {
    throw new Error("Solo administración puede modificar el inventario");
  }
}

async function getDefaultTenantId(): Promise<string> {
  const sb = getSupabase();
  if (!sb) return "mock-tenant";
  const { data, error } = await sb.from("tenants").select("id").order("created_at").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Crea primero la picada en la base de datos");
  return String(data.id);
}

export const inventoryService = {
  async listItems(): Promise<InventoryItem[]> {
    ensureLoaded();
    const sb = getSupabase();
    if (!sb) return [...memoryItems].sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
    const { data, error } = await sb.from("inventory_items").select("*").eq("is_active", true).order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as InventoryItem[];
  },

  async listMovements(): Promise<InventoryMovement[]> {
    ensureLoaded();
    const sb = getSupabase();
    if (!sb) return [...memoryMovements].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 60);
    const { data, error } = await sb
      .from("inventory_movements")
      .select("*, inventory_items(name)")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      ...(row as unknown as InventoryMovement),
      item_name: String((row.inventory_items as { name?: string } | null)?.name ?? "Artículo"),
    }));
  },

  async createItem(input: Omit<InventoryItem, "id" | "updated_at">): Promise<InventoryItem> {
    assertAdmin();
    ensureLoaded();
    if (!input.name.trim() || !input.unit.trim() || input.quantity < 0 || input.min_quantity < 0) {
      throw new Error("Nombre, unidad y cantidades deben ser válidos");
    }
    if (input.kind === "UNIT" && !input.dish_id) {
      throw new Error("Vincula el producto unitario con un plato del catálogo");
    }
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("inventory_items")
        .insert({ ...input, tenant_id: input.tenant_id ?? await getDefaultTenantId() })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as InventoryItem;
    }
    const item: InventoryItem = {
      ...input,
      id: `inv-${Date.now()}`,
      updated_at: new Date().toISOString(),
    };
    memoryItems = [item, ...memoryItems];
    persistMock();
    return item;
  },

  async adjustStock(id: string, delta: number, reason: string): Promise<InventoryItem> {
    assertAdmin();
    ensureLoaded();
    if (!Number.isFinite(delta) || delta === 0) throw new Error("Ingresa una cantidad distinta de cero");
    if (!reason.trim()) throw new Error("Indica el motivo del ajuste");
    const sb = getSupabase();
    if (sb) {
      const { data: current, error: readError } = await sb.from("inventory_items").select("*").eq("id", id).single();
      if (readError) throw new Error(readError.message);
      const item = current as InventoryItem;
      const quantity = Number(item.quantity) + delta;
      if (quantity < 0) throw new Error("El ajuste no puede dejar stock negativo");
      const { data, error } = await sb
        .from("inventory_items")
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      const { error: movementError } = await sb.from("inventory_movements").insert({
        inventory_item_id: id,
        delta,
        reason,
      });
      if (movementError) throw new Error(movementError.message);
      return data as InventoryItem;
    }
    const item = memoryItems.find((entry) => entry.id === id);
    if (!item) throw new Error("No se encontró el artículo");
    const quantity = item.quantity + delta;
    if (quantity < 0) throw new Error("El ajuste no puede dejar stock negativo");
    const updated = { ...item, quantity, updated_at: new Date().toISOString() };
    memoryItems = memoryItems.map((entry) => entry.id === id ? updated : entry);
    memoryMovements = [makeMovement(item, delta, reason), ...memoryMovements];
    persistMock();
    return updated;
  },

  async updateItem(
    id: string,
    patch: Pick<InventoryItem, "name" | "unit" | "min_quantity" | "dish_id">
  ): Promise<InventoryItem> {
    assertAdmin();
    ensureLoaded();
    if (!patch.name.trim() || !patch.unit.trim() || patch.min_quantity < 0) {
      throw new Error("Revisa nombre, unidad y stock mínimo");
    }
    const current = await this.listItems().then((items) => items.find((item) => item.id === id));
    if (current?.kind === "UNIT" && !patch.dish_id) {
      throw new Error("Vincula el producto unitario con un plato del catálogo");
    }
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("inventory_items")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as InventoryItem;
    }
    const currentMock = memoryItems.find((item) => item.id === id);
    if (!currentMock) throw new Error("No se encontró el artículo");
    const updated = { ...currentMock, ...patch, updated_at: new Date().toISOString() };
    memoryItems = memoryItems.map((item) => item.id === id ? updated : item);
    persistMock();
    return updated;
  },

  async canSell(items: SoldItem[]): Promise<boolean> {
    const stock = await this.listItems();
    const requested = new Map<string, number>();
    items.forEach((sold) => requested.set(sold.dish_id, (requested.get(sold.dish_id) ?? 0) + sold.qty));
    return [...requested.entries()].every(([dishId, qty]) => {
      const tracked = stock.find((item) => item.kind === "UNIT" && item.dish_id === dishId);
      return !tracked || tracked.quantity >= qty;
    });
  },

  async consumeSoldItems(items: SoldItem[], orderId: string): Promise<void> {
    ensureLoaded();
    const sb = getSupabase();
    const stock = await this.listItems();
    const requested = new Map<string, number>();
    items.forEach((sold) => requested.set(sold.dish_id, (requested.get(sold.dish_id) ?? 0) + sold.qty));
    const deductions = [...requested.entries()].flatMap(([dishId, qty]) => {
      const tracked = stock.find((item) => item.kind === "UNIT" && item.dish_id === dishId);
      return tracked ? [{ tracked, qty }] : [];
    });
    if (deductions.some(({ tracked, qty }) => tracked.quantity < qty)) {
      throw new Error("No hay stock suficiente para descontar los productos vendidos");
    }
    const updatedQuantities = new Map<string, number>();
    for (const { tracked, qty } of deductions) {
      if (sb) {
        const { error } = await sb
          .from("inventory_items")
          .update({ quantity: tracked.quantity - qty, updated_at: new Date().toISOString() })
          .eq("id", tracked.id);
        if (error) throw new Error(error.message);
        const { error: movementError } = await sb.from("inventory_movements").insert({
          inventory_item_id: tracked.id,
          delta: -qty,
          reason: "Venta de producto unitario",
          order_id: orderId,
        });
        if (movementError) throw new Error(movementError.message);
      } else {
        const quantity = (updatedQuantities.get(tracked.id) ?? tracked.quantity) - qty;
        updatedQuantities.set(tracked.id, quantity);
        memoryMovements = [makeMovement(tracked, -qty, "Venta de producto unitario", orderId), ...memoryMovements];
      }
    }
    if (!sb && updatedQuantities.size > 0) {
      memoryItems = memoryItems.map((item) => {
        const quantity = updatedQuantities.get(item.id);
        return quantity === undefined ? item : { ...item, quantity, updated_at: new Date().toISOString() };
      });
    }
    persistMock();
  },
};
