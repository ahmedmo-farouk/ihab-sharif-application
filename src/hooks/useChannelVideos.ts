import { usePagedVideos } from "@/hooks/usePagedVideos";
import { UPLOADS_PLAYLIST_ID } from "@/services/youtubeApi";

export function useChannelVideos() {
  return usePagedVideos(UPLOADS_PLAYLIST_ID, 20);
}
