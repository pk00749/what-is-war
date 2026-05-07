'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface AISummaryData {
  summary: string;
  events_count: number;
  date: string;
}

export function AIDailySummary() {
  const t = useTranslations();
  const [data, setData] = useState<AISummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/daily-summary-ai');
        if (!res.ok) throw new Error('Failed to fetch');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <span className="text-amber-400">🤖</span>
          </div>
          <div className="h-4 w-32 bg-amber-700/30 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.summary) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🤖</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-amber-400">{t('ai_daily.title')}</h3>
            <span className="text-xs text-amber-600/60">AI</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {data.events_count} {t('ai_daily.events')}
            </span>
          </div>
          <div className="text-sm text-amber-100/80 leading-relaxed whitespace-pre-line">
            {data.summary}
          </div>
        </div>
      </div>
    </div>
  );
}
