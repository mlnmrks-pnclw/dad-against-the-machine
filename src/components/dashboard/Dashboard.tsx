"use client";

import Link from "next/link";
import { AddIdeaButton } from "@/components/ideas/AddIdeaButton";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { FORMAT_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { useContentStore } from "@/lib/store/content-store";
import {
  countByStatus,
  formatDateTime,
  isThisMonth,
  isThisWeek,
  sortIdeasNewest,
  sortScheduledSoonest,
} from "@/lib/utils";

export function Dashboard() {
  const { ideas, scheduledPosts, getPillar } = useContentStore();

  const ideasWaiting = countByStatus(ideas, "idea");
  const readyToProduce = countByStatus(ideas, "ready_to_produce");
  const scheduledThisWeek = scheduledPosts.filter((post) =>
    isThisWeek(post.scheduledAt),
  ).length;
  const publishedThisMonth = [
    ...ideas.filter(
      (idea) => idea.status === "published" && isThisMonth(idea.updatedAt),
    ),
    ...scheduledPosts.filter(
      (post) => post.status === "published" && isThisMonth(post.updatedAt),
    ),
  ].length;

  const recent = sortIdeasNewest(ideas).slice(0, 6);
  const upcoming = sortScheduledSoonest(
    scheduledPosts.filter((post) => post.status === "scheduled"),
  ).slice(0, 5);

  const stats = [
    {
      label: "Ideas waiting",
      value: ideasWaiting,
      href: "/ideas?status=idea",
    },
    {
      label: "Ready to produce",
      value: readyToProduce,
      href: "/board",
    },
    {
      label: "Scheduled this week",
      value: scheduledThisWeek,
      href: "/calendar",
    },
    {
      label: "Published this month",
      value: publishedThisMonth,
      href: "/library",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Idea → creation → production → scheduling → published."
        actions={<AddIdeaButton size="lg" openCreator />}
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-ink-800 px-5 py-5 transition-colors hover:border-copper/40"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-50">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-100">Recent content</h2>
            <Link href="/ideas" className="text-xs text-ink-500 hover:text-ink-200">
              View all
            </Link>
          </div>
          <div className="border border-ink-800">
            {recent.map((idea, index) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className={`flex items-start justify-between gap-4 px-4 py-3 hover:bg-ink-900/50 ${
                  index < recent.length - 1 ? "border-b border-ink-800" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-ink-50">{idea.title}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {getPillar(idea.pillarId)?.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={idea.status} />
                  <PriorityBadge priority={idea.priority} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-100">Upcoming schedule</h2>
            <Link
              href="/calendar"
              className="text-xs text-ink-500 hover:text-ink-200"
            >
              Open calendar
            </Link>
          </div>
          <div className="border border-ink-800">
            {upcoming.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-500">
                Nothing scheduled yet. Open an idea and add a date.
              </p>
            ) : (
              upcoming.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/ideas/${post.ideaId}`}
                  className={`block px-4 py-3 hover:bg-ink-900/50 ${
                    index < upcoming.length - 1 ? "border-b border-ink-800" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-ink-50">{post.title}</p>
                  <p className="mt-1 text-xs text-ink-500">
                    {PLATFORM_LABELS[post.platform]} ·{" "}
                    {FORMAT_LABELS[post.format]} ·{" "}
                    {formatDateTime(post.scheduledAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
