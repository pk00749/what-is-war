// Conflict Event Types
export interface Location {
  lat: number;
  lon: number;
  place: string;
  country: string;
}

export interface Actors {
  perpetrator: string[];
  target?: string[];
}

export interface Fatalities {
  confirmed: number;
  estimated_min?: number;
  estimated_max?: number;
  civilians?: number;
}

export interface Source {
  name: string;
  url: string;
}

export type EventType =
  | 'battle'
  | 'explosion'
  | 'aerial_strike'
  | 'missile_attack'
  | 'drone_strike'
  | 'civilian_violence'
  | 'protest'
  | 'riot'
  | 'remote_violence'
  | 'strategic_development';

export type DataSource = 'gdelt' | 'acled' | 'manual';

export interface ConflictEvent {
  id: string;
  source: DataSource;
  region: string;
  date: string;
  time?: string;
  location: Location;
  event_type: EventType;
  sub_type?: string;
  actors?: Actors;
  fatalities: Fatalities;
  description: string; // 默认描述（中文）
  description_en?: string; // 英文描述
  description_ru?: string; // 俄文描述
  description_fa?: string; // 波斯文描述
  description_tw?: string; // 繁体中文描述
  sources?: Source[];
  confidence?: number;
  related_events?: string[];
  tags?: string[];
}

// Daily Statistics Types
export interface EventCounts {
  battle: number;
  explosion: number;
  protest: number;
  civilian_violence: number;
  other: number;
  aerial_strike?: number;
  missile_attack?: number;
  drone_strike?: number;
  riot?: number;
  remote_violence?: number;
  strategic_development?: number;
}

export interface HotLocation {
  place: string;
  count: number;
}

export interface DailyStat {
  date: string;
  region: string;
  events_total: number;
  events_by_type: Partial<EventCounts>;
  fatalities_total: number;
  fatalities_civilians: number;
  fatalities_military?: number;
  hottest_locations?: HotLocation[];
  trending_topics?: string[];
  last_updated: string;
}

// API Response Types
export interface EventsResponse {
  events: ConflictEvent[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface StatsResponse {
  stat: DailyStat | null;
  message?: string;
}

export interface TimelinePoint {
  date: string;
  events_total: number;
  fatalities_total: number;
}

export interface MapDataPoint {
  lat: number;
  lon: number;
  place: string;
  event_type: EventType;
  fatalities: number;
  date: string;
  id: string;
}

export interface DailySummary {
  date: string;
  global_events_total: number;
  global_fatalities_total: number;
  global_civilian_fatalities: number;
  regions: {
    region: string;
    events_total: number;
    fatalities_total: number;
  }[];
}

// Source Index
export interface SourceIndex {
  source_id: string;
  name: string;
  url: string;
  license: string;
  update_frequency: string;
  coverage: string;
  api_endpoint?: string;
}
