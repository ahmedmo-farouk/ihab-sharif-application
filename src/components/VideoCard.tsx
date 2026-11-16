import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FONT_BOLD, FONT_REGULAR } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import type { Video } from "@/types";

type VideoCardProps = {
  video: Video;
  onPress: () => void;
};

export function VideoCard({ video, onPress }: VideoCardProps) {
  const { colors, fontScale } = useTheme();
  const publishedLabel = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString("ar")
    : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`تشغيل الفيديو: ${video.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.thumbnailContainer,
          { backgroundColor: colors.thumbPlaceholder },
        ]}
      >
        {video.thumbnail ? (
          <Image
            source={{ uri: video.thumbnail }}
            contentFit="cover"
            style={styles.thumbnail}
            accessibilityLabel={video.title}
          />
        ) : null}
      </View>
      <Text
        numberOfLines={2}
        style={[
          styles.title,
          { color: colors.text, fontSize: 15 * fontScale },
        ]}
      >
        {video.title}
      </Text>
      {publishedLabel ? (
        <Text
          numberOfLines={1}
          style={[
            styles.subtitle,
            { color: colors.muted, fontSize: 12 * fontScale },
          ]}
        >
          {publishedLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontFamily: FONT_BOLD,
    lineHeight: 24,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 2,
  },
});
