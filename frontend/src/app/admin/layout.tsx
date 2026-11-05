import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["admin"]}>
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 dark:bg-stone-900 dark:text-stone-100">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur dark:border-stone-700 dark:bg-stone-900/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="rounded-xl focus-visible:outline-none" aria-label="La Picá Admin">
            <Logo size={38} priority />
          </Link>
          <nav className="flex items-center gap-1 font-sans text-sm font-medium">
            <Link
              className="rounded-xl px-3 py-2.5 text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              href="/admin"
            >
              Dashboard
            </Link>
            <Link
              className="rounded-xl px-3 py-2.5 text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              href="/admin/dishes"
            >
              Platos
            </Link>
            <Link
              className="rounded-xl px-3 py-2.5 text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              href="/admin/menu-builder"
            >
              Menú del día
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
    </RoleGuard>
  );
}
