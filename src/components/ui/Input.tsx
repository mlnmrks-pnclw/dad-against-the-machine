import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-ink-700 bg-ink-900 px-3 text-sm text-ink-50 placeholder:text-ink-500 outline-none focus:border-copper/70",
        className,
      )}
      {...props}
    />
  );
}
