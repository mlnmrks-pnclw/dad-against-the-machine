"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/constants";
import type { IdeaFilters } from "@/lib/types";
import { useContentStore } from "@/lib/store/content-store";

export function IdeaFiltersBar({
  filters,
  onChange,
}: {
  filters: IdeaFilters;
  onChange: (next: IdeaFilters) => void;
}) {
  const { pillars } = useContentStore();

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Input
        value={filters.search ?? ""}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search ideas…"
      />
      <Select
        value={filters.status ?? "all"}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as IdeaFilters["status"],
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
      <Select
        value={filters.pillarId ?? "all"}
        onChange={(e) =>
          onChange({
            ...filters,
            pillarId: e.target.value,
          })
        }
      >
        <option value="all">All pillars</option>
        {pillars.map((pillar) => (
          <option key={pillar.id} value={pillar.id}>
            {pillar.name}
          </option>
        ))}
      </Select>
      <Select
        value={filters.priority ?? "all"}
        onChange={(e) =>
          onChange({
            ...filters,
            priority: e.target.value as IdeaFilters["priority"],
          })
        }
      >
        <option value="all">All priorities</option>
        {PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </Select>
    </div>
  );
}
