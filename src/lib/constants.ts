import type {
  ContentFormat,
  ContentPlatform,
  ContentPriority,
  ContentStatus,
} from "@/lib/types";

export const APP_NAME = "DATM Content OS";
export const BRAND_NAME = "Dad Against The Machine";

export const STATUSES: ContentStatus[] = [
  "idea",
  "developing",
  "ready_to_produce",
  "produced",
  "scheduled",
  "published",
];

export const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "Idea",
  developing: "Developing",
  ready_to_produce: "Ready to Produce",
  produced: "Produced",
  scheduled: "Scheduled",
  published: "Published",
};

export const PRIORITIES: ContentPriority[] = ["low", "medium", "high"];

export const PRIORITY_LABELS: Record<ContentPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const FORMATS: ContentFormat[] = [
  "instagram_reel",
  "instagram_carousel",
  "instagram_story",
  "tiktok",
  "caption",
];

export const FORMAT_LABELS: Record<ContentFormat, string> = {
  instagram_reel: "Instagram Reel",
  instagram_carousel: "Instagram Carousel",
  instagram_story: "Instagram Story",
  tiktok: "TikTok",
  caption: "Caption",
};

export const PLATFORMS: ContentPlatform[] = [
  "instagram",
  "tiktok",
  "cross_platform",
];

export const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  cross_platform: "Cross-platform",
};

export const FORMAT_PLATFORM: Record<ContentFormat, ContentPlatform> = {
  instagram_reel: "instagram",
  instagram_carousel: "instagram",
  instagram_story: "instagram",
  tiktok: "tiktok",
  caption: "cross_platform",
};

export const STORAGE_KEY = "datm-content-os-v1";

export const DEFAULT_PILLARS = [
  { name: "Control", slug: "control", sortOrder: 1 },
  { name: "Capability", slug: "capability", sortOrder: 2 },
  { name: "Family Direction", slug: "family-direction", sortOrder: 3 },
  { name: "Resilience", slug: "resilience", sortOrder: 4 },
] as const;
