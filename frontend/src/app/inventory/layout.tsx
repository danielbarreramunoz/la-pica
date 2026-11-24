import { EmployeeShell } from "@/components/auth/EmployeeShell";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["mesero", "cocina", "caja", "admin"]}>
      <EmployeeShell allow={["mesero", "cocina", "caja", "admin"]}>{children}</EmployeeShell>
    </RoleGuard>
  );
}
