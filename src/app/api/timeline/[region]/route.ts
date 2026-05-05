import { NextRequest, NextResponse } from 'next/server';
import { getTimeline } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ region: string }> }
) {
  const { region } = await params;
  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;
  
  const timeline = getTimeline(region, days);
  return NextResponse.json(timeline);
}
