import { usePagedVideos } from "@/hooks/usePagedVideos";

export function usePlaylistVideos(playlistId: string) {
  return usePagedVideos(playlistId, 50);
}
