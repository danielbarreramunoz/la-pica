import { RoleGuard } from "@/components/auth/RoleGuard";
import { EmployeeShell } from "@/components/auth/EmployeeShell";

// El acceso simulado se resuelve en el cliente; se omite la validación de
// navegación instantánea para este segmento privado.
export const instant = false;

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["mesero", "admin"]}>
      <EmployeeShell allow={["mesero", "admin"]}>{children}</EmployeeShell>
    </RoleGuard>
  );
}
