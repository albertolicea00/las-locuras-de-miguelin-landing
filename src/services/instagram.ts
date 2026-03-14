// ============================================
// Instagram Build-Time Fetcher
// Fetches HD profile pics + latest posts from Instagram's web API
// All data comes from a single API call per user
// Cache ensures we only call the API once per build
// ============================================

export interface InstagramPost {
  id: string;
  shortcode: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  isVideo: boolean;
  timestamp: number;
  url: string;
}

export interface InstagramData {
  profilePicUrl: string | null;
  posts: InstagramPost[];
}

// Build-time cache: shared across all pages in the same build
const dataCache: Record<string, InstagramData> = {};
let allFetched = false;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-IG-App-ID": "936619743392459",
  "Accept": "application/json",
};

/**
 * Fetch full Instagram data (profile pic + posts) for a single user.
 * Retries up to 2 times with exponential backoff on rate limit.
 */
async function fetchUserData(username: string, retries = 2): Promise<InstagramData | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, attempt * 2000));
        console.log(`[Instagram] Retry ${attempt} for @${username}`);
      }

      const response = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        { headers: HEADERS }
      );

      if (response.status === 429) {
        console.warn(`[Instagram] Rate limited for @${username} (attempt ${attempt + 1})`);
        continue;
      }

      if (!response.ok) return null;

      const json = await response.json();
      const user = json?.data?.user;
      if (!user) return null;

      const profilePicUrl = user.profile_pic_url_hd || user.profile_pic_url || null;

      // Extract posts from edge_owner_to_timeline_media
      const edges = user.edge_owner_to_timeline_media?.edges || [];
      const posts: InstagramPost[] = edges.map((edge: any) => {
        const node = edge.node;
        const captionEdges = node.edge_media_to_caption?.edges || [];
        return {
          id: node.id,
          shortcode: node.shortcode,
          thumbnail: node.thumbnail_src || node.display_url,
          caption: captionEdges[0]?.node?.text || "",
          likes: node.edge_liked_by?.count || 0,
          comments: node.edge_media_to_comment?.count || 0,
          isVideo: node.is_video || false,
          timestamp: node.taken_at_timestamp || 0,
          url: `https://www.instagram.com/p/${node.shortcode}/`,
        };
      });

      return { profilePicUrl, posts };
    } catch (error) {
      if (attempt === retries) {
        console.warn(`[Instagram] Failed to fetch @${username} after ${retries + 1} attempts`);
      }
    }
  }
  return null;
}

/**
 * Fetch profile pics for multiple users. Returns characterId -> CDN URL map.
 * Uses cache so API is only called once per build.
 */
export async function fetchAllProfilePics(
  characters: { id: string; instagramHandle: string }[]
): Promise<Record<string, string>> {
  // Ensure all data is fetched
  await fetchAllInstagramData(characters);

  const result: Record<string, string> = {};
  for (const { id } of characters) {
    if (dataCache[id]?.profilePicUrl) {
      result[id] = dataCache[id].profilePicUrl!;
    }
  }
  return result;
}

/**
 * Get Instagram posts for a specific character.
 * Must call fetchAllInstagramData first (or fetchAllProfilePics which calls it).
 */
export function getInstagramPosts(characterId: string): InstagramPost[] {
  return dataCache[characterId]?.posts || [];
}

/**
 * Fetch all Instagram data (pics + posts) for all characters.
 * Cached per build — only calls the API once.
 */
export async function fetchAllInstagramData(
  characters: { id: string; instagramHandle: string }[]
): Promise<void> {
  if (allFetched) {
    console.log("[Instagram] Using cached data");
    return;
  }

  for (const { id, instagramHandle } of characters) {
    if (!instagramHandle) continue;

    const data = await fetchUserData(instagramHandle);
    if (data) {
      console.log(`[Instagram] Got data for @${instagramHandle}: ${data.posts.length} posts`);
      dataCache[id] = data;
    } else {
      console.warn(`[Instagram] Could not fetch @${instagramHandle}`);
      dataCache[id] = { profilePicUrl: null, posts: [] };
    }

    // 1.5s between requests to avoid rate limiting
    await new Promise((r) => setTimeout(r, 1500));
  }

  allFetched = true;
}
