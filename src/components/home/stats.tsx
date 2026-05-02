"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Users,
  AlertTriangle,
  TrendingUp,
  Globe,
  Clock,
  MapPin,
} from "lucide-react";
import type { DailySummary, ConflictEvent } from "@/lib/types";

// 动态导入 Leaflet 组件（避免 SSR 问题）
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// 修复 Leaflet 默认图标问题
function fixLeafletIcons() {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }
}

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

interface StatsCardsProps {
  summary: DailySummary | null;
  loading?: boolean;
}

export function StatsCards({ summary, loading }: StatsCardsProps) {
  const t = useTranslations();

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      labelKey: "stats.eventsTotal",
      value: summary.global_events_total,
      icon: Activity,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      labelKey: "stats.fatalitiesTotal",
      value: summary.global_fatalities_total,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      labelKey: "stats.civilianFatalities",
      value: summary.global_civilian_fatalities,
      icon: Users,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.labelKey} className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface HotRegionsProps {
  summary: DailySummary | null;
}

export function HotRegions({ summary }: HotRegionsProps) {
  const t = useTranslations();
  const tNav = useTranslations('nav');

  const regionKeys: Record<string, string> = {
    ukraine: "ukraine",
    "middle-east": "middleEast",
    "us-iran": "usIran",
  };

  const regionColors: Record<string, string> = {
    ukraine: "bg-red-500",
    "middle-east": "bg-orange-500",
    "us-iran": "bg-purple-500",
  };

  if (!summary?.regions?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{t('stats.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4" />
          {t('stats.hotRegion')}
        </h3>
        <div className="space-y-3">
          {summary.regions.map((region) => (
            <div key={region.region} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    regionColors[region.region] || "bg-gray-500"
                  }`}
                />
                <span className="text-sm">
                  {tNav(regionKeys[region.region] || region.region)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-xs">
                  {region.events_total} {t('stats.eventsTotal').split('总')[0]}
                </Badge>
                <span className="text-sm font-medium text-destructive">
                  {region.fatalities_total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentEventsProps {
  events: ConflictEvent[];
}

export function RecentEvents({ events }: RecentEventsProps) {
  const t = useTranslations();
  const tEventTypes = useTranslations('eventTypes');
  const locale = useLocale();

  if (!events?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{t('stats.noData')}</p>
        </CardContent>
      </Card>
    );
  }

  const eventTypeColors: Record<string, string> = {
    battle: "bg-red-500",
    aerial_strike: "bg-orange-500",
    explosion: "bg-yellow-500",
    drone_strike: "bg-purple-500",
    missile_attack: "bg-pink-500",
    civilian_casualties: "bg-gray-500",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4" />
          {t('tabs.events')}
        </h3>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        style={{
                          backgroundColor:
                            eventTypeColors[event.event_type] || "#22c55e",
                        }}
                        className="text-white border-0 text-xs"
                      >
                        {tEventTypes(event.event_type) || event.event_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location.place}
                      </span>
                    </div>
                    <p className="text-sm">{getLocalizedDescription(event, locale)}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.date} · {event.region}
                    </div>
                  </div>
                  {event.fatalities.confirmed > 0 && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-destructive">
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

interface WorldMapProps {
  events: ConflictEvent[];
}

export function WorldMap({ events }: WorldMapProps) {
  const t = useTranslations();
  const tEventTypes = useTranslations('eventTypes');
  const locale = useLocale();
  const [isMounted, setIsMounted] = useState(false);

  // 只在客户端渲染地图
  useEffect(() => {
    setIsMounted(true);
    // 动态加载 Leaflet CSS
    import('leaflet/dist/leaflet.css');
    // 修复图标
    fixLeafletIcons();
  }, []);

  const eventTypeColors: Record<string, string> = {
    battle: "#ef4444",
    aerial_strike: "#f97316",
    explosion: "#eab308",
    drone_strike: "#a855f7",
    missile_attack: "#ec4899",
    civilian_casualties: "#6b7280",
  };

  if (!isMounted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">{t('ui.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          🗺️ {t('tabs.map')}
        </h3>
        <div className="h-[300px] rounded-lg overflow-hidden z-0">
          <MapContainer
            center={[30, 50]}
            zoom={3}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.slice(0, 50).map((event) => (
              <Marker
                key={event.id}
                position={[event.location.lat, event.location.lon]}
              >
                <Popup>
                  <div className="text-sm">
                    <strong style={{ color: eventTypeColors[event.event_type] || "#22c55e" }}>
                      {tEventTypes(event.event_type) || event.event_type}
                    </strong>
                    <br />
                    <span className="text-xs">{event.location.place}</span>
                    <br />
                    <span>{getLocalizedDescription(event, locale).slice(0, 80)}...</span>
                    {event.fatalities.confirmed > 0 && (
                      <div className="text-red-500 font-bold mt-1">
                        💀 {event.fatalities.confirmed}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(eventTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">
                {tEventTypes(type)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 累计死亡统计组件
interface CumulativeStatsProps {
  endDate?: string | null;
}

interface CumulativeData {
  war_start_date: string;
  current_end_date: string;
  global_events_total: number;
  global_fatalities_total: number;
  global_civilian_fatalities: number;
  regions: Record<string, {
    events_total: number;
    fatalities_total: number;
    fatalities_civilians: number;
    start_date: string;
    end_date: string;
  }>;
}

export function CumulativeStats({ endDate }: CumulativeStatsProps) {
  const t = useTranslations();
  const [data, setData] = useState<CumulativeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCumulativeStats() {
      try {
        const url = endDate ? `/api/cumulative-stats?end_date=${endDate}` : '/api/cumulative-stats';
        const res = await fetch(url);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCumulativeStats();
  }, [endDate]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="h-20 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.global_events_total === 0) {
    return null;
  }

  const regionLabels: Record<string, string> = {
    ukraine: t('nav.ukraine'),
    'middle-east': t('nav.middleEast'),
    'us-iran': t('nav.usIran'),
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
      <CardContent className="pt-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          💀 {t('stats.cumulativeStats')} ({data.war_start_date} ~ {data.current_end_date})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('stats.totalEvents')}</p>
            <p className="text-3xl font-bold text-red-500">{data.global_events_total.toLocaleString()}</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('stats.totalDeaths')}</p>
            <p className="text-3xl font-bold text-orange-500">{data.global_fatalities_total.toLocaleString()}</p>
          </div>
          <div className="bg-card/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">{t('stats.civilianDeaths')}</p>
            <p className="text-3xl font-bold text-yellow-500">{data.global_civilian_fatalities.toLocaleString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {Object.entries(data.regions).filter(([_, v]) => v.events_total > 0).map(([region, stats]) => (
            <div key={region} className="bg-card/30 rounded p-2 text-sm">
              <span className="font-medium">{regionLabels[region] || region}: </span>
              <span className="text-red-500">{stats.fatalities_total.toLocaleString()} </span>
              <span className="text-muted-foreground">死亡 / </span>
              <span className="text-orange-500">{stats.events_total} </span>
              <span className="text-muted-foreground">事件</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 日期查询组件
interface DateSearchProps {
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
}

interface AvailableDates {
  dates: string[];
}

export function DateSearch({ selectedDate, onDateChange }: DateSearchProps) {
  const t = useTranslations();
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    async function fetchDates() {
      try {
        const res = await fetch('/api/available-dates');
        if (res.ok) {
          const data: AvailableDates = await res.json();
          setDates(data.dates);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchDates();
  }, []);

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">{t('stats.searchDate')}:</span>
      <select
        className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        value={selectedDate || ''}
        onChange={(e) => onDateChange(e.target.value || null)}
      >
        <option value="">-- {t('stats.selectDate')} --</option>
        {dates.map((date) => (
          <option key={date} value={date}>
            {date}
          </option>
        ))}
      </select>
      {selectedDate && (
        <button
          onClick={() => onDateChange(null)}
          className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg"
        >
          ✕
        </button>
      )}
    </div>
  );
}