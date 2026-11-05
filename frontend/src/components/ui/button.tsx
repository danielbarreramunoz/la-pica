import * as React from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#E65100] text-white shadow-sm hover:bg-[#BF4300] hover:shadow-md active:scale-[0.98] focus-visible:ring-[#E65100]",
  secondary:
    "bg-[#2E7D32] text-white shadow-sm hover:bg-[#245f27] hover:shadow-md active:scale-[0.98] focus-visible:ring-[#2E7D32]",
  ghost:
    "bg-transparent text-stone-800 hover:bg-stone-100 active:scale-[0.98] focus-visible:ring-stone-400 dark:text-stone-200 dark:hover:bg-stone-800 dark:focus-visible:ring-stone-500",
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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-sans font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
