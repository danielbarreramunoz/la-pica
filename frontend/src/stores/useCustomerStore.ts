"use client";

import { create } from "zustand";

export interface CartLine {
  dish_id: string;
  dish_name: string;
  unit_price: number;
  qty: number;
  notes?: string;
}

interface CustomerState {
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  view: "list" | "map";
  restaurantId: string | null;
  cart: CartLine[];
  customerName: string;
  phone: string;
  eta: string;
  setLocation: (lat: number, lng: number) => void;
  setRadius: (km: number) => void;
  setView: (v: "list" | "map") => void;
  setRestaurant: (id: string | null) => void;
  addToCart: (line: CartLine) => void;
  clearCart: () => void;
  setCustomer: (name: string, phone: string, eta: string) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  lat: null,
  lng: null,
  radiusKm: 3,
  view: "list",
  restaurantId: null,
  cart: [],
  customerName: "",
  phone: "",
  eta: "13:30",
  setLocation: (lat, lng) => set({ lat, lng }),
  setRadius: (radiusKm) => set({ radiusKm }),
  setView: (view) => set({ view }),
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
}));
