"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AddIdeaButton } from "@/components/ideas/AddIdeaButton";
import { IdeaFiltersBar } from "@/components/ideas/IdeaFiltersBar";
import { IdeaForm } from "@/components/ideas/IdeaForm";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Idea, IdeaFilters } from "@/lib/types";
import { useContentStore } from "@/lib/store/content-store";
import { formatDate } from "@/lib/utils";

export function IdeasPage() {
  const { filterIdeas, getPillar, updateIdea, deleteIdea } = useContentStore();
  const [filters, setFilters] = useState<IdeaFilters>({
    search: "",
    status: "all",
    pillarId: "all",
    priority: "all",
  });
  const [editing, setEditing] = useState<Idea | null>(null);

  const ideas = useMemo(() => filterIdeas(filters), [filterIdeas, filters]);

  return (
    <div>
      <PageHeader
        title="Ideas"
        description="Capture hooks, messages, and pillars. Open any idea to develop formats."
        actions={<AddIdeaButton openCreator />}
      />

      <div className="mb-6">
        <IdeaFiltersBar filters={filters} onChange={setFilters} />
      </div>

      {ideas.length === 0 ? (
        <EmptyState
          title="No ideas match"
          description="Add a new idea or clear your filters."
          action={<AddIdeaButton />}
        />
      ) : (
        <div className="overflow-hidden border border-ink-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-800 bg-ink-900/70 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title / hook</th>
                <th className="px-4 py-3 font-medium">Pillar</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr
                  key={idea.id}
                  className="border-b border-ink-850 last:border-0 hover:bg-ink-900/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="font-medium text-ink-50 hover:text-copper-bright"
                    >
                      {idea.title}
                    </Link>
                    {idea.coreMessage ? (
                      <p className="mt-1 line-clamp-1 text-xs text-ink-500">
                        {idea.coreMessage}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-ink-300">
                    {getPillar(idea.pillarId)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={idea.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={idea.priority} />
                  </td>
                  <td className="px-4 py-3 text-ink-400">
                    {formatDate(idea.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(idea)}
                        aria-label="Edit idea"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Delete this idea and its formats/schedules?",
                            )
                          ) {
                            deleteIdea(idea.id);
                          }
                        }}
                        aria-label="Delete idea"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        title="Edit idea"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <IdeaForm
            initial={editing}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={(input) => {
              updateIdea(editing.id, input);
              setEditing(null);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
