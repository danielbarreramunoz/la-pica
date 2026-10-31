"use client";

import { create } from "zustand";
import { orderService, type Order } from "@/services/order.service";

interface OrderState {
  orders: Order[];
  loading: boolean;
  setOrders: (orders: Order[]) => void;
  upsertOrder: (order: Order) => void;
  setLoading: (v: boolean) => void;
  startRealtime: () => () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  setOrders: (orders) => set({ orders }),
  upsertOrder: (order) =>
    set((s) => {
      const exists = s.orders.some((o) => o.id === order.id);
      return {
        orders: exists ? s.orders.map((o) => (o.id === order.id ? order : o)) : [...s.orders, order],
      };
    }),
  setLoading: (loading) => set({ loading }),
  startRealtime: () => {
    const unsub = orderService.subscribeToOrders((orders) => set({ orders }));
    return unsub;
  },
}));
