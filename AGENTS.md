# La Picá — POS + Menú del Día + App pública

Stack: Next.js 16 App Router, TypeScript, Tailwind v4, Zustand, Sonner, Supabase (Postgres + PostGIS + Realtime).
Idioma: español, corto y directo.

## Estructura
- `frontend/src/app/admin` — Dashboard, `dishes` (catálogo), `menu-builder` (menú día).
- `frontend/src/app/waiter|kitchen|cashier` — Comandas realtime `PENDING->IN_PREPARATION->READY->SERVED->PAID`.
- `frontend/src/app/app` — Pública: `/app` (buscador+mapa), `/app/restaurant/[id]`, `/app/checkout` (pre-pedido → KDS como `PENDING` con nota `PRE-ORDER`).
- `frontend/src/components/ui` — ÚNICOS permitidos: `Button, Modal, Input, Select, Badge, Switch`, toasts `showToast` en `toast.ts`. Prohibido `<button>/<input>` suelto y `alert()`.
- `frontend/src/stores` — `useAdminStore, useOrderStore, useCustomerStore`.
- `frontend/src/services` — `menu.service, order.service, restaurant.service` (todos con fallback mock si no hay Supabase).
- `backend/*.sql` — Migraciones. `001` base, `002` columnas app + RPC `nearby_tenants`.

## Reglas
- Paleta `#E65100` CTA / `#2E7D32` éxito-precios. Geist Sans prosa, Geist Mono precios.
- Menú del día = elegir platos de `dishes`, no duplicar. Un `daily_menus` activo por tenant+fecha.
- Realtime en `orders, order_items`. Geolocalización `ST_DWithin` vía RPC `nearby_tenants`.
- Verificación obligatoria: `npx tsc --noEmit` + `npm run build` en `frontend/`. Lockfile: solo npm.

## Comandos
- Dev: `cd frontend && npm install && npm run dev`
- Env: `frontend/.env.local` con `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Sin ellas la app usa mocks.
- DB: aplicar `backend/001_*.sql` y `backend/002_*.sql` en Supabase SQL Editor (orden).
