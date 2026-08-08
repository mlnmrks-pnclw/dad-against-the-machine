import { FORMATS } from "@/lib/constants";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  mapIdea,
  mapPillar,
  mapScheduledPost,
  mapVariation,
  type IdeaRow,
  type PillarRow,
  type ScheduledPostRow,
  type VariationRow,
} from "@/lib/supabase/mappers";
import type {
  AppData,
  ContentFormat,
  ContentPillar,
  ContentPlatform,
  ContentStatus,
  ContentVariation,
  Idea,
  IdeaInput,
  ScheduledPost,
} from "@/lib/types";

function requireClient() {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return client;
}

function throwIfError(error: { message: string } | null, action: string) {
  if (error) {
    throw new Error(`${action}: ${error.message}`);
  }
}

export async function loadAllData(): Promise<AppData> {
  const supabase = requireClient();

  const [pillarsRes, ideasRes, variationsRes, postsRes] = await Promise.all([
    supabase.from("content_pillars").select("*").order("sort_order"),
    supabase.from("ideas").select("*").order("updated_at", { ascending: false }),
    supabase.from("content_variations").select("*"),
    supabase
      .from("scheduled_posts")
      .select("*")
      .order("scheduled_at", { ascending: true }),
  ]);

  throwIfError(pillarsRes.error, "Failed to load pillars");
  throwIfError(ideasRes.error, "Failed to load ideas");
  throwIfError(variationsRes.error, "Failed to load variations");
  throwIfError(postsRes.error, "Failed to load scheduled posts");

  return {
    pillars: ((pillarsRes.data ?? []) as PillarRow[]).map(mapPillar),
    ideas: ((ideasRes.data ?? []) as IdeaRow[]).map(mapIdea),
    variations: ((variationsRes.data ?? []) as VariationRow[]).map(mapVariation),
    scheduledPosts: ((postsRes.data ?? []) as ScheduledPostRow[]).map(
      mapScheduledPost,
    ),
  };
}

export async function createIdeaRecord(input: IdeaInput): Promise<{
  idea: Idea;
  variations: ContentVariation[];
}> {
  const supabase = requireClient();

  const { data: ideaRow, error: ideaError } = await supabase
    .from("ideas")
    .insert({
      title: input.title.trim(),
      core_message: input.coreMessage?.trim() ?? "",
      pillar_id: input.pillarId,
      status: input.status ?? "idea",
      priority: input.priority ?? "medium",
      notes: input.notes?.trim() ?? "",
    })
    .select("*")
    .single();

  throwIfError(ideaError, "Failed to create idea");
  const idea = mapIdea(ideaRow as IdeaRow);

  const { data: variationRows, error: variationError } = await supabase
    .from("content_variations")
    .insert(
      FORMATS.map((format) => ({
        idea_id: idea.id,
        format,
        body: "",
      })),
    )
    .select("*");

  throwIfError(variationError, "Failed to create content variations");

  return {
    idea,
    variations: ((variationRows ?? []) as VariationRow[]).map(mapVariation),
  };
}

export async function updateIdeaRecord(
  id: string,
  patch: Partial<IdeaInput & { status: ContentStatus }>,
): Promise<Idea> {
  const supabase = requireClient();

  const payload: Record<string, string> = {};
  if (patch.title !== undefined) payload.title = patch.title.trim();
  if (patch.coreMessage !== undefined) {
    payload.core_message = patch.coreMessage.trim();
  }
  if (patch.pillarId !== undefined) payload.pillar_id = patch.pillarId;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.priority !== undefined) payload.priority = patch.priority;
  if (patch.notes !== undefined) payload.notes = patch.notes.trim();

  const { data, error } = await supabase
    .from("ideas")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, "Failed to update idea");
  return mapIdea(data as IdeaRow);
}

export async function deleteIdeaRecord(id: string): Promise<void> {
  const supabase = requireClient();
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  throwIfError(error, "Failed to delete idea");
}

export async function upsertVariationRecord(
  ideaId: string,
  format: ContentFormat,
  body: string,
): Promise<ContentVariation> {
  const supabase = requireClient();

  const { data, error } = await supabase
    .from("content_variations")
    .upsert(
      {
        idea_id: ideaId,
        format,
        body,
      },
      { onConflict: "idea_id,format" },
    )
    .select("*")
    .single();

  throwIfError(error, "Failed to save content variation");
  return mapVariation(data as VariationRow);
}

export async function createScheduledPostRecord(input: {
  ideaId: string;
  contentVariationId: string | null;
  platform: ContentPlatform;
  format: ContentFormat;
  title: string;
  scheduledAt: string;
}): Promise<ScheduledPost> {
  const supabase = requireClient();

  const { data, error } = await supabase
    .from("scheduled_posts")
    .insert({
      idea_id: input.ideaId,
      content_variation_id: input.contentVariationId,
      platform: input.platform,
      format: input.format,
      title: input.title,
      scheduled_at: input.scheduledAt,
      status: "scheduled",
    })
    .select("*")
    .single();

  throwIfError(error, "Failed to schedule post");
  return mapScheduledPost(data as ScheduledPostRow);
}

export async function updateScheduledPostRecord(
  id: string,
  patch: Partial<{
    scheduledAt: string;
    status: ContentStatus;
    platform: ContentPlatform;
    format: ContentFormat;
    title: string;
  }>,
): Promise<ScheduledPost> {
  const supabase = requireClient();

  const payload: Record<string, string> = {};
  if (patch.scheduledAt !== undefined) payload.scheduled_at = patch.scheduledAt;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.platform !== undefined) payload.platform = patch.platform;
  if (patch.format !== undefined) payload.format = patch.format;
  if (patch.title !== undefined) payload.title = patch.title.trim();

  const { data, error } = await supabase
    .from("scheduled_posts")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, "Failed to update scheduled post");
  return mapScheduledPost(data as ScheduledPostRow);
}

export async function deleteScheduledPostRecord(id: string): Promise<void> {
  const supabase = requireClient();
  const { error } = await supabase.from("scheduled_posts").delete().eq("id", id);
  throwIfError(error, "Failed to delete scheduled post");
}

export async function updatePillarRecord(
  id: string,
  name: string,
): Promise<ContentPillar> {
  const supabase = requireClient();
  const trimmed = name.trim();
  const slug = trimmed.toLowerCase().replace(/\s+/g, "-");

  const { data, error } = await supabase
    .from("content_pillars")
    .update({ name: trimmed, slug })
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, "Failed to update pillar");
  return mapPillar(data as PillarRow);
}
