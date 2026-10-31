import { getSupabase } from "@/lib/supabase/client";
import { menuService, type Dish } from "@/services/menu.service";

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  lunch_hours: string;
  cover_url?: string;
  lat: number;
  lng: number;
  distance_m?: number;
  featured?: { name: string; price: number };
}

export interface RestaurantWithMenu extends Restaurant {
  menu: Dish[];
}

const MOCK: Restaurant[] = [
  {
    id: "ten-quil",
    name: "La Picá Central · Quilicura",
    address: "Av. Manuel Antonio Matta 512, Quilicura",
    lunch_hours: "12:30 – 16:00",
    lat: -33.3622,
    lng: -70.7244,
    featured: { name: "Cazuela de vacuno", price: 5500 },
  },
  {
    id: "ten-rosa",
    name: "Picada Doña Rosa",
    address: "San Pablo 3200, Santiago",
    lunch_hours: "12:00 – 16:30",
    lat: -33.4511,
    lng: -70.6652,
    featured: { name: "Pastel de choclo", price: 6200 },
  },
  {
    id: "ten-huaso",
    name: "El Rincón Huaso",
    address: "Av. Pajaritos 2100, Maipú",
    lunch_hours: "13:00 – 17:00",
    lat: -33.5112,
    lng: -70.7589,
    featured: { name: "Porotos granados", price: 4800 },
  },
];

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export const restaurantService = {
  async getNearbyRestaurants(lat: number, lng: number, radiusKm: number): Promise<Restaurant[]> {
    const sb = getSupabase();
    if (sb) {
      // PostGIS vía RPC `nearby_tenants(lat,lng,radius_m)` -> ST_DWithin(location, ST_MakePoint(lng,lat)::geography, radius_m)
      try {
        const { data, error } = await sb.rpc("nearby_tenants", {
          p_lat: lat,
          p_lng: lng,
          p_radius_m: Math.round(radiusKm * 1000),
        });
        if (!error && Array.isArray(data)) return data as Restaurant[];
      } catch {
        // cae a mock filtrado
      }
    }
    return MOCK.map((r) => ({ ...r, distance_m: Math.round(haversineM(lat, lng, r.lat, r.lng)) }))
      .filter((r) => (r.distance_m ?? 0) <= radiusKm * 1000)
      .sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0));
  },

  async getRestaurantWithDailyMenu(tenantId: string): Promise<RestaurantWithMenu | null> {
    const sb = getSupabase();
    const dishes = await menuService.listDishes();
    if (!sb) {
      const r = MOCK.find((x) => x.id === tenantId) ?? MOCK[0];
      return { ...r, menu: dishes.filter((d) => d.is_active) };
    }
    const { data: tenant } = await sb.from("tenants").select("*").eq("id", tenantId).maybeSingle();
    const today = new Date().toISOString().slice(0, 10);
    const { data: menu } = await sb.from("daily_menus").select("id").eq("tenant_id", tenantId).eq("date", today).maybeSingle();
    let menuDishes = dishes;
    if (menu) {
      const { data: items } = await sb.from("daily_menu_items").select("dish_id").eq("daily_menu_id", (menu as { id: string }).id);
      const ids = new Set(((items ?? []) as { dish_id: string }[]).map((i) => i.dish_id));
      if (ids.size > 0) menuDishes = dishes.filter((d) => ids.has(d.id));
    }
    if (!tenant) return null;
    return {
      id: (tenant as Restaurant).id,
      name: (tenant as Restaurant).name,
      address: (tenant as Restaurant).address ?? "",
      lunch_hours: (tenant as Restaurant).lunch_hours ?? "12:30 – 16:00",
      lat: 0,
      lng: 0,
      menu: menuDishes,
    };
  },
};
