'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendItem, Platform, Category, Sentiment, PLATFORM_CONFIG, CATEGORY_CONFIG, SENTIMENT_CONFIG } from '@/lib/trend-radar/types';

interface TrendCardProps {
  trend: TrendItem;
  onClick: (trend: TrendItem) => void;
}

export function TrendCard({ trend, onClick }: TrendCardProps) {
  const platformInfo = PLATFORM_CONFIG[trend.platform];
  const categoryInfo = CATEGORY_CONFIG[trend.category];
  const sentimentInfo = SENTIMENT_CONFIG[trend.sentiment];

  const heatColor = trend.heatScore >= 8 ? '#FF3E6C' : trend.heatScore >= 5 ? '#FFD166' : '#06D6A0';
  const heatGlow = trend.heatScore >= 8 ? 'neon-glow-pink' : trend.heatScore >= 5 ? 'neon-glow-yellow' : 'neon-glow-teal';

  return (
    <div
      onClick={() => onClick(trend)}
      className={`card-hover relative bg-[#151D30] border border-[#1F2937] rounded-xl p-4 cursor-pointer group ${trend.heatScore >= 9 ? 'ring-1 ring-[#FF3E6C]/30' : ''}`}
    >
      {/* Platform badge & time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
            style={{ backgroundColor: `${platformInfo.color}20`, color: platformInfo.color }}
          >
            {platformInfo.icon}
          </span>
          <span className="text-xs text-[#8B95A5]">{platformInfo.label}</span>
        </div>
        <span className="text-xs text-[#8B95A5] flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#06D6A0] animate-pulse" />
          {trend.relativeTime}
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-sm md:text-base font-bold text-white mb-2 leading-relaxed line-clamp-2 group-hover:text-[#FF3E6C] transition-colors duration-300">
        {trend.headline}
      </h3>

      {/* Explanation */}
      <p className="text-xs md:text-sm text-[#8B95A5] mb-3 line-clamp-2 leading-relaxed">
        {trend.explanation}
      </p>

      {/* Category tag & sentiment */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${categoryInfo.color}15`, color: categoryInfo.color }}
        >
          {categoryInfo.label}
        </span>
        <span className="text-sm" title={sentimentInfo.label}>
          {sentimentInfo.emoji}
        </span>
      </div>

      {/* Heat Score Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#8B95A5] whitespace-nowrap">حرارة</span>
        <div className="flex-1 h-2 bg-[#0B0F19] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${trend.heatScore * 10}%`,
              background: `linear-gradient(90deg, #06D6A0, #FFD166 ${trend.heatScore * 10}%, #FF3E6C)`,
            }}
          />
        </div>
        <span
          className="text-sm font-bold min-w-[28px] text-center"
          style={{ color: heatColor }}
        >
          {trend.heatScore}
        </span>
      </div>

      {/* Video embed indicator */}
      {trend.videoUrl && (
        <div className="mt-3 pt-2 border-t border-[#1F2937]">
          <span className="inline-flex items-center gap-1 text-xs text-[#06D6A0]">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            شوف بنفسك - فيديو متاح
          </span>
        </div>
      )}

      {/* Hover overlay effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,62,108,0.05), rgba(6,214,160,0.05))',
        }}
      />
    </div>
  );
}
