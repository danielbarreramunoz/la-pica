"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  dish_id: string;
  dish_name: string;
  unit_price: number;
  qty: number;
  notes?: string;
}

export interface CustomerOrder {
  id: string;
  restaurantId: string | null;
  customerName: string;
  phone: string;
  eta: string;
  items: CartLine[];
  total: number;
  status: "PENDING" | "IN_PREPARATION" | "READY" | "SERVED" | "PAID";
  createdAt: string;
}

interface CustomerState {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  restaurantId: string | null;
  cart: CartLine[];
  customerName: string;
  phone: string;
  eta: string;
  query: string;
  orderHistory: CustomerOrder[];
  setLocation: (lat: number, lng: number) => void;
  setRadius: (km: number) => void;
  setRestaurant: (id: string | null) => void;
  addToCart: (line: CartLine) => void;
  clearCart: () => void;
  setCustomer: (name: string, phone: string, eta: string) => void;
  setQuery: (q: string) => void;
  saveOrder: (order: CustomerOrder) => void;
  updateOrderStatus: (id: string, status: CustomerOrder["status"]) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      radiusKm: 3,
      restaurantId: null,
      cart: [],
      customerName: "",
      phone: "",
      eta: "13:30",
      query: "",
      orderHistory: [],
      setLocation: (lat, lng) => set({ lat, lng }),
      setRadius: (radiusKm) => set({ radiusKm }),
      setRestaurant: (restaurantId) => set({ restaurantId }),
      addToCart: (line) =>
        set((s) => {
          const i = s.cart.findIndex((c) => c.dish_id === line.dish_id && (c.notes ?? "") === (line.notes ?? ""));
          if (i >= 0) {
            const cart = [...s.cart];
            cart[i] = { ...cart[i], qty: cart[i].qty + line.qty };
            return { cart };
          }
          return { cart: [...s.cart, line] };
        }),
      clearCart: () => set({ cart: [] }),
      setCustomer: (customerName, phone, eta) => set({ customerName, phone, eta }),
      setQuery: (query) => set({ query }),
      saveOrder: (order) =>
        set((state) => ({
          orderHistory: [order, ...state.orderHistory.filter((current) => current.id !== order.id)].slice(0, 50),
        })),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orderHistory: state.orderHistory.map((order) => order.id === id ? { ...order, status } : order),
        })),
    }),
    { name: "lapica-customer-device" }
  )
);
