import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import type { ContentPriority, ContentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<ContentStatus, string> = {
  idea: "bg-ink-800 text-ink-200",
  developing: "bg-fuchsia-950 text-fuchsia-200",
  ready_to_produce: "bg-pink-950 text-pink-200",
  produced: "bg-purple-950 text-purple-200",
  scheduled: "bg-copper/20 text-copper-bright",
  published: "bg-violet-950 text-violet-200",
};

const priorityStyles: Record<ContentPriority, string> = {
  low: "text-ink-400",
  medium: "text-ink-200",
  high: "text-copper-bright",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        statusStyles[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ContentPriority }) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium uppercase tracking-wide",
        priorityStyles[priority],
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
