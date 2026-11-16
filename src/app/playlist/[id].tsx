import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList } from "react-native";

import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { VideoCard } from "@/components/VideoCard";
import { usePlaylistVideos } from "@/hooks/usePlaylistVideos";
import { useTheme } from "@/hooks/useTheme";

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function PlaylistScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; title?: string | string[] }>();
  const playlistId = firstParam(params.id);
  const playlistTitle = firstParam(params.title) || "قائمة التشغيل";
  const router = useRouter();
  const { colors } = useTheme();
  const {
    videos,
    nextPageToken,
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  } = usePlaylistVideos(playlistId);

  const headerOptions = { title: playlistTitle };

  if (loading && videos.length === 0) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <LoadingState />
      </>
    );
  }
  if (error && videos.length === 0) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <ErrorState message={error} onRetry={retry} />
      </>
    );
  }
  if (videos.length === 0) {
    return (
      <>
        <Stack.Screen options={headerOptions} />
        <EmptyState message="لا توجد حلقات في هذا القسم." />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <FlatList
        data={videos}
        keyExtractor={(video) => video.id}
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 16, backgroundColor: colors.background }}
        onEndReached={() => {
          if (nextPageToken && !loadingMore) loadMore();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : loadingMore ? (
            <LoadingState message="جارٍ تحميل المزيد..." />
          ) : undefined
        }
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
    </>
  );
}
