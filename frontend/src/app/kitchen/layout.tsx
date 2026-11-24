import { RoleGuard } from "@/components/auth/RoleGuard";
import { EmployeeShell } from "@/components/auth/EmployeeShell";

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["cocina", "admin"]}>
      <EmployeeShell allow={["cocina", "admin"]}>{children}</EmployeeShell>
    </RoleGuard>
  );
}
