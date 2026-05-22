import { NextResponse } from "next/server";
import { TrendItem, Category, Sentiment } from "@/lib/trend-radar/types";
import { MOCK_TRENDS } from "@/lib/trend-radar/data";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3/videos";

// Map YouTube category IDs to our Category type
const YOUTUBE_CATEGORY_MAP: Record<string, Category> = {
  "1": "entertainment", // Film & Animation
  "2": "entertainment", // Autos & Vehicles
  "10": "entertainment", // Music
  "15": "entertainment", // Pets & Animals
  "17": "sports", // Sports
  "19": "entertainment", // Travel & Events
  "20": "entertainment", // Gaming
  "22": "entertainment", // People & Blogs
  "23": "entertainment", // Comedy
  "24": "entertainment", // Entertainment
  "25": "tech", // News & Politics -> tech for variety
  "26": "education", // How-to & Style
  "27": "education", // Education
  "28": "tech", // Science & Technology
  "29": "entertainment", // Nonprofits & Activism
};

// Determine category based on video tags and title keywords
function inferCategory(title: string, tags: string[], categoryId: string): Category {
  // First check the YouTube category mapping
  const mappedCategory = YOUTUBE_CATEGORY_MAP[categoryId];
  
  // Then check title/tags for more specific categories
  const combinedText = (title + " " + tags.join(" ")).toLowerCase();
  
  if (/\b(كرة|ماتش|أهلي|زمالك|منتخب|رياض|goal|match|football|soccer)\b/i.test(combinedText)) {
    return "sports";
  }
  if (/\b(تكنولوج|تقن|برمج|ذكاء اصطناع|tech|ai|phone|iphone|galaxy)\b/i.test(combinedText)) {
    return "tech";
  }
  if (/\b(سياس|رئيس|حكوم|وزار|برلمان|politic|president|government)\b/i.test(combinedText)) {
    return "politics";
  }
  if (/\b(أكل|طعام|مطعم|كشري|فول|recipe|food|cook|restaurant)\b/i.test(combinedText)) {
    return "food";
  }
  if (/\b(تعليم|مدرس|جامع|امتحان|ثانوي|education|school|university|exam)\b/i.test(combinedText)) {
    return "education";
  }
  if (/\b(اقتصاد|بورص|دولار|أسعار|جنيه|economy|stock|dollar|price)\b/i.test(combinedText)) {
    return "economy";
  }
  if (/\b(صح|مرض|طب|مستشفي|دواء|health|medical|doctor|hospital)\b/i.test(combinedText)) {
    return "health";
  }
  if (/\b(ترند|فاير|فيروس|viral|trend)\b/i.test(combinedText)) {
    return "viral";
  }
  
  return mappedCategory || "entertainment";
}

// Generate heat score based on view count
function calculateHeatScore(viewCount: number): number {
  if (viewCount >= 10_000_000) return 10;
  if (viewCount >= 5_000_000) return 9;
  if (viewCount >= 2_000_000) return 8;
  if (viewCount >= 1_000_000) return 7;
  if (viewCount >= 500_000) return 6;
  if (viewCount >= 200_000) return 5;
  if (viewCount >= 100_000) return 4;
  if (viewCount >= 50_000) return 3;
  if (viewCount >= 10_000) return 2;
  return 1;
}

// Determine sentiment based on title/content
function inferSentiment(title: string, heatScore: number): Sentiment {
  const lowerTitle = title.toLowerCase();
  if (heatScore >= 9) return "viral";
  if (/\b(أزمة|مشكل|غضب|غالي|خسر|انهيار|crisis|angry|expensive|fail)\b/i.test(lowerTitle)) {
    return "negative";
  }
  if (/\b(نجاح|فوز|إنجاز|فرح|حلو|success|win|achievement|happy)\b/i.test(lowerTitle)) {
    return "positive";
  }
  return "neutral";
}

