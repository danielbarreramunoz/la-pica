"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Restaurant } from "@/services/restaurant.service";

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const PIN_CSS = `
@keyframes pin-pulse {
  0% { transform: scale(0.5); opacity: 0.7; }
  80%, 100% { transform: scale(2.1); opacity: 0; }
}
@keyframes pin-beat {
  0%, 100% { transform: translateX(-50%) scale(1); }
  25% { transform: translateX(-50%) scale(1.1); }
  50% { transform: translateX(-50%) scale(1); }
}
.pin-wrap { position: relative; display: block; width: 36px; height: 44px; }
.pin-aura {
  position: absolute; left: 50%; top: 16px; width: 32px; height: 32px;
  margin: -16px 0 0 -16px; border-radius: 9999px;
  border: 3px solid rgba(230, 81, 0, 0.6); background: transparent;
  animation: pin-pulse 2s ease-out infinite;
}
.pin-aura-2 { animation-delay: 1s; }
.pin-core {
  position: absolute; left: 50%; top: 0; transform: translateX(-50%);
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 9999px;
  border: 3px solid #fff; background: #e65100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  animation: pin-beat 2s ease-in-out infinite;
}
.pin-dot { width: 10px; height: 10px; border-radius: 9999px; background: #2e7d32; }
.pin-selected { box-shadow: 0 0 0 3px #2e7d32, 0 2px 8px rgba(0, 0, 0, 0.35); }
@media (prefers-reduced-motion: reduce) {
  .pin-aura { animation: none; opacity: 0; }
  .pin-core { animation: none; }
}
`;

function brandPin(selected: boolean): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -40],
    html: `<span class="pin-wrap"><span class="pin-aura"></span><span class="pin-aura pin-aura-2"></span><span class="pin-core${selected ? " pin-selected" : ""}"><span class="pin-dot"></span></span></span>`,
  });
}

const userDot = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4);"></span>`,
});

export default function ClientMap({
  lat,
  lng,
  restaurants,
  selectedId,
  onSelect,
}: {
  lat: number;
  lng: number;
  restaurants: Restaurant[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tilesRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const zoomRef = useRef<L.Control.Zoom | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Crear el mapa una sola vez (con cleanup para StrictMode)
  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, { scrollWheelZoom: false, zoomControl: false }).setView([lat, lng], 14);
    zoomRef.current = L.control.zoom({ position: "bottomright" }).addTo(map);
    tilesRef.current = L.tileLayer(TILES, { attribution: ATTR, maxZoom: 19 }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      tilesRef.current = null;
      markersRef.current = null;
      zoomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tema de tiles (mismo raster OSM; en dark se invierte por CSS en globals.css)

  // Vista sigue a la ubicación
  useEffect(() => {
    mapRef.current?.setView([lat, lng], Math.max(mapRef.current.getZoom(), 14));
  }, [lat, lng]);

  // Marcadores (+ reasegura zoom abajo-derecha ante hot-reload parcial)
  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;
    zoomRef.current?.remove();
    zoomRef.current = L.control.zoom({ position: "bottomright" }).addTo(map);
    group.clearLayers();
    L.marker([lat, lng], { icon: userDot }).addTo(group);
    restaurants.forEach((r) => {
      L.marker([r.lat, r.lng], { icon: brandPin(selectedId === r.id) })
        .on("click", () => onSelectRef.current?.(r.id))
        .addTo(group);
    });
  }, [restaurants, selectedId, lat, lng]);

  return (
    <div ref={divRef} className="h-full w-full">
      <style>{PIN_CSS}</style>
    </div>
  );
}
