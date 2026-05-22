'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CrawlLogEntry } from '@/lib/trend-radar/types';
import { CRAWL_LOG_MESSAGES } from '@/lib/trend-radar/data';

const INITIAL_LOGS: CrawlLogEntry[] = CRAWL_LOG_MESSAGES.slice(0, 3).map((msg, i) => ({
  id: `init-${i}`,
  message: msg.message,
  source: msg.source,
  status: 'success' as const,
  timestamp: new Date(Date.now() - (3 - i) * 5000),
}));

export function TerminalConsole() {
  const [logs, setLogs] = useState<CrawlLogEntry[]>(INITIAL_LOGS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(3);

  useEffect(() => {
    const interval = setInterval(() => {
      const msgData = CRAWL_LOG_MESSAGES[indexRef.current % CRAWL_LOG_MESSAGES.length];
      const newLog: CrawlLogEntry = {
        id: `log-${Date.now()}`,
        message: msgData.message,
        source: msgData.source,
        status: Math.random() > 0.15 ? 'success' : 'error',
        timestamp: new Date(),
      };
      setLogs((prev) => [...prev.slice(-30), newLog]);
      indexRef.current++;
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      youtube: '#FF0000',
      facebook: '#1877F2',
      tiktok: '#00F2EA',
      x: '#FFFFFF',
      google: '#4285F4',
      ai: '#7C3AED',
      system: '#06D6A0',
    };
    return colors[source] || '#8B95A5';
  };

  return (
    <div className="bg-[#0B0F19] border border-[#1F2937] rounded-xl overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#151D30] border-b border-[#1F2937]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF3E6C]" />
          <div className="w-3 h-3 rounded-full bg-[#FFD166]" />
          <div className="w-3 h-3 rounded-full bg-[#06D6A0]" />
        </div>
        <span className="text-xs text-[#8B95A5] mr-2 font-mono">crawler-terminal</span>
        <span className="text-xs text-[#06D6A0] animate-pulse mr-auto">● LIVE</span>
        <span className="text-xs text-[#8B95A5] font-mono">
          {logs.length} entries
        </span>
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollRef}
        className="h-48 md:h-56 overflow-y-auto p-3 font-mono text-xs md:text-sm leading-relaxed"
        dir="ltr"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 mb-1.5">
            <span className="text-[#8B95A5] text-xs whitespace-nowrap">
              {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span
              className="text-xs font-bold whitespace-nowrap"
              style={{ color: getSourceColor(log.source) }}
            >
              [{log.source.toUpperCase()}]
            </span>
            <span className={`${log.status === 'error' ? 'text-[#FF3E6C]' : 'text-[#E8ECF1]'}`}>
              {log.message}
            </span>
          </div>
        ))}
        <div className="terminal-cursor" />
      </div>
    </div>
  );
}
