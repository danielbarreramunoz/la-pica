import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-[#d9c5a9] bg-[#fffdf7] px-3.5 font-sans text-sm text-stone-900 shadow-[inset_0_1px_2px_rgba(92,57,32,0.05)] placeholder:text-stone-400 focus-visible:border-[#e65100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e65100]/25 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 ${className}`}
      {...props}
    />
  );
}
