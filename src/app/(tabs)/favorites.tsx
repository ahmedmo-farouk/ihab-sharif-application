import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList } from "react-native";

import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { VideoCard } from "@/components/VideoCard";
import { useTheme } from "@/hooks/useTheme";
import { useLibraryStore } from "@/store/libraryStore";

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const favorites = useLibraryStore((state) => state.favorites);
  const hasHydrated = useLibraryStore((state) => state.hasHydrated);
  const hydrationError = useLibraryStore((state) => state.hydrationError);
  const retryHydration = useCallback(() => {
    void useLibraryStore.persist.rehydrate();
  }, []);

  if (hydrationError) {
    return <ErrorState message={hydrationError} onRetry={retryHydration} />;
  }
  if (!hasHydrated) return <LoadingState />;
  if (favorites.length === 0) {
    return <EmptyState message="لسه مضفتش حاجة للمفضلة" />;
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(video) => video.id}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, backgroundColor: colors.background }}
      renderItem={({ item }) => (
        <VideoCard
          video={item}
          onPress={() =>
            router.push({
              pathname: "/video/[id]",
              params: {
                id: item.id,
                title: item.title,
                thumbnail: item.thumbnail ?? "",
              },
            })
          }
        />
      )}
    />
  );
}
