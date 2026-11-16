import type { Playlist, Video, VideoPage } from "@/types";

export const CHANNEL_ID = "UCoz5JtGoJYy2HemkSVHWCTg";
export const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace(/^UC/, "UU");

const API_BASE_URL = "https://www.googleapis.com/youtube/v3";
const REQUEST_TIMEOUT_MS = 15_000;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_YT_KEY?.trim();
  if (!key) {
    throw new Error(
      "مفتاح YouTube API غير موجود. أضف EXPO_PUBLIC_YT_KEY إلى ملف .env ثم أعد تشغيل التطبيق.",
    );
  }
  return key;
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("انتهت مهلة الاتصال بـ YouTube. حاول مرة أخرى.");
      }
      const detail = error instanceof Error ? ` (${error.message})` : "";
      throw new Error(`تعذر الاتصال بـ YouTube. تحقق من اتصال الإنترنت${detail}`);
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      if (controller.signal.aborted) {
        throw new Error("انتهت مهلة الاتصال بـ YouTube. حاول مرة أخرى.");
      }
      body = null;
    }

    if (!response.ok) {
      const root = isRecord(body) ? body : undefined;
      const apiError = root && isRecord(root.error) ? root.error : undefined;
      const message = apiError ? stringValue(apiError.message) : undefined;
      throw new Error(
        message
          ? `YouTube API (${response.status}): ${message}`
          : `تعذر تحميل بيانات YouTube (HTTP ${response.status}).`,
      );
    }

    if (!isRecord(body)) {
      throw new Error("استجابة YouTube غير صالحة.");
    }
    return body;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildUrl(
  resource: string,
  params: Record<string, string | number>,
): string {
  const query = new URLSearchParams();
  query.set("key", getApiKey());
  for (const [key, value] of Object.entries(params)) {
    query.set(key, String(value));
  }
  return `${API_BASE_URL}/${resource}?${query.toString()}`;
}

function thumbnailFrom(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  const thumbnails = value.thumbnails;
  if (!isRecord(thumbnails)) return undefined;

  for (const size of ["high", "medium", "standard", "default"]) {
    const thumbnail = thumbnails[size];
    if (isRecord(thumbnail)) {
      const url = stringValue(thumbnail.url);
      if (url) return url;
    }
  }
  return undefined;
}

function videosFrom(body: unknown): Video[] {
  if (!isRecord(body) || !Array.isArray(body.items)) return [];

  const videos: Video[] = [];
  for (const item of body.items) {
    if (!isRecord(item) || !isRecord(item.snippet)) continue;
    const snippet = item.snippet;
    const resourceId = isRecord(snippet.resourceId) ? snippet.resourceId : undefined;
    const id = resourceId ? stringValue(resourceId.videoId) : undefined;
    const title = stringValue(snippet.title);
    if (!id || !title) continue;

    const normalizedTitle = title.trim().toLowerCase();
    if (normalizedTitle === "private video" || normalizedTitle === "deleted video") {
      continue;
    }

    videos.push({
      id,
      title,
      thumbnail: thumbnailFrom(snippet),
      publishedAt: stringValue(snippet.publishedAt),
    });
  }
  return videos;
}

function pageFrom(body: unknown): VideoPage {
  const root = isRecord(body) ? body : {};
  return {
    videos: videosFrom(body),
    nextPageToken: stringValue(root.nextPageToken) ?? "",
  };
}

export async function getChannelVideos(
  pageToken = "",
  pageSize = 20,
): Promise<VideoPage> {
  const params: Record<string, string | number> = {
    part: "snippet",
    maxResults: pageSize,
    playlistId: UPLOADS_PLAYLIST_ID,
  };
  if (pageToken) params.pageToken = pageToken;
  return pageFrom(
    await fetchJson(buildUrl("playlistItems", params)),
  );
}

export async function getPlaylistVideos(
  playlistId: string,
  pageToken = "",
  pageSize = 50,
): Promise<VideoPage> {
  const params: Record<string, string | number> = {
    part: "snippet",
    maxResults: pageSize,
    playlistId,
  };
  if (pageToken) params.pageToken = pageToken;
  return pageFrom(
    await fetchJson(buildUrl("playlistItems", params)),
  );
}

export async function getPlaylists(): Promise<Playlist[]> {
  const playlists: Playlist[] = [];
  const knownIds = new Set<string>();
  const seenPageTokens = new Set<string>();
  let pageToken = "";

  do {
    if (pageToken && seenPageTokens.has(pageToken)) break;
    if (pageToken) seenPageTokens.add(pageToken);
    const params: Record<string, string | number> = {
      part: "snippet,contentDetails",
      maxResults: 50,
      channelId: CHANNEL_ID,
    };
    if (pageToken) params.pageToken = pageToken;
    const body = await fetchJson(buildUrl("playlists", params));
    if (!isRecord(body)) break;

    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        if (!isRecord(item) || !isRecord(item.snippet)) continue;
        const id = stringValue(item.id);
        const title = stringValue(item.snippet.title);
        if (!id || !title || knownIds.has(id)) continue;

        const details = isRecord(item.contentDetails)
          ? item.contentDetails
          : undefined;
        const itemCount =
          details && typeof details.itemCount === "number"
            ? details.itemCount
            : 0;
        knownIds.add(id);
        playlists.push({
          id,
          title,
          thumbnail: thumbnailFrom(item.snippet),
          itemCount,
        });
      }
    }

    const nextPageToken = stringValue(body.nextPageToken) ?? "";
    pageToken =
      nextPageToken && !seenPageTokens.has(nextPageToken)
        ? nextPageToken
        : "";
  } while (pageToken);

  return playlists;
}
