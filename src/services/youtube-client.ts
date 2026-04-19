import type { YouTubeChannelInfo, YouTubeData, YouTubeVideo } from "./youtube";

export const YT_CACHE_KEY_PREFIX = "yt_home_data_";
export const YT_CACHE_TTL = 1000 * 60 * 30; // 30 minutes

const RSS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
];

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface RSSVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: string;
}

interface ClientYouTubeData extends Pick<YouTubeData, "channel" | "latestVideos" | "popularVideos"> {
  timestamp: number;
}

interface FetchClientYouTubeDataOptions {
  apiKey?: string;
  channelId: string;
  maxLatest?: number;
  maxPopular?: number;
}

interface YouTubeApiChannelResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: Record<string, { url?: string }>;
    };
    statistics?: {
      subscriberCount?: string;
      videoCount?: string;
      viewCount?: string;
    };
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
}

interface YouTubeApiPlaylistItemsResponse {
  items?: Array<{
    contentDetails?: {
      videoId?: string;
    };
  }>;
}

interface YouTubeApiVideosResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      liveBroadcastContent?: string;
      thumbnails?: Record<string, { url?: string }>;
    };
    contentDetails?: {
      duration?: string;
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    liveStreamingDetails?: {
      scheduledStartTime?: string;
    };
  }>;
}

function formatViewCount(count: string | number): string {
  const num = typeof count === "number" ? count : parseInt(count, 10);
  if (Number.isNaN(num)) return String(count);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function parseRSSFeed(xml: string): RSSVideo[] {
  const videos: RSSVideo[] = [];
  const entries = xml.split("<entry>");

  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i];
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
    const descMatch = entry.match(/<media:description>([^<]*)<\/media:description>/);
    const viewsMatch = entry.match(/views="(\d+)"/);
    const thumbMatch = entry.match(/<media:thumbnail url="([^"]+)"/);

    if (!videoIdMatch) continue;

    const videoId = videoIdMatch[1];
    videos.push({
      id: videoId,
      title: titleMatch?.[1] || "",
      description: descMatch?.[1] || "",
      publishedAt: publishedMatch?.[1] || "",
      thumbnail: thumbMatch?.[1] || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      viewCount: viewsMatch?.[1] || "0",
    });
  }

  return videos;
}

function detectVideoStatus(input: {
  title: string;
  liveBroadcastContent?: string;
  scheduledStartTime?: string;
  viewCount?: string;
}): YouTubeVideo["status"] {
  const lowerTitle = input.title.toLowerCase();
  const isUpcoming =
    input.liveBroadcastContent === "upcoming" ||
    !!input.scheduledStartTime ||
    input.viewCount === "0" ||
    lowerTitle.includes("estreno") ||
    lowerTitle.includes("premiere") ||
    lowerTitle.includes("upcoming");
  const isLive = input.liveBroadcastContent === "live";
  const isMembersOnly =
    lowerTitle.includes("miembros") ||
    lowerTitle.includes("members only") ||
    lowerTitle.includes("exclusivo");

  if (isLive) return "live";
  if (isUpcoming) return "upcoming";
  if (isMembersOnly) return "members-only";
  return "published";
}

function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";

  const hours = Number.parseInt(match[1] || "0", 10);
  const minutes = Number.parseInt(match[2] || "0", 10);
  const seconds = Number.parseInt(match[3] || "0", 10);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getBestThumbnail(
  thumbnails: Record<string, { url?: string }> | undefined,
  fallback: string,
): { thumbnail: string; thumbnailHigh: string } {
  return {
    thumbnail:
      thumbnails?.medium?.url ||
      thumbnails?.high?.url ||
      thumbnails?.default?.url ||
      fallback,
    thumbnailHigh:
      thumbnails?.maxres?.url ||
      thumbnails?.standard?.url ||
      thumbnails?.high?.url ||
      thumbnails?.medium?.url ||
      fallback,
  };
}

