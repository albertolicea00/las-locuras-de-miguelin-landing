/**
 * Client-side script to handle Instagram data fetching and caching.
 * This runs on the user's browser, so requests come from their IP.
 */

export const IG_CACHE_KEY_PREFIX = "ig_data_";
export const IG_CACHE_TTL = 1000 * 60 * 60; // 1 hour

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
  timestamp: number;
}

const HEADERS = {
  "X-IG-App-ID": "936619743392459",
  Accept: "application/json",
};

export async function fetchInstagramDataClient(
  username: string,
): Promise<InstagramData | null> {
  const cacheKey = `${IG_CACHE_KEY_PREFIX}${username}`;

  // 1. Check LocalStorage Cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as InstagramData;
      const isExpired = Date.now() - parsed.timestamp > IG_CACHE_TTL;
      if (!isExpired) {
        console.log(`[IG Client] Using cached data for @${username}`);
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[IG Client] Cache read error", e);
  }

  // 2. Fetch from Instagram via CORS proxy (Client IP)
  try {
    console.log(`[IG Client] Fetching @${username} from browser...`);
    
    const igUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    
    // Try multiple CORS proxy options
    const proxyUrls = [
      `https://corsproxy.io/?${encodeURIComponent(igUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(igUrl)}`,
    ];

    let response: Response | null = null;
    
    for (const proxyUrl of proxyUrls) {
      try {
        const r = await fetch(proxyUrl, {
          headers: {
            ...HEADERS,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        if (r.ok) {
          response = r;
          break;
        }
        if (r.status === 429) {
          console.warn(`[IG Client] Rate limited for @${username}`);
          return null;
        }
      } catch {
        continue; // try next proxy
      }
    }

    if (!response) {
      console.warn(`[IG Client] All proxies failed for @${username}`);
      return null;
    }

    const json = await response.json();
    const user = json?.data?.user;
    if (!user) return null;

    const profilePicUrl =
      user.profile_pic_url_hd || user.profile_pic_url || null;
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

    const data: InstagramData = {
      profilePicUrl,
      posts,
      timestamp: Date.now(),
    };

    // 3. Save to Cache
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error(`[IG Client] Error fetching @${username}:`, error);
    return null;
  }
}
