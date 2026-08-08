"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FORMATS } from "@/lib/constants";
import { loadLocalData, saveLocalData } from "@/lib/store/local-store";
import type {
  AppData,
  ContentFormat,
  ContentPillar,
  ContentPlatform,
  ContentPriority,
  ContentStatus,
  ContentVariation,
  Idea,
  IdeaFilters,
  IdeaInput,
  LibraryFilters,
  ScheduledPost,
} from "@/lib/types";
import { createId, nowIso, sortIdeasNewest } from "@/lib/utils";

interface ScheduleInput {
  ideaId: string;
  format: ContentFormat;
  platform: ContentPlatform;
  scheduledAt: string;
  title?: string;
}

interface ContentStoreValue {
  ready: boolean;
  pillars: ContentPillar[];
  ideas: Idea[];
  variations: ContentVariation[];
  scheduledPosts: ScheduledPost[];
  getIdea: (id: string) => Idea | undefined;
  getPillar: (id: string) => ContentPillar | undefined;
  getVariationsForIdea: (ideaId: string) => ContentVariation[];
  filterIdeas: (filters: IdeaFilters) => Idea[];
  filterLibrary: (filters: LibraryFilters) => Idea[];
  createIdea: (input: IdeaInput) => Idea;
  updateIdea: (id: string, patch: Partial<IdeaInput & { status: ContentStatus }>) => void;
  deleteIdea: (id: string) => void;
  setIdeaStatus: (id: string, status: ContentStatus) => void;
  updateVariation: (ideaId: string, format: ContentFormat, body: string) => void;
  schedulePost: (input: ScheduleInput) => ScheduledPost;
  updateScheduledPost: (
    id: string,
    patch: Partial<Pick<ScheduledPost, "scheduledAt" | "status" | "platform" | "format" | "title">>,
  ) => void;
  deleteScheduledPost: (id: string) => void;
  updatePillar: (id: string, name: string) => void;
}

const ContentStoreContext = createContext<ContentStoreValue | null>(null);

