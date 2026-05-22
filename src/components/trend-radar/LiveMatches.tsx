'use client';

import React, { useState } from 'react';
import { MatchItem } from '@/lib/trend-radar/types';

interface LiveMatchesProps {
  matches: MatchItem[];
}

export function LiveMatches({ matches }: LiveMatchesProps) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#FF3E6C';
      case 'upcoming': return '#FFD166';
      case 'finished': return '#8B95A5';
      default: return '#8B95A5';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live': return '🔴 مباشر';
      case 'upcoming': return '⏰ قادم';
      case 'finished': return '✅ انتهى';
      default: return status;
    }
  };

  return (
    <div className="bg-[#151D30] border border-[#1F2937] rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚽</span>
        <h3 className="text-sm md:text-base font-bold text-white">ماتشات اليوم - Live</h3>
        <span className="text-xs text-[#FF3E6C] animate-pulse mr-auto">● LIVE</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-[#0B0F19] rounded-xl p-3 md:p-4 border border-[#1F2937] cursor-pointer transition-all duration-300 hover:border-[#FF3E6C]/30"
            onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
          >
            {/* Match header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8B95A5]">{match.league}</span>
              <span
                className="text-xs font-bold"
                style={{ color: getStatusColor(match.status) }}
              >
                {getStatusLabel(match.status)}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-sm md:text-base font-bold text-white">{match.homeTeam}</p>
              </div>
              <div className="flex items-center gap-3 px-4">
                {match.status !== 'upcoming' ? (
                  <>
                    <span className={`text-xl md:text-2xl font-bold ${match.status === 'live' ? 'text-[#FF3E6C] animate-pulse' : 'text-white'}`}>
                      {match.homeScore}
                    </span>
                    <span className="text-[#8B95A5]">-</span>
                    <span className={`text-xl md:text-2xl font-bold ${match.status === 'live' ? 'text-[#FF3E6C] animate-pulse' : 'text-white'}`}>
                      {match.awayScore}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[#FFD166]">{match.matchDate}</span>
                )}
              </div>
              <div className="flex-1 text-center">
                <p className="text-sm md:text-base font-bold text-white">{match.awayTeam}</p>
              </div>
            </div>

            {/* Expanded AI Analysis */}
            {expandedMatch === match.id && match.aiAnalysis && (
              <div className="mt-3 pt-3 border-t border-[#1F2937]">
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-xs">🤖</span>
                  <span className="text-xs font-bold text-[#7C3AED]">تحليل الذكاء الاصطناعي لردود الجماهير</span>
                </div>
                <p className="text-xs md:text-sm text-[#E8ECF1] leading-relaxed">
                  {match.aiAnalysis}
                </p>
              </div>
            )}

            {/* Expand hint */}
            {match.aiAnalysis && expandedMatch !== match.id && (
              <p className="text-xs text-[#8B95A5] mt-2 text-center">
                دوس عشان تشوف تحليل الجماهير 🤖
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
