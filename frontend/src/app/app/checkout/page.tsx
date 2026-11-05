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
  const { cart, clearCart, customerName, phone, eta, setCustomer, restaurantId } = useCustomerStore();
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
      await orderService.createOrder(
        0,
        cart.map((c) => ({ dish_id: c.dish_id, dish_name: c.dish_name, qty: c.qty, unit_price: c.unit_price, notes: c.notes })),
        `PRE-ORDER ${customerName} ${phone} ETA ${eta} @${restaurantId ?? "s/t"}`
      );
      showToast.success(`¡Pre-pedido enviado! Te esperamos a las ${eta}`);
      clearCart();
      router.push("/kitchen");
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Error al enviar");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <h1 className="font-sans text-2xl font-bold dark:text-stone-100">Pre-Pedido Express</h1>
      <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
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

      <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <p className="font-sans text-sm font-bold">Resumen</p>
        {cart.map((c, i) => (
          <p key={i} className="flex justify-between font-sans text-sm">
            <span>
              {c.qty}x {c.dish_name}
              {c.notes ? <span className="text-stone-500 dark:text-stone-400"> · {c.notes}</span> : null}
            </span>
            <span className="font-mono">${(c.qty * c.unit_price).toLocaleString("es-CL")}</span>
          </p>
        ))}
        <p className="mt-2 flex justify-between font-sans font-bold">
          <span>Total</span>
          <span className="font-mono text-[#2E7D32] dark:text-[#7cc47f]">${total.toLocaleString("es-CL")}</span>
        </p>
      </div>

      <Button onClick={handleConfirm} className="w-full bg-[#E65100] h-12 text-base">
        Confirmar y Enviar Pre-Pedido
      </Button>
    </div>
  );
}