function ensureVariations(ideaId: string, existing: ContentVariation[]) {
  const timestamp = nowIso();
  const byFormat = new Map(
    existing.filter((v) => v.ideaId === ideaId).map((v) => [v.format, v]),
  );

  return FORMATS.map((format) => {
    const current = byFormat.get(format);
    if (current) return current;
    return {
      id: createId(),
      ideaId,
      format,
      body: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });
}

export function ContentStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadLocalData());
  }, []);

  useEffect(() => {
    if (data) saveLocalData(data);
  }, [data]);

  const updateData = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => {
      if (!current) return current;
      return updater(current);
    });
  }, []);

  const getIdea = useCallback(
    (id: string) => data?.ideas.find((idea) => idea.id === id),
    [data],
  );

  const getPillar = useCallback(
    (id: string) => data?.pillars.find((pillar) => pillar.id === id),
    [data],
  );

  const getVariationsForIdea = useCallback(
    (ideaId: string) => {
      if (!data) return [];
      return ensureVariations(
        ideaId,
        data.variations.filter((v) => v.ideaId === ideaId),
      );
    },
    [data],
  );

  const filterIdeas = useCallback(
    (filters: IdeaFilters) => {
      if (!data) return [];
      const search = filters.search?.trim().toLowerCase() ?? "";

      return sortIdeasNewest(
        data.ideas.filter((idea) => {
          if (filters.status && filters.status !== "all" && idea.status !== filters.status) {
            return false;
          }
          if (
            filters.pillarId &&
            filters.pillarId !== "all" &&
            idea.pillarId !== filters.pillarId
          ) {
            return false;
          }
          if (
            filters.priority &&
            filters.priority !== "all" &&
            idea.priority !== filters.priority
          ) {
            return false;
          }
          if (!search) return true;

          const pillarName =
            data.pillars.find((p) => p.id === idea.pillarId)?.name.toLowerCase() ??
            "";

          return (
            idea.title.toLowerCase().includes(search) ||
            idea.coreMessage.toLowerCase().includes(search) ||
            idea.notes.toLowerCase().includes(search) ||
            pillarName.includes(search)
          );
        }),
      );
    },
    [data],
  );

  const filterLibrary = useCallback(
    (filters: LibraryFilters) => {
      if (!data) return [];
      const search = filters.search?.trim().toLowerCase() ?? "";

      return sortIdeasNewest(
        data.ideas.filter((idea) => {
          if (
            filters.pillarId &&
            filters.pillarId !== "all" &&
            idea.pillarId !== filters.pillarId
          ) {
            return false;
          }
          if (filters.status && filters.status !== "all" && idea.status !== filters.status) {
            return false;
          }

          const ideaPosts = data.scheduledPosts.filter((p) => p.ideaId === idea.id);
          const ideaVariations = data.variations.filter((v) => v.ideaId === idea.id);

          if (filters.platform && filters.platform !== "all") {
            const hasPlatform = ideaPosts.some((p) => p.platform === filters.platform);
            if (!hasPlatform) return false;
          }

          if (filters.format && filters.format !== "all") {
            const hasFormat =
              ideaPosts.some((p) => p.format === filters.format) ||
              ideaVariations.some(
                (v) => v.format === filters.format && v.body.trim().length > 0,
              );
            if (!hasFormat) return false;
          }

          if (filters.dateFrom) {
            if (idea.createdAt < filters.dateFrom) return false;
          }
          if (filters.dateTo) {
            if (idea.createdAt > `${filters.dateTo}T23:59:59.999Z`) return false;
          }

          if (!search) return true;

          const bodies = ideaVariations.map((v) => v.body.toLowerCase()).join(" ");
          return (
            idea.title.toLowerCase().includes(search) ||
            idea.coreMessage.toLowerCase().includes(search) ||
            idea.notes.toLowerCase().includes(search) ||
            bodies.includes(search)
          );
        }),
      );
    },
    [data],
  );

  const createIdea = useCallback(
    (input: IdeaInput) => {
      const timestamp = nowIso();
      const idea: Idea = {
        id: createId(),
        title: input.title.trim(),
        coreMessage: input.coreMessage?.trim() ?? "",
        pillarId: input.pillarId,
        status: input.status ?? "idea",
        priority: input.priority ?? "medium",
        notes: input.notes?.trim() ?? "",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const variations = ensureVariations(idea.id, []);

      updateData((current) => ({
        ...current,
        ideas: [idea, ...current.ideas],
        variations: [...current.variations, ...variations],
      }));

      return idea;
    },
    [updateData],
  );

  const updateIdea = useCallback(
    (id: string, patch: Partial<IdeaInput & { status: ContentStatus }>) => {
      updateData((current) => ({
        ...current,
        ideas: current.ideas.map((idea) => {
          if (idea.id !== id) return idea;
          return {
            ...idea,
            title: patch.title?.trim() ?? idea.title,
            coreMessage:
              patch.coreMessage !== undefined
                ? patch.coreMessage.trim()
                : idea.coreMessage,
            pillarId: patch.pillarId ?? idea.pillarId,
            status: patch.status ?? idea.status,
            priority: (patch.priority as ContentPriority | undefined) ?? idea.priority,
            notes: patch.notes !== undefined ? patch.notes.trim() : idea.notes,
            updatedAt: nowIso(),
          };
        }),
      }));
    },
    [updateData],
  );

  const deleteIdea = useCallback(
    (id: string) => {
      updateData((current) => ({
        ...current,
        ideas: current.ideas.filter((idea) => idea.id !== id),
        variations: current.variations.filter((v) => v.ideaId !== id),
        scheduledPosts: current.scheduledPosts.filter((p) => p.ideaId !== id),
      }));
    },
    [updateData],
  );

  const setIdeaStatus = useCallback(
    (id: string, status: ContentStatus) => {
      updateIdea(id, { status });
    },
    [updateIdea],
  );

  const updateVariation = useCallback(
    (ideaId: string, format: ContentFormat, body: string) => {
      const timestamp = nowIso();
      updateData((current) => {
        const existing = current.variations.find(
          (v) => v.ideaId === ideaId && v.format === format,
        );

        const variations = existing
          ? current.variations.map((v) =>
              v.id === existing.id
                ? { ...v, body, updatedAt: timestamp }
                : v,
            )
          : [
              ...current.variations,
              {
                id: createId(),
                ideaId,
                format,
                body,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
            ];

        return {
          ...current,
          variations,
          ideas: current.ideas.map((idea) =>
            idea.id === ideaId
              ? {
                  ...idea,
                  status:
                    idea.status === "idea" && body.trim()
                      ? "developing"
                      : idea.status,
                  updatedAt: timestamp,
                }
              : idea,
          ),
        };
      });
    },
    [updateData],
  );

  const schedulePost = useCallback(
    (input: ScheduleInput) => {
      const timestamp = nowIso();
      let created!: ScheduledPost;

      updateData((current) => {
        const idea = current.ideas.find((item) => item.id === input.ideaId);
        const variation =
          current.variations.find(
            (v) => v.ideaId === input.ideaId && v.format === input.format,
          ) ?? null;

        created = {
          id: createId(),
          ideaId: input.ideaId,
          contentVariationId: variation?.id ?? null,
          platform: input.platform,
          format: input.format,
          title: input.title?.trim() || idea?.title || "Untitled",
          scheduledAt: input.scheduledAt,
          status: "scheduled",
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        return {
          ...current,
          scheduledPosts: [...current.scheduledPosts, created],
          ideas: current.ideas.map((item) =>
            item.id === input.ideaId
              ? {
                  ...item,
                  status:
                    item.status === "published" ? item.status : "scheduled",
                  updatedAt: timestamp,
                }
              : item,
          ),
        };
      });

      return created;
    },
    [updateData],
  );

  const updateScheduledPost = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<ScheduledPost, "scheduledAt" | "status" | "platform" | "format" | "title">
      >,
    ) => {
      const timestamp = nowIso();
      updateData((current) => {
        const target = current.scheduledPosts.find((post) => post.id === id);
        const scheduledPosts = current.scheduledPosts.map((post) =>
          post.id === id
            ? {
                ...post,
                ...patch,
                title: patch.title?.trim() ?? post.title,
                updatedAt: timestamp,
              }
            : post,
        );

        const ideas =
          target && patch.status === "published"
            ? current.ideas.map((idea) =>
                idea.id === target.ideaId
                  ? { ...idea, status: "published" as const, updatedAt: timestamp }
                  : idea,
              )
            : current.ideas;

        return { ...current, scheduledPosts, ideas };
      });
    },
    [updateData],
  );

  const deleteScheduledPost = useCallback(
    (id: string) => {
      updateData((current) => ({
        ...current,
        scheduledPosts: current.scheduledPosts.filter((post) => post.id !== id),
      }));
    },
    [updateData],
  );

  const updatePillar = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateData((current) => ({
        ...current,
        pillars: current.pillars.map((pillar) =>
          pillar.id === id
            ? {
                ...pillar,
                name: trimmed,
                slug: trimmed.toLowerCase().replace(/\s+/g, "-"),
              }
            : pillar,
        ),
      }));
    },
    [updateData],
  );

  const value = useMemo<ContentStoreValue>(
    () => ({
      ready: Boolean(data),
      pillars: data?.pillars ?? [],
      ideas: data?.ideas ?? [],
      variations: data?.variations ?? [],
      scheduledPosts: data?.scheduledPosts ?? [],
      getIdea,
      getPillar,
      getVariationsForIdea,
      filterIdeas,
      filterLibrary,
      createIdea,
      updateIdea,
      deleteIdea,
      setIdeaStatus,
      updateVariation,
      schedulePost,
      updateScheduledPost,
      deleteScheduledPost,
      updatePillar,
    }),
    [
      data,
      getIdea,
      getPillar,
      getVariationsForIdea,
      filterIdeas,
      filterLibrary,
      createIdea,
      updateIdea,
      deleteIdea,
      setIdeaStatus,
      updateVariation,
      schedulePost,
      updateScheduledPost,
      deleteScheduledPost,
      updatePillar,
    ],
  );

  return (
    <ContentStoreContext.Provider value={value}>
      {children}
    </ContentStoreContext.Provider>
  );
}

export function useContentStore() {
  const ctx = useContext(ContentStoreContext);
  if (!ctx) {
    throw new Error("useContentStore must be used within ContentStoreProvider");
  }
  return ctx;
}
