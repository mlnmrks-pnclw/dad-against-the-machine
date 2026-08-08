"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/constants";
import type { ContentPriority, ContentStatus, Idea, IdeaInput } from "@/lib/types";
import { useContentStore } from "@/lib/store/content-store";

interface IdeaFormProps {
  initial?: Idea;
  onSubmit: (input: IdeaInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function IdeaForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save idea",
}: IdeaFormProps) {
  const { pillars } = useContentStore();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [coreMessage, setCoreMessage] = useState(initial?.coreMessage ?? "");
  const [pillarId, setPillarId] = useState(
    initial?.pillarId ?? pillars[0]?.id ?? "",
  );
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? "idea");
  const [priority, setPriority] = useState<ContentPriority>(
    initial?.priority ?? "medium",
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim() || !pillarId) return;
        onSubmit({
          title,
          coreMessage,
          pillarId,
          status,
          priority,
          notes,
        });
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Title / hook
        </span>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Strong opening line or idea title"
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Core message
        </span>
        <Textarea
          value={coreMessage}
          onChange={(e) => setCoreMessage(e.target.value)}
          placeholder="What should the audience walk away with?"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
            Content pillar
          </span>
          <Select
            value={pillarId}
            onChange={(e) => setPillarId(e.target.value)}
            required
          >
            {pillars.map((pillar) => (
              <option key={pillar.id} value={pillar.id}>
                {pillar.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
            Status
          </span>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentStatus)}
          >
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
            Priority
          </span>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value as ContentPriority)}
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {PRIORITY_LABELS[value]}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Notes
        </span>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="References, angles, production notes…"
        />
      </label>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
