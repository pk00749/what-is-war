import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/data';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'qwen2.5:3b';

export async function GET() {
  try {
    // 获取今天的事件
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = getEvents(undefined, {
      start_date: today,
      end_date: today,
      page_size: 100,
    });

    if (todayEvents.events.length === 0) {
      // 没有今天的数据，返回空
      return NextResponse.json({ summary: '', events_count: 0 });
    }

    // 构建 prompt
    const eventsText = todayEvents.events
      .map((e) => {
        const casualties = e.fatalities.confirmed + (e.fatalities.estimated_min || 0);
        return `[${e.region}] ${e.date} ${e.location.place}: ${e.description} (死亡:${casualties})`;
      })
      .join('\n');

    const prompt = `你是一个战争新闻分析师。请根据以下今日冲突事件，写一份100-200字的中文摘要：

${eventsText}

请按以下格式输出：
1. 今日主要冲突概述
2. 重大事件（伤亡最严重的前3个）
3. 伤亡统计

只输出中文摘要，不要输出其他内容。`;

    // 调用 Ollama
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 300,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.response?.trim() || '';

    return NextResponse.json({
      summary,
      events_count: todayEvents.events.length,
      date: today,
    });
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
