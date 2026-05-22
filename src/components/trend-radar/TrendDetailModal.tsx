'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendItem, PLATFORM_CONFIG, CATEGORY_CONFIG, SENTIMENT_CONFIG } from '@/lib/trend-radar/types';

interface TrendDetailModalProps {
  trend: TrendItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrendDetailModal({ trend, isOpen, onClose }: TrendDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!trend) return;
    const text = `${trend.headline}\n\n${trend.explanation}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for containerized environments
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [trend]);

  if (!isOpen || !trend) return null;

  const platformInfo = PLATFORM_CONFIG[trend.platform];
  const categoryInfo = CATEGORY_CONFIG[trend.category];
  const sentimentInfo = SENTIMENT_CONFIG[trend.sentiment];
  const heatColor = trend.heatScore >= 8 ? '#FF3E6C' : trend.heatScore >= 5 ? '#FFD166' : '#06D6A0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#151D30] border border-[#1F2937] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#151D30] border-b border-[#1F2937] p-4 md:p-6 flex items-start justify-between gap-4 z-10">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold"
              style={{ backgroundColor: `${platformInfo.color}20`, color: platformInfo.color }}
            >
              {platformInfo.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#8B95A5]">{platformInfo.label}</span>
                <span className="text-xs text-[#8B95A5]">•</span>
                <span className="text-xs text-[#8B95A5]">{trend.relativeTime}</span>
              </div>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1"
                style={{ backgroundColor: `${categoryInfo.color}15`, color: categoryInfo.color }}
              >
                {categoryInfo.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B95A5] hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          {/* Headline */}
          <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
            {trend.headline}
          </h2>

          {/* Heat Score */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#8B95A5]">مؤشر الحرارة</span>
            <div className="flex-1 h-3 bg-[#0B0F19] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${trend.heatScore * 10}%`,
                  background: 'linear-gradient(90deg, #06D6A0, #FFD166, #FF3E6C)',
                }}
              />
            </div>
            <span className="text-lg font-bold" style={{ color: heatColor }}>
              {trend.heatScore}/10
            </span>
          </div>

          {/* Sentiment */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sentimentInfo.emoji}</span>
            <span className="text-sm" style={{ color: sentimentInfo.color }}>
              المشاعر: {sentimentInfo.label}
            </span>
          </div>

          {/* Explanation */}
          <div className="bg-[#0B0F19] rounded-xl p-4">
            <h3 className="text-sm font-bold text-[#06D6A0] mb-2">📋 التفاصيل</h3>
            <p className="text-sm md:text-base text-[#E8ECF1] leading-relaxed">
              {trend.explanation}
            </p>
          </div>

          {/* AI Summary (if available) */}
          {trend.aiSummary && (
            <div className="bg-[#0B0F19] rounded-xl p-4 border border-[#06D6A0]/20">
              <h3 className="text-sm font-bold text-[#FFD166] mb-2">🤖 تحليل الذكاء الاصطناعي</h3>
              <p className="text-sm text-[#E8ECF1] leading-relaxed">{trend.aiSummary}</p>
            </div>
          )}

          {/* Video Embed */}
          {trend.videoUrl && (
            <div className="bg-[#0B0F19] rounded-xl p-4">
              <h3 className="text-sm font-bold text-[#FF3E6C] mb-3">🎬 شوف بنفسك</h3>
              <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden">
                <iframe
                  src={trend.videoUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={trend.headline}
                />
              </div>
            </div>
          )}

          {/* Region */}
          {trend.region && (
            <div className="flex items-center gap-2 text-sm text-[#8B95A5]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{trend.region}</span>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-[#0B0F19] rounded-xl p-4">
            <h3 className="text-sm font-bold text-[#FFD166] mb-3">💬 تعليقات الناس</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {trend.comments.map((comment, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-[#151D30] rounded-lg p-3 border border-[#1F2937]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-xs text-[#8B95A5] flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-[#E8ECF1] leading-relaxed">{comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-[#0B0F19] hover:bg-[#1F2937] border border-[#1F2937] text-[#E8ECF1] rounded-xl py-3 transition-all duration-300"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[#06D6A0]">تم النسخ!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>انسخ الترند</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
