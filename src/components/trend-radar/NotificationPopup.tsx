'use client';

import React from 'react';

interface NotificationPopupProps {
  isVisible: boolean;
  headline: string;
  message: string;
  onClose: () => void;
}

export function NotificationPopup({ isVisible, headline, message, onClose }: NotificationPopupProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[60] animate-bounce-once">
      <div className="bg-[#151D30] border border-[#FF3E6C]/40 rounded-xl p-4 shadow-2xl neon-glow-pink">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#FF3E6C]/20 flex items-center justify-center">
            <span className="text-lg">🚨</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#FF3E6C]">ترند انفجاري!</span>
              <span className="w-2 h-2 rounded-full bg-[#FF3E6C] animate-pulse" />
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">{headline}</p>
            <p className="text-xs text-[#8B95A5] mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-[#8B95A5] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
