import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { FontScale, ThemeMode } from "@/types";

type SettingsState = {
  themeMode: ThemeMode;
  fontScale: FontScale;
  setThemeMode: (mode: ThemeMode) => void;
  setFontScale: (scale: FontScale) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      fontScale: "medium",
      setThemeMode: (themeMode) => set({ themeMode }),
      setFontScale: (fontScale) => set({ fontScale }),
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
