"use client";

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, AlertTriangle } from "lucide-react";
import { RegionMap } from "@/components/ui/region-map";
import type { ConflictEvent } from "@/lib/types";

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

export default function MiddleEastPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [events, setEvents] = useState<ConflictEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/events?region=middle-east&page_size=50");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const eventTypeColors: Record<string, string> = {
    aerial_strike: "bg-orange-500",
    remote_violence: "bg-yellow-500",
    battle: "bg-red-500",
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">🇵🇸🇮🇱 {t('regions.middleEast')}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">{t('stats.eventsTotal')}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{events.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">{t('stats.fatalitiesTotal')}</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {events.reduce((sum, e) => sum + e.fatalities.confirmed, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">{t('tabs.events')}</TabsTrigger>
            <TabsTrigger value="map">{t('tabs.map')}</TabsTrigger>
            <TabsTrigger value="trend">{t('tabs.trend')}</TabsTrigger>
          </TabsList>
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            style={{ backgroundColor: eventTypeColors[event.event_type] || "#22c55e" }}
                            className="text-white border-0"
                          >
                            {t(`eventTypes.${event.event_type}`) || event.event_type}
                          </Badge>
                          <span className="text-sm font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location.place}
                          </span>
                        </div>
                        <p className="text-sm">{getLocalizedDescription(event, locale)}</p>
                        {event.fatalities.confirmed > 0 && (
                          <p className="text-xs text-destructive mt-2">
                            {t('ui.deaths')}: {event.fatalities.confirmed}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="map" className="mt-6">
            <RegionMap events={events} center={[31.5, 34.5]} zoom={6} />
          </TabsContent>
          <TabsContent value="trend" className="mt-6">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-center">{t('stats.noData')}</p></CardContent></Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-12 pt-8 border-t">
          <div className="text-center text-sm text-muted-foreground">
            <p>{t('footer.sources')}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}