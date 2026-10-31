export type OrderStatus = "PENDING" | "IN_PREPARATION" | "READY" | "SERVED" | "PAID";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  IN_PREPARATION: "bg-blue-100 text-blue-800 border-blue-300",
  READY: "bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30",
  SERVED: "bg-violet-100 text-violet-800 border-violet-300",
  PAID: "bg-stone-100 text-stone-600 border-stone-300",
};

export function Badge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono tabular-nums ${styles[status]}`}
    >
      {status}
    </span>
  );
}
