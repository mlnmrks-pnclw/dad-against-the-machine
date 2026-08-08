"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import {
  FORMAT_LABELS,
  FORMATS,
  PLATFORM_LABELS,
  PLATFORMS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/constants";
import type { LibraryFilters } from "@/lib/types";
import { useContentStore } from "@/lib/store/content-store";
import { formatDate } from "@/lib/utils";

export function ContentLibrary() {
  const { filterLibrary, getPillar, pillars, variations, scheduledPosts } =
    useContentStore();
  const [filters, setFilters] = useState<LibraryFilters>({
    search: "",
    pillarId: "all",
    platform: "all",
    format: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  const items = useMemo(
    () => filterLibrary(filters),
    [filterLibrary, filters],
  );

  return (
    <div>
      <PageHeader
        title="Content Library"
        description="Searchable archive of every idea and developed piece."
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Input
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search library…"
          className="md:col-span-2 xl:col-span-2"
        />
        <Select
          value={filters.pillarId ?? "all"}
          onChange={(e) => setFilters({ ...filters, pillarId: e.target.value })}
        >
          <option value="all">All pillars</option>
          {pillars.map((pillar) => (
            <option key={pillar.id} value={pillar.id}>
              {pillar.name}
            </option>
          ))}
        </Select>
        <Select
          value={filters.platform ?? "all"}
          onChange={(e) =>
            setFilters({
              ...filters,
              platform: e.target.value as LibraryFilters["platform"],
            })
          }
        >
          <option value="all">All platforms</option>
          {PLATFORMS.map((platform) => (
            <option key={platform} value={platform}>
              {PLATFORM_LABELS[platform]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.format ?? "all"}
          onChange={(e) =>
            setFilters({
              ...filters,
              format: e.target.value as LibraryFilters["format"],
            })
          }
        >
          <option value="all">All formats</option>
          {FORMATS.map((format) => (
            <option key={format} value={format}>
              {FORMAT_LABELS[format]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.status ?? "all"}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value as LibraryFilters["status"],
            })
          }
        >
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
        />
        <Input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No content found"
          description="Try widening your filters."
        />
      ) : (
        <div className="space-y-3">
          {items.map((idea) => {
            const filledFormats = variations.filter(
              (v) => v.ideaId === idea.id && v.body.trim().length > 0,
            );
            const posts = scheduledPosts.filter((p) => p.ideaId === idea.id);

            return (
              <article
                key={idea.id}
                className="border border-ink-800 px-4 py-4 hover:border-ink-700"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="text-base font-medium text-ink-50 hover:text-copper-bright"
                    >
                      {idea.title}
                    </Link>
                    <p className="mt-1 text-sm text-ink-400">
                      {idea.coreMessage || "No core message yet."}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                      <span>{getPillar(idea.pillarId)?.name}</span>
                      <span>Created {formatDate(idea.createdAt)}</span>
                      <span>
                        {filledFormats.length} format
                        {filledFormats.length === 1 ? "" : "s"} drafted
                      </span>
                      <span>
                        {posts.length} schedule
                        {posts.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={idea.priority} />
                    <StatusBadge status={idea.status} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
