import YoutubePlayer, { type YoutubeIframeRef } from "react-native-youtube-iframe";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { FONT_BOLD, FONT_REGULAR } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { useLibraryStore } from "@/store/libraryStore";

const PROGRESS_POLL_INTERVAL_MS = 5_000;
const PROGRESS_SAVE_INTERVAL_MS = 20_000;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  const paddedRemainder = String(remainder).padStart(2, "0");

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${paddedRemainder}`
    : `${minutes}:${paddedRemainder}`;
}

export default function VideoScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    thumbnail?: string | string[];
  }>();
  const id = firstParam(params.id);
  const title = firstParam(params.title) || "الفيديو";
  const thumbnail = firstParam(params.thumbnail) || undefined;
  const { width } = useWindowDimensions();
  const { colors, fontScale, isDark } = useTheme();
  const playerRef = useRef<YoutubeIframeRef>(null);
  const resumedVideoId = useRef("");
  const [readyVideoId, setReadyVideoId] = useState("");
  const [playerError, setPlayerError] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [playback, setPlayback] = useState<{
    id: string;
    currentTime: number;
    duration: number;
  }>({ id: "", currentTime: 0, duration: 0 });
  const savedTime = useLibraryStore((state) => state.progress[id] ?? 0);
  const hasHydrated = useLibraryStore((state) => state.hasHydrated);
  const favorites = useLibraryStore((state) => state.favorites);
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite);
  const saveProgress = useLibraryStore((state) => state.saveProgress);
  const isFavorite = favorites.some((favorite) => favorite.id === id);
  const ready = readyVideoId === id;
  const activePlayerError = playerError?.id === id ? playerError.message : null;
  const currentTime = playback.id === id ? playback.currentTime : 0;
  const duration = playback.id === id ? playback.duration : 0;

  useEffect(() => {
    if (!ready || !hasHydrated || resumedVideoId.current === id) return;
    resumedVideoId.current = id;
    if (savedTime > 0) {
      void playerRef.current?.seekTo(savedTime, true);
    }
  }, [hasHydrated, id, ready, savedTime]);

  useEffect(() => {
    if (!ready || !hasHydrated || activePlayerError) return;
    let active = true;
    let updateInFlight = false;
    let latestSeconds = 0;
    let lastSavedAt = Date.now();

    const updateProgress = async () => {
      const player = playerRef.current;
      if (!player || updateInFlight) return;

      updateInFlight = true;
      try {
        const [seconds, total] = await Promise.all([
          player.getCurrentTime(),
          player.getDuration(),
        ]);
        if (!active) return;
        const validSeconds = Number.isFinite(seconds) ? seconds : 0;
        const validDuration = Number.isFinite(total) ? total : 0;
        latestSeconds = validSeconds;
        setPlayback({
          id,
          currentTime: validSeconds,
          duration: validDuration,
        });
        const now = Date.now();
        if (now - lastSavedAt >= PROGRESS_SAVE_INTERVAL_MS) {
          saveProgress(id, validSeconds);
          lastSavedAt = now;
        }
      } catch (error) {
        if (active) {
          setPlayerError(
            {
              id,
              message:
                error instanceof Error
                  ? error.message
                  : "تعذر قراءة تقدم الفيديو.",
            },
          );
        }
      } finally {
        updateInFlight = false;
      }
    };

    const timer = setInterval(() => {
      void updateProgress();
    }, PROGRESS_POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
      if (latestSeconds > 0) saveProgress(id, latestSeconds);
    };
  }, [activePlayerError, hasHydrated, id, ready, saveProgress]);

  const progressPercent =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      <Stack.Screen options={{ title: "الفيديو" }} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <YoutubePlayer
          key={id}
          ref={playerRef}
          height={(width * 9) / 16}
          width={width}
          videoId={id}
          play={hasHydrated && !activePlayerError}
          onReady={() => setReadyVideoId(id)}
          onError={(message: string) => setPlayerError({ id, message })}
          forceAndroidAutoplay
          webViewProps={{ allowsFullscreenVideo: true }}
        />
        <View style={{ padding: 16, gap: 16 }}>
          <Text
            style={{
              color: colors.text,
              fontFamily: FONT_BOLD,
              fontSize: 20 * fontScale,
            }}
          >
            {title}
          </Text>

          <View style={{ gap: 6 }}>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: Math.max(duration, currentTime, 1),
                now: currentTime,
              }}
              style={{
                height: 6,
                overflow: "hidden",
                borderRadius: 3,
                backgroundColor: colors.border,
              }}
            >
              <View
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  backgroundColor: colors.primary,
                }}
              />
            </View>
            <Text
              style={{
                color: colors.muted,
                fontFamily: FONT_REGULAR,
                fontSize: 13 * fontScale,
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>

          {activePlayerError ? (
            <Text
              accessibilityRole="alert"
              style={{
                color: colors.danger,
                fontFamily: FONT_REGULAR,
                fontSize: 14 * fontScale,
              }}
            >
              تعذر تشغيل الفيديو: {activePlayerError}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isFavorite }}
            onPress={() =>
              toggleFavorite({
                id,
                title,
                ...(thumbnail ? { thumbnail } : {}),
              })
            }
            style={({ pressed }) => ({
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              backgroundColor: isFavorite ? colors.danger : colors.primary,
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: 16,
            })}
          >
            <Text
              style={{
                color: isDark ? colors.background : colors.headerText,
                fontFamily: FONT_BOLD,
                fontSize: 15 * fontScale,
              }}
            >
              {isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
