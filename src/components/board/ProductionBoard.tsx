"use client";

import Link from "next/link";
import { useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { ContentStatus, Idea } from "@/lib/types";
import { useContentStore } from "@/lib/store/content-store";

export function ProductionBoard() {
  const { ideas, getPillar, setIdeaStatus } = useContentStore();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const columns = STATUSES.map((status) => ({
    status,
    items: ideas.filter((idea) => idea.status === status),
  }));

  function moveIdea(ideaId: string, status: ContentStatus) {
    setIdeaStatus(ideaId, status);
    setDraggingId(null);
  }

  return (
    <div>
      <PageHeader
        title="Production Board"
        description="Drag ideas across stages from concept to published."
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <section
            key={column.status}
            className="w-72 shrink-0"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggingId) moveIdea(draggingId, column.status);
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                {STATUS_LABELS[column.status]}
              </h2>
              <span className="text-xs text-ink-600">{column.items.length}</span>
            </div>

            <div className="min-h-[420px] space-y-2 border border-ink-800 bg-ink-950/50 p-2">
              {column.items.map((idea) => (
                <BoardCard
                  key={idea.id}
                  idea={idea}
                  pillarName={getPillar(idea.pillarId)?.name ?? "—"}
                  onDragStart={() => setDraggingId(idea.id)}
                  onDragEnd={() => setDraggingId(null)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function BoardCard({
  idea,
  pillarName,
  onDragStart,
  onDragEnd,
}: {
  idea: Idea;
  pillarName: string;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab border border-ink-800 bg-ink-900 p-3 active:cursor-grabbing"
    >
      <Link
        href={`/ideas/${idea.id}`}
        className="text-sm font-medium text-ink-50 hover:text-copper-bright"
      >
        {idea.title}
      </Link>
      <p className="mt-2 text-xs text-ink-500">{pillarName}</p>
      <div className="mt-3 flex items-center justify-between">
        <StatusBadge status={idea.status} />
        <PriorityBadge priority={idea.priority} />
      </div>
    </article>
  );
}
