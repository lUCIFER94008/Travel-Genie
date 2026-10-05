import { NextRequest, NextResponse } from 'next/server';
import { getPlaces } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destinationSlug = searchParams.get('destination') || undefined;
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;

  const places = await getPlaces(destinationSlug, category, search);
  return NextResponse.json({ success: true, data: places });
}
