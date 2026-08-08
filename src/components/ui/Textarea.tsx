import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-50 placeholder:text-ink-500 outline-none focus:border-copper/70",
        className,
      )}
      {...props}
    />
  );
}
