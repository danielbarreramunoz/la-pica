"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "cliente" | "mesero" | "cocina" | "caja" | "admin";

export interface MockUser {
  id: string;
  name: string;
  role: Role;
  home: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: "u-cliente", name: "Camila (clienta)", role: "cliente", home: "/app" },
  { id: "u-mesero", name: "Garzón Pedro", role: "mesero", home: "/waiter" },
  { id: "u-cocina", name: "Cocina Ana", role: "cocina", home: "/kitchen" },
  { id: "u-caja", name: "Caja Luis", role: "caja", home: "/cashier" },
  { id: "u-admin", name: "Admin Dani", role: "admin", home: "/admin" },
];

interface SessionState {
  user: MockUser | null;
  login: (id: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      login: (id) => set({ user: MOCK_USERS.find((u) => u.id === id) ?? null }),
      logout: () => set({ user: null }),
    }),
    { name: "lapica-session" }
  )
);
