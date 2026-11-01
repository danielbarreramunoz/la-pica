import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * Logo oficial La Picá — plato con cubiertos.
 * El PNG oficial tiene fondo negro: se presenta dentro de un
 * contenedor redondeado oscuro para que no rompa proporciones
 * sobre fondos claros (bg-stone-50 / blanco).
 */
export function Logo({ size = 36, showText = true, priority = false, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-950 shadow-sm ring-1 ring-stone-900/10"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <Image
          src="/images/lapica_png.png"
          alt=""
          width={160}
          height={160}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </span>
      {showText ? (
        <span className="leading-none">
          <span className="block font-sans text-lg font-bold tracking-tight text-stone-900">
            La Picá
          </span>
          <span className="mt-0.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-stone-500">
            Menú del día
          </span>
        </span>
      ) : null}
    </span>
  );
}

export default Logo;
