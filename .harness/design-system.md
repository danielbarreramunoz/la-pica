# Design System — La Picá (obligatorio)

## 1. Paleta
- Primary Naranja Picá: `#E65100` (CTA, acciones principales, logo plato).
- Secondary Verde Hoja: `#2E7D32` (confirmaciones, cocina lista, éxito).
- Fondos Neutros: `bg-stone-50 / stone-100` claro, `stone-900` oscuro, texto `stone-800 / stone-100`.
- Estados comanda: PENDING ámbar, IN_PREPARATION azul, READY verde, SERVED violeta, PAID gris.

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
