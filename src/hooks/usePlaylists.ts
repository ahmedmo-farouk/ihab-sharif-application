import { useCallback, useEffect, useState } from "react";

import { getPlaylists } from "@/services/youtubeApi";
import type { Playlist } from "@/types";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(() => {
      getPlaylists()
        .then((result) => {
          if (active) setPlaylists(result);
        })
        .catch((requestError: unknown) => {
          if (active) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "تعذر تحميل الأقسام.",
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [reloadId]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadId((current) => current + 1);
  }, []);

  return { playlists, loading, error, retry };
}
