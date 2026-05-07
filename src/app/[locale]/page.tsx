"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from "react";
import { StatsCards, HotRegions, RecentEvents, WorldMap, CumulativeStats, DateSearch } from "@/components/home/stats";
import { AIDailySummary } from "@/components/home/AIDailySummary";
import type { DailySummary, ConflictEvent } from "@/lib/types";

export default function Home() {
  const t = useTranslations();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [events, setEvents] = useState<ConflictEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, eventsRes] = await Promise.all([
          fetch(selectedDate ? `/api/daily-summary?date=${selectedDate}` : "/api/daily-summary"),
          fetch("/api/events?page_size=20"),
        ]);

        if (!summaryRes.ok || !eventsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const summaryData = await summaryRes.json();
        const eventsData = await eventsRes.json();

        setSummary(summaryData);
        setEvents(eventsData.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedDate]);

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{t('ui.error')}: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            {t('ui.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            🔥 {t('site.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        {/* AI 日报组件 */}
        <AIDailySummary />

        {/* 日期查询组件 */}
        <DateSearch selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* 累计统计组件 */}
        <CumulativeStats endDate={selectedDate} />

        <StatsCards summary={summary} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <WorldMap events={events} />
          </div>
          <div>
            <HotRegions summary={summary} />
          </div>
        </div>

        <div className="mt-6">
          <RecentEvents events={events} />
        </div>

        <footer className="mt-12 pt-8 border-t">
          <div className="text-center text-sm text-muted-foreground">
            <p>{t('footer.sources')}</p>
            <p className="mt-1">{t('footer.warning')}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}