// Generate Egyptian Arabic explanation based on video title
function generateExplanation(title: string, viewCount: number, category: Category): string {
  const viewStr = viewCount >= 1_000_000 
    ? `${(viewCount / 1_000_000).toFixed(1)} مليون` 
    : viewCount >= 1_000 
      ? `${(viewCount / 1_000).toFixed(0)} ألف` 
      : viewCount.toString();

  const categoryExplanations: Record<Category, string> = {
    sports: `فيديو رياضي اتصور ${viewStr} مرة! الناس شغالة تتكلم عن الموضوع ده والترند مبيعملش خلاص`,
    tech: `فيديو تكنولوجي شغال بجنون على يوتيوب ${viewStr} مشاهدة! المحتوى التقني بيعمل ضجة كبيرة`,
    entertainment: `الفيديو ده اتصور ${viewStr} مرة والناس مبتقدرش تتوقف عن المشاهدة! محتوى ترفيهي بيخلي الناس تتعلق`,
    politics: `فيديو سياسي مهم اتصور ${viewStr} مرة والناس بتناقشه بجدية على السوشيال`,
    food: `فيديو عن الأكل اتصور ${viewStr} مرة! المصريين بيحبوا الأكل والفديوهات دي بتاخد ترند بسرعة`,
    education: `فيديو تعليمي مهم اتصور ${viewStr} مرة والطلبة والأهالي بيتابعوه بحرص`,
    viral: `الفيديو ده اتصور ${viewStr} مرة واتحول لترند جامد! الناس مبتقدرش تتوقف عن مشاركته`,
    economy: `فيديو اقتصادي مهم اتصور ${viewStr} مرة والناس قلقة منه على السوشيال`,
    health: `فيديو صحي مهم اتصور ${viewStr} مرة والناس بتناقشه بحرص على السوشيال`,
  };

  return categoryExplanations[category] || `فيديو اتصور ${viewStr} مرة وشغال يعمل ضجة على يوتيوب مصر!`;
}

// Generate Egyptian Arabic comments based on video title
function generateComments(title: string, category: Category): string[] {
  const categoryComments: Record<Category, string[][]> = {
    sports: [
      ["يا سلااام على المحتوى ده! 🔥", "رياضة مصرية بجد!", "أحسن فيديو شفته النهاردة"],
      ["ماتش جامد أوي! 💪", "المنتخب يحيا مصر 🇪🇬", "كورة مصرية ولا أحلى"],
    ],
    tech: [
      ["التكنولوجيا دي بتغير الدنيا بجد", "يا سلاام على التقنية دي! 📱", "محتوى تقني مفيد أوي"],
      ["أخيراً حاجة تكنولوجيا حلوة في مصر", "الجيل الجديد شغال على حاجات جامدة", "المستقبل هيكون أحلى"],
    ],
    entertainment: [
      ["هههههه أنا بموت من الضحف 😂", "محتوى مصري بجد!", "أحسن حاجة شفتها النهاردة"],
      ["الفن المصري ولا أحلى! 🎬", "المصريين أذكياء بجد في المحتوى", "مش هقدر أوقف إني أعمل ريبلاي"],
    ],
    politics: [
      ["لازم نتابع الأخبار دي بجد", "الموقف ده مهم أوي لمصر", "يا ريت الناس كلها تشوف"],
      ["السياسة دي مش سهلة بس لازم نفهم", "مصر لازم تتغير للأحسن", "الكلام ده مهم أوي"],
    ],
    food: [
      ["جعان دلوقتي من الشكل ده 😋", "أكل مصري أصلي!", "لازم أجرب الحاجة دي"],
      ["الفول والكشري ولا أي حاجة تانية! 🍽️", "المطاعم دي مش عادية", "أنا هعمل اللي في الفيديو دلوقتي"],
    ],
    education: [
      ["محتوى تعليمي مفيد أوي!", "التعليم هو الحل بجد 📚", "كل طالب لازم يشوف الفيديو ده"],
      ["أخيراً حد بيشرح ببساطة", "معلومات مهمة أوي يا جماعة", "التعلبم أحسن استثمار"],
    ],
    viral: [
      ["ترند ترند ترند! 🔥🔥🔥", "ده اتحرق الدنيا بجد!", "مش مصدق اللي بشوفه"],
      ["الفيديو ده هيحطم كل الأرقام!", "فاير أوي يا جدعان", "الناس اتجننت على السوشيال"],
    ],
    economy: [
      ["الاقتصاد محتاج يتحسن بسرعة", "الأسعار دي مش معقولة 😰", "لازم في حل"],
      ["الفلوس بتقل والأسعار بتزيد", "مصر تستاهل أحسن من كده", "المرتبات مش كفاية"],
    ],
    health: [
      ["الصحة أهم حاجة بجد!", "معلومات طبية مهمة يا جماعة", "لازم نحافظ على نفسنا"],
      ["يا ريت الدكاترة كلهم هيك", "الوعي الصحي مهم أوي في مصر", "شكراً على المحتوى المفيد"],
    ],
  };

  const commentSets = categoryComments[category] || categoryComments.entertainment;
  const randomSet = commentSets[Math.floor(Math.random() * commentSets.length)];
  return randomSet;
}

