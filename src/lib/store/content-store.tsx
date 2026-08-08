"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FORMATS } from "@/lib/constants";
import {
  createIdeaRecord,
  createScheduledPostRecord,
  deleteIdeaRecord,
  deleteScheduledPostRecord,
  loadAllData,
  updateIdeaRecord,
  updatePillarRecord,
  updateScheduledPostRecord,
  upsertVariationRecord,
} from "@/lib/supabase/repository";
import type {
  AppData,
  ContentFormat,
  ContentPillar,
  ContentPlatform,
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
  error: string | null;
  pillars: ContentPillar[];
  ideas: Idea[];
  variations: ContentVariation[];
  scheduledPosts: ScheduledPost[];
  getIdea: (id: string) => Idea | undefined;
  getPillar: (id: string) => ContentPillar | undefined;
  getVariationsForIdea: (ideaId: string) => ContentVariation[];
  filterIdeas: (filters: IdeaFilters) => Idea[];
  filterLibrary: (filters: LibraryFilters) => Idea[];
  createIdea: (input: IdeaInput) => Promise<Idea>;
  updateIdea: (
    id: string,
    patch: Partial<IdeaInput & { status: ContentStatus }>,
  ) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  setIdeaStatus: (id: string, status: ContentStatus) => Promise<void>;
  updateVariation: (
    ideaId: string,
    format: ContentFormat,
    body: string,
  ) => void;
  schedulePost: (input: ScheduleInput) => Promise<ScheduledPost>;
  updateScheduledPost: (
    id: string,
    patch: Partial<
      Pick<ScheduledPost, "scheduledAt" | "status" | "platform" | "format" | "title">
    >,
  ) => Promise<void>;
  deleteScheduledPost: (id: string) => Promise<void>;
  updatePillar: (id: string, name: string) => Promise<void>;
  reload: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const dataRef = useRef<AppData | null>(null);
  const variationTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const next = await loadAllData();
      setData(next);
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setReady(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const next = await loadAllData();
        if (!cancelled) {
          setData(next);
          setError(null);
          setReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      variationTimers.current.forEach((timer) => clearTimeout(timer));
      variationTimers.current.clear();
    };
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

  const createIdea = useCallback(async (input: IdeaInput) => {
    try {
      const { idea, variations } = await createIdeaRecord(input);
      setData((current) =>
        current
          ? {
              ...current,
              ideas: [idea, ...current.ideas],
              variations: [...current.variations, ...variations],
            }
          : current,
      );
      setError(null);
      return idea;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create idea";
      setError(message);
      throw err;
    }
  }, []);

  const updateIdea = useCallback(
    async (
      id: string,
      patch: Partial<IdeaInput & { status: ContentStatus }>,
    ) => {
      try {
        const updated = await updateIdeaRecord(id, patch);
        setData((current) =>
          current
            ? {
                ...current,
                ideas: current.ideas.map((idea) =>
                  idea.id === id ? updated : idea,
                ),
              }
            : current,
        );
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update idea";
        setError(message);
        throw err;
      }
    },
    [],
  );

  const deleteIdea = useCallback(async (id: string) => {
    try {
      await deleteIdeaRecord(id);
      setData((current) =>
        current
          ? {
              ...current,
              ideas: current.ideas.filter((idea) => idea.id !== id),
              variations: current.variations.filter((v) => v.ideaId !== id),
              scheduledPosts: current.scheduledPosts.filter(
                (p) => p.ideaId !== id,
              ),
            }
          : current,
      );
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete idea";
      setError(message);
      throw err;
    }
  }, []);

  const setIdeaStatus = useCallback(
    async (id: string, status: ContentStatus) => {
      await updateIdea(id, { status });
    },
    [updateIdea],
  );

  const updateVariation = useCallback(
    (ideaId: string, format: ContentFormat, body: string) => {
      const timestamp = nowIso();
      const key = `${ideaId}:${format}`;

      setData((current) => {
        if (!current) return current;

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

      const existingTimer = variationTimers.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(async () => {
        variationTimers.current.delete(key);
        try {
          const saved = await upsertVariationRecord(ideaId, format, body);
          setData((current) => {
            if (!current) return current;
            const withoutTemp = current.variations.filter(
              (v) => !(v.ideaId === ideaId && v.format === format),
            );
            return {
              ...current,
              variations: [...withoutTemp, saved],
            };
          });

          const currentIdea = dataRef.current?.ideas.find((i) => i.id === ideaId);
          if (body.trim() && currentIdea?.status === "idea") {
            const updatedIdea = await updateIdeaRecord(ideaId, {
              status: "developing",
            });
            setData((current) =>
              current
                ? {
                    ...current,
                    ideas: current.ideas.map((idea) =>
                      idea.id === ideaId ? updatedIdea : idea,
                    ),
                  }
                : current,
            );
          }
          setError(null);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to save variation",
          );
        }
      }, 400);

      variationTimers.current.set(key, timer);
    },
    [],
  );

  const schedulePost = useCallback(async (input: ScheduleInput) => {
    try {
      const current = dataRef.current;
      const idea = current?.ideas.find((item) => item.id === input.ideaId);
      const localVariation =
        current?.variations.find(
          (v) => v.ideaId === input.ideaId && v.format === input.format,
        ) ?? null;

      const variation = await upsertVariationRecord(
        input.ideaId,
        input.format,
        localVariation?.body ?? "",
      );

      setData((prev) => {
        if (!prev) return prev;
        const withoutTemp = prev.variations.filter(
          (v) => !(v.ideaId === input.ideaId && v.format === input.format),
        );
        return { ...prev, variations: [...withoutTemp, variation] };
      });

      const created = await createScheduledPostRecord({
        ideaId: input.ideaId,
        contentVariationId: variation.id,
        platform: input.platform,
        format: input.format,
        title: input.title?.trim() || idea?.title || "Untitled",
        scheduledAt: input.scheduledAt,
      });

      let updatedIdea: Idea | null = null;
      if (idea && idea.status !== "published") {
        updatedIdea = await updateIdeaRecord(input.ideaId, {
          status: "scheduled",
        });
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              scheduledPosts: [...prev.scheduledPosts, created],
              ideas: updatedIdea
                ? prev.ideas.map((item) =>
                    item.id === input.ideaId ? updatedIdea! : item,
                  )
                : prev.ideas,
            }
          : prev,
      );
      setError(null);
      return created;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to schedule post";
      setError(message);
      throw err;
    }
  }, []);

  const updateScheduledPost = useCallback(
    async (
      id: string,
      patch: Partial<
        Pick<ScheduledPost, "scheduledAt" | "status" | "platform" | "format" | "title">
      >,
    ) => {
      try {
        const updated = await updateScheduledPostRecord(id, patch);
        let publishedIdea: Idea | null = null;

        if (patch.status === "published") {
          const ideaId = updated.ideaId;
          publishedIdea = await updateIdeaRecord(ideaId, {
            status: "published",
          });
        }

        setData((current) => {
          if (!current) return current;
          return {
            ...current,
            scheduledPosts: current.scheduledPosts.map((post) =>
              post.id === id ? updated : post,
            ),
            ideas: publishedIdea
              ? current.ideas.map((idea) =>
                  idea.id === publishedIdea!.id ? publishedIdea! : idea,
                )
              : current.ideas,
          };
        });
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update scheduled post";
        setError(message);
        throw err;
      }
    },
    [],
  );

  const deleteScheduledPost = useCallback(async (id: string) => {
    try {
      await deleteScheduledPostRecord(id);
      setData((current) =>
        current
          ? {
              ...current,
              scheduledPosts: current.scheduledPosts.filter(
                (post) => post.id !== id,
              ),
            }
          : current,
      );
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete scheduled post";
      setError(message);
      throw err;
    }
  }, []);

  const updatePillar = useCallback(async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const updated = await updatePillarRecord(id, trimmed);
      setData((current) =>
        current
          ? {
              ...current,
              pillars: current.pillars.map((pillar) =>
                pillar.id === id ? updated : pillar,
              ),
            }
          : current,
      );
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update pillar";
      setError(message);
      throw err;
    }
  }, []);

  const value = useMemo<ContentStoreValue>(
    () => ({
      ready,
      error,
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
      reload,
    }),
    [
      ready,
      error,
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
      reload,
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
