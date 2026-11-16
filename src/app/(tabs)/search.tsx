import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  TextInput,
  View,
} from "react-native";

import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { VideoCard } from "@/components/VideoCard";
import { FONT_REGULAR } from "@/constants/fonts";
import { useSearchVideos } from "@/hooks/useSearchVideos";
import { useTheme } from "@/hooks/useTheme";

export default function SearchScreen() {
  const router = useRouter();
  const { colors, fontScale } = useTheme();
  const { query, setQuery, videos, loading, error, retry } = useSearchVideos();

  const searchHeader = useMemo(
    () => (
      <TextInput
        accessibilityLabel="ابحث عن فيديو"
        value={query}
        onChangeText={setQuery}
        placeholder="ابحث عن فيديو..."
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={{
          minHeight: 50,
          marginBottom: 16,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          backgroundColor: colors.inputBg,
          color: colors.text,
          fontFamily: FONT_REGULAR,
          fontSize: 16 * fontScale,
        }}
      />
    ),
    [colors, fontScale, query, setQuery],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {searchHeader}
      {loading ? (
        <LoadingState message="جارٍ تحميل أحدث ٢٥٠ فيديو..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : videos.length === 0 ? (
        <EmptyState
          message={query ? "لا توجد نتائج مطابقة." : "لا توجد فيديوهات."}
        />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(video) => video.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}
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
      )}
    </View>
  );
}