// Calculate relative time in Egyptian Arabic
function getRelativeTime(publishedAt: string): string {
  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const diffMs = now - published;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} ${diffMins <= 10 ? "دقائق" : "دقيقة"}`;
  if (diffHours < 24) return `منذ ${diffHours} ${diffHours === 1 ? "ساعة" : diffHours <= 10 ? "ساعات" : "ساعة"}`;
  return `منذ ${diffDays} ${diffDays === 1 ? "يوم" : diffDays <= 10 ? "أيام" : "يوم"}`;
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    categoryId: string;
    tags?: string[];
    publishedAt: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    channelTitle: string;
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

async function fetchYouTubeTrends(): Promise<TrendItem[]> {
  const categories = ["", "17", "25", "24"]; // All, Sports, News, Entertainment
  const allVideos: TrendItem[] = [];

  for (const videoCategoryId of categories) {
    try {
      const params = new URLSearchParams({
        part: "snippet,contentDetails,statistics",
        chart: "mostPopular",
        regionCode: "EG",
        maxResults: "10",
        key: YOUTUBE_API_KEY,
      });

      if (videoCategoryId) {
        params.set("videoCategoryId", videoCategoryId);
      }

      const response = await fetch(`${YOUTUBE_API_BASE}?${params.toString()}`, {
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        console.error(`YouTube API error for category ${videoCategoryId}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const items: YouTubeVideoItem[] = data.items || [];

      for (const item of items) {
        // Skip duplicates
        if (allVideos.some((v) => v.sourceId === item.id)) continue;

        const viewCount = parseInt(item.statistics.viewCount || "0", 10);
        const category = inferCategory(
          item.snippet.title,
          item.snippet.tags || [],
          item.snippet.categoryId
        );
        const heatScore = calculateHeatScore(viewCount);
        const sentiment = inferSentiment(item.snippet.title, heatScore);

        const trendItem: TrendItem = {
          id: `yt-${item.id}`,
          headline: item.snippet.title,
          explanation: generateExplanation(item.snippet.title, viewCount, category),
          platform: "youtube",
          category,
          heatScore,
          sentiment,
          region: "مصر",
          videoUrl: `https://www.youtube.com/embed/${item.id}`,
          imageUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          comments: generateComments(item.snippet.title, category),
          sourceId: item.id,
          timestamp: new Date(item.snippet.publishedAt),
          relativeTime: getRelativeTime(item.snippet.publishedAt),
        };

        allVideos.push(trendItem);
      }
    } catch (err) {
      console.error(`Error fetching YouTube category ${videoCategoryId}:`, err);
    }
  }

  // Sort by heatScore descending and deduplicate
  const seen = new Set<string>();
  const unique = allVideos
    .sort((a, b) => b.heatScore - a.heatScore)
    .filter((item) => {
      if (seen.has(item.sourceId!)) return false;
      seen.add(item.sourceId!);
      return true;
    });

  return unique.slice(0, 20); // Return top 20
}

export async function GET() {
  try {
    const trends = await fetchYouTubeTrends();

    // If we got no results from YouTube API, fall back to mock data
    if (trends.length === 0) {
      console.warn("YouTube API returned no results, using mock data");
      const mockYoutube = MOCK_TRENDS.filter((t) => t.platform === "youtube");
      return NextResponse.json({
        success: true,
        data: mockYoutube,
        source: "mock",
        count: mockYoutube.length,
      });
    }

    return NextResponse.json({
      success: true,
      data: trends,
      source: "youtube-api",
      count: trends.length,
    });
  } catch (error) {
    console.error("YouTube Trends API error:", error);
    // Fall back to mock data on any error
    const mockYoutube = MOCK_TRENDS.filter((t) => t.platform === "youtube");
    return NextResponse.json({
      success: true,
      data: mockYoutube,
      source: "mock-fallback",
      count: mockYoutube.length,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
