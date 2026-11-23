import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#E65100] text-white shadow-[0_3px_0_#9c3700] hover:-translate-y-px hover:bg-[#f05a0b] hover:shadow-[0_4px_0_#9c3700] active:translate-y-px active:shadow-none focus-visible:ring-[#E65100]",
  secondary:
    "bg-[#2E7D32] text-white shadow-[0_3px_0_#1d5721] hover:-translate-y-px hover:bg-[#348c39] hover:shadow-[0_4px_0_#1d5721] active:translate-y-px active:shadow-none focus-visible:ring-[#2E7D32]",
  ghost:
    "bg-transparent text-stone-800 hover:bg-[#f1e6d6] active:translate-y-px focus-visible:ring-stone-400 dark:text-stone-200 dark:hover:bg-stone-800 dark:focus-visible:ring-stone-500",
  outline:
    "border border-[#d9c5a9] bg-[#fffdf7] text-stone-800 shadow-sm hover:border-[#e65100]/50 hover:bg-[#fff6e9] active:translate-y-px dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 py-2 text-sm",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-sans font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
