"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore, type Role } from "@/stores/useSessionStore";

export function RoleGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const user = useSessionStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (!allow.includes(user.role)) router.replace(user.home);
  }, [user, allow, router]);

  if (!user || !allow.includes(user.role)) return null;
  return <>{children}</>;
}
