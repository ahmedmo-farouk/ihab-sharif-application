import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Video } from "@/types";

type LibraryState = {
  favorites: Video[];
  progress: Record<string, number>;
  hasHydrated: boolean;
  hydrationError: string | null;
  setHasHydrated: () => void;
  setHydrationError: (message: string) => void;
  toggleFavorite: (video: Video) => void;
  saveProgress: (id: string, seconds: number) => void;
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      favorites: [],
      progress: {},
      hasHydrated: false,
      hydrationError: null,
      setHasHydrated: () => set({ hasHydrated: true, hydrationError: null }),
      setHydrationError: (message) => set({ hydrationError: message }),
      toggleFavorite: (video) =>
        set((state) => {
          const exists = state.favorites.some((favorite) => favorite.id === video.id);
          return {
            favorites: exists
              ? state.favorites.filter((favorite) => favorite.id !== video.id)
              : [...state.favorites, video],
          };
        }),
      saveProgress: (id, seconds) =>
        set((state) => ({
          progress: { ...state.progress, [id]: Math.max(0, seconds) },
        })),
    }),
    {
      name: "video-library",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.setHydrationError(
            error instanceof Error ? error.message : "تعذر تحميل بيانات المكتبة.",
          );
        }
        else state?.setHasHydrated();
      },
    },
  ),
);
