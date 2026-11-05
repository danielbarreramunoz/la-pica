# Design System — La Picá (obligatorio)

## 1. Paleta
- Primary Naranja Picá: `#E65100` (CTA, acciones principales, logo plato).
  Tokens: `pica-50 #FFF3EC`, `pica-100 #FFE4D3`, `pica-300 #FF8A3D`, `pica-400 #FF6A1A`, `pica-500 #E65100`, `pica-600 #C74800`, `pica-700 #BF4300`.
  En dark se mantiene `pica-500` (contrasta bien sobre fondo oscuro).
- Secondary Verde Hoja: `#2E7D32` (confirmaciones, cocina lista, éxito).
  Tokens: `hoja-50 #EDF5EE`, `hoja-100 #D7E9D9`, `hoja-300 #7CC47F`, `hoja-500 #2E7D32`, `hoja-600 #276A2B`, `hoja-700 #245F27`.
  En dark usar `hoja-300 #7CC47F` para texto sobre fondo oscuro (el `hoja-500` no contrasta).
- Superficies: light `bg-stone-50` fondo / `bg-white` tarjetas / `text-stone-900` / `border-stone-200`.
  Dark `dark:bg-stone-900` fondo / `dark:bg-stone-800` tarjetas / `dark:text-stone-100` / `dark:border-stone-700`.
  Texto secundario: `text-stone-600` → `dark:text-stone-400`; `text-stone-700/800` → `dark:text-stone-300/200`.
- Estados comanda: PENDING ámbar, IN_PREPARATION azul, READY verde, SERVED violeta, PAID gris.
  Cada `Badge` lleva variante dark (`-950` fondo / `-300` texto / `-800` borde), READY usa `hoja-300`.
- Modo oscuro: clase `.dark` en `<html>` (Tailwind v4 `@custom-variant dark`), `color-scheme` light/dark,
  `useThemeStore` (persist `lapica-theme`) + `<ThemeToggle />` global fijo arriba-derecha (`fixed right-4 top-4 z-50`,
  `Button` ghost circular con icono luna/sol) + script pre-pintado en `layout.tsx`.
  Cocina KDS responde al tema igual que el resto (no forzar solo-oscuro).

## 2. Tipografía
- Prosa: Geist Sans (`font-sans`).
- Precios/cantidades: Geist Mono (`font-mono`, tabular-nums).
- Cargar vía `geist/font` en Next.js.

## 3. Componentes base (REGLA ESTRICTA)
- Usar exclusivamente `@/components/ui/` : `Button`, `Modal`, `Badge`, `Input`, `Select`.
- Prohibido: `<button>`, `<input>` nativos sueltos o `alert()` de JS.
- Toasts vía `sonner` (`toast.ts` + `<Toaster />`).
- Estilos con Tailwind CSS v4 (`@import "tailwindcss"`).

## 4. Identidad visual
- Logo minimalista: pin de mapa integrado sobre plato circular.
- Naranja `#E65100` plato/borde, pin verde `#2E7D32` al centro.
- Uso en header, favicon y splash PWA mesero/cocina.
