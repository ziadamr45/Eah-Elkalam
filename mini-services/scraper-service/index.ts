const PORT = 3004;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Global Error Handlers ───────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION]", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_URL =
  "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=EG&maxResults=20";
const GOOGLE_TRENDS_RSS_URL = "https://trends.google.com/trending/rss?geo=EG";

// ─── Cache Layer ──────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function getExpiredCache<T>(key: string): T | null {
  const entry = cache.get(key);
  return entry ? (entry.data as T) : null;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface YouTubeTrendItem {
  id: string;
  headline: string;
  platform: "youtube";
  category: string;
  heatScore: number;
  videoUrl: string;
  thumbnail: string;
  viewCount: number;
  channelTitle: string;
  publishedAt: string;
}

export interface GoogleTrendItem {
  id: string;
  headline: string;
  platform: "google";
  category: string;
  heatScore: number;
  relatedQueries: string[];
  searchVolume: number;
  articleUrl: string;
  articleTitle: string;
}

export type TrendItem = YouTubeTrendItem | GoogleTrendItem;

interface ScrapeResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  cached?: boolean;
}

// ─── YouTube Category Mapping ────────────────────────────────────────────────
const YOUTUBE_CATEGORY_MAP: Record<string, string> = {
  "1": "entertainment", "2": "entertainment", "10": "entertainment",
  "15": "entertainment", "17": "sports", "18": "entertainment",
  "19": "entertainment", "20": "tech", "21": "entertainment",
  "22": "entertainment", "23": "entertainment", "24": "entertainment",
  "25": "politics", "26": "education", "27": "education",
  "28": "tech", "29": "viral", "30": "entertainment",
  "31": "entertainment", "32": "entertainment", "33": "entertainment",
  "34": "entertainment", "35": "entertainment", "36": "entertainment",
  "37": "entertainment", "38": "entertainment", "39": "entertainment",
  "40": "entertainment", "41": "entertainment", "42": "entertainment",
  "43": "entertainment", "44": "entertainment",
};

// ─── Heat Score Calculator ───────────────────────────────────────────────────
function calculateHeatScore(viewCount: number): number {
  if (viewCount <= 0) return 1;
  const logViews = Math.log10(viewCount);
  return Math.min(10, Math.max(1, Math.round((logViews - 3) * (9 / 5))));
}

// ─── Category Inference ──────────────────────────────────────────────────────
function inferCategoryFromQuery(query: string): string {
  const q = query.toLowerCase();
  const categoryKeywords: Record<string, string[]> = {
    sports: ["football", "soccer", "match", "league", "كرة", "ماتش", "أهلي", "زمالك", "منتخب", "دوري"],
    tech: ["technology", "app", "phone", "internet", "تكنولوجيا", "تطبيق", "موبايل", "إنترنت", "باقة"],
    entertainment: ["movie", "series", "song", "music", "show", "فيلم", "مسلسل", "أغنية", "رمضان"],
    politics: ["politics", "government", "president", "election", "سياسة", "حكومة", "رئيس", "انتخابات"],
    economy: ["economy", "dollar", "price", "stock", "gold", "دولار", "سعر", "اقتصاد", "بورصة"],
    education: ["education", "exam", "university", "school", "تعليم", "ثانوية", "جامعة", "امتحان"],
    food: ["food", "restaurant", "recipe", "أكل", "كشري", "فول", "مطعم"],
    health: ["health", "hospital", "doctor", "disease", "صحة", "مستشفى", "دواء", "مرض"],
    viral: ["trend", "viral", "challenge", "ترند", "تحدي", "فاير"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => q.includes(kw))) {
      return category;
    }
  }
  return "viral";
}

// ─── YouTube Scraper ─────────────────────────────────────────────────────────
async function scrapeYouTube(): Promise<ScrapeResponse<YouTubeTrendItem[]>> {
  const cacheKey = "youtube";
  const cached = getCache<YouTubeTrendItem[]>(cacheKey);
  if (cached) {
    return { success: true, data: cached, cached: true };
  }

  try {
    const response = await fetch(YOUTUBE_URL + `&key=${YOUTUBE_API_KEY}`);
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const items: YouTubeTrendItem[] = (json.items || []).map(
      (item: {
        id: string;
        snippet: {
          title: string;
          categoryId: string;
          channelTitle: string;
          publishedAt: string;
          thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
        };
        statistics: { viewCount: string; likeCount: string };
      }) => {
        const viewCount = parseInt(item.statistics.viewCount || "0", 10);
        const thumbnails = item.snippet.thumbnails;
        const thumbnail =
          thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || "";

        return {
          id: `yt-${item.id}`,
          headline: item.snippet.title,
          platform: "youtube" as const,
          category: YOUTUBE_CATEGORY_MAP[item.snippet.categoryId] || "entertainment",
          heatScore: calculateHeatScore(viewCount),
          videoUrl: `https://www.youtube.com/embed/${item.id}`,
          thumbnail,
          viewCount,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
        };
      }
    );

    setCache(cacheKey, items);
    return { success: true, data: items };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error fetching YouTube data";
    console.error("[YouTube Scraper Error]", errMsg);

    const expiredCache = getExpiredCache<YouTubeTrendItem[]>(cacheKey);
    if (expiredCache) {
      return { success: false, data: expiredCache, error: errMsg, cached: true };
    }

    return { success: false, data: [], error: errMsg };
  }
}

