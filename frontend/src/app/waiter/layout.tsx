import { RoleGuard } from "@/components/auth/RoleGuard";
import { EmployeeShell } from "@/components/auth/EmployeeShell";

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["mesero", "admin"]}>
      <EmployeeShell allow={["mesero", "admin"]}>{children}</EmployeeShell>
    </RoleGuard>
  );
}
