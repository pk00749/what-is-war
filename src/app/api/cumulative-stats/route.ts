import { NextRequest, NextResponse } from 'next/server';
import { getCumulativeStats } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endDate = searchParams.get('end_date') || undefined;
  
  const stats = getCumulativeStats(endDate);
  return NextResponse.json(stats);
}