// ─── Google Trends Scraper (via RSS) ─────────────────────────────────────────
function parseRSSItems(xml: string): GoogleTrendItem[] {
  const items: GoogleTrendItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    try {
      const itemXml = match[1];

      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].trim() : "";
      if (!title) continue;

      const trafficMatch = itemXml.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/);
      let traffic = 0;
      if (trafficMatch) {
        const raw = trafficMatch[1].trim();
        const numOnly = parseInt(raw.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(numOnly)) {
          traffic = numOnly;
          if (raw.includes("K") || raw.includes("k")) traffic = numOnly * 1000;
          if (raw.includes("M") || raw.includes("m")) traffic = numOnly * 1000000;
        }
      }

      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const link = linkMatch ? linkMatch[1].trim() : "";

      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
      const description = descMatch ? descMatch[1].trim() : "";

      // Extract article info from description
      const newsUrlMatch = description.match(/href="([^"]+)"/);
      const articleUrl = newsUrlMatch ? newsUrlMatch[1] : link;

      const newsTitleMatch = description.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const articleTitle = newsTitleMatch
        ? newsTitleMatch[1].replace(/<[^>]+>/g, "").trim()
        : "";

      // Extract related queries
      const relatedQueries: string[] = [];
      const queryRegex = /<a[^>]*>([\s\S]*?)<\/a>/g;
      let qMatch;
      while ((qMatch = queryRegex.exec(description)) !== null) {
        const qText = qMatch[1].replace(/<[^>]+>/g, "").trim();
        if (qText && qText !== articleTitle) {
          relatedQueries.push(qText);
        }
      }

      items.push({
        id: `gt-${Buffer.from(title).toString("base64").slice(0, 20)}`,
        headline: title,
        platform: "google",
        category: inferCategoryFromQuery(title),
        heatScore: calculateHeatScore(traffic || 100),
        relatedQueries: relatedQueries.slice(0, 5),
        searchVolume: traffic,
        articleUrl,
        articleTitle,
      });
    } catch (parseErr) {
      console.error("[RSS Parse Error]", parseErr);
    }
  }

  return items;
}

async function scrapeGoogleTrends(): Promise<ScrapeResponse<GoogleTrendItem[]>> {
  const cacheKey = "google-trends";
  const cached = getCache<GoogleTrendItem[]>(cacheKey);
  if (cached) {
    return { success: true, data: cached, cached: true };
  }

  try {
    const response = await fetch(GOOGLE_TRENDS_RSS_URL);
    if (!response.ok) {
      throw new Error(`Google Trends RSS returned ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();
    const trendItems = parseRSSItems(xml);

    setCache(cacheKey, trendItems);
    return { success: true, data: trendItems };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error fetching Google Trends data";
    console.error("[Google Trends Scraper Error]", errMsg);

    const expiredCache = getExpiredCache<GoogleTrendItem[]>(cacheKey);
    if (expiredCache) {
      return { success: false, data: expiredCache, error: errMsg, cached: true };
    }

    return { success: false, data: [], error: errMsg };
  }
}

// ─── Combined Scraper ────────────────────────────────────────────────────────
async function scrapeAll(): Promise<ScrapeResponse<TrendItem[]>> {
  const youtubeResult = await scrapeYouTube();
  const googleResult = await scrapeGoogleTrends();

  const combined: TrendItem[] = [
    ...youtubeResult.data,
    ...googleResult.data,
  ];

  // Deduplicate by headline
  const seen = new Set<string>();
  const deduplicated = combined.filter((item) => {
    const key = item.headline.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by heatScore descending
  deduplicated.sort((a, b) => b.heatScore - a.heatScore);

  const errors: string[] = [];
  if (!youtubeResult.success && youtubeResult.error) errors.push(`YouTube: ${youtubeResult.error}`);
  if (!googleResult.success && googleResult.error) errors.push(`Google Trends: ${googleResult.error}`);

  return {
    success: youtubeResult.success && googleResult.success,
    data: deduplicated,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    const corsHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (path === "/api/health") {
        return Response.json(
          {
            status: "ok",
            service: "scraper-service",
            version: "1.0.0",
            uptime: process.uptime(),
            cacheEntries: cache.size,
            timestamp: new Date().toISOString(),
          },
          { headers: corsHeaders }
        );
      }

      if (path === "/api/scrape/youtube") {
        const result = await scrapeYouTube();
        return Response.json(result, { headers: corsHeaders });
      }

      if (path === "/api/scrape/google-trends") {
        const result = await scrapeGoogleTrends();
        return Response.json(result, { headers: corsHeaders });
      }

      if (path === "/api/scrape/all") {
        const result = await scrapeAll();
        return Response.json(result, { headers: corsHeaders });
      }

      return Response.json(
        { error: "Not Found", path },
        { status: 404, headers: corsHeaders }
      );
    } catch (err) {
      console.error("[Handler Error]", err);
      return Response.json(
        { success: false, error: "Internal server error" },
        { status: 200, headers: corsHeaders }
      );
    }
  },
});

console.log(`🚀 Scraper Service running on http://localhost:${PORT}`);
console.log(`   Endpoints:`);
console.log(`   GET /api/health`);
console.log(`   GET /api/scrape/youtube`);
console.log(`   GET /api/scrape/google-trends`);
console.log(`   GET /api/scrape/all`);
