"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { IdeaForm } from "@/components/ideas/IdeaForm";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  FORMAT_LABELS,
  FORMAT_PLATFORM,
  FORMATS,
  PLATFORM_LABELS,
  PLATFORMS,
  STATUS_LABELS,
  STATUSES,
} from "@/lib/constants";
import type { ContentFormat, ContentPlatform, ContentStatus } from "@/lib/types";
import { useContentStore } from "@/lib/store/content-store";
import { formatDate } from "@/lib/utils";

export function IdeaCreator({ ideaId }: { ideaId: string }) {
  const {
    getIdea,
    getPillar,
    getVariationsForIdea,
    updateIdea,
    updateVariation,
    setIdeaStatus,
    schedulePost,
    scheduledPosts,
  } = useContentStore();

  const idea = getIdea(ideaId);
  const variations = getVariationsForIdea(ideaId);
  const [activeFormat, setActiveFormat] = useState<ContentFormat>("instagram_reel");
  const [editingMeta, setEditingMeta] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduleFormat, setScheduleFormat] =
    useState<ContentFormat>("instagram_reel");
  const [schedulePlatform, setSchedulePlatform] =
    useState<ContentPlatform>("instagram");

  const activeBody = useMemo(
    () => variations.find((v) => v.format === activeFormat)?.body ?? "",
    [variations, activeFormat],
  );

  const ideaSchedules = scheduledPosts
    .filter((post) => post.ideaId === ideaId)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  if (!idea) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-400">Idea not found.</p>
        <Link href="/ideas" className="text-sm text-copper-bright hover:underline">
          Back to ideas
        </Link>
      </div>
    );
  }

  const pillar = getPillar(idea.pillarId);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Ideas
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 border-b border-ink-800 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={idea.status} />
            <PriorityBadge priority={idea.priority} />
            <span className="text-xs text-ink-500">
              {pillar?.name} · Created {formatDate(idea.createdAt)}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-50">
            {idea.title}
          </h1>
          {idea.coreMessage ? (
            <p className="mt-3 text-sm leading-6 text-ink-300">{idea.coreMessage}</p>
          ) : null}
          {idea.notes ? (
            <p className="mt-3 text-sm text-ink-500">Notes: {idea.notes}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            className="w-auto min-w-44"
            value={idea.status}
            onChange={(e) =>
              setIdeaStatus(idea.id, e.target.value as ContentStatus)
            }
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={() => setEditingMeta(true)}>
            Edit details
          </Button>
          <Button
            onClick={() => {
              setScheduleFormat(activeFormat);
              setSchedulePlatform(FORMAT_PLATFORM[activeFormat]);
              setScheduleOpen(true);
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            Schedule
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">
            Formats
          </p>
          {FORMATS.map((format) => {
            const filled = Boolean(
              variations.find((v) => v.format === format)?.body.trim(),
            );
            return (
              <button
                key={format}
                type="button"
                onClick={() => setActiveFormat(format)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                  activeFormat === format
                    ? "bg-ink-850 text-ink-50"
                    : "text-ink-400 hover:bg-ink-900 hover:text-ink-100"
                }`}
              >
                <span>{FORMAT_LABELS[format]}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    filled ? "bg-copper" : "bg-ink-700"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-100">
              {FORMAT_LABELS[activeFormat]}
            </h2>
            <span className="text-xs text-ink-500">
              Linked to the same core idea
            </span>
          </div>
          <Textarea
            className="min-h-[420px] font-mono text-[13px] leading-6"
            value={activeBody}
            onChange={(e) =>
              updateVariation(idea.id, activeFormat, e.target.value)
            }
            placeholder={`Write the ${FORMAT_LABELS[activeFormat]} version…`}
          />

          {ideaSchedules.length > 0 ? (
            <div className="mt-6 border border-ink-800 p-4">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-500">
                Scheduled for this idea
              </h3>
              <ul className="space-y-2 text-sm">
                {ideaSchedules.map((post) => (
                  <li
                    key={post.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-ink-300"
                  >
                    <span>
                      {PLATFORM_LABELS[post.platform]} ·{" "}
                      {FORMAT_LABELS[post.format]}
                    </span>
                    <span className="text-ink-500">
                      {new Date(post.scheduledAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        open={editingMeta}
        title="Edit idea details"
        onClose={() => setEditingMeta(false)}
      >
        <IdeaForm
          initial={idea}
          submitLabel="Save details"
          onCancel={() => setEditingMeta(false)}
          onSubmit={(input) => {
            updateIdea(idea.id, input);
            setEditingMeta(false);
          }}
        />
      </Modal>

      <Modal
        open={scheduleOpen}
        title="Schedule content"
        onClose={() => setScheduleOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!scheduleAt) return;
            schedulePost({
              ideaId: idea.id,
              format: scheduleFormat,
              platform: schedulePlatform,
              scheduledAt: new Date(scheduleAt).toISOString(),
              title: idea.title,
            });
            setScheduleOpen(false);
            setScheduleAt("");
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Date / time
            </span>
            <Input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Format
              </span>
              <Select
                value={scheduleFormat}
                onChange={(e) => {
                  const format = e.target.value as ContentFormat;
                  setScheduleFormat(format);
                  setSchedulePlatform(FORMAT_PLATFORM[format]);
                }}
              >
                {FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {FORMAT_LABELS[format]}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Platform
              </span>
              <Select
                value={schedulePlatform}
                onChange={(e) =>
                  setSchedulePlatform(e.target.value as ContentPlatform)
                }
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {PLATFORM_LABELS[platform]}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setScheduleOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add to calendar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
