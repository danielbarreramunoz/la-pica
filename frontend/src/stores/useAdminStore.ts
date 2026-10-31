"use client";

import { create } from "zustand";
import type { Dish } from "@/services/menu.service";

interface AdminState {
  dishes: Dish[];
  selectedDate: string;
  selectedDishIds: string[];
  featuredDishId: string | null;
  promoPrice: number | null;
  loading: boolean;
  setDishes: (dishes: Dish[]) => void;
  addDish: (dish: Dish) => void;
  patchDish: (id: string, patch: Partial<Dish>) => void;
  setDate: (date: string) => void;
  toggleDishInMenu: (id: string) => void;
  setFeatured: (id: string | null) => void;
  setPromoPrice: (price: number | null) => void;
  setLoading: (loading: boolean) => void;
  hydrateMenu: (dishIds: string[], featuredId?: string | null, promo?: number | null) => void;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useAdminStore = create<AdminState>((set) => ({
  dishes: [],
  selectedDate: todayKey(),
  selectedDishIds: [],
  featuredDishId: null,
  promoPrice: null,
  loading: false,
  setDishes: (dishes) => set({ dishes }),
  addDish: (dish) => set((s) => ({ dishes: [...s.dishes, dish] })),
  patchDish: (id, patch) =>
    set((s) => ({ dishes: s.dishes.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
  setDate: (date) => set({ selectedDate: date }),
  toggleDishInMenu: (id) =>
    set((s) => ({
      selectedDishIds: s.selectedDishIds.includes(id)
        ? s.selectedDishIds.filter((d) => d !== id)
        : [...s.selectedDishIds, id],
    })),
  setFeatured: (id) => set({ featuredDishId: id }),
  setPromoPrice: (price) => set({ promoPrice: price }),
  setLoading: (loading) => set({ loading }),
  hydrateMenu: (dishIds, featuredId = null, promo = null) =>
    set({ selectedDishIds: dishIds, featuredDishId: featuredId, promoPrice: promo }),
}));
