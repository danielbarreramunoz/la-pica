# Reglas de dominio — La Picá POS + Menú del Día

## 1. Flujo de comandas (máquina de estados)
```
PENDING -> IN_PREPARATION -> READY -> SERVED -> PAID
```
- Sin saltos ni retornos (solo avance lineal).
- `Badge` visual por estado. Cambio emite evento Realtime.
- Solo Caja puede marcar `PAID`.

## 2. Menú del Día
- Catálogo maestro: tabla `dishes` (por `tenant_id`).
- Selector rápido: `daily_menus` + `daily_menu_items(daily_menu_id, dish_id)`.
- Un `daily_menus` activo por `tenant_id` + `date`.
- Crear menú = elegir platos existentes, no duplicar fichas.

## 3. Sincronización en tiempo real
- Supabase Realtime para `orders` y `order_items`.
- Canales: `orders:tenant_id=<uuid>`.
- Roles: Mesero crea (PENDING), Cocina avanza a IN_PREPARATION/READY, Caja cierra a SERVED/PAID.

## 4. Geolocalización
- `tenants.location geography(Point,4326)` con extensión `postgis`.
- Búsqueda: `ST_DWithin(location, ST_MakePoint(lng,lat)::geography, radio_m)`.
- Índice `GIST(location)`. Frontend pide permiso GPS solo en vista mapa.
