import { RoleGuard } from "@/components/auth/RoleGuard";
import { EmployeeShell } from "@/components/auth/EmployeeShell";

export const instant = false;

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["caja", "admin"]}>
      <EmployeeShell allow={["caja", "admin"]}>{children}</EmployeeShell>
    </RoleGuard>
  );
}
