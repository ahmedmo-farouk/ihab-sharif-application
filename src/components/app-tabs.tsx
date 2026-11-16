import { Tabs } from "expo-router";
import type { SymbolViewProps } from "expo-symbols";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

type AppTabsProps = {
  screenOptions?: ComponentProps<typeof Tabs>["screenOptions"];
};

type PlatformSymbols = {
  ios: NonNullable<Extract<SymbolViewProps["name"], object>["ios"]>;
  android: NonNullable<Extract<SymbolViewProps["name"], object>["android"]>;
};

type TabIconProps = {
  color: ColorValue | null | undefined;
  focused: boolean;
  size: number;
};

function tabIcon(
  ios: { inactive: PlatformSymbols["ios"]; active: PlatformSymbols["ios"] },
  android: {
    inactive: PlatformSymbols["android"];
    active: PlatformSymbols["android"];
  },
) {
  return function RenderTabIcon({ color, focused, size }: TabIconProps) {
    return (
      <SymbolView
        name={{
          ios: focused ? ios.active : ios.inactive,
          android: focused ? android.active : android.inactive,
          web: focused ? android.active : android.inactive,
        }}
        size={size}
        tintColor={color ?? undefined}
      />
    );
  };
}

export default function AppTabs({ screenOptions }: AppTabsProps) {
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: tabIcon(
            { inactive: "house", active: "house.fill" },
            { inactive: "home", active: "home_filled" },
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "الأقسام",
          tabBarIcon: tabIcon(
            { inactive: "square.grid.2x2", active: "square.grid.2x2.fill" },
            { inactive: "video_library", active: "video_library" },
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "بحث",
          tabBarIcon: tabIcon(
            { inactive: "magnifyingglass", active: "magnifyingglass" },
            { inactive: "search", active: "search" },
          ),
        }}
      />
      <Tabs.Screen
        name="ibn-alhaytham"
        options={{
          title: " انا السلفي",
          tabBarIcon: tabIcon(
            { inactive: "waveform", active: "waveform" },
            { inactive: "headphones", active: "headphones" },
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "المفضلة",
          tabBarIcon: tabIcon(
            { inactive: "heart", active: "heart.fill" },
            { inactive: "favorite_border", active: "favorite" },
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "الإعدادات",
          tabBarIcon: tabIcon(
            { inactive: "gearshape", active: "gearshape.fill" },
            { inactive: "settings", active: "settings" },
          ),
        }}
      />
    </Tabs>
  );
}
