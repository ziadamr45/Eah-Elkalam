'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendItem, Platform, PLATFORM_CONFIG, CATEGORY_CONFIG } from '@/lib/trend-radar/types';
import { MOCK_TRENDS, MOCK_MATCHES } from '@/lib/trend-radar/data';
import { TrendCard } from '@/components/trend-radar/TrendCard';
import { TrendDetailModal } from '@/components/trend-radar/TrendDetailModal';
import { AISummaryModal } from '@/components/trend-radar/AISummaryModal';
import { TerminalConsole } from '@/components/trend-radar/TerminalConsole';
import { EgyptMap } from '@/components/trend-radar/EgyptMap';
import { LiveMatches } from '@/components/trend-radar/LiveMatches';
import { NotificationPopup } from '@/components/trend-radar/NotificationPopup';

// ========================================
// MAIN PAGE - إيه الكلام؟ Egyptian Trend Radar
// ========================================

export default function EhElKalamPage() {
  // ---- Core State ----
  const [trends, setTrends] = useState<TrendItem[]>(MOCK_TRENDS);
  const [filteredTrends, setFilteredTrends] = useState<TrendItem[]>(MOCK_TRENDS);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ---- Modal State ----
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  // ---- Timer State ----
  const [countdown, setCountdown] = useState(10);

  // ---- Notification State ----
  const [notification, setNotification] = useState({
    isVisible: false,
    headline: '',
    message: '',
  });

  // ---- Active Section State ----
  const [activeSection, setActiveSection] = useState<'trends' | 'map' | 'matches'>('trends');

  // ========================================
  // FETCH TRENDS FROM API
  // ========================================
  const fetchTrends = useCallback(async () => {
    try {
      const response = await fetch('/api/trends?platform=all');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setTrends(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // COUNTDOWN TIMER - Simulates data refresh
  // ========================================
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTrends();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [fetchTrends]);

  // ========================================
  // FILTER TRENDS
  // ========================================
  useEffect(() => {
    let result = [...trends];

    if (selectedPlatform !== 'all') {
      result = result.filter((t) => t.platform === selectedPlatform);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.headline.toLowerCase().includes(q) ||
          t.explanation.toLowerCase().includes(q) ||
          t.category.includes(q)
      );
    }

    result.sort((a, b) => b.heatScore - a.heatScore);
    setFilteredTrends(result);
  }, [trends, selectedPlatform, searchQuery]);

  // ========================================
  // SIMULATED NOTIFICATION
  // ========================================
  useEffect(() => {
    const interval = setInterval(() => {
      const explosiveTrends = trends.filter((t) => t.heatScore >= 9);
      if (explosiveTrends.length > 0 && Math.random() > 0.7) {
        const trend = explosiveTrends[Math.floor(Math.random() * explosiveTrends.length)];
        setNotification({
          isVisible: true,
          headline: trend.headline,
          message: `ترند انفجاري على ${PLATFORM_CONFIG[trend.platform]?.label || trend.platform}! حرارته ${trend.heatScore}/10 🔥`,
        });
        setTimeout(() => {
          setNotification((prev) => ({ ...prev, isVisible: false }));
        }, 6000);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [trends]);

  // ========================================
  // INITIAL FETCH
  // ========================================
  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // ========================================
  // HANDLERS
  // ========================================
  const handleTrendClick = useCallback((trend: TrendItem) => {
    setSelectedTrend(trend);
    setIsDetailModalOpen(true);
  }, []);

  const handleAISummary = useCallback(async () => {
    setIsAISummaryOpen(true);
    setIsAILoading(true);
    setAiSummary(null);

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trends: trends.slice(0, 8).map((t) => ({
            headline: t.headline,
            explanation: t.explanation,
            platform: t.platform,
            category: t.category,
            heatScore: t.heatScore,
          })),
        }),
      });

      const data = await response.json();
      if (data.success && data.summary) {
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error('AI Summary failed:', error);
      setAiSummary(`🎯 خلاصة الترندات

الشارع المصري شغال بجنون النهاردة! أكتر حاجة لافطة إن الرياضة والاقتصاد بيسخنوا السوشيال ميديا بشكل غير عادي.

📊 التحليل

الماتشات بتعمل ضجة كبيرة خصوصاً لما يكون في ديربي أو ماتش منتخب. من الناحية التانية أسعار الباقة والكشري والدولار دول ترندات ثابتة بقت جزء من يوم المصري. التكنولوجيا والتعليم برضه بيسخنوا خصوصاً مع التابلت والامتحانات.

🔮 التوقعات

ممكن نشوف ترندات جديدة لو حصل أي خبر عاجل عن الأسعار. مواضيع الصحة ممكن تترند لو في موجة حر جديدة.

💡 الخاتمة

بصراحة يا جماعة المصريين بيفضلوا أقوى من أي ترند! زي ما بيقولوا: "اللي عاشر المامون ما يموتش من السم" 😂🇪🇬`);
    } finally {
      setIsAILoading(false);
    }
  }, [trends]);

  const handleRegionClick = useCallback((region: { nameAr: string; topTrends: string[] }) => {
    setSearchQuery(region.topTrends[0]?.split(' ').slice(0, 2).join(' ') || '');
    setActiveSection('trends');
  }, []);

  // ========================================
  // PLATFORM TABS
  // ========================================
  const platforms: { key: Platform; label: string; icon: string; color: string }[] = [
    { key: 'all', label: 'الكل', icon: '🌐', color: '#E8ECF1' },
    { key: 'youtube', label: 'يوتيوب', icon: '▶', color: '#FF0000' },
    { key: 'facebook', label: 'فيسبوك', icon: 'f', color: '#1877F2' },
    { key: 'tiktok', label: 'تيك توك', icon: '♪', color: '#00F2EA' },
    { key: 'x', label: 'إكس', icon: '𝕏', color: '#FFFFFF' },
    { key: 'google', label: 'جوجل', icon: 'G', color: '#4285F4' },
  ];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19]">
      {/* ============================================
          STICKY NAVIGATION HEADER
          ============================================ */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-lg border-b border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#FF3E6C] to-[#7C3AED] flex items-center justify-center shadow-lg">
              <span className="text-white text-sm md:text-base font-bold">إ؟</span>
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white font-[family-name:var(--font-tajawal)]">
                إيه الكلام؟
              </h1>
              <p className="text-[10px] md:text-xs text-[#8B95A5] hidden sm:block">رادار الترندات المصري</p>
            </div>
          </div>

          {/* Live Indicator & Timer */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-[#06D6A0] animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#06D6A0] animate-ping opacity-40" />
              </div>
              <span className="text-xs text-[#06D6A0] font-medium hidden md:inline">مباشر</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#151D30] border border-[#1F2937] rounded-lg px-3 py-1.5">
              <svg className="w-3.5 h-3.5 text-[#FFD166]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs font-mono text-[#FFD166]">
                {countdown}s
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6 md:space-y-8">

        {/* ============================================
            HERO BUZZ SECTION
            ============================================ */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#151D30] via-[#1A2332] to-[#151D30] border border-[#1F2937] p-6 md:p-10">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#FF3E6C]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#06D6A0]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF3E6C]/10 border border-[#FF3E6C]/20 text-xs text-[#FF3E6C] font-medium">
                🔥 رادار الترندات المصري
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 font-[family-name:var(--font-tajawal)] leading-tight">
              الشارع مقلوب دلوقتي على إيه؟
            </h2>

            <p className="text-sm md:text-base text-[#8B95A5] mb-6 max-w-xl md:mr-0 mx-auto md:mx-0 leading-relaxed">
              كل الترندات اللي شغالة في مصر النهاردة لحظة بلحظة من يوتيوب وفيسبوك وتيك توك وإكس وجوجل.
              إنت عارف إيه اللي بيحصل وإيه اللي الناس بتتكلم عنه؟
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <button
                onClick={handleAISummary}
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#FF3E6C] to-[#7C3AED] text-white px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3E6C]/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg group-hover:animate-bounce">🤖</span>
                <span>إيه الخلاصة يا جميناي؟</span>
              </button>

              <div className="flex items-center gap-4 text-xs text-[#8B95A5]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0]" />
                  {trends.length} ترند
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166]" />
                  5 منصات
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3E6C]" />
                  مباشر
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            PLATFORM FILTERING SYSTEM & LIVE SEARCH
            ============================================ */}
        <section className="space-y-3">
          {/* Platform Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            {platforms.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPlatform(p.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedPlatform === p.key
                    ? 'bg-[#151D30] border border-[#1F2937] text-white shadow-lg'
                    : 'bg-transparent border border-transparent text-[#8B95A5] hover:bg-[#151D30]/50 hover:border-[#1F2937]'
                }`}
              >
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-md text-xs font-bold"
                  style={{
                    backgroundColor: selectedPlatform === p.key ? `${p.color}20` : 'transparent',
                    color: p.color,
                  }}
                >
                  {p.icon}
                </span>
                <span>{p.label}</span>
                {selectedPlatform === p.key && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B95A5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="دور على ترند... (مثلاً: باقة، ماتش، كشري)"
              className="w-full bg-[#151D30] border border-[#1F2937] rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-[#8B95A5] focus:outline-none focus:border-[#FF3E6C]/50 focus:ring-1 focus:ring-[#FF3E6C]/20 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B95A5] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* ============================================
            SECTION NAVIGATION TABS
            ============================================ */}
        <div className="flex items-center gap-1 bg-[#151D30] rounded-xl p-1 border border-[#1F2937]">
          {[
            { key: 'trends' as const, label: '🔥 الترندات', count: filteredTrends.length },
            { key: 'map' as const, label: '🗺️ الخريطة', count: null },
            { key: 'matches' as const, label: '⚽ الماتشات', count: MOCK_MATCHES.filter(m => m.status === 'live').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                activeSection === tab.key
                  ? 'bg-[#0B0F19] text-white shadow-md'
                  : 'text-[#8B95A5] hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[#FF3E6C]/20 text-[#FF3E6C] text-xs font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ============================================
            TRENDS SECTION
            ============================================ */}
        {activeSection === 'trends' && (
          <section>
            {isLoading ? (
              /* Loading skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#151D30] border border-[#1F2937] rounded-xl p-4 animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-4 w-16 bg-[#1F2937] rounded" />
                      <div className="h-3 w-12 bg-[#1F2937] rounded" />
                    </div>
                    <div className="h-5 w-3/4 bg-[#1F2937] rounded mb-2" />
                    <div className="h-4 w-full bg-[#1F2937] rounded mb-2" />
                    <div className="h-4 w-1/2 bg-[#1F2937] rounded mb-3" />
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-16 bg-[#1F2937] rounded-full" />
                      <div className="h-4 w-8 bg-[#1F2937] rounded" />
                    </div>
                    <div className="mt-3 h-2 bg-[#1F2937] rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredTrends.length === 0 ? (
              /* Empty state */
              <div className="text-center py-16">
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="text-lg font-bold text-white mb-2">مفيش ترندات هنا</p>
                <p className="text-sm text-[#8B95A5]">جرّب تغيّر الفلتر أو كلمة البحث</p>
              </div>
            ) : (
              /* Trend Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrends.map((trend) => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                    onClick={handleTrendClick}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============================================
            MAP SECTION
            ============================================ */}
        {activeSection === 'map' && (
          <section>
            <EgyptMap onRegionClick={handleRegionClick} />
          </section>
        )}

        {/* ============================================
            LIVE MATCHES SECTION
            ============================================ */}
        {activeSection === 'matches' && (
          <section>
            <LiveMatches matches={MOCK_MATCHES} />
          </section>
        )}

        {/* ============================================
            CRAWLER TERMINAL CONSOLE
            ============================================ */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">💻</span>
            <h3 className="text-sm md:text-base font-bold text-white">طرفية الزاحف - Crawler Terminal</h3>
          </div>
          <TerminalConsole />
        </section>

        {/* ============================================
            QUICK STATS BAR
            ============================================ */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'إجمالي الترندات', value: trends.length, color: '#FF3E6C', icon: '📊' },
            { label: 'ترندات فاير 🔥', value: trends.filter(t => t.heatScore >= 8).length, color: '#FFD166', icon: '🔥' },
            { label: 'منصات نشطة', value: '5', color: '#06D6A0', icon: '📡' },
            { label: 'آخر تحديث', value: `${countdown}s`, color: '#7C3AED', icon: '⏱️' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#151D30] border border-[#1F2937] rounded-xl p-3 md:p-4 text-center card-hover"
            >
              <span className="text-lg md:text-xl block mb-1">{stat.icon}</span>
              <p className="text-lg md:text-xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-[#8B95A5] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </section>
      </main>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="mt-auto bg-[#0B0F19] border-t border-[#1F2937] py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF3E6C] to-[#7C3AED] flex items-center justify-center">
                <span className="text-white text-xs font-bold">إ؟</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">إيه الكلام؟</p>
                <p className="text-xs text-[#8B95A5]">رادار الترندات المصري - Eh El-Kalam?</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#8B95A5]">
              <span>🇪🇬 زياد عمرو</span>
              <span>•</span>
              <span>📡 بيانات حية</span>
            </div>

            <p className="text-xs text-[#8B95A5]">
              © 2026 إيه الكلام؟ - زياد عمرو
            </p>
          </div>
        </div>
      </footer>

      {/* ============================================
          MODALS
          ============================================ */}
      <TrendDetailModal
        trend={selectedTrend}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <AISummaryModal
        isOpen={isAISummaryOpen}
        onClose={() => setIsAISummaryOpen(false)}
        summary={aiSummary}
        isLoading={isAILoading}
      />

      {/* ============================================
          NOTIFICATION POPUP
          ============================================ */}
      <NotificationPopup
        isVisible={notification.isVisible}
        headline={notification.headline}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