function mapRSSVideo(video: RSSVideo): YouTubeVideo {
  const status = detectVideoStatus({
    title: video.title,
    viewCount: video.viewCount,
  });

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumbnail,
    thumbnailHigh: `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
    publishedAt: video.publishedAt,
    duration: "",
    viewCount: formatViewCount(video.viewCount),
    likeCount: "0",
    commentCount: "0",
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    status,
    statusLabel: "",
  };
}

async function fetchText(url: string): Promise<string | null> {
  const candidates = [url, ...RSS_PROXIES.map((proxy) => `${proxy}${encodeURIComponent(url)}`)];

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate);
      if (response.ok) return await response.text();
    } catch {
      continue;
    }
  }

  return null;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

async function fetchYouTubeDataFromRSS(
  channelId: string,
  maxLatest: number,
  maxPopular: number,
): Promise<Pick<YouTubeData, "channel" | "latestVideos" | "popularVideos"> | null> {
  const poolSize = Math.max(maxLatest, maxPopular, 15);
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const xml = await fetchText(rssUrl);

  if (!xml) return null;

  const videos = parseRSSFeed(xml)
    .slice(0, poolSize)
    .map(mapRSSVideo);

  if (videos.length === 0) return null;

  const popularVideos = [...videos]
    .sort((a, b) => {
      const aViews = parseInt(a.viewCount.replace(/[^0-9]/g, ""), 10) || 0;
      const bViews = parseInt(b.viewCount.replace(/[^0-9]/g, ""), 10) || 0;
      return bViews - aViews;
    })
    .slice(0, maxPopular);

  return {
    channel: null,
    latestVideos: videos.slice(0, maxLatest),
    popularVideos,
  };
}

async function fetchYouTubeDataFromApi(
  channelId: string,
  apiKey: string,
  maxLatest: number,
  maxPopular: number,
): Promise<Pick<YouTubeData, "channel" | "latestVideos" | "popularVideos"> | null> {
  const poolSize = Math.max(maxLatest, maxPopular, 15);
  const channelUrl = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${apiKey}`;
  const channelResponse = await fetchJson<YouTubeApiChannelResponse>(channelUrl);
  const channelItem = channelResponse?.items?.[0];

  if (!channelItem) return null;

  const uploadsPlaylistId =
    channelItem.contentDetails?.relatedPlaylists?.uploads ||
    channelItem.id.replace(/^UC/, "UU");

  const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${poolSize}&key=${apiKey}`;
  const playlistResponse = await fetchJson<YouTubeApiPlaylistItemsResponse>(playlistUrl);
  const videoIds = (playlistResponse?.items || [])
    .map((item) => item.contentDetails?.videoId || "")
    .filter(Boolean);

  if (videoIds.length === 0) return null;

  const videosUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics,liveStreamingDetails&id=${videoIds.join(",")}&key=${apiKey}`;
  const videosResponse = await fetchJson<YouTubeApiVideosResponse>(videosUrl);

  if (!videosResponse?.items?.length) return null;

  const rawVideos = videosResponse.items
    .map((item) => {
      if (!item.id) return null;

      const fallbackThumb = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
      const { thumbnail, thumbnailHigh } = getBestThumbnail(item.snippet?.thumbnails, fallbackThumb);
      const rawViewCount = parseInt(item.statistics?.viewCount || "0", 10) || 0;
      const status = detectVideoStatus({
        title: item.snippet?.title || "",
        liveBroadcastContent: item.snippet?.liveBroadcastContent,
        scheduledStartTime: item.liveStreamingDetails?.scheduledStartTime,
        viewCount: item.statistics?.viewCount || "0",
      });

      const video: YouTubeVideo = {
        id: item.id,
        title: item.snippet?.title || "",
        description: item.snippet?.description || "",
        thumbnail,
        thumbnailHigh,
        publishedAt: item.snippet?.publishedAt || "",
        duration: parseDuration(item.contentDetails?.duration || ""),
        viewCount: formatViewCount(rawViewCount),
        likeCount: formatViewCount(item.statistics?.likeCount || "0"),
        commentCount: formatViewCount(item.statistics?.commentCount || "0"),
        embedUrl: `https://www.youtube.com/embed/${item.id}`,
        status,
        statusLabel: "",
      };

      return { video, rawViewCount };
    })
    .filter((item): item is { video: YouTubeVideo; rawViewCount: number } => !!item)
    .sort((a, b) => {
      const aDate = Date.parse(a.video.publishedAt) || 0;
      const bDate = Date.parse(b.video.publishedAt) || 0;
      return bDate - aDate;
    });

  if (rawVideos.length === 0) return null;

  const channelThumbs = channelItem.snippet?.thumbnails || {};
  const channelThumbnail =
    channelThumbs.high?.url ||
    channelThumbs.medium?.url ||
    channelThumbs.default?.url ||
    "";

  const channel: YouTubeChannelInfo = {
    id: channelItem.id,
    title: channelItem.snippet?.title || "Las Locuras de Miguelín",
    description: channelItem.snippet?.description || "",
    subscriberCount: channelItem.statistics?.subscriberCount || "0",
    videoCount: channelItem.statistics?.videoCount || "0",
    viewCount: channelItem.statistics?.viewCount || "0",
    thumbnail: channelThumbnail,
    uploadsPlaylistId,
  };

  return {
    channel,
    latestVideos: rawVideos.slice(0, maxLatest).map((item) => item.video),
    popularVideos: [...rawVideos]
      .sort((a, b) => b.rawViewCount - a.rawViewCount)
      .slice(0, maxPopular)
      .map((item) => item.video),
  };
}

function readCachedYouTubeData(cacheKey: string): Pick<YouTubeData, "channel" | "latestVideos" | "popularVideos"> | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as ClientYouTubeData;
    const isExpired = Date.now() - parsed.timestamp > YT_CACHE_TTL;

    if (isExpired) return null;

    return {
      channel: parsed.channel,
      latestVideos: parsed.latestVideos,
      popularVideos: parsed.popularVideos,
    };
  } catch {
    return null;
  }
}

function writeCachedYouTubeData(
  cacheKey: string,
  data: Pick<YouTubeData, "channel" | "latestVideos" | "popularVideos">,
): void {
  try {
    const payload: ClientYouTubeData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch {
    // Ignore storage errors.
  }
}

export async function fetchAllYouTubeDataClient(
  options: FetchClientYouTubeDataOptions,
): Promise<Pick<YouTubeData, "channel" | "latestVideos" | "popularVideos"> | null> {
  const {
    apiKey = "",
    channelId,
    maxLatest = 12,
    maxPopular = 6,
  } = options;

  if (!channelId) return null;

  const cacheKey = `${YT_CACHE_KEY_PREFIX}${channelId}`;
  const cachedData = readCachedYouTubeData(cacheKey);
  if (cachedData) return cachedData;

  let data = await fetchYouTubeDataFromRSS(channelId, maxLatest, maxPopular);

  if (!data && apiKey) {
    data = await fetchYouTubeDataFromApi(channelId, apiKey, maxLatest, maxPopular);
  }

  if (!data) return null;

  writeCachedYouTubeData(cacheKey, data);
  return data;
}
