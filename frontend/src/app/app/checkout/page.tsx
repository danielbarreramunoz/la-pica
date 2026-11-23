"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCustomerStore } from "@/stores/useCustomerStore";
import { orderService } from "@/services/order.service";
import { showToast } from "@/components/ui/toast";

const ETAS = ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

export default function CheckoutPage() {
  const { cart, clearCart, customerName, phone, eta, setCustomer, restaurantId, saveOrder } = useCustomerStore();
  const router = useRouter();

  const total = cart.reduce((s, c) => s + c.qty * c.unit_price, 0);

  async function handleConfirm() {
    if (!customerName.trim() || !phone.trim()) {
      showToast.error("Nombre y teléfono obligatorios");
      return;
    }
    if (cart.length === 0) {
      showToast.error("Carrito vacío");
      return;
    }
    try {
      const order = await orderService.createOrder(
        0,
        cart.map((c) => ({ dish_id: c.dish_id, dish_name: c.dish_name, qty: c.qty, unit_price: c.unit_price, notes: c.notes })),
        `PRE-ORDER ${customerName} ${phone} ETA ${eta} @${restaurantId ?? "s/t"}`,
        { customer_name: customerName.trim(), customer_phone: phone.trim(), eta, tenant_id: restaurantId ?? undefined }
      );
      saveOrder({
        id: order.id,
        restaurantId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        eta,
        items: cart,
        total,
        status: order.status,
        createdAt: order.created_at,
      });
      showToast.success(`¡Pre-pedido enviado! Te esperamos a las ${eta}`);
      clearCart();
      router.push("/app/pedidos");
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Error al enviar");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-5 pb-28">
      <section className="picada-hero rounded-3xl p-6">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#f3b62c]">Paso final · Pre-pedido express</p>
        <h1 className="mt-1.5 text-4xl text-[#fff8eb]">Confirma tu pedido</h1>
        <p className="mt-2 text-sm text-[#ffe9ce]/85">Déjanos tus datos para tenerlo listo cuando llegues a la picada.</p>
      </section>

      <div className="picada-card space-y-3 p-4 sm:p-5">
        <div>
          <p className="picada-eyebrow">Tus datos</p>
          <h2 className="mt-1 text-lg font-extrabold">¿A nombre de quién?</h2>
        </div>
        <Input
          placeholder="Nombre del cliente"
          value={customerName}
          onChange={(e) => setCustomer(e.target.value, phone, eta)}
        />
        <Input
          placeholder="Teléfono de contacto"
          inputMode="tel"
          value={phone}
          onChange={(e) => setCustomer(customerName, e.target.value, eta)}
        />
        <Select value={eta} onChange={(e) => setCustomer(customerName, phone, e.target.value)}>
          {ETAS.map((h) => (
            <option key={h} value={h}>
              Llegada {h} hrs
            </option>
          ))}
        </Select>
      </div>

      <div className="picada-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="picada-eyebrow">Resumen</p>
            <h2 className="mt-1 text-lg font-extrabold">Tu pedido</h2>
          </div>
          <span className="rounded-full bg-[#fff3e6] px-3 py-1 font-mono text-xs font-bold text-[#9a3e1a] dark:bg-orange-950/60 dark:text-orange-200">
            {cart.reduce((sum, line) => sum + line.qty, 0)} productos
          </span>
        </div>
        <div className="mt-3 divide-y divide-dashed divide-[#e7d5bb] dark:divide-stone-700">
          {cart.map((c, i) => (
            <p key={i} className="flex justify-between gap-3 py-2 font-sans text-sm">
              <span>
                {c.qty}× {c.dish_name}
                {c.notes ? <span className="text-stone-500 dark:text-stone-400"> · {c.notes}</span> : null}
              </span>
              <span className="font-mono">${(c.qty * c.unit_price).toLocaleString("es-CL")}</span>
            </p>
          ))}
        </div>
        <p className="mt-3 flex justify-between border-t border-dashed border-[#e7d5bb] pt-3 font-sans font-black dark:border-stone-700">
          <span>Total</span>
          <span className="font-mono text-lg text-[#2E7D32] dark:text-[#7cc47f]">${total.toLocaleString("es-CL")}</span>
        </p>
      </div>

      <Button onClick={handleConfirm} size="lg" className="w-full text-base">
        Confirmar pre-pedido
      </Button>
    </div>
  );
}
