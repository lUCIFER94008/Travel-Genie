import { NextRequest, NextResponse } from 'next/server';
import { getDestinations } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;

  const destinations = await getDestinations(search);
  return NextResponse.json({ success: true, data: destinations });
}
