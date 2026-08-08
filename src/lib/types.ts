export type ContentStatus =
  | "idea"
  | "developing"
  | "ready_to_produce"
  | "produced"
  | "scheduled"
  | "published";

export type ContentPriority = "low" | "medium" | "high";

export type ContentFormat =
  | "instagram_reel"
  | "instagram_carousel"
  | "instagram_story"
  | "tiktok"
  | "caption";

export type ContentPlatform = "instagram" | "tiktok" | "cross_platform";

export interface ContentPillar {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  coreMessage: string;
  pillarId: string;
  status: ContentStatus;
  priority: ContentPriority;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVariation {
  id: string;
  ideaId: string;
  format: ContentFormat;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  id: string;
  ideaId: string;
  contentVariationId: string | null;
  platform: ContentPlatform;
  format: ContentFormat;
  title: string;
  scheduledAt: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaInput {
  title: string;
  coreMessage?: string;
  pillarId: string;
  status?: ContentStatus;
  priority?: ContentPriority;
  notes?: string;
}

export interface IdeaFilters {
  search?: string;
  status?: ContentStatus | "all";
  pillarId?: string | "all";
  priority?: ContentPriority | "all";
}

export interface LibraryFilters {
  search?: string;
  pillarId?: string | "all";
  platform?: ContentPlatform | "all";
  format?: ContentFormat | "all";
  status?: ContentStatus | "all";
  dateFrom?: string;
  dateTo?: string;
}

export interface AppData {
  pillars: ContentPillar[];
  ideas: Idea[];
  variations: ContentVariation[];
  scheduledPosts: ScheduledPost[];
}
