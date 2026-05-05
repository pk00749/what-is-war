"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card";
import type { ConflictEvent } from "@/lib/types";

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

interface RegionMapProps {
  events: ConflictEvent[];
  center: [number, number];
  zoom: number;
}

export function RegionMap({ events, center, zoom }: RegionMapProps) {
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
    strategic_development: "#3b82f6",
    naval_clash: "#06b6d4",
  };

  if (!isMounted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
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
        <div className="h-[400px] rounded-lg overflow-hidden z-0">
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {events.map((event) => (
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