import { STORAGE_KEY } from "@/lib/constants";
import type { AppData } from "@/lib/types";
import { createSeedData } from "@/lib/store/seed";

export function loadLocalData(): AppData {
  if (typeof window === "undefined") {
    return createSeedData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      saveLocalData(seed);
      return seed;
    }

    const parsed = JSON.parse(raw) as AppData;
    if (
      !parsed.pillars?.length ||
      !Array.isArray(parsed.ideas) ||
      !Array.isArray(parsed.variations) ||
      !Array.isArray(parsed.scheduledPosts)
    ) {
      const seed = createSeedData();
      saveLocalData(seed);
      return seed;
    }

    return parsed;
  } catch {
    const seed = createSeedData();
    saveLocalData(seed);
    return seed;
  }
}

export function saveLocalData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetLocalData() {
  const seed = createSeedData();
  saveLocalData(seed);
  return seed;
}
