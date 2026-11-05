"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Select } from "@/components/ui/select";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { restaurantService, type Restaurant } from "@/services/restaurant.service";
import { showToast } from "@/components/ui/toast";

const ClientMap = dynamic(() => import("@/components/app/client-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone-100 font-sans text-sm text-stone-500 dark:bg-stone-800 dark:text-stone-400">
      Cargando mapa…
    </div>
  ),
});

// Centro por defecto: Quilicura (para demo con mocks)
const DEFAULT_LAT = -33.3622;
const DEFAULT_LNG = -70.7244;

function fmtDist(m?: number): string {
  if (m === undefined) return "—";
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

function GpsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path d="M12 17a5 5 0 100-10 5 5 0 000 10z" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function PublicSearchPage() {
  const { lat, lng, setLocation, radiusKm, setRadius, setRestaurant, query } = useCustomerStore();
  const [list, setList] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const curLat = lat ?? DEFAULT_LAT;
  const curLng = lng ?? DEFAULT_LNG;

  useEffect(() => {
    (async () => {
      const res = await restaurantService.getNearbyRestaurants(curLat, curLng, radiusKm);
      setList(res);
    })();
  }, [curLat, curLng, radiusKm]);

  // Toma la ubicación actual al entrar (móvil primero)
  useEffect(() => {
    if (lat !== null || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setLocation(p.coords.latitude, p.coords.longitude),
      undefined,
      { enableHighAccuracy: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q));
  }, [list, query]);

  const selected = selectedId ? filtered.find((r) => r.id === selectedId) ?? null : null;

  function handleSelect(id: string) {
    setSelectedId(id);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setSelectedId(null);
  }

  return (
    <div>
      {/* Solo mapa a pantalla completa; al tocar un pin sube la ficha */}
      <div className="relative h-[calc(100dvh-4rem)] w-full">
        <ClientMap
          lat={curLat}
          lng={curLng}
          restaurants={filtered}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <div className="absolute bottom-4 left-4 z-[500] flex flex-col gap-2">
          <Select
            value={String(radiusKm)}
            onChange={(e) => setRadius(Number(e.target.value))}
            aria-label="Radio de búsqueda"
            className="w-24 shadow-md"
          >
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={useGps}
            aria-label="Usar mi ubicación"
            title="Usar mi ubicación"
            className="rounded-full! border border-stone-200 bg-white/90 px-2.5! shadow-md backdrop-blur dark:border-stone-700 dark:bg-stone-800/90"
          >
            <GpsIcon />
          </Button>
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={closeSheet} title={selected?.name ?? "Picada"}>
        {selected ? (
          <div className="space-y-2 pb-2">
            {selected.cover_url ? (
              <div className="relative h-36 w-full overflow-hidden rounded-xl">
                <Image
                  src={selected.cover_url}
                  alt={`Foto de ${selected.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 512px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-36 w-full items-center justify-center rounded-xl bg-stone-100 font-sans text-sm font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                Sin foto
              </div>
            )}
            <p className="font-mono text-xs font-medium tabular-nums text-stone-700 dark:text-stone-300">
              {fmtDist(selected.distance_m)} · {selected.address}
            </p>
            <p className="font-sans text-sm text-stone-600 dark:text-stone-400">Colación: {selected.lunch_hours}</p>
            {selected.featured ? (
              <p className="font-sans text-sm">
                Destacado: {selected.featured.name}{" "}
                <span className="font-mono font-bold text-[#2E7D32] dark:text-[#7cc47f]">
                  ${selected.featured.price.toLocaleString("es-CL")}
                </span>
              </p>
            ) : null}
            <Link href={`/app/restaurant/${selected.id}`} onClick={() => setRestaurant(selected.id)}>
              <Button className="mt-2 w-full bg-[#E65100]">Ver Menú de Hoy</Button>
            </Link>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
