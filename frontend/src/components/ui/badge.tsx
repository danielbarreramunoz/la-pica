export type OrderStatus = "PENDING" | "IN_PREPARATION" | "READY" | "SERVED" | "PAID";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  IN_PREPARATION: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
  READY: "bg-green-100 text-green-900 border-green-300 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
  SERVED: "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950 dark:text-violet-200 dark:border-violet-800",
  PAID: "bg-stone-100 text-stone-600 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-600",
};

const labels: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  IN_PREPARATION: "Preparando",
  READY: "Listo",
  SERVED: "Servido",
  PAID: "Pagado",
};

const dots: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500",
  IN_PREPARATION: "bg-sky-500",
  READY: "bg-green-600",
  SERVED: "bg-violet-500",
  PAID: "bg-stone-400",
};

export function Badge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold font-mono uppercase tracking-wide tabular-nums ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} aria-hidden="true" />
      {labels[status]}
    </span>
  );
}
