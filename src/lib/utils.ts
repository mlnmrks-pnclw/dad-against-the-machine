import {
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { ContentStatus, Idea, ScheduledPost } from "@/lib/types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId() {
  return crypto.randomUUID();
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseISO(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parseISO(value));
}

export function isThisWeek(value: string, reference = new Date()) {
  const date = parseISO(value);
  return isWithinInterval(date, {
    start: startOfWeek(reference, { weekStartsOn: 1 }),
    end: endOfWeek(reference, { weekStartsOn: 1 }),
  });
}

export function isThisMonth(value: string, reference = new Date()) {
  const date = parseISO(value);
  return isWithinInterval(date, {
    start: startOfMonth(reference),
    end: endOfMonth(reference),
  });
}

export function countByStatus(ideas: Idea[], status: ContentStatus) {
  return ideas.filter((idea) => idea.status === status).length;
}

export function sortIdeasNewest(ideas: Idea[]) {
  return [...ideas].sort(
    (a, b) => parseISO(b.updatedAt).getTime() - parseISO(a.updatedAt).getTime(),
  );
}

export function sortScheduledSoonest(posts: ScheduledPost[]) {
  return [...posts].sort(
    (a, b) =>
      parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime(),
  );
}
