import { useColorScheme } from "react-native";

import { darkColors, lightColors } from "@/constants/theme";
import { useSettingsStore } from "@/store/settingsStore";
import type { FontScale, ThemeMode } from "@/types";

const FONT_SCALES: Record<FontScale, number> = {
  small: 0.9,
  medium: 1,
  large: 1.15,
};

export function useTheme() {
  const systemScheme = useColorScheme();
  const mode = useSettingsStore((state) => state.themeMode);
  const setMode = useSettingsStore((state) => state.setThemeMode);
  const fontScale = useSettingsStore((state) => state.fontScale);
  const isDark = mode === "dark" || (mode === "system" && systemScheme === "dark");

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
    mode,
    setMode: (nextMode: ThemeMode) => setMode(nextMode),
    fontScale: FONT_SCALES[fontScale],
    fontScaleMode: fontScale,
  };
}
