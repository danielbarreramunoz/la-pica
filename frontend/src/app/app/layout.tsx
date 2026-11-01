import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/app" className="rounded-xl focus-visible:outline-none" aria-label="La Picá — buscar picadas">
            <Logo size={38} priority />
          </Link>
          <nav className="flex gap-1 font-sans text-sm font-medium">
            <Link
              className="rounded-xl px-3 py-2.5 text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
              href="/app"
            >
              Buscar
            </Link>
            <Link
              className="rounded-xl px-3 py-2.5 text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
              href="/app/checkout"
            >
              Pre-pedido
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
