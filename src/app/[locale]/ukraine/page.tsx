"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MapPin, Calendar, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { RegionMap } from "@/components/ui/region-map";
import type { DailyStat, TimelinePoint, ConflictEvent } from "@/lib/types";

// 根据 locale 选择对应语言的描述
function getLocalizedDescription(event: ConflictEvent, locale: string): string {
  switch (locale) {
    case 'en':
      return event.description_en || event.description;
    case 'ru':
      return event.description_ru || event.description;
    case 'fa':
      return event.description_fa || event.description;
    case 'zh-TW':
      return event.description_tw || event.description;
    default:
      return event.description;
  }
}

interface UkraineStatsProps {
  date: string;
  stat: DailyStat | null;
}

function DailyStatsCard({ date, stat }: UkraineStatsProps) {
  const t = useTranslations();
  
  if (!stat) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{t('stats.noData')} {date}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">{t('stats.eventsTotal')}</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stat.events_total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">{t('stats.fatalitiesTotal')}</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stat.fatalities_total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">{t('stats.civilianFatalities')}</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stat.fatalities_civilians}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">{t('stats.hotRegion')}</span>
          </div>
          <p className="text-lg font-bold mt-1 truncate">
            {stat.hottest_locations?.[0]?.place || "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface TimelineChartProps {
  data: TimelinePoint[];
}

function TimelineChart({ data }: TimelineChartProps) {
  const t = useTranslations();
  
  if (!data.length) {
    return <p className="text-muted-foreground text-center py-8">{t('stats.noData')}</p>;
  }

  const chartData = data.map((d) => ({
    ...d,
    dateShort: d.date.slice(5),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('ui.trend7days')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateShort" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="events_total" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="fatalities_total" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface EventListProps {
  events: ConflictEvent[];
  locale: string;
}

function EventList({ events, locale }: EventListProps) {
  const t = useTranslations();
  const tTabs = useTranslations('tabs');
  const tEventTypes = useTranslations('eventTypes');
  
  const eventTypeColors: Record<string, string> = {
    battle: "bg-red-500",
    aerial_strike: "bg-orange-500",
    explosion: "bg-yellow-500",
    drone_strike: "bg-purple-500",
    missile_attack: "bg-pink-500",
    civilian_violence: "bg-gray-500",
    civilian_casualties: "bg-gray-500",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {tTabs('events')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge
                        style={{
                          backgroundColor: eventTypeColors[event.event_type] || "#22c55e",
                        }}
                        className="text-white border-0"
                      >
                        {tEventTypes(event.event_type) || event.event_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {event.time?.slice(0, 5) || ""}
                      </span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location.place}
                      </span>
                    </div>
                    <p className="text-sm">{getLocalizedDescription(event, locale)}</p>
                  </div>
                  {event.fatalities.confirmed > 0 && (
                    <div className="text-right">
                      <span className="text-2xl font-bold text-destructive">
                        {event.fatalities.confirmed}
                      </span>
                      <p className="text-xs text-muted-foreground">{t('ui.deaths')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default function UkrainePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [stat, setStat] = useState<DailyStat | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [events, setEvents] = useState<ConflictEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const todayDisplay = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // 先获取timeline，找到最近有数据的日期
        const timelineRes = await fetch("/api/timeline/ukraine?days=7");
        const eventsRes = await fetch("/api/events?region=ukraine&page_size=50");
        
        if (!timelineRes.ok || !eventsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const timelineData = await timelineRes.json();
        const eventsData = await eventsRes.json();

        setTimeline(timelineData);
        setEvents(eventsData.events || []);

        // 找到最近有数据的日期（events_total > 0）
        const latestDateWithData = timelineData.find(
          (d: TimelinePoint) => d.events_total > 0
        )?.date || today;

        // 用该日期获取统计
        const statRes = await fetch(`/api/stats/ukraine/${latestDateWithData}`);
        if (statRes.ok) {
          const statData = await statRes.json();
          setStat(statData.stat);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [today]);

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
          <h1 className="text-2xl font-bold tracking-tight">🇷🇺🇺🇦 {t('regions.ukraine')}</h1>
          <p className="text-sm text-muted-foreground">{todayDisplay}</p>
        </div>

        <DailyStatsCard date={today} stat={stat} />

        <div className="mt-6">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">{t('tabs.events')}</TabsTrigger>
              <TabsTrigger value="map">{t('tabs.map')}</TabsTrigger>
              <TabsTrigger value="trend">{t('tabs.trend')}</TabsTrigger>
            </TabsList>
            <TabsContent value="events" className="mt-6">
              <EventList events={events} locale={locale} />
            </TabsContent>
            <TabsContent value="map" className="mt-6">
              <RegionMap events={events} center={[48.5, 37.0]} zoom={5} />
            </TabsContent>
            <TabsContent value="trend" className="mt-6">
              <TimelineChart data={timeline} />
            </TabsContent>
          </Tabs>
        </div>

        <footer className="mt-12 pt-8 border-t">
          <div className="text-center text-sm text-muted-foreground">
            <p>{t('footer.sources')}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}