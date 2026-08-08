"use client";

import Link from "next/link";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { FORMAT_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { useContentStore } from "@/lib/store/content-store";
import { formatDateTime, sortScheduledSoonest } from "@/lib/utils";

type ViewMode = "week" | "month";

export function ContentCalendar() {
  const { scheduledPosts, deleteScheduledPost, updateScheduledPost } =
    useContentStore();
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(new Date());

  const range = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(anchor, { weekStartsOn: 1 });
      const end = endOfWeek(anchor, { weekStartsOn: 1 });
      return { start, end, days: eachDayOfInterval({ start, end }) };
    }
    const monthStart = startOfMonth(anchor);
    const monthEnd = endOfMonth(anchor);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return {
      start,
      end,
      days: eachDayOfInterval({ start, end }),
      monthStart,
    };
  }, [anchor, view]);

  const postsInView = useMemo(
    () =>
      sortScheduledSoonest(
        scheduledPosts.filter((post) => {
          const date = parseISO(post.scheduledAt);
          return date >= range.start && date <= range.end;
        }),
      ),
    [scheduledPosts, range],
  );

  return (
    <div>
      <PageHeader
        title="Content Calendar"
        description="Plan scheduled posts by week or month. No automatic publishing."
        actions={
          <div className="flex gap-2">
            <Button
              variant={view === "week" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button
              variant={view === "month" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setView("month")}
            >
              Month
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setAnchor((current) =>
                view === "week" ? addDays(current, -7) : subMonths(current, 1),
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAnchor(new Date())}
          >
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setAnchor((current) =>
                view === "week" ? addDays(current, 7) : addMonths(current, 1),
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm font-medium text-ink-200">
          {view === "week"
            ? `${format(range.start, "d MMM")} – ${format(range.end, "d MMM yyyy")}`
            : format(anchor, "MMMM yyyy")}
        </p>
      </div>

      <div
        className={`grid gap-px border border-ink-800 bg-ink-800 ${
          view === "week" ? "grid-cols-7" : "grid-cols-7"
        }`}
      >
        {range.days.map((day) => {
          const dayPosts = postsInView.filter((post) =>
            isSameDay(parseISO(post.scheduledAt), day),
          );
          const muted =
            view === "month" &&
            range.monthStart &&
            !isSameMonth(day, range.monthStart);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-36 bg-ink-925 p-2 ${muted ? "opacity-40" : ""}`}
            >
              <div className="mb-2 text-xs font-medium text-ink-400">
                {format(day, view === "week" ? "EEE d" : "d")}
              </div>
              <div className="space-y-1.5">
                {dayPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/ideas/${post.ideaId}`}
                    className="block border border-ink-800 bg-ink-900 p-2 hover:border-copper/40"
                  >
                    <p className="line-clamp-2 text-xs font-medium text-ink-100">
                      {post.title}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-500">
                      {PLATFORM_LABELS[post.platform]} ·{" "}
                      {FORMAT_LABELS[post.format]}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-500">
                      {format(parseISO(post.scheduledAt), "HH:mm")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-ink-200">
          Scheduled in this view
        </h2>
        {postsInView.length === 0 ? (
          <EmptyState
            title="Nothing scheduled here"
            description="Open an idea and use Schedule to add a planning slot."
          />
        ) : (
          <div className="overflow-hidden border border-ink-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-800 bg-ink-900/70 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Format</th>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {postsInView.map((post) => (
                  <tr key={post.id} className="border-b border-ink-850 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/ideas/${post.ideaId}`}
                        className="text-ink-100 hover:text-copper-bright"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-300">
                      {PLATFORM_LABELS[post.platform]}
                    </td>
                    <td className="px-4 py-3 text-ink-300">
                      {FORMAT_LABELS[post.format]}
                    </td>
                    <td className="px-4 py-3 text-ink-400">
                      {formatDateTime(post.scheduledAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            updateScheduledPost(post.id, {
                              status: "published",
                            })
                          }
                        >
                          Mark published
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteScheduledPost(post.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
