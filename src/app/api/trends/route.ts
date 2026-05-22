import { NextResponse } from "next/server";
import { TrendItem, Platform } from "@/lib/trend-radar/types";
import { MOCK_TRENDS } from "@/lib/trend-radar/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platformParam = searchParams.get("platform") || "all";
    const searchParam = searchParams.get("search") || "";

    // Validate platform param
    const validPlatforms: Platform[] = ["all", "youtube", "facebook", "tiktok", "x", "google"];
    const platform = validPlatforms.includes(platformParam as Platform)
      ? (platformParam as Platform)
      : "all";

    // Start with mock data
    let allTrends: TrendItem[] = [...MOCK_TRENDS];

    // Try to fetch real YouTube data from the scraper service
    try {
      const scraperResponse = await fetch(
        `http://localhost:3004/api/scrape/youtube?XTransformPort=3004`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (scraperResponse.ok) {
        const scraperData = await scraperResponse.json();
        if (scraperData.success && Array.isArray(scraperData.data) && scraperData.data.length > 0) {
          // Convert scraper format to TrendItem format
          const ytTrends: TrendItem[] = scraperData.data.map(
            (item: {
              id: string;
              headline: string;
              category: string;
              heatScore: number;
              videoUrl: string;
              viewCount: number;
              channelTitle: string;
            }) => ({
              id: item.id,
              headline: item.headline,
              explanation: `فيديو شغال يعمل ضجة على يوتيوب مصر! ${item.viewCount >= 1000000 ? `${(item.viewCount / 1000000).toFixed(1)} مليون` : `${Math.round(item.viewCount / 1000)} ألف`} مشاهدة`,
              platform: "youtube" as const,
              category: item.category || "entertainment",
              heatScore: item.heatScore,
              sentiment: item.heatScore >= 9 ? "viral" as const : "neutral" as const,
              region: "مصر",
              videoUrl: item.videoUrl,
              comments: [
                "يا سلااام على المحتوى! 🔥",
                "محتوى مصري بجد!",
                "مش هقدر أوقف الربلاي",
              ],
              timestamp: new Date(),
              relativeTime: "الآن",
            })
          );
          // Replace YouTube mock data with real data
          allTrends = allTrends.filter((t) => t.platform !== "youtube");
          allTrends = [...allTrends, ...ytTrends];
        }
      }
    } catch {
      // Scraper service unavailable, use mock data
      console.log("Scraper service unavailable, using mock data");
    }

    // Filter by platform
    let filteredTrends = platform === "all"
      ? allTrends
      : allTrends.filter((t) => t.platform === platform);

    // Filter by search keyword
    if (searchParam.trim()) {
      const keyword = searchParam.trim().toLowerCase();
      filteredTrends = filteredTrends.filter(
        (t) =>
          t.headline.toLowerCase().includes(keyword) ||
          t.explanation.toLowerCase().includes(keyword) ||
          t.comments.some((c) => c.toLowerCase().includes(keyword)) ||
          t.category.toLowerCase().includes(keyword)
      );
    }

    // Sort by heatScore descending
    filteredTrends.sort((a, b) => b.heatScore - a.heatScore);

    const stats = {
      total: filteredTrends.length,
      byPlatform: {
        youtube: filteredTrends.filter((t) => t.platform === "youtube").length,
        facebook: filteredTrends.filter((t) => t.platform === "facebook").length,
        tiktok: filteredTrends.filter((t) => t.platform === "tiktok").length,
        x: filteredTrends.filter((t) => t.platform === "x").length,
        google: filteredTrends.filter((t) => t.platform === "google").length,
      },
      avgHeatScore:
        filteredTrends.length > 0
          ? Math.round(
              (filteredTrends.reduce((sum, t) => sum + t.heatScore, 0) /
                filteredTrends.length) *
                10
            ) / 10
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: filteredTrends,
      stats,
      filters: { platform, search: searchParam },
      count: filteredTrends.length,
    });
  } catch (error) {
    console.error("Combined Trends API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حصلت مشكلة في جلب الترندات",
        data: MOCK_TRENDS,
        count: MOCK_TRENDS.length,
      },
      { status: 500 }
    );
  }
}
