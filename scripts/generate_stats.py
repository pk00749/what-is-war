import json
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

def load_events(region: str) -> list:
    data_dir = Path("data/ukraine")
    events = []
    for f in data_dir.glob("*.jsonl"):
        with open(f, "r", encoding="utf-8") as file:
            for line in file:
                event = json.loads(line.strip())
                if event.get("region") == region:
                    events.append(event)
    return events

def generate_daily_stats(region: str, date: str):
    events = load_events(region)
    day_events = [e for e in events if e.get("date") == date]
    
    event_types = defaultdict(int)
    fatalities = 0
    civilian_fatalities = 0
    
    for event in day_events:
        event_types[event.get("event_type", "other")] += 1
        fatalities += event.get("fatalities", {}).get("confirmed", 0)
        civilian_fatalities += event.get("fatalities", {}).get("civilians", 0)
    
    location_counts = defaultdict(int)
    for event in day_events:
        place = event.get("location", {}).get("place", "Unknown")
        location_counts[place] += 1
    
    hottest = sorted(location_counts.items(), key=lambda x: -x[1])[:5]
    
    stat = {
        "date": date,
        "region": region,
        "events_total": len(day_events),
        "events_by_type": dict(event_types),
        "fatalities_total": fatalities,
        "fatalities_civilians": civilian_fatalities,
        "hottest_locations": [{"place": p, "count": c} for p, c in hottest],
        "trending_topics": ["战争持续"],
        "last_updated": datetime.now().isoformat() + "Z"
    }
    
    return stat

def main():
    today = datetime.now().strftime("%Y-%m-%d")
    
    for region in ["ukraine", "middle-east"]:
        stat = generate_daily_stats(region, today)
        
        stats_dir = Path(f"data/stats")
        stats_dir.mkdir(parents=True, exist_ok=True)
        output_file = stats_dir / f"{region}-daily.jsonl"
        
        existing_stats = []
        if output_file.exists():
            with open(output_file, "r", encoding="utf-8") as f:
                for line in f:
                    existing_stats.append(json.loads(line.strip()))
        
        existing_stats = [s for s in existing_stats if s.get("date") != today]
        existing_stats.insert(0, stat)
        existing_stats = existing_stats[:30]
        
        with open(output_file, "w", encoding="utf-8") as f:
            for s in existing_stats:
                f.write(json.dumps(s, ensure_ascii=False) + "\n")
        
        print(f"Updated stats for {region}: {stat['events_total']} events, {stat['fatalities_total']} fatalities")

if __name__ == "__main__":
    main()
