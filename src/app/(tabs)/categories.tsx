import { useRouter } from "expo-router";
import { FlatList, Image, Pressable, Text, View } from "react-native";

import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { FONT_BOLD, FONT_REGULAR } from "@/constants/fonts";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useTheme } from "@/hooks/useTheme";

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors, fontScale } = useTheme();
  const { playlists, loading, error, retry } = usePlaylists();

  if (loading) return <LoadingState message="جارٍ تحميل الأقسام..." />;
  if (error && playlists.length === 0) {
    return <ErrorState message={error} onRetry={retry} />;
  }
  if (playlists.length === 0) return <EmptyState message="لا توجد أقسام." />;

  return (
    <FlatList
      data={playlists}
      keyExtractor={(playlist) => playlist.id}
      numColumns={2}
      contentContainerStyle={{ padding: 10, backgroundColor: colors.background }}
      style={{ backgroundColor: colors.background }}
      columnWrapperStyle={{ gap: 12 }}
      onRefresh={retry}
      refreshing={loading}
      ListFooterComponent={
        error ? <ErrorState message={error} onRetry={retry} /> : undefined
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/playlist/[id]",
              params: { id: item.id, title: item.title },
            })
          }
          style={({ pressed }) => ({
            flex: 1,
            marginBottom: 12,
            overflow: "hidden",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View
            style={{
              width: "100%",
              aspectRatio: 16 / 10,
              backgroundColor: colors.thumbPlaceholder,
            }}
          >
            {item.thumbnail ? (
              <Image
                source={{ uri: item.thumbnail }}
                resizeMode="cover"
                style={{ width: "100%", height: "100%" }}
                accessibilityLabel={item.title}
              />
            ) : null}
          </View>
          <View style={{ padding: 10 }}>
            <Text
              numberOfLines={2}
              style={{
                color: colors.text,
                fontFamily: FONT_BOLD,
                fontSize: 15 * fontScale,
              }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontFamily: FONT_REGULAR,
                fontSize: 12 * fontScale,
                marginTop: 4,
              }}
            >
              {item.itemCount} حلقة
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}
