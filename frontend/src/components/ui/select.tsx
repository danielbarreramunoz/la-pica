import * as React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`h-10 w-full rounded-lg border border-stone-300 bg-white px-3 font-sans text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E65100] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
