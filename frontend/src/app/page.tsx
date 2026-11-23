"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { MOCK_USERS, useSessionStore } from "@/stores/useSessionStore";
import { showToast } from "@/components/ui/toast";

export default function Home() {
  const user = useSessionStore((s) => s.user);
  const login = useSessionStore((s) => s.login);
  const [id, setId] = useState(MOCK_USERS[0].id);
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(user.home);
  }, [user, router]);

  function submit() {
    const selected = MOCK_USERS.find((candidate) => candidate.id === id);
    if (!selected) return;
    login(id);
    showToast.success(`Bienvenido, ${selected.name}`);
    router.replace(selected.home);
  }

  return (
    <main className="picada-paper flex min-h-screen flex-col items-center justify-center px-5 py-12 text-stone-900 dark:text-stone-100">
      <div className="picada-card w-full max-w-md overflow-hidden p-0">
        <div className="picada-hero px-7 py-6 text-center sm:px-9">
          <Logo size={86} priority showText={false} className="justify-center" />
          <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#f3b62c]">
            La Picá · Acceso de prueba
          </p>
          <h1 className="mt-1.5 text-3xl text-[#fff8eb]">¿Quién está de turno?</h1>
          <p className="mt-1.5 text-sm text-[#ffe9ce]/85">
            Elige un perfil para entrar directo a su espacio.
          </p>
        </div>
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex flex-wrap justify-center gap-1.5">
            <span className="rounded-full bg-[#f6efe1] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#6b4b35] dark:bg-stone-800 dark:text-stone-300">Menú</span>
            <span className="rounded-full bg-[#f6efe1] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#6b4b35] dark:bg-stone-800 dark:text-stone-300">Comandas</span>
            <span className="rounded-full bg-[#f6efe1] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#6b4b35] dark:bg-stone-800 dark:text-stone-300">Caja</span>
            <span className="rounded-full bg-[#f6efe1] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-[#6b4b35] dark:bg-stone-800 dark:text-stone-300">Inventario</span>
          </div>
          <div className="space-y-3">
            <Select value={id} onChange={(event) => setId(event.target.value)} aria-label="Perfil de prueba">
              {MOCK_USERS.map((mockUser) => (
                <option key={mockUser.id} value={mockUser.id}>
                  {mockUser.name} · {mockUser.role}
                </option>
              ))}
            </Select>
            <Button onClick={submit} size="lg" className="w-full">
              Entrar
            </Button>
          </div>
          <p className="mt-5 text-center text-xs text-stone-500 dark:text-stone-400">
            Acceso simulado para desarrollo. La autenticación real se agregará más adelante.
          </p>
        </div>
      </div>
    </main>
  );
}
