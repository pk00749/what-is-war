import { NextRequest, NextResponse } from 'next/server';
import { getAvailableDates } from '@/lib/data';

export async function GET(request: NextRequest) {
  const dates = getAvailableDates();
  return NextResponse.json({ dates });
}