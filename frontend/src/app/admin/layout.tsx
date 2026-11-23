import { RoleGuard } from "@/components/auth/RoleGuard";
import { EmployeeShell } from "@/components/auth/EmployeeShell";

export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["admin"]}>
      <EmployeeShell allow={["admin"]}>{children}</EmployeeShell>
    </RoleGuard>
  );
}
