import { NextRequest, NextResponse } from 'next/server';
import { getRestaurants } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destinationSlug = searchParams.get('destination') || undefined;
  const search = searchParams.get('search') || undefined;

  const restaurants = await getRestaurants(destinationSlug, search);
  return NextResponse.json({ success: true, data: restaurants });
}
