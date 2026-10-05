import { NextRequest, NextResponse } from 'next/server';
import { getHotels } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destinationSlug = searchParams.get('destination') || undefined;
  const type = searchParams.get('type') || undefined;
  const search = searchParams.get('search') || undefined;

  const hotels = await getHotels(destinationSlug, type, search);
  return NextResponse.json({ success: true, data: hotels });
}
