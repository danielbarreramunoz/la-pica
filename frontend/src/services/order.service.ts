import { getSupabase } from "@/lib/supabase/client";
import type { OrderStatus } from "@/components/ui/badge";

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
  status: OrderStatus;
  items: OrderItemInput[];
  notes?: string;
  total: number;
  created_at: string;
}

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "IN_PREPARATION",
  IN_PREPARATION: "READY",
  READY: "SERVED",
  SERVED: "PAID",
  PAID: null,
};

// Mock local con polling (fallback si no hay Supabase)
let mockOrders: Order[] = [
  {
    id: "mock-ord-1",
    table_number: 3,
    status: "PENDING",
    items: [{ dish_id: "mock-1", dish_name: "Cazuela de vacuno", qty: 2, unit_price: 5500 }],
    total: 11000,
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
  },
];
const listeners = new Set<(orders: Order[]) => void>();

function emit() {
  listeners.forEach((cb) => cb([...mockOrders]));
}

function calcTotal(items: OrderItemInput[]): number {
  return items.reduce((s, i) => s + i.qty * i.unit_price, 0);
}

export const orderService = {
  async listActive(): Promise<Order[]> {
    const sb = getSupabase();
    if (!sb) return mockOrders.filter((o) => o.status !== "PAID");
    const { data } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .neq("status", "PAID")
      .order("created_at", { ascending: true });
    if (!data) return [];
    return (data as unknown as Order[]).map((o) => ({
      ...o,
      items: Array.isArray((o as unknown as { order_items: unknown }).order_items)
        ? ((o as unknown as { order_items: OrderItemInput[] }).order_items ?? [])
        : o.items ?? [],
    }));
  },

  async createOrder(table_number: number, items: OrderItemInput[], notes?: string): Promise<Order> {
    const total = calcTotal(items);
    const sb = getSupabase();
    if (!sb) {
      const order: Order = {
        id: `mock-ord-${Date.now()}`,
        table_number,
        status: "PENDING",
        items,
        notes,
        total,
        created_at: new Date().toISOString(),
      };
      mockOrders = [...mockOrders, order];
      emit();
      return order;
    }
    const { data: order, error } = await sb
      .from("orders")
      .insert({ table_number, status: "PENDING", total })
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (items.length > 0) {
      await sb.from("order_items").insert(
        items.map((i) => ({ order_id: order.id, dish_id: i.dish_id, qty: i.qty, unit_price: i.unit_price }))
      );
    }
    return { ...(order as Order), items, notes, total };
  },

  async updateOrderStatus(id: string, next: OrderStatus): Promise<Order> {
    const current = mockOrders.find((o) => o.id === id);
    if (current && NEXT_STATUS[current.status] !== next) {
      throw new Error(`Transición inválida ${current.status} -> ${next}`);
    }
    const sb = getSupabase();
    if (!sb) {
      mockOrders = mockOrders.map((o) => (o.id === id ? { ...o, status: next } : o));
      emit();
      return mockOrders.find((o) => o.id === id) as Order;
    }
    const { data, error } = await sb.from("orders").update({ status: next }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data as Order;
  },

  subscribeToOrders(cb: (orders: Order[]) => void): () => void {
    const sb = getSupabase();
    if (!sb) {
      listeners.add(cb);
      cb([...mockOrders]);
      const timer = setInterval(() => cb([...mockOrders]), 3000);
      return () => {
        listeners.delete(cb);
        clearInterval(timer);
      };
    }
    const channel = sb
      .channel("orders:all")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async () => {
        cb(await this.listActive());
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, async () => {
        cb(await this.listActive());
      })
      .subscribe();
    this.listActive().then(cb).catch(() => undefined);
    return () => {
      sb.removeChannel(channel);
    };
  },
};
