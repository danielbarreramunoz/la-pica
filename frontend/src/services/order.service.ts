import { getSupabase } from "@/lib/supabase/client";
import { inventoryService } from "@/services/inventory.service";
import type { OrderStatus } from "@/components/ui/badge";
import { useCustomerStore } from "@/stores/useCustomerStore";

export type { OrderStatus };

export interface OrderItemInput {
  dish_id: string;
  dish_name: string;
  qty: number;
  unit_price: number;
  notes?: string;
}

export interface Order {
  id: string;
  table_number: number;
  seat_number?: number | null;
  party_size?: number | null;
  status: OrderStatus;
  items: OrderItemInput[];
  notes?: string;
  total: number;
  tip_amount?: number;
  payment_method?: string;
  customer_name?: string;
  customer_phone?: string;
  eta?: string;
  created_at: string;
}

export interface CreateOrderOptions {
  seat_number?: number;
  party_size?: number;
  customer_name?: string;
  customer_phone?: string;
  eta?: string;
  tenant_id?: string;
}

export interface PaymentDetails {
  tip_amount?: number;
  payment_method?: string;
}

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "IN_PREPARATION",
  IN_PREPARATION: "READY",
  READY: "SERVED",
  SERVED: "PAID",
  PAID: null,
};

const STORAGE_KEY = "lapica-orders-mock";
const initialOrders: Order[] = [
  {
    id: "mock-ord-1",
    table_number: 3,
    seat_number: 1,
    status: "PENDING",
    items: [{ dish_id: "mock-1", dish_name: "Cazuela de vacuno", qty: 2, unit_price: 5500 }],
    total: 11000,
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
  },
];

let mockOrders: Order[] = initialOrders;
let loaded = false;
const listeners = new Set<(orders: Order[]) => void>();

function ensureMockLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) mockOrders = JSON.parse(stored) as Order[];
  } catch {
    mockOrders = initialOrders;
  }
}

function saveMockOrders() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
  } catch {
    // La app sigue funcionando en memoria si el navegador bloquea localStorage.
  }
}

function emit() {
  saveMockOrders();
  listeners.forEach((callback) => callback([...mockOrders]));
}

function calcTotal(items: OrderItemInput[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
}

function mapDatabaseOrder(row: Record<string, unknown>): Order {
  const rawItems = Array.isArray(row.order_items) ? row.order_items as Record<string, unknown>[] : [];
  return {
    ...(row as unknown as Order),
    items: rawItems.map((item) => ({
      dish_id: String(item.dish_id ?? ""),
      dish_name: String(item.dish_name ?? (item.dishes as { name?: string } | null)?.name ?? "Producto"),
      qty: Number(item.qty ?? 0),
      unit_price: Number(item.unit_price ?? 0),
      notes: typeof item.notes === "string" ? item.notes : undefined,
    })),
  };
}

async function getDefaultTenantId(): Promise<string> {
  const sb = getSupabase();
  if (!sb) return "mock-tenant";
  const { data, error } = await sb.from("tenants").select("id").order("created_at").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Crea primero la picada en la base de datos");
  return String(data.id);
}

export const orderService = {
  async listActive(): Promise<Order[]> {
    return (await this.listAll()).filter((order) => order.status !== "PAID");
  },

  async listAll(): Promise<Order[]> {
    ensureMockLoaded();
    const sb = getSupabase();
    if (!sb) return [...mockOrders].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const { data, error } = await sb
      .from("orders")
      .select("*, order_items(*, dishes(name))")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => mapDatabaseOrder(row as unknown as Record<string, unknown>));
  },

  async createOrder(
    table_number: number,
    items: OrderItemInput[],
    notes?: string,
    options: CreateOrderOptions = {}
  ): Promise<Order> {
    ensureMockLoaded();
    const total = calcTotal(items);
    const sb = getSupabase();
    if (!sb) {
      const order: Order = {
        id: `mock-ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        table_number,
        seat_number: options.seat_number ?? null,
        party_size: options.party_size ?? null,
        status: "PENDING",
        items,
        notes,
        total,
        customer_name: options.customer_name,
        customer_phone: options.customer_phone,
        eta: options.eta,
        created_at: new Date().toISOString(),
      };
      mockOrders = [order, ...mockOrders];
      emit();
      return order;
    }

    const tenant_id = options.tenant_id ?? await getDefaultTenantId();
    const { data: order, error } = await sb
      .from("orders")
      .insert({
        tenant_id,
        table_number,
        seat_number: options.seat_number ?? null,
        party_size: options.party_size ?? null,
        status: "PENDING",
        total,
        notes,
        customer_name: options.customer_name,
        customer_phone: options.customer_phone,
        eta: options.eta,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (items.length > 0) {
      const { error: itemsError } = await sb.from("order_items").insert(
        items.map((item) => ({
          order_id: order.id,
          dish_id: item.dish_id,
          dish_name: item.dish_name,
          qty: item.qty,
          unit_price: item.unit_price,
          notes: item.notes,
        }))
      );
      if (itemsError) throw new Error(itemsError.message);
    }
    return {
      ...(order as Order),
      seat_number: options.seat_number ?? null,
      items,
      notes,
      total,
      customer_name: options.customer_name,
      customer_phone: options.customer_phone,
      eta: options.eta,
    };
  },

  async updateOrderStatus(id: string, next: OrderStatus, payment: PaymentDetails = {}): Promise<Order> {
    ensureMockLoaded();
    let current = mockOrders.find((order) => order.id === id);
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from("orders")
        .select("*, order_items(*, dishes(name))")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      current = mapDatabaseOrder(data as unknown as Record<string, unknown>);
    }
    if (current && NEXT_STATUS[current.status] !== next) throw new Error(`Transición inválida ${current.status} -> ${next}`);
    if (current && next === "PAID" && !(await inventoryService.canSell(current.items))) {
      throw new Error("No hay stock suficiente para cerrar esta venta");
    }

    let updated: Order;
    if (!sb) {
      if (!current) throw new Error("No se encontró la comanda");
      updated = {
        ...current,
        status: next,
        ...(next === "PAID" ? { tip_amount: payment.tip_amount ?? 0, payment_method: payment.payment_method ?? "Efectivo" } : {}),
      };
      mockOrders = mockOrders.map((order) => order.id === id ? updated : order);
      emit();
    } else {
      const { data, error } = await sb
        .from("orders")
        .update({
          status: next,
          ...(next === "PAID" ? {
            tip_amount: payment.tip_amount ?? 0,
            payment_method: payment.payment_method ?? "Efectivo",
          } : {}),
        })
        .eq("id", id)
        .select("*, order_items(*, dishes(name))")
        .single();
      if (error) throw new Error(error.message);
      updated = mapDatabaseOrder(data as unknown as Record<string, unknown>);
    }

    useCustomerStore.getState().updateOrderStatus(id, next);
    if (next === "PAID") await inventoryService.consumeSoldItems(updated.items, updated.id);
    return updated;
  },

  subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    ensureMockLoaded();
    const sb = getSupabase();
    if (!sb) {
      listeners.add(callback);
      callback([...mockOrders]);
      const timer = setInterval(() => callback([...mockOrders]), 3000);
      return () => {
        listeners.delete(callback);
        clearInterval(timer);
      };
    }
    const refresh = () => this.listAll().then(callback).catch(() => undefined);
    const channel = sb
      .channel("orders:all")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, refresh)
      .subscribe();
    refresh();
    return () => {
      sb.removeChannel(channel);
    };
  },
};
