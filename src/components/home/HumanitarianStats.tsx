'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ConflictEvent } from '@/lib/types';

interface HumanitarianStats {
  total_fatalities: number;
  civilian_fatalities: number;
  military_fatalities: number;
  infrastructure_damage_events: number;
  regions: Record<string, {
    fatalities: number;
    civilian_fatalities: number;
    events: number;
  }>;
}

interface HumanitarianStatsProps {
  events: ConflictEvent[];
}

export function HumanitarianStats({ events }: HumanitarianStatsProps) {
  const t = useTranslations();
  const [stats, setStats] = useState<HumanitarianStats | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    const totalFatalities = events.reduce((sum, e) => sum + e.fatalities.confirmed, 0);
    const civilianFatalities = events.reduce((sum, e) => sum + (e.fatalities.civilians || 0), 0);
    const militaryFatalities = totalFatalities - civilianFatalities;

    const infraKeywords = ['基础设施', '电网', '医院', '学校', '民居', 'infrastructure', 'power', 'hospital', 'school'];
    const infraDamageEvents = events.filter((e) =>
      e.tags?.some((tag) => infraKeywords.some((kw) => tag.toLowerCase().includes(kw.toLowerCase())))
    ).length;

    const regionStats: Record<string, { fatalities: number; civilian_fatalities: number; events: number }> = {};
    events.forEach((e) => {
      if (!regionStats[e.region]) {
        regionStats[e.region] = { fatalities: 0, civilian_fatalities: 0, events: 0 };
      }
      regionStats[e.region].fatalities += e.fatalities.confirmed;
      regionStats[e.region].civilian_fatalities += e.fatalities.civilians || 0;
      regionStats[e.region].events += 1;
    });

    setStats({
      total_fatalities: totalFatalities,
      civilian_fatalities: civilianFatalities,
      military_fatalities: Math.max(0, militaryFatalities),
      infrastructure_damage_events: infraDamageEvents,
      regions: regionStats,
    });
  }, [events]);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
            <div className="h-4 w-20 bg-muted-foreground/20 rounded mb-2"></div>
            <div className="h-8 w-16 bg-muted-foreground/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const regionLabels: Record<string, string> = {
    ukraine: t('regions.ukraine'),
    'middle-east': t('regions.middleEast'),
    'us-iran': t('regions.usIran'),
  };

  const regionColors: Record<string, string> = {
    ukraine: 'bg-blue-500',
    'middle-east': 'bg-amber-500',
    'us-iran': 'bg-purple-500',
  };

  const civilianRatio = stats.total_fatalities > 0 
    ? (stats.civilian_fatalities / stats.total_fatalities * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-900/30 to-red-900/10 border border-red-800/30 rounded-lg p-4">
          <div className="text-sm text-red-400 mb-1">{t('stats.fatalitiesTotal')}</div>
          <div className="text-2xl font-bold text-red-300">
            {stats.total_fatalities.toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-900/30 to-pink-900/10 border border-pink-800/30 rounded-lg p-4">
          <div className="text-sm text-pink-400 mb-1">{t('stats.civilianFatalities')}</div>
          <div className="text-2xl font-bold text-pink-300">
            {stats.civilian_fatalities.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {civilianRatio}% of total
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-800/30 rounded-lg p-4">
          <div className="text-sm text-blue-400 mb-1">{t('stats.militaryFatalities')}</div>
          <div className="text-2xl font-bold text-blue-300">
            {stats.military_fatalities.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {(100 - parseFloat(civilianRatio)).toFixed(1)}% of total
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-900/10 border border-orange-800/30 rounded-lg p-4">
          <div className="text-sm text-orange-400 mb-1">{t('humanitarian.infrastructure')}</div>
          <div className="text-2xl font-bold text-orange-300">
            {stats.infrastructure_damage_events}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {t('humanitarian.incidents')}
          </div>
        </div>
      </div>

      {/* Regional distribution */}
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">{t('humanitarian.regionalDistribution')}</h3>
        <div className="space-y-3">
          {Object.entries(stats.regions).map(([region, data]) => (
            <div
              key={region}
              className="flex items-center gap-4 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
              onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
            >
              <div className={`w-3 h-3 rounded-full ${regionColors[region]}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{regionLabels[region] || region}</span>
                  <span className="text-sm text-muted-foreground">
                    {data.events} {t('ai_daily.events')} · {data.fatalities.toLocaleString()} {t('ui.deaths')}
                  </span>
                </div>
                <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${regionColors[region]} transition-all`}
                    style={{
                      width: `${Math.min(100, stats.total_fatalities > 0 ? (data.fatalities / stats.total_fatalities) * 100 : 0)}%`,
                    }}
                  />
                </div>
                {selectedRegion === region && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t('stats.civilianFatalities')}: {data.civilian_fatalities.toLocaleString()} (
                    {data.fatalities > 0 ? ((data.civilian_fatalities / data.fatalities) * 100).toFixed(1) : 0}%)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Humanitarian crisis warning */}
      {parseFloat(civilianRatio) > 30 && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-400">{t('humanitarian.crisis_warning')}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {t('humanitarian.crisis_message')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
