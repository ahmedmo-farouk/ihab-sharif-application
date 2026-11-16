export type Video = {
  id: string;
  title: string;
  thumbnail?: string;
  publishedAt?: string;
};

export type Playlist = {
  id: string;
  title: string;
  thumbnail?: string;
  itemCount: number;
};

export type ThemeMode = "system" | "light" | "dark";
export type FontScale = "small" | "medium" | "large";

export type VideoPage = {
  videos: Video[];
  nextPageToken: string;
};

export type AsyncStatus = {
  loading: boolean;
  error: string | null;
};
