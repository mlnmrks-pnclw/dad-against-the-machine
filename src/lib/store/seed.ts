import { DEFAULT_PILLARS, FORMATS } from "@/lib/constants";
import type { AppData, ContentVariation, Idea } from "@/lib/types";
import { createId, nowIso } from "@/lib/utils";

export function createSeedData(): AppData {
  const timestamp = nowIso();

  const pillars = DEFAULT_PILLARS.map((pillar) => ({
    id: createId(),
    name: pillar.name,
    slug: pillar.slug,
    sortOrder: pillar.sortOrder,
    createdAt: timestamp,
  }));

  const bySlug = Object.fromEntries(pillars.map((p) => [p.slug, p.id]));

  const ideas: Idea[] = [
    {
      id: createId(),
      title: "Your phone is training your kids more than you are",
      coreMessage:
        "If you don't set the rules for attention, the algorithm will. Fathers reclaim the frame.",
      pillarId: bySlug.control,
      status: "idea",
      priority: "high",
      notes: "Strong hook for Reels. Keep tone firm, not panicked.",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createId(),
      title: "Competence is a form of care",
      coreMessage:
        "Building skill is how a man protects his family when life gets hard.",
      pillarId: bySlug.capability,
      status: "developing",
      priority: "medium",
      notes: "Pair with a practical skill example.",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createId(),
      title: "Direction beats motivation",
      coreMessage:
        "Families don't drift into strength. They are led there on purpose.",
      pillarId: bySlug["family-direction"],
      status: "ready_to_produce",
      priority: "high",
      notes: "Ready for carousel outline.",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: createId(),
      title: "Pressure reveals the operating system",
      coreMessage:
        "Resilience is built in ordinary weeks, not only in crisis.",
      pillarId: bySlug.resilience,
      status: "scheduled",
      priority: "medium",
      notes: "Schedule mid-week.",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const variations: ContentVariation[] = ideas.flatMap((idea) =>
    FORMATS.map((format) => ({
      id: createId(),
      ideaId: idea.id,
      format,
      body:
        format === "caption" && idea.status !== "idea"
          ? `${idea.title}\n\n${idea.coreMessage}\n\n#DadAgainstTheMachine`
          : "",
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  );

  const scheduledIdea = ideas.find((idea) => idea.status === "scheduled")!;
  const nextWednesday = new Date();
  nextWednesday.setDate(
    nextWednesday.getDate() + ((3 - nextWednesday.getDay() + 7) % 7 || 7),
  );
  nextWednesday.setHours(9, 0, 0, 0);

  return {
    pillars,
    ideas,
    variations,
    scheduledPosts: [
      {
        id: createId(),
        ideaId: scheduledIdea.id,
        contentVariationId:
          variations.find(
            (v) =>
              v.ideaId === scheduledIdea.id && v.format === "instagram_reel",
          )?.id ?? null,
        platform: "instagram",
        format: "instagram_reel",
        title: scheduledIdea.title,
        scheduledAt: nextWednesday.toISOString(),
        status: "scheduled",
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}
