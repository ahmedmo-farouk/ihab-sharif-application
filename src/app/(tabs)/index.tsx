import { useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";

import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { VideoCard } from "@/components/VideoCard";
import { FONT_BOLD } from "@/constants/fonts";
import { useChannelVideos } from "@/hooks/useChannelVideos";
import { useTheme } from "@/hooks/useTheme";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, fontScale } = useTheme();
  const {
    videos,
    nextPageToken,
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  } = useChannelVideos();

  if (loading && videos.length === 0) return <LoadingState />;
  if (error && videos.length === 0) return <ErrorState message={error} onRetry={retry} />;
  if (videos.length === 0) return <EmptyState message="لا توجد فيديوهات حتى الآن." />;

  return (
    <FlatList
      data={videos}
      keyExtractor={(video) => video.id}
      contentContainerStyle={{
        padding: 16,
        backgroundColor: colors.background,
      }}
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View style={{ paddingBottom: 12 }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: FONT_BOLD,
              fontSize: 18 * fontScale,
            }}
          >
            آخر الدروس
          </Text>
        </View>
      }
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
  );
}
