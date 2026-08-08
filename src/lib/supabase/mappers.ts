import type {
  ContentFormat,
  ContentPillar,
  ContentPlatform,
  ContentPriority,
  ContentStatus,
  ContentVariation,
  Idea,
  ScheduledPost,
} from "@/lib/types";

export type PillarRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
};

export type IdeaRow = {
  id: string;
  title: string;
  core_message: string;
  pillar_id: string;
  status: ContentStatus;
  priority: ContentPriority;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type VariationRow = {
  id: string;
  idea_id: string;
  format: ContentFormat;
  body: string;
  created_at: string;
  updated_at: string;
};

export type ScheduledPostRow = {
  id: string;
  idea_id: string;
  content_variation_id: string | null;
  platform: ContentPlatform;
  format: ContentFormat;
  title: string;
  scheduled_at: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};

export function mapPillar(row: PillarRow): ContentPillar {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function mapIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    title: row.title,
    coreMessage: row.core_message,
    pillarId: row.pillar_id,
    status: row.status,
    priority: row.priority,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapVariation(row: VariationRow): ContentVariation {
  return {
    id: row.id,
    ideaId: row.idea_id,
    format: row.format,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapScheduledPost(row: ScheduledPostRow): ScheduledPost {
  return {
    id: row.id,
    ideaId: row.idea_id,
    contentVariationId: row.content_variation_id,
    platform: row.platform,
    format: row.format,
    title: row.title,
    scheduledAt: row.scheduled_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
