import { NextRequest, NextResponse } from 'next/server';
import { getDailySummary } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date') || undefined;
  
  const summary = getDailySummary(date);
  return NextResponse.json(summary);
}
