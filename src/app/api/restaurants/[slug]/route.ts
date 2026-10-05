import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantBySlug } from '@/lib/dataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: restaurant });
}
