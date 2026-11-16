import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getChannelVideos } from "@/services/youtubeApi";
import type { Video } from "@/types";

function normalizeArabic(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim();
}

export function useSearchVideos() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadId, setReloadId] = useState(0);
  const inFlight = useRef(false);

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(() => {
      if (inFlight.current) return;
      inFlight.current = true;
      setLoading(true);
      setError(null);

      void (async () => {
        try {
          const collected: Video[] = [];
          const seenPageTokens = new Set<string>();
          let token = "";
          for (let pageIndex = 0; pageIndex < 5; pageIndex += 1) {
            if (token && seenPageTokens.has(token)) break;
            if (token) seenPageTokens.add(token);
            const page = await getChannelVideos(token, 50);
            collected.push(...page.videos);
            token = page.nextPageToken;
            if (!token || seenPageTokens.has(token)) break;
          }
          if (active) {
            const uniqueVideos = new Map(
              collected.map((video) => [video.id, video] as const),
            );
            setVideos([...uniqueVideos.values()].slice(0, 250));
          }
        } catch (requestError) {
          if (active) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "تعذر تحميل نتائج البحث.",
            );
          }
        } finally {
          inFlight.current = false;
          if (active) setLoading(false);
        }
      })();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [reloadId]);

  const filteredVideos = useMemo(() => {
    const normalizedQuery = normalizeArabic(query);
    if (!normalizedQuery) return videos;
    return videos.filter((video) =>
      normalizeArabic(video.title).includes(normalizedQuery),
    );
  }, [query, videos]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadId((current) => current + 1);
  }, []);

  return {
    query,
    setQuery,
    videos: filteredVideos,
    loading,
    error,
    retry,
  };
}
