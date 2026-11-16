import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";

import { FONT_BOLD, FONT_REGULAR } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/store/settingsStore";
import type { FontScale, ThemeMode } from "@/types";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "تلقائي" },
  { value: "light", label: "فاتح" },
  { value: "dark", label: "داكن" },
];

const FONT_OPTIONS: { value: FontScale; label: string }[] = [
  { value: "small", label: "صغير" },
  { value: "medium", label: "متوسط" },
  { value: "large", label: "كبير" },
];

export default function SettingsScreen() {
  const { colors, fontScale, isDark } = useTheme();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const fontScaleMode = useSettingsStore((state) => state.fontScale);
  const setFontScale = useSettingsStore((state) => state.setFontScale);

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 24,
        backgroundColor: colors.background,
      }}
    >
      <SettingGroup title="المظهر" colors={colors} fontScale={fontScale}>
        {THEME_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={themeMode === option.value}
            onPress={() => setThemeMode(option.value)}
            colors={colors}
            isDark={isDark}
            fontScale={fontScale}
          />
        ))}
      </SettingGroup>
      <SettingGroup title="حجم الخط" colors={colors} fontScale={fontScale}>
        {FONT_OPTIONS.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={fontScaleMode === option.value}
            onPress={() => setFontScale(option.value)}
            colors={colors}
            isDark={isDark}
            fontScale={fontScale}
          />
        ))}
      </SettingGroup>
    </View>
  );
}

type ThemeColors = ReturnType<typeof useTheme>["colors"];

function SettingGroup({
  title,
  colors,
  fontScale,
  children,
}: {
  title: string;
  colors: ThemeColors;
  fontScale: number;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          color: colors.text,
          fontFamily: FONT_BOLD,
          fontSize: 18 * fontScale,
        }}
      >
        {title}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>{children}</View>
    </View>
  );
}

function OptionButton({
  label,
  selected,
  onPress,
  colors,
  isDark,
  fontScale,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
  isDark: boolean;
  fontScale: number;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 46,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        borderRadius: 12,
        paddingHorizontal: 8,
        backgroundColor: selected ? colors.primary : colors.card,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          color: selected
            ? isDark
              ? colors.background
              : colors.headerText
            : colors.text,
          fontFamily: selected ? FONT_BOLD : FONT_REGULAR,
          fontSize: 14 * fontScale,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
