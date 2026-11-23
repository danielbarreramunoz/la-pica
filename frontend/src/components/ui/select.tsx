import * as React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`h-11 w-full cursor-pointer rounded-xl border border-[#d9c5a9] bg-[#fffdf7] px-3.5 font-sans text-sm text-stone-900 shadow-[inset_0_1px_2px_rgba(92,57,32,0.05)] focus-visible:border-[#e65100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e65100]/25 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
