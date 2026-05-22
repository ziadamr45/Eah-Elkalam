// Types for the Egyptian Trend Radar Platform

export type Platform = "all" | "youtube" | "facebook" | "tiktok" | "x" | "google";

export type Category = 
  | "sports" 
  | "tech" 
  | "entertainment" 
  | "politics" 
  | "food" 
  | "education"
  | "viral"
  | "economy"
  | "health";

export type Sentiment = "positive" | "negative" | "neutral" | "viral";

export interface TrendItem {
  id: string;
  headline: string;
  explanation: string;
  platform: Exclude<Platform, "all">;
  category: Category;
  heatScore: number; // 1-10
  sentiment: Sentiment;
  region?: string;
  videoUrl?: string;
  postUrl?: string;
  imageUrl?: string;
  comments: string[];
  aiSummary?: string;
  sourceId?: string;
  timestamp: Date;
  relativeTime: string;
}

export interface MatchItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "live" | "upcoming" | "finished";
  league: string;
  matchDate: string;
  aiAnalysis?: string;
}

export interface CrawlLogEntry {
  id: string;
  message: string;
  source: string;
  status: "success" | "error" | "pending";
  timestamp: Date;
}

export interface EgyptRegion {
  name: string;
  nameAr: string;
  topTrends: string[];
  x: number;
  y: number;
}

export const PLATFORM_CONFIG: Record<Exclude<Platform, "all">, { label: string; color: string; icon: string }> = {
  youtube: { label: "يوتيوب", color: "#FF0000", icon: "▶" },
  facebook: { label: "فيسبوك", color: "#1877F2", icon: "f" },
  tiktok: { label: "تيك توك", color: "#00F2EA", icon: "♪" },
  x: { label: "إكس", color: "#FFFFFF", icon: "𝕏" },
  google: { label: "جوجل", color: "#4285F4", icon: "G" },
};

export const CATEGORY_CONFIG: Record<Category, { label: string; color: string }> = {
  sports: { label: "رياضة", color: "#06D6A0" },
  tech: { label: "تكنولوجيا", color: "#7C3AED" },
  entertainment: { label: "ترفيه", color: "#FF3E6C" },
  politics: { label: "سياسة", color: "#3B82F6" },
  food: { label: "أكل", color: "#FFD166" },
  education: { label: "تعليم", color: "#06B6D4" },
  viral: { label: "فاير 🔥", color: "#FF3E6C" },
  economy: { label: "اقتصاد", color: "#F59E0B" },
  health: { label: "صحة", color: "#10B981" },
};

export const SENTIMENT_CONFIG: Record<Sentiment, { emoji: string; label: string; color: string }> = {
  positive: { emoji: "😊", label: "إيجابي", color: "#06D6A0" },
  negative: { emoji: "😤", label: "سلبي", color: "#FF3E6C" },
  neutral: { emoji: "😐", label: "محايد", color: "#FFD166" },
  viral: { emoji: "🔥", label: "فاير", color: "#FF3E6C" },
};
