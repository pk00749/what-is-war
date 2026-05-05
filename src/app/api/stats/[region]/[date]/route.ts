import { NextRequest, NextResponse } from 'next/server';
import { getDailyStats } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ region: string; date: string }> }
) {
  const { region, date } = await params;
  const stat = getDailyStats(region, date);
  
  if (!stat) {
    return NextResponse.json(
      { stat: null, message: `No stats found for ${region} on ${date}` },
      { status: 404 }
    );
  }

  return NextResponse.json({ stat });
}
