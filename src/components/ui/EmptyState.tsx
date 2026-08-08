import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 border border-dashed border-ink-700 px-6 py-10">
      <h3 className="text-sm font-medium text-ink-100">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-ink-400">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
