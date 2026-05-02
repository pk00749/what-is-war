import fs from 'fs';
import path from 'path';
import type { ConflictEvent, DailyStat, SourceIndex } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

// 动态获取当前年月
function getCurrentMonthFile(region: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${region}/${region}-${year}-${month}.jsonl`;
}

export function readJsonlFile<T>(filePath: string): T[] {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      return [];
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return content
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as T);
  } catch {
    return [];
  }
}

export function getEvents(region?: string, filters?: {
  start_date?: string;
  end_date?: string;
  event_type?: string;
  min_fatalities?: number;
  page?: number;
  page_size?: number;
}) {
  let events: ConflictEvent[] = [];

  if (region) {
    // 读取当前月和历史月数据
    const currentMonth = getCurrentMonthFile(region);
    const prevMonthFile = `${region}/${region}-2026-04.jsonl`;
    events = [
      ...readJsonlFile<ConflictEvent>(currentMonth),
      ...readJsonlFile<ConflictEvent>(prevMonthFile),
    ];
  } else {
    // 读取所有区域数据
    const regions = ['ukraine', 'middle-east', 'us-iran'];
    for (const r of regions) {
      const currentMonth = getCurrentMonthFile(r);
      const prevMonthFile = `${r}/${r}-2026-04.jsonl`;
      events.push(
        ...readJsonlFile<ConflictEvent>(currentMonth),
        ...readJsonlFile<ConflictEvent>(prevMonthFile)
      );
    }
  }

  if (filters?.start_date) {
    events = events.filter((e) => e.date >= filters.start_date!);
  }
  if (filters?.end_date) {
    events = events.filter((e) => e.date <= filters.end_date!);
  }
  if (filters?.event_type) {
    events = events.filter((e) => e.event_type === filters.event_type);
  }
  if (filters?.min_fatalities) {
    events = events.filter((e) => e.fatalities.confirmed >= filters.min_fatalities!);
  }

  events.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.time || '').localeCompare(a.time || '');
  });

  const page = filters?.page || 1;
  const pageSize = filters?.page_size || 50;
  const start = (page - 1) * pageSize;
  const paginatedEvents = events.slice(start, start + pageSize);

  return {
    events: paginatedEvents,
    total: events.length,
    page,
    page_size: pageSize,
    has_more: start + pageSize < events.length,
  };
}

export function getDailyStats(region: string, date: string): DailyStat | null {
  const stats = readJsonlFile<DailyStat>(`stats/${region}-daily.jsonl`);
  return stats.find((s) => s.date === date) || null;
}

export function getTimeline(region: string, days: number = 30) {
  const stats = readJsonlFile<DailyStat>(`stats/${region}-daily.jsonl`);
  return stats.slice(0, days).map((s) => ({
    date: s.date,
    events_total: s.events_total,
    fatalities_total: s.fatalities_total,
  }));
}

export function getMapData(region: string) {
  const currentMonth = getCurrentMonthFile(region);
  const prevMonthFile = `${region}/${region}-2026-04.jsonl`;
  const events = [
    ...readJsonlFile<ConflictEvent>(currentMonth),
    ...readJsonlFile<ConflictEvent>(prevMonthFile),
  ];
  return events.map((e) => ({
    lat: e.location.lat,
    lon: e.location.lon,
    place: e.location.place,
    event_type: e.event_type,
    fatalities: e.fatalities.confirmed,
    date: e.date,
    id: e.id,
  }));
}

export function getDailySummary(date?: string) {
  const regions = ['ukraine', 'middle-east', 'us-iran'];
  
  // 收集所有日期和统计
  const allStats: { date: string; events_total: number; fatalities_total: number; fatalities_civilians: number; region: string }[] = [];
  
  for (const region of regions) {
    const stats = readJsonlFile<DailyStat>(`stats/${region}-daily.jsonl`);
    for (const s of stats) {
      if (s.events_total > 0) {
        allStats.push({
          date: s.date,
          events_total: s.events_total,
          fatalities_total: s.fatalities_total,
          fatalities_civilians: s.fatalities_civilians,
          region,
        });
      }
    }
  }

  // 如果指定日期，用指定日期
  if (date) {
    const targetStats = allStats.filter(s => s.date === date);
    if (targetStats.length > 0) {
      return {
        date,
        global_events_total: targetStats.reduce((sum, s) => sum + s.events_total, 0),
        global_fatalities_total: targetStats.reduce((sum, s) => sum + s.fatalities_total, 0),
        global_civilian_fatalities: targetStats.reduce((sum, s) => sum + s.fatalities_civilians, 0),
        regions: targetStats.map(s => ({ region: s.region, events_total: s.events_total, fatalities_total: s.fatalities_total })),
      };
    }
  }

  // 按日期排序，找到最近有数据的日期
  allStats.sort((a, b) => b.date.localeCompare(a.date));
  
  if (allStats.length === 0) {
    return {
      date: date || new Date().toISOString().split('T')[0],
      global_events_total: 0,
      global_fatalities_total: 0,
      global_civilian_fatalities: 0,
      regions: regions.map(r => ({ region: r, events_total: 0, fatalities_total: 0 })),
    };
  }

  // 取最近有数据的日期
  const latestDate = allStats[0].date;
  const latestStats = allStats.filter(s => s.date === latestDate);

  return {
    date: latestDate,
    global_events_total: latestStats.reduce((sum, s) => sum + s.events_total, 0),
    global_fatalities_total: latestStats.reduce((sum, s) => sum + s.fatalities_total, 0),
    global_civilian_fatalities: latestStats.reduce((sum, s) => sum + s.fatalities_civilians, 0),
    regions: latestStats.map(s => ({ region: s.region, events_total: s.events_total, fatalities_total: s.fatalities_total })),
  };
}

export function getSources(): SourceIndex[] {
  return readJsonlFile<SourceIndex>('sources/source-index.jsonl');
}

// 获取所有有数据的日期列表（用于日期选择器）
export function getAvailableDates(): string[] {
  const regions = ['ukraine', 'middle-east', 'us-iran'];
  const dates = new Set<string>();
  
  for (const region of regions) {
    const stats = readJsonlFile<DailyStat>(`stats/${region}-daily.jsonl`);
    for (const s of stats) {
      if (s.events_total > 0) {
        dates.add(s.date);
      }
    }
  }
  
  return Array.from(dates).sort((a, b) => b.localeCompare(a)); // 降序排列，最新的在前
}

// 获取开战以来的累计死亡统计
export function getCumulativeStats(endDate?: string) {
  const regions = ['ukraine', 'middle-east', 'us-iran'];
  
  const regionStats: Record<string, {
    events_total: number;
    fatalities_total: number;
    fatalities_civilians: number;
    start_date: string;
    end_date: string;
  }> = {};
  
  for (const region of regions) {
    const stats = readJsonlFile<DailyStat>(`stats/${region}-daily.jsonl`);
    // 筛选出有效的统计数据
    const validStats = stats.filter(s => s.events_total > 0);
    
    if (validStats.length > 0) {
      // 按日期排序
      validStats.sort((a, b) => a.date.localeCompare(b.date));
      
      // 确定结束日期
      const lastDate = endDate 
        ? validStats.filter(s => s.date <= endDate).pop()?.date || validStats[validStats.length - 1].date
        : validStats[validStats.length - 1].date;
      
      // 筛选到指定日期的数据
      const filteredStats = validStats.filter(s => s.date <= lastDate);
      
      regionStats[region] = {
        events_total: filteredStats.reduce((sum, s) => sum + s.events_total, 0),
        fatalities_total: filteredStats.reduce((sum, s) => sum + s.fatalities_total, 0),
        fatalities_civilians: filteredStats.reduce((sum, s) => sum + s.fatalities_civilians, 0),
        start_date: filteredStats[0].date,
        end_date: lastDate,
      };
    } else {
      regionStats[region] = {
        events_total: 0,
        fatalities_total: 0,
        fatalities_civilians: 0,
        start_date: '',
        end_date: '',
      };
    }
  }
  
  // 计算全局累计
  const globalEvents = Object.values(regionStats).reduce((sum, r) => sum + r.events_total, 0);
  const globalFatalities = Object.values(regionStats).reduce((sum, r) => sum + r.fatalities_total, 0);
  const globalCivilians = Object.values(regionStats).reduce((sum, r) => sum + r.fatalities_civilians, 0);
  
  // 找到最早开战日期
  const startDates = Object.values(regionStats)
    .filter(r => r.start_date)
    .map(r => r.start_date)
    .sort((a, b) => a.localeCompare(b));
  
  const warStartDate = startDates[0] || '';
  
  return {
    war_start_date: warStartDate,
    current_end_date: endDate || new Date().toISOString().split('T')[0],
    global_events_total: globalEvents,
    global_fatalities_total: globalFatalities,
    global_civilian_fatalities: globalCivilians,
    regions: regionStats,
  };
}
