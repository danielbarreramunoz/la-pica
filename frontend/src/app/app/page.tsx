"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { restaurantService, type Restaurant } from "@/services/restaurant.service";
import { showToast } from "@/components/ui/toast";

// Centro por defecto: Quilicura (para demo con mocks)
const DEFAULT_LAT = -33.3622;
const DEFAULT_LNG = -70.7244;

function fmtDist(m?: number): string {
  if (m === undefined) return "—";
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function PublicSearchPage() {
  const { lat, lng, setLocation, radiusKm, setRadius, view, setView, setRestaurant } = useCustomerStore();
  const [list, setList] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const curLat = lat ?? DEFAULT_LAT;
  const curLng = lng ?? DEFAULT_LNG;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await restaurantService.getNearbyRestaurants(curLat, curLng, radiusKm);
      setList(res);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curLat, curLng, radiusKm]);

  function useGps() {
    if (!navigator.geolocation) {
      showToast.error("GPS no disponible");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocation(p.coords.latitude, p.coords.longitude);
        showToast.success("Ubicación actualizada");
      },
      () => showToast.error("No se pudo obtener ubicación"),
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
      <h1 className="font-sans text-2xl font-bold">Picadas cercanas</h1>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <p className="mb-1 font-sans text-xs text-stone-500">Radio</p>
          <Select value={String(radiusKm)} onChange={(e) => setRadius(Number(e.target.value))}>
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
          </Select>
        </div>
        <Button variant="secondary" onClick={useGps}>
          Usar mi ubicación
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm">Lista / Mapa</span>
          <Switch checked={view === "map"} onChange={(v) => setView(v ? "map" : "list")} label="Mapa" />
        </div>
      </div>

      {loading ? <p className="font-sans text-sm text-stone-500">Buscando picadas…</p> : null}

      {view === "map" ? (
        <div className="relative h-80 overflow-hidden rounded-xl border border-stone-200 bg-[#dbe9d4]">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-0 top-1/3 h-8 w-full bg-white/70" />
            <div className="absolute left-1/3 top-0 h-full w-8 bg-white/70" />
          </div>
          {list.map((r, i) => (
            <div
              key={r.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${15 + i * 25}%`, top: `${25 + (i % 2) * 30}%` }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#E65100] shadow-lg">
                <span className="h-3 w-3 rounded-full bg-[#2E7D32]" />
              </span>
              <span className="mt-1 rounded bg-white px-2 py-0.5 font-sans text-xs font-semibold shadow">
                {r.name}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <div className="flex h-28 items-center justify-center bg-stone-100 font-sans text-sm text-stone-400">
              Foto portada
            </div>
            <div className="p-4">
              <p className="font-sans text-base font-bold">{r.name}</p>
              <p className="font-mono text-xs text-stone-500">{fmtDist(r.distance_m)} · {r.address}</p>
              {r.featured ? (
                <p className="mt-2 font-sans text-sm">
                  Destacado: {r.featured.name}{" "}
                  <span className="font-mono font-bold text-[#2E7D32]">
                    ${r.featured.price.toLocaleString("es-CL")}
                  </span>
                </p>
              ) : null}
              <Link href={`/app/restaurant/${r.id}`} onClick={() => setRestaurant(r.id)}>
                <Button className="mt-3 w-full bg-[#E65100]">Ver Menú de Hoy</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && !loading ? (
        <p className="font-sans text-sm text-stone-500">Sin picadas en este radio. Prueba 5 km.</p>
      ) : null}
    </div>
  );
}
