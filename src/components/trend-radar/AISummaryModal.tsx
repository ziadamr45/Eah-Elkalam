'use client';

import React, { useState, useEffect } from 'react';
import { AI_LOADING_TEXTS } from '@/lib/trend-radar/data';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string | null;
  isLoading: boolean;
}

export function AISummaryModal({ isOpen, onClose, summary, isLoading }: AISummaryModalProps) {
  // Use a tick counter that increments via interval callback (allowed in effects)
  const [tick, setTick] = useState(0);
  const loadingTextIndex = tick % AI_LOADING_TEXTS.length;

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

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
        <div className="sticky top-0 bg-[#151D30] border-b border-[#1F2937] p-4 md:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF3E6C] to-[#7C3AED] flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white">جيميناوي بيقولك</h2>
              <p className="text-xs text-[#8B95A5]">ملخص ذكي بالعامية المصرية</p>
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

        <div className="p-4 md:p-6">
          {isLoading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              {/* Animated spinner */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-[#1F2937] rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-[#FF3E6C] border-r-[#06D6A0] rounded-full animate-spin-slow" />
                <div className="absolute inset-3 border-4 border-transparent border-b-[#FFD166] rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
              </div>

              {/* Rotating loading text */}
              <div className="text-center">
                <p className="text-base md:text-lg font-bold text-white neon-text-pink transition-all duration-500">
                  {AI_LOADING_TEXTS[loadingTextIndex]}
                </p>
                <p className="text-sm text-[#8B95A5] mt-2">استنى شوية هنخليك تفهم كل حاجة...</p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#FF3E6C] animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Summary Content */
            <div className="space-y-4">
              <div className="bg-[#0B0F19] rounded-xl p-4 md:p-6 border border-[#1F2937]">
                <div className="prose prose-invert max-w-none">
                  {summary?.split('\n').map((line, idx) => {
                    // Parse markdown-like formatting
                    if (line.startsWith('🎯') || line.startsWith('📊') || line.startsWith('🔮') || line.startsWith('💡')) {
                      return (
                        <h3 key={idx} className="text-base md:text-lg font-bold text-[#FFD166] mt-4 mb-2">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <p key={idx} className="text-sm md:text-base text-[#E8ECF1] leading-relaxed mr-4 mb-1">
                          ○ {line.slice(2)}
                        </p>
                      );
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h4 key={idx} className="text-sm md:text-base font-bold text-[#06D6A0] mt-3 mb-1">
                          {line.replace(/\*\*/g, '')}
                        </h4>
                      );
                    }
                    if (line.trim() === '') {
                      return <div key={idx} className="h-2" />;
                    }
                    return (
                      <p key={idx} className="text-sm md:text-base text-[#E8ECF1] leading-relaxed mb-2">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Footer note */}
              <div className="flex items-center gap-2 text-xs text-[#8B95A5]">
                <span>🤖</span>
                <span>الملخص ده اتعمل بالذكاء الاصطناعي بالعامية المصرية الأصيلة</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
