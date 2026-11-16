import BrandHeader from "@/components/BrandHeader";
import AppTabs from "@/components/app-tabs";
import { FONT_BOLD } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";

export default function TabsLayout() {
  const { colors, fontScale } = useTheme();

  return (
    <AppTabs
      screenOptions={{
        headerShown: true,
        headerTitle: () => <BrandHeader />,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.headerBg,
          height: 62,
        },
        headerTintColor: colors.headerText,
        headerShadowVisible: false,
        headerTitleContainerStyle: {
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 94,
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: FONT_BOLD,
          fontSize: 11 * fontScale,
        },
      }}
    />
  );
}
