import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const region = searchParams.get('region') || undefined;
  const start_date = searchParams.get('start_date') || undefined;
  const end_date = searchParams.get('end_date') || undefined;
  const event_type = searchParams.get('event_type') || undefined;
  const min_fatalities = searchParams.get('min_fatalities') 
    ? parseInt(searchParams.get('min_fatalities')!) 
    : undefined;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const page_size = searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : 50;

  const result = getEvents(region, {
    start_date,
    end_date,
    event_type,
    min_fatalities,
    page,
    page_size,
  });

  return NextResponse.json(result);
}
