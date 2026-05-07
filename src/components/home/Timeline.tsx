'use client';

import { useEffect, useState, useRef } from 'react';
import type { ConflictEvent } from '@/lib/types';

type ZoomLevel = 'day' | 'week' | 'month';

interface TimelineProps {
  events: ConflictEvent[];
}

interface TimelineGroup {
  label: string;
  date: string;
  events: ConflictEvent[];
  fatalities: number;
}

export function Timeline({ events }: TimelineProps) {
  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 按日期分组
  const groupEvents = (): TimelineGroup[] => {
    const groups: Record<string, ConflictEvent[]> = {};

    events.forEach((e) => {
      let key: string;
      const date = new Date(e.date);

      if (zoom === 'day') {
        key = e.date;
      } else if (zoom === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, evts]) => ({
        label: formatLabel(date, zoom),
        date,
        events: evts.sort((a, b) => (b.time || '').localeCompare(a.time || '')),
        fatalities: evts.reduce((sum, e) => sum + e.fatalities.confirmed, 0),
      }));
  };

  const formatLabel = (date: string, z: ZoomLevel): string => {
    if (z === 'month') {
      const [year, month] = date.split('-');
      return `${year}年${parseInt(month)}月`;
    }
    const d = new Date(date);
    if (z === 'week') {
      return `${d.getMonth() + 1}/${d.getDate()} 周${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`;
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const groups = groupEvents();
  const visibleGroups = groups.slice(visibleRange.start, visibleRange.end);

  const scrollLeft = () => {
    setVisibleRange((r) => ({
      start: Math.max(0, r.start - 10),
      end: Math.max(20, r.end - 10),
    }));
  };

  const scrollRight = () => {
    setVisibleRange((r) => ({
      start: Math.min(groups.length - 20, r.start + 10),
      end: Math.min(groups.length, r.end + 10),
    }));
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      battle: 'bg-red-500',
      aerial_strike: 'bg-orange-500',
      missile_attack: 'bg-yellow-500',
      drone_strike: 'bg-purple-500',
      explosion: 'bg-amber-500',
      civilian_violence: 'bg-pink-500',
      protest: 'bg-green-500',
      riot: 'bg-teal-500',
      remote_violence: 'bg-blue-500',
      strategic_development: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-400';
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>暂无事件数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 缩放控制 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as ZoomLevel[]).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`px-3 py-1.5 text-sm rounded ${
                zoom === z
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {z === 'day' ? '按小时' : z === 'week' ? '按周' : '按月'}
            </button>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          共 {groups.length} 个时间点 · {events.length} 事件
        </div>
      </div>

      {/* 时间轴 */}
      <div className="relative">
        {/* 滚动按钮 */}
        {visibleRange.start > 0 && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background border rounded-full p-2 shadow-md hover:bg-muted"
          >
            ←
          </button>
        )}
        {visibleRange.end < groups.length && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background border rounded-full p-2 shadow-md hover:bg-muted"
          >
            →
          </button>
        )}

        {/* 时间轴容器 */}
        <div
          ref={containerRef}
          className="overflow-x-auto pb-4 pt-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="flex gap-4 min-w-max px-8">
            {visibleGroups.map((group, idx) => (
              <div
                key={group.date}
                className="flex flex-col items-center"
              >
                {/* 连接线 */}
                {idx < visibleGroups.length - 1 && (
                  <div className="absolute h-0.5 bg-border w-full top-1/2 left-0 pointer-events-none" style={{ zIndex: -1 }} />
                )}

                {/* 事件点 */}
                <div className="relative group">
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-background ${getEventTypeColor(
                      group.events[0].event_type
                    )} cursor-pointer transition-transform hover:scale-125`}
                    onClick={() => setSelectedEvent(group.events[0])}
                  >
                    {/* Hover 显示详情 */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm whitespace-nowrap">
                        <div className="font-semibold">{group.label}</div>
                        <div className="text-muted-foreground">
                          {group.events.length} 事件 · {group.fatalities} 死亡
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 日期标签 */}
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  {group.label}
                </div>

                {/* 事件数量 */}
                <div className="text-xs font-medium mt-1">
                  {group.events.length}事件
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 事件列表 */}
      <div className="border rounded-lg divide-y">
        {events.slice(0, 50).map((event) => (
          <div
            key={event.id}
            className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${getEventTypeColor(
                      event.event_type
                    )}`}
                  />
                  <span className="text-sm font-medium">{event.location.place}</span>
                  <span className="text-xs text-muted-foreground">{event.date}</span>
                </div>
                <p className="text-sm mt-1 line-clamp-2">{event.description}</p>
              </div>
              {event.fatalities.confirmed > 0 && (
                <div className="text-red-500 text-sm font-medium whitespace-nowrap">
                  -{event.fatalities.confirmed}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 详情弹窗 */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.location.place}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.date} · {selectedEvent.location.country}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">事件类型：</span>
                <span className="text-sm text-muted-foreground">{selectedEvent.event_type}</span>
              </div>
              <div>
                <span className="text-sm font-medium">来源：</span>
                <span className="text-sm text-muted-foreground">{selectedEvent.source}</span>
              </div>
              {selectedEvent.actors && (
                <div>
                  <span className="text-sm font-medium">涉及方：</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedEvent.actors.perpetrator.join(', ')}
                  </span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">伤亡：</span>
                <span className="text-sm text-red-500">
                  确认死亡 {selectedEvent.fatalities.confirmed}
                  {selectedEvent.fatalities.civilians ? ` (平民 ${selectedEvent.fatalities.civilians})` : ''}
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {selectedEvent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-muted rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
