import { Server } from "socket.io";

const PORT = 3003;

const io = new Server(PORT, {
  cors: { origin: "*" },
});

console.log(`🚀 Realtime service running on port ${PORT}`);

// ─── Sample Data ─────────────────────────────────────────────────────────────

const TREND_UPDATES = [
  { headline: "الباقة الجديدة اتعملت فيها عرض", heatScore: 8, change: 2 },
  { headline: "ماتش الأهلي والزمالك اقترب", heatScore: 9, change: 1 },
  { headline: "تحدي الفول المدمس وصل 10 مليون", heatScore: 7, change: 3 },
  { headline: "الدولار وصل 65 في السوداء", heatScore: 10, change: 2 },
  { headline: "تابلت الثانوية الباكورة ظهرت", heatScore: 6, change: -1 },
];

const CRAWL_LOGS = [
  { message: "📡 جاري البحث عن هاشتاجات #الباقة...", source: "facebook", status: "success" },
  { message: "🔍 تم العثور على 2,340 منشور عن #ماتش_المنتخب", source: "x", status: "success" },
  { message: "▶️ جاري سحب فيديوهات ترند يوتيوب مصر...", source: "youtube", status: "pending" },
  { message: "🎵 تيك توك: تحدي الفول المدمس وصل 5 مليون مشاهدة", source: "tiktok", status: "success" },
  { message: "⚠️ معدل البحث عن 'أسعار الدولار' زاد 300%", source: "google", status: "success" },
];

const EXPLOSIVE_TRENDS = [
  { headline: "🔥 خبر عاجل: إعلان رسمي عن تعديل أسعار البنزين", category: "economy", platform: "x", message: "خبر عاجل! أسعار البنزين اتعدلت والناس بتتناقش بشراسة" },
  { headline: "⚡ ترند انفجاري: حادث كبير على كوبري 6 أكتوبر", category: "viral", platform: "facebook", message: "حادثة كبيرة على كوبري 6 أكتوبر والزحام واقف تمام" },
];

const MATCH_COMMENTS = [
  "جول! ⚽",
  "ركلة جزاء محتسبة",
  "بطاقة صفراء",
  "تبديل لاعب",
  "نهاية الشوط الأول",
  "بداية الشوط الثاني",
  "فرصة ضائعة!",
  "تسديدة على القائم",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// ─── Connection Handling ─────────────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
  });
});

// ─── trend-update (every 30s) ───────────────────────────────────────────────

setInterval(() => {
  const trend = randomItem(TREND_UPDATES);
  const payload = {
    id: generateId(),
    headline: trend.headline,
    heatScore: trend.heatScore,
    change: trend.change,
  };
  io.emit("trend-update", payload);
  console.log(`📊 trend-update: ${payload.headline} (${payload.heatScore}, ${payload.change > 0 ? "+" : ""}${payload.change})`);
}, 30_000);

// ─── crawl-log (every 5s) ───────────────────────────────────────────────────

setInterval(() => {
  const log = randomItem(CRAWL_LOGS);
  const payload = {
    message: log.message,
    source: log.source,
    status: log.status,
    timestamp: new Date().toISOString(),
  };
  io.emit("crawl-log", payload);
  console.log(`📡 crawl-log: [${log.source}] ${log.message}`);
}, 5_000);

// ─── explosive-trend (random 60-120s) ───────────────────────────────────────

function scheduleExplosiveTrend() {
  const delay = randomInt(60_000, 120_000);
  setTimeout(() => {
    const trend = randomItem(EXPLOSIVE_TRENDS);
    const payload = {
      headline: trend.headline,
      heatScore: 10,
      category: trend.category,
      platform: trend.platform,
      message: trend.message,
    };
    io.emit("explosive-trend", payload);
    console.log(`🚨 explosive-trend: ${payload.headline}`);
    scheduleExplosiveTrend(); // schedule next one
  }, delay);
}

scheduleExplosiveTrend();

// ─── match-update (every 45s) ───────────────────────────────────────────────

setInterval(() => {
  const payload = {
    matchId: `match-${generateId()}`,
    homeScore: randomInt(0, 4),
    awayScore: randomInt(0, 4),
    status: randomItem(["live", "halftime", "finished"]),
    comment: randomItem(MATCH_COMMENTS),
  };
  io.emit("match-update", payload);
  console.log(`⚽ match-update: ${payload.homeScore}-${payload.awayScore} (${payload.status}) ${payload.comment}`);
}, 45_000);
