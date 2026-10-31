import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export type DishCategory = "Entrada" | "Fondo" | "Postre" | "Bebestible";

export interface Dish {
  id: string;
  tenant_id?: string;
  name: string;
  description: string;
  category: DishCategory;
  base_price: number;
  image_url?: string;
  is_active: boolean;
}

export interface DailyMenuItem {
  daily_menu_id: string;
  dish_id: string;
  stock: number;
  is_featured?: boolean;
  promo_price?: number | null;
}

export interface DailyMenu {
  id: string;
  tenant_id?: string;
  date: string;
  is_active: boolean;
  items: DailyMenuItem[];
}

// Mock elegante si no hay Supabase (testing local)
const mockDishes: Dish[] = [
  { id: "mock-1", name: "Cazuela de vacuno", description: "Caldo casero con choclo y zapallo", category: "Fondo", base_price: 5500, is_active: true },
  { id: "mock-2", name: "Sopaipillas", description: "Con pebre de la casa", category: "Entrada", base_price: 2500, is_active: true },
  { id: "mock-3", name: "Mote con huesillo", description: "Clásico chileno bien helado", category: "Bebestible", base_price: 2000, is_active: true },
  { id: "mock-4", name: "Leche asada", description: "Postre casero con caramelo", category: "Postre", base_price: 2800, is_active: false },
];

const mockMenus: Record<string, DailyMenu> = {};

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export const menuService = {
  useMock(): boolean {
    return !isSupabaseConfigured || !getSupabase();
  },

  async listDishes(): Promise<Dish[]> {
    const sb = getSupabase();
    if (!sb) return [...mockDishes];
    const { data, error } = await sb.from("dishes").select("*").order("name");
    if (error) return [...mockDishes];
    return (data ?? []) as Dish[];
  },

  async createDish(input: Omit<Dish, "id">): Promise<Dish> {
    const sb = getSupabase();
    const created: Dish = { ...input, id: `mock-${Date.now()}` };
    if (!sb) {
      mockDishes.push(created);
      return created;
    }
    const { data, error } = await sb.from("dishes").insert(input).select().single();
    if (error) throw new Error(error.message);
    return data as Dish;
  },

  async updateDish(id: string, patch: Partial<Dish>): Promise<Dish> {
    const sb = getSupabase();
    if (!sb) {
      const i = mockDishes.findIndex((d) => d.id === id);
      if (i >= 0) mockDishes[i] = { ...mockDishes[i], ...patch };
      return mockDishes[i];
    }
    const { data, error } = await sb.from("dishes").update(patch).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data as Dish;
  },

  async getDailyMenu(date: string = todayKey()): Promise<DailyMenu> {
    const sb = getSupabase();
    if (!sb) {
      if (!mockMenus[date]) {
        mockMenus[date] = {
          id: `menu-${date}`,
          date,
          is_active: true,
          items: mockDishes
            .filter((d) => d.is_active)
            .slice(0, 3)
            .map((d) => ({ daily_menu_id: `menu-${date}`, dish_id: d.id, stock: 20 })),
        };
      }
      return mockMenus[date];
    }
    const { data: menu } = await sb.from("daily_menus").select("*").eq("date", date).maybeSingle();
    if (!menu) return { id: "", date, is_active: true, items: [] };
    const { data: items } = await sb.from("daily_menu_items").select("*").eq("daily_menu_id", menu.id);
    return { ...(menu as DailyMenu), items: (items ?? []) as DailyMenuItem[] };
  },

  async saveDailyMenu(
    date: string,
    dishIds: string[],
    opts?: { featuredDishId?: string | null; promoPrice?: number | null }
  ): Promise<DailyMenu> {
    const sb = getSupabase();
    if (!sb) {
      const menu: DailyMenu = {
        id: `menu-${date}`,
        date,
        is_active: true,
        items: dishIds.map((dish_id) => ({
          daily_menu_id: `menu-${date}`,
          dish_id,
          stock: 20,
          is_featured: dish_id === opts?.featuredDishId,
          promo_price: dish_id === opts?.featuredDishId ? opts?.promoPrice ?? null : null,
        })),
      };
      mockMenus[date] = menu;
      return menu;
    }
    // Upsert daily_menus por (tenant+date): simplificado a date para demo single-tenant
    const { data: menu, error } = await sb
      .from("daily_menus")
      .upsert({ date, is_active: true }, { onConflict: "tenant_id,date" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await sb.from("daily_menu_items").delete().eq("daily_menu_id", menu.id);
    if (dishIds.length > 0) {
      const rows = dishIds.map((dish_id) => ({
        daily_menu_id: menu.id,
        dish_id,
        stock: 20,
      }));
      const { error: itemsError } = await sb.from("daily_menu_items").insert(rows);
      if (itemsError) throw new Error(itemsError.message);
    }
    return this.getDailyMenu(date);
  },
};
