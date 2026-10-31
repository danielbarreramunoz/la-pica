import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E65100] text-white">
              <span className="h-3 w-3 rounded-full bg-[#2E7D32]" />
            </span>
            <span className="font-sans text-lg font-bold">La Picá · Admin</span>
          </div>
          <nav className="flex gap-2 font-sans text-sm">
            <Link className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/admin">
              Dashboard
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/admin/dishes">
              Platos
            </Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-stone-100" href="/admin/menu-builder">
              Menú del día
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
