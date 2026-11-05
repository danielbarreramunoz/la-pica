import { RoleGuard } from "@/components/auth/RoleGuard";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={["caja", "admin"]}>{children}</RoleGuard>;
}
