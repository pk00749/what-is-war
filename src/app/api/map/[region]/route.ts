import { NextRequest, NextResponse } from 'next/server';
import { getMapData } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ region: string }> }
) {
  const { region } = await params;
  const mapData = getMapData(region);
  return NextResponse.json(mapData);
}
