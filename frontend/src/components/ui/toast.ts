"use client";

import * as React from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return React.createElement(SonnerToaster, { richColors: true, position: "top-right" });
}

export const showToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast(msg),
  orderAlert: (msg: string) => toast.warning(msg || "Nueva comanda en cocina"),
};

export { toast };
