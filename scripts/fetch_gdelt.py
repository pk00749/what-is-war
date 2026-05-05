import json
import os
from datetime import datetime, timedelta
from pathlib import Path

def fetch_gdelt_events():
    import httpx
    
    today = datetime.now()
    yesterday = (today - timedelta(days=1)).strftime("%Y%m%d")
    
    url = f"https://api.gdeltproject.org/api/v2/doc/doc?format=json&query=ukraine%20OR%20russia%20war%20conflict&mode=artlist&maxrecords=250&sort=Datetime DESC&format=json"
    
    try:
        response = httpx.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        events = []
        for i, article in enumerate(data.get("articles", [])[:100]):
            event = {
                "id": f"gdelt-{yesterday}-{i+1:03d}",
                "source": "gdelt",
                "region": "ukraine",
                "date": today.strftime("%Y-%m-%d"),
                "location": {
                    "lat": 48.5,
                    "lon": 32.0,
                    "place": "乌克兰",
                    "country": "乌克兰"
                },
                "event_type": "battle",
                "description": article.get("title", "GDELT article"),
                "confidence": 0.6,
                "fatalities": {"confirmed": 0}
            }
            events.append(event)
        
        return events
    except Exception as e:
        print(f"GDELT fetch failed: {e}")
        return []

def main():
    data_dir = Path("data/ukraine")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    events = fetch_gdelt_events()
    
    if events:
        output_file = data_dir / f"ukraine-{datetime.now().strftime('%Y-%m')}.jsonl"
        with open(output_file, "a", encoding="utf-8") as f:
            for event in events:
                f.write(json.dumps(event, ensure_ascii=False) + "\n")
        print(f"Added {len(events)} events to {output_file}")

if __name__ == "__main__":
    main()
