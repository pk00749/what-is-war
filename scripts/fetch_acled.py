#!/usr/bin/env python3
"""
ACLED 数据抓取脚本
文档: https://acleddataservice.com/

注意: ACLED 免费层需要注册获取 API Key
免费层限制: 每月最多 1000 次请求
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

# ACLED API 配置
# 从环境变量获取，或使用免费公开端点
ACLED_API_KEY = os.getenv('ACLED_API_KEY', '')
ACLED_BASE_URL = "https://acleddataservice.com/api/v1"

# 地区映射
REGION_MAP = {
    'ukraine': 'Eastern_Europe',
    'middle-east': 'Middle_East', 
    'us-iran': 'Middle_East'  # 需要特殊处理
}

def fetch_acled_events(region: str, start_date: str, end_date: str) -> list:
    """
    从 ACLED API 获取事件数据
    
    Args:
        region: 地区标识 (ukraine, middle-east, us-iran)
        start_date: 开始日期 YYYY-MM-DD
        end_date: 结束日期 YYYY-MM-DD
    
    Returns:
        事件列表
    """
    try:
        import httpx
        
        # 尝试使用 ACLED 的免费公开数据端点
        # ACLED 提供 CSV 下载，但这需要 API key
        # 对于没有 key 的情况，尝试从公开数据源获取
        
        if not ACLED_API_KEY:
            print("ACLED_API_KEY 未设置，尝试从公开数据源获取...")
            return fetch_from_public_source(region, start_date, end_date)
        
        headers = {'Authorization': f'Token {ACLED_API_KEY}'}
        
        # ACLED API 端点
        # https://acleddataservice.com/documentation
        url = f"{ACLED_BASE_URL}/events"
        
        params = {
            'limit': 250,
            'offset': 0,
            'date_from': start_date,
            'date_to': end_date,
        }
        
        # 根据地区添加筛选
        region_code = REGION_MAP.get(region, region)
        if region == 'ukraine':
            params['iso3'] = 'UKR'  # 乌克兰
        elif region == 'middle-east':
            params['iso3'] = 'ISR,PSE,LBN,SYR,YEM'  # 以色列、巴勒斯坦、黎巴嫩、叙利亚、也门
        elif region == 'us-iran':
            params['iso3'] = 'IRN,IRQ,USA,SYS'  # 伊朗、伊拉克、美国
        
        response = httpx.get(url, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        events = []
        for item in data.get('results', []):
            event = convert_acled_event(item, region)
            if event:
                events.append(event)
        
        return events
        
    except Exception as e:
        print(f"ACLED fetch error for {region}: {e}")
        return []


def fetch_from_public_source(region: str, start_date: str, end_date: str) -> list:
    """
    从 ACLED 公开 CSV 文件获取数据
    ACLED 提供免费公开数据文件
    """
    try:
        import httpx
        
        # ACLED 公开数据文件 URL (每周更新)
        # https://acleddataservice.com/uploads/weekly_files/
        
        # 这是备用方案，直接返回空列表让 GDELT 作为主数据源
        print(f"No ACLED API key, skipping ACLED fetch for {region}")
        return []
        
    except Exception as e:
        print(f"ACLED public source error: {e}")
        return []


def convert_acled_event(acled_item: dict, region: str) -> dict:
    """
    将 ACLED 事件格式转换为项目标准格式
    """
    try:
        # ACLED 字段映射
        # https://acleddataservice.com/documentation#events__events__events_get
        
        event_id = f"acled-{acled_item.get('event_id_cnty', '')}"
        
        # 事件类型映射
        event_type_map = {
            'Battle': 'battle',
            'Explosion': 'explosion',
            'Violence against civilians': 'civilian_violence',
            'Protests': 'protest',
            'Riots': 'riot',
            'Strategic development': 'strategic_development',
            'Remote violence': 'remote_violence',
        }
        
        event_type = event_type_map.get(
            acled_item.get('event_type', ''), 
            'other'
        )
        
        # 位置信息
        location = {
            'lat': float(acled_item.get('latitude', 0)),
            'lon': float(acled_item.get('longitude', 0)),
            'place': acled_item.get('location', 'Unknown'),
            'country': acled_item.get('country', 'Unknown')
        }
        
        # 伤亡数据
        fatalities = {
            'confirmed': acled_item.get('fatalities', 0),
            'civilians': acled_item.get('fatalities', 0)  # ACLED 主要记录平民伤亡
        }
        
        # 日期格式
        event_date = acled_item.get('event_date', '')
        if not event_date:
            event_date = acled_item.get('year', '') + '-' + \
                        str(acled_item.get('month', '')).zfill(2) + '-' + \
                        str(acled_item.get('day', '')).zfill(2)
        
        event = {
            'id': event_id,
            'source': 'acled',
            'region': region,
            'date': event_date,
            'location': location,
            'event_type': event_type,
            'actors': {
                'perpetrator': [acled_item.get('actor1', 'Unknown')],
                'target': [acled_item.get('actor2', 'Unknown')]
            },
            'fatalities': fatalities,
            'description': acled_item.get('notes', ''),
            'description_en': acled_item.get('notes', ''),
            'tags': [acled_item.get('sub_event_type', ''), acled_item.get('event_type', '')],
            'confidence': 0.85,  # ACLED 数据质量较高
        }
        
        return event
        
    except Exception as e:
        print(f"Error converting ACLED event: {e}")
        return None


def save_events(events: list, region: str):
    """保存事件到 JSONL 文件"""
    if not events:
        print(f"No events to save for {region}")
        return
    
    data_dir = Path(f"data/{region}")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    today = datetime.now()
    filename = f"{region}-{today.year}-{today.month:02d}.jsonl"
    filepath = data_dir / filename
    
    # 读取现有事件
    existing_ids = set()
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    event = json.loads(line.strip())
                    existing_ids.add(event['id'])
                except:
                    pass
    
    # 追加新事件
    with open(filepath, 'a', encoding='utf-8') as f:
        for event in events:
            if event['id'] not in existing_ids:
                f.write(json.dumps(event, ensure_ascii=False) + '\n')
                existing_ids.add(event['id'])
    
    print(f"Saved {len(events)} events for {region} to {filename}")


def main():
    today = datetime.now()
    # 获取过去 7 天的数据
    start_date = (today - timedelta(days=7)).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    
    print(f"=== ACLED Data Fetch ===")
    print(f"Period: {start_date} to {end_date}")
    
    for region in ['ukraine', 'middle-east', 'us-iran']:
        print(f"\nFetching {region}...")
        events = fetch_acled_events(region, start_date, end_date)
        if events:
            save_events(events, region)
        else:
            print(f"No events from ACLED for {region}")


if __name__ == "__main__":
    main()
