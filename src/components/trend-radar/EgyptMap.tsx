'use client';

import React, { useState } from 'react';
import { EGYPT_REGIONS } from '@/lib/trend-radar/data';

interface EgyptMapProps {
  onRegionClick: (region: typeof EGYPT_REGIONS[0]) => void;
}

export function EgyptMap({ onRegionClick }: EgyptMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleRegionClick = (region: typeof EGYPT_REGIONS[0]) => {
    setSelectedRegion(region.name);
    onRegionClick(region);
  };

  return (
    <div className="bg-[#151D30] border border-[#1F2937] rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🗺️</span>
        <h3 className="text-sm md:text-base font-bold text-white">خريطة الترندات الذكية</h3>
        <span className="text-xs text-[#8B95A5] mr-auto">دوس على المحافظة</span>
      </div>

      {/* Map Container */}
      <div className="relative bg-[#0B0F19] rounded-xl p-4 overflow-hidden" style={{ minHeight: '320px' }}>
        {/* Egypt SVG Outline - Simplified */}
        <svg viewBox="0 0 100 100" className="w-full h-auto" style={{ maxHeight: '280px' }}>
          {/* Egypt border outline */}
          <path
            d="M25,15 L75,15 L80,20 L82,35 L78,50 L75,65 L72,80 L68,90 L60,95 L50,93 L40,90 L35,85 L30,75 L28,60 L25,45 L23,30 Z"
            fill="#151D30"
            stroke="#1F2937"
            strokeWidth="0.5"
          />

          {/* Nile River */}
          <path
            d="M50,10 L52,20 L51,30 L52,40 L50,50 L51,60 L50,70 L49,80 L50,90 L50,95"
            fill="none"
            stroke="#1F2937"
            strokeWidth="0.3"
            strokeDasharray="2,1"
            opacity="0.5"
          />

          {/* Region dots */}
          {EGYPT_REGIONS.map((region) => (
            <g key={region.name}>
              {/* Pulse ring for selected region */}
              {selectedRegion === region.name && (
                <circle
                  cx={region.x}
                  cy={region.y}
                  r="4"
                  fill="none"
                  stroke="#FF3E6C"
                  strokeWidth="0.3"
                  opacity="0.6"
                >
                  <animate attributeName="r" from="2" to="5" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Clickable dot */}
              <circle
                cx={region.x}
                cy={region.y}
                r={hoveredRegion === region.name ? "2.5" : "1.8"}
                fill={selectedRegion === region.name ? "#FF3E6C" : hoveredRegion === region.name ? "#FFD166" : "#06D6A0"}
                className="cursor-pointer transition-all duration-300"
                onClick={() => handleRegionClick(region)}
                onMouseEnter={() => setHoveredRegion(region.name)}
                onMouseLeave={() => setHoveredRegion(null)}
              />

              {/* Region label */}
              <text
                x={region.x}
                y={region.y - 3}
                textAnchor="middle"
                fill={hoveredRegion === region.name ? "#FFD166" : "#8B95A5"}
                fontSize="2.5"
                className="cursor-pointer transition-all duration-300 pointer-events-none"
                onClick={() => handleRegionClick(region)}
              >
                {region.nameAr}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover info popup */}
        {hoveredRegion && (
          <div className="absolute top-2 left-2 bg-[#151D30] border border-[#1F2937] rounded-lg p-3 shadow-lg max-w-[200px]">
            <p className="text-sm font-bold text-white mb-1">
              {EGYPT_REGIONS.find(r => r.name === hoveredRegion)?.nameAr}
            </p>
            <div className="space-y-1">
              {EGYPT_REGIONS.find(r => r.name === hoveredRegion)?.topTrends.map((trend, i) => (
                <p key={i} className="text-xs text-[#8B95A5]">
                  🔹 {trend}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Region cards below map */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {EGYPT_REGIONS.map((region) => (
          <button
            key={region.name}
            onClick={() => handleRegionClick(region)}
            className={`text-right p-2 rounded-lg border transition-all duration-300 ${
              selectedRegion === region.name
                ? 'bg-[#FF3E6C]/10 border-[#FF3E6C]/30'
                : 'bg-[#0B0F19] border-[#1F2937] hover:border-[#06D6A0]/30'
            }`}
          >
            <p className={`text-xs font-bold ${selectedRegion === region.name ? 'text-[#FF3E6C]' : 'text-white'}`}>
              {region.nameAr}
            </p>
            <p className="text-xs text-[#8B95A5] truncate mt-0.5">
              {region.topTrends[0]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
