import {
  Cairo_400Regular,
  Cairo_700Bold,
} from "@expo-google-fonts/cairo";
import { useFonts } from "expo-font";
import { Stack, ThemeProvider, DarkTheme, DefaultTheme } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { I18nManager } from "react-native";

import { FONT_BOLD } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Cairo_400Regular, Cairo_700Bold });
  const { colors, fontScale, isDark } = useTheme();

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.headerBg },
          headerTintColor: colors.headerText,
          headerShadowVisible: false,
          headerTitleStyle: {
            color: colors.headerText,
            fontFamily: FONT_BOLD,
            fontSize: 16 * fontScale,
          },
          headerBackTitle: "رجوع",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="playlist/[id]" options={{ title: "قائمة التشغيل" }} />
        <Stack.Screen name="video/[id]" options={{ title: "الفيديو" }} />
      </Stack>
    </ThemeProvider>
  );
}
