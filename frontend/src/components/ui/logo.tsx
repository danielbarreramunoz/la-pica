import Image from "next/image";

interface LogoProps {
  size?: number;
  showText?: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * Logo oficial La Picá — pin naranjo + plato verde.
 * El PNG ya incluye el texto "La Picá", por eso `showText`
 * solo agrega el subtítulo "Menú del día" cuando se pide.
 */
export function Logo({ size = 36, showText = false, priority = false, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo-la-pica-pin-plato.png"
        alt="La Picá"
        width={320}
        height={320}
        priority={priority}
        style={{ height: size, width: "auto" }}
        className="rounded-none shadow-none ring-0"
      />
      {showText ? (
        <span className="leading-none">
          <span className="mt-0.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-stone-500">
            Menú del día
          </span>
        </span>
      ) : null}
    </span>
  );
}

export default Logo;
