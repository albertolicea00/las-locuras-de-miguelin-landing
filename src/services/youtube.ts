// ============================================
// YouTube Data Service
// Uses RSS feeds + page scraping (no API quota limits)
// Falls back to API if RSS fails and key is available
// ============================================

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailHigh: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  embedUrl: string;
}

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  thumbnail: string;
  uploadsPlaylistId: string;
}

// ---- Helpers ----

function formatViewCount(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return count;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return count;
}

// ---- RSS Feed Parsing ----

interface RSSVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: string;
}

function parseRSSFeed(xml: string): { channelId: string; channelTitle: string; videos: RSSVideo[] } {
  const channelIdMatch = xml.match(/<yt:channelId>([^<]+)<\/yt:channelId>/);
  const channelTitleMatch = xml.match(/<author>\s*<name>([^<]+)<\/name>/);
  const channelId = channelIdMatch?.[1] || "";
  const channelTitle = channelTitleMatch?.[1] || "";

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

    if (videoIdMatch) {
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
  }

  return { channelId, channelTitle, videos };
}

// ---- Channel page scraping for stats ----

async function scrapeChannelStats(handle: string): Promise<{
  subscriberCount: string;
  videoCount: string;
  description: string;
  thumbnail: string;
} | null> {
  try {
    const url = `https://www.youtube.com/@${handle}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract subscriber count from meta or JSON
    const subMatch = html.match(/"subscriberCountText":\s*\{"simpleText":\s*"([^"]+)"\}/);
    const videoCountMatch = html.match(/"videosCountText":\s*\{"runs":\s*\[\{"text":\s*"([^"]+)"\}/);
    const descMatch = html.match(/"description":\s*"([^"]*?)(?:"|\\)/);
    const thumbMatch = html.match(/"avatar":\s*\{"thumbnails":\s*\[.*?\{"url":\s*"([^"]+)"/);

    return {
      subscriberCount: subMatch?.[1] || "0",
      videoCount: videoCountMatch?.[1]?.replace(/[^0-9]/g, "") || "0",
      description: descMatch?.[1] || "",
      thumbnail: thumbMatch?.[1] || "",
    };
  } catch (error) {
    console.error("[YouTube] Scraping error:", error);
    return null;
  }
}

// ---- Get channel ID from handle via RSS or page ----

async function getChannelIdFromHandle(handle: string): Promise<string | null> {
  try {
    // Try fetching the channel page and extracting channel ID
    const response = await fetch(`https://www.youtube.com/@${handle}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok) return null;

    const html = await response.text();
    const channelIdMatch = html.match(/"browseId":\s*"(UC[^"]+)"/) || html.match(/"channelId":\s*"(UC[^"]+)"/);
    return channelIdMatch?.[1] || null;
  } catch {
    return null;
  }
}

// ---- Public API ----

export async function getChannelInfo(): Promise<YouTubeChannelInfo | null> {
  const handle = import.meta.env.YOUTUBE_CHANNEL_HANDLE || "laslocurasdemiguelin4300";
  const envChannelId = import.meta.env.YOUTUBE_CHANNEL_ID || "";

  console.log("[YouTube] Fetching channel info via scraping...");

  const channelId = envChannelId || await getChannelIdFromHandle(handle);
  if (!channelId) {
    console.warn("[YouTube] Could not find channel ID for handle:", handle);
    return null;
  }

  // Fetch RSS to get basic info
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  let channelTitle = "";

  try {
    const rssResponse = await fetch(rssUrl);
    if (rssResponse.ok) {
      const rssXml = await rssResponse.text();
      const parsed = parseRSSFeed(rssXml);
      channelTitle = parsed.channelTitle;
    }
  } catch {
    // RSS optional for channel info
  }

  // Scrape stats from channel page
  const stats = await scrapeChannelStats(handle);

  return {
    id: channelId,
    title: channelTitle || "Las Locuras de Miguelín",
    description: stats?.description || "",
    subscriberCount: stats?.subscriberCount || "0",
    videoCount: stats?.videoCount || "0",
    viewCount: "0",
    thumbnail: stats?.thumbnail || "",
    uploadsPlaylistId: channelId.replace("UC", "UU"), // Standard YT convention
  };
}

export async function getLatestVideos(channelId: string, maxResults = 12): Promise<YouTubeVideo[]> {
  console.log("[YouTube] Fetching latest videos via RSS...");

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const response = await fetch(rssUrl);
    if (!response.ok) {
      console.error("[YouTube] RSS fetch failed:", response.status);
      return [];
    }

    const xml = await response.text();
    const { videos } = parseRSSFeed(xml);

    return videos.slice(0, maxResults).map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      thumbnail: v.thumbnail,
      thumbnailHigh: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
      publishedAt: v.publishedAt,
      duration: "",
      viewCount: formatViewCount(v.viewCount),
      likeCount: "0",
      commentCount: "0",
      embedUrl: `https://www.youtube.com/embed/${v.id}`,
    }));
  } catch (error) {
    console.error("[YouTube] RSS error:", error);
    return [];
  }
}

export async function getMostPopularVideos(channelId: string, maxResults = 6): Promise<YouTubeVideo[]> {
  // RSS doesn't support sorting by views, so we get latest and sort by view count
  const videos = await getLatestVideos(channelId, 15);
  return videos
    .sort((a, b) => {
      const aViews = parseInt(a.viewCount.replace(/[^0-9]/g, ""), 10) || 0;
      const bViews = parseInt(b.viewCount.replace(/[^0-9]/g, ""), 10) || 0;
      return bViews - aViews;
    })
    .slice(0, maxResults);
}

export async function getShortVideos(channelId: string, maxResults = 8): Promise<YouTubeVideo[]> {
  // RSS doesn't distinguish shorts; return empty (we use Facebook Reels now)
  return [];
}

// ---- Convenience: Fetch all data in one call ----

export interface YouTubeData {
  channel: YouTubeChannelInfo | null;
  latestVideos: YouTubeVideo[];
  popularVideos: YouTubeVideo[];
  shorts: YouTubeVideo[];
}

export async function fetchAllYouTubeData(): Promise<YouTubeData> {
  const channel = await getChannelInfo();

  if (!channel) {
    console.warn("[YouTube] Could not fetch channel info. Using fallback data.");
    return { channel: null, latestVideos: [], popularVideos: [], shorts: [] };
  }

  const [latestVideos, popularVideos] = await Promise.all([
    getLatestVideos(channel.id, 12),
    getMostPopularVideos(channel.id, 6),
  ]);

  return { channel, latestVideos, popularVideos, shorts: [] };
}
