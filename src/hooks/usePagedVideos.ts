import { useCallback, useEffect, useRef, useState } from "react";

import { getPlaylistVideos } from "@/services/youtubeApi";
import type { Video } from "@/types";

export function usePagedVideos(playlistId: string, pageSize: number) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const nextTokenRef = useRef("");
  const consumedTokens = useRef(new Set<string>());
  const failedRequest = useRef<{ token: string; replace: boolean } | null>(null);
  const generation = useRef(0);

  const requestPage = useCallback(
    async (pageToken: string, replace: boolean, requestGeneration: number) => {
      if (inFlight.current) return;
      if (!playlistId) {
        setError("معرّف قائمة التشغيل غير صالح.");
        setLoading(false);
        return;
      }
      inFlight.current = true;
      setError(null);
      if (replace) {
        consumedTokens.current.clear();
        setLoading(true);
      }
      else setLoadingMore(true);

      try {
        const page = await getPlaylistVideos(playlistId, pageToken, pageSize);
        if (generation.current !== requestGeneration) return;
        if (pageToken) consumedTokens.current.add(pageToken);
        setVideos((current) => {
          if (replace) return page.videos;
          const knownIds = new Set(current.map((video) => video.id));
          return [...current, ...page.videos.filter((video) => !knownIds.has(video.id))];
        });
        const nextToken =
          page.nextPageToken &&
          page.nextPageToken !== pageToken &&
          !consumedTokens.current.has(page.nextPageToken)
            ? page.nextPageToken
            : "";
        nextTokenRef.current = nextToken;
        setNextPageToken(nextToken);
        failedRequest.current = null;
      } catch (requestError) {
        if (generation.current !== requestGeneration) return;
        failedRequest.current = { token: pageToken, replace };
        setError(
          requestError instanceof Error
            ? requestError.message
            : "تعذر تحميل الفيديوهات.",
        );
      } finally {
        if (generation.current === requestGeneration) {
          inFlight.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [pageSize, playlistId],
  );

  useEffect(() => {
    generation.current += 1;
    const requestGeneration = generation.current;
    inFlight.current = false;
    nextTokenRef.current = "";
    consumedTokens.current.clear();
    setTimeout(() => {
      setVideos([]);
      setNextPageToken("");
      setError(null);
      setLoading(true);
      setLoadingMore(false);
      void requestPage("", true, requestGeneration);
    }, 0);

    return () => {
      generation.current += 1;
    };
  }, [requestPage]);

  const loadMore = useCallback(() => {
    const token = nextTokenRef.current;
    if (
      !token ||
      inFlight.current ||
      failedRequest.current ||
      consumedTokens.current.has(token)
    ) {
      return;
    }
    void requestPage(token, false, generation.current);
  }, [requestPage]);

  const retry = useCallback(() => {
    const failed = failedRequest.current;
    if (failed) {
      void requestPage(failed.token, failed.replace, generation.current);
      return;
    }
    void requestPage("", true, generation.current);
  }, [requestPage]);

  return {
    videos,
    nextPageToken,
    loading,
    loadingMore,
    error,
    loadMore,
    retry,
  };
}
