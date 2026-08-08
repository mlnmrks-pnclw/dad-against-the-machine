import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-ink-700 bg-ink-900 px-3 text-sm text-ink-50 outline-none focus:border-copper/70",